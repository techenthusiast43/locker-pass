// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LockerPass
 * @notice Decentralized Locker Permission Management smart contract for BOT Chain.
 * Allows locker owners to register lockers, grant time-bound or permanent access,
 * revoke access, and verify authorizations on-chain for virtual access demonstrations.
 */
contract LockerPass {
    struct Locker {
        uint256 id;
        address owner;
        bool isActive;
        string name;
        string locationDescription;
        uint256 createdAt;
    }

    struct UserPermission {
        address user;
        uint256 validUntil; // 0 = revoked/no access, type(uint256).max = permanent, > block.timestamp = active
        bool exists;
    }

    // Incremental counter for unique locker IDs
    uint256 private _lockerIdCounter;

    // lockerId => Locker details
    mapping(uint256 => Locker) public lockers;

    // lockerId => userAddress => validUntil timestamp
    // validUntil == 0: Revoked / Not authorized
    // validUntil == type(uint256).max: Permanent permission (no expiration)
    // validUntil > block.timestamp: Valid temporary permission
    mapping(uint256 => mapping(address => uint256)) public accessExpiry;

    // lockerId => array of addresses that have ever been granted access (for list enumeration)
    mapping(uint256 => address[]) private _lockerAuthorizedUsers;
    // lockerId => userAddress => index in _lockerAuthorizedUsers + 1 (1-based to detect inclusion)
    mapping(uint256 => mapping(address => uint256)) private _userIndexInLocker;

    // ownerAddress => array of locker IDs owned
    mapping(address => uint256[]) private _ownerLockerIds;

    // Array of all locker IDs for platform discoverability
    uint256[] private _allLockerIds;

    // --- EVENTS ---
    event LockerRegistered(
        uint256 indexed lockerId,
        address indexed owner,
        string name,
        string locationDescription,
        uint256 timestamp
    );

    event AccessGranted(
        uint256 indexed lockerId,
        address indexed user,
        uint256 validUntil,
        address indexed grantedBy,
        uint256 timestamp
    );

    event AccessRevoked(
        uint256 indexed lockerId,
        address indexed user,
        address indexed revokedBy,
        uint256 timestamp
    );

    event LockerStatusChanged(
        uint256 indexed lockerId,
        bool isActive,
        address indexed owner,
        uint256 timestamp
    );

    event VirtualUnlockRecorded(
        uint256 indexed lockerId,
        address indexed user,
        bool success,
        uint256 timestamp
    );

    // --- CUSTOM ERRORS (Gas-efficient) ---
    error LockerNotFound(uint256 lockerId);
    error NotLockerOwner(uint256 lockerId, address caller);
    error LockerIsInactive(uint256 lockerId);
    error InvalidUserAddress();
    error InvalidExpirationTime(uint256 validUntil);
    error EmptyLockerName();

    modifier onlyLockerOwner(uint256 lockerId) {
        if (lockers[lockerId].id == 0) revert LockerNotFound(lockerId);
        if (lockers[lockerId].owner != msg.sender) revert NotLockerOwner(lockerId, msg.sender);
        _;
    }

    /**
     * @notice Registers a new locker with a unique ID.
     * @param name Descriptive label for the locker (e.g. "Locker #104 - Main Gym")
     * @param locationDescription Location or virtual designation (e.g. "Terminal B, Sector 4")
     * @return lockerId The newly assigned unique locker ID
     */
    function registerLocker(
        string calldata name,
        string calldata locationDescription
    ) external returns (uint256) {
        if (bytes(name).length == 0) revert EmptyLockerName();

        _lockerIdCounter++;
        uint256 newId = _lockerIdCounter;

        lockers[newId] = Locker({
            id: newId,
            owner: msg.sender,
            isActive: true,
            name: name,
            locationDescription: locationDescription,
            createdAt: block.timestamp
        });

        _ownerLockerIds[msg.sender].push(newId);
        _allLockerIds.push(newId);

        emit LockerRegistered(newId, msg.sender, name, locationDescription, block.timestamp);
        return newId;
    }

    /**
     * @notice Grants permission to a user address for a specific locker.
     * @dev Only callable by the locker owner.
     * @param lockerId ID of the target locker
     * @param user Wallet address to authorize
     * @param validUntil Unix timestamp when access expires (pass 0 or type(uint256).max for permanent)
     */
    function grantAccess(
        uint256 lockerId,
        address user,
        uint256 validUntil
    ) external onlyLockerOwner(lockerId) {
        if (user == address(0)) revert InvalidUserAddress();
        if (!lockers[lockerId].isActive) revert LockerIsInactive(lockerId);

        // Normalize 0 to type(uint256).max to represent permanent access
        uint256 actualExpiry = validUntil;
        if (actualExpiry == 0) {
            actualExpiry = type(uint256).max;
        } else if (actualExpiry <= block.timestamp && actualExpiry != type(uint256).max) {
            revert InvalidExpirationTime(actualExpiry);
        }

        accessExpiry[lockerId][user] = actualExpiry;

        // Keep track of user in list if not already tracked
        if (_userIndexInLocker[lockerId][user] == 0) {
            _lockerAuthorizedUsers[lockerId].push(user);
            _userIndexInLocker[lockerId][user] = _lockerAuthorizedUsers[lockerId].length;
        }

        emit AccessGranted(lockerId, user, actualExpiry, msg.sender, block.timestamp);
    }

    /**
     * @notice Revokes a user's access to a locker immediately.
     * @dev Only callable by the locker owner.
     * @param lockerId ID of the target locker
     * @param user Wallet address to revoke
     */
    function revokeAccess(
        uint256 lockerId,
        address user
    ) external onlyLockerOwner(lockerId) {
        if (user == address(0)) revert InvalidUserAddress();

        accessExpiry[lockerId][user] = 0;

        emit AccessRevoked(lockerId, user, msg.sender, block.timestamp);
    }

    /**
     * @notice Allows locker owner to activate or deactivate their locker.
     * @param lockerId ID of the locker
     * @param isActive New status
     */
    function setLockerStatus(
        uint256 lockerId,
        bool isActive
    ) external onlyLockerOwner(lockerId) {
        lockers[lockerId].isActive = isActive;
        emit LockerStatusChanged(lockerId, isActive, msg.sender, block.timestamp);
    }

    /**
     * @notice Checks whether a wallet address is currently authorized to open a locker.
     * @dev Anyone can query this (read-only, no gas).
     * @param lockerId ID of the locker
     * @param user Address being queried
     * @return authorized True if user is owner or has valid unexpired access and locker is active
     * @return statusMessage Human-readable status description
     */
    function isAuthorized(
        uint256 lockerId,
        address user
    ) public view returns (bool authorized, string memory statusMessage) {
        Locker storage locker = lockers[lockerId];

        if (locker.id == 0) {
            return (false, "Locker does not exist");
        }

        if (!locker.isActive) {
            return (false, "Locker is deactivated by owner");
        }

        // Owner always has access as long as locker is active
        if (locker.owner == user) {
            return (true, "Authorized: Locker Owner");
        }

        uint256 expiry = accessExpiry[lockerId][user];

        if (expiry == 0) {
            return (false, "Access not granted or revoked");
        }

        if (expiry == type(uint256).max) {
            return (true, "Authorized: Permanent access");
        }

        if (block.timestamp <= expiry) {
            return (true, "Authorized: Temporary pass active");
        }

        return (false, "Access permission has expired");
    }

    /**
     * @notice Virtual unlock verification test.
     * @dev Read-only verification that checks caller permissions and returns detailed unlock data.
     * @param lockerId ID of the locker
     * @param user Wallet attempting the virtual unlock
     */
    function checkVirtualUnlock(
        uint256 lockerId,
        address user
    ) external view returns (
        bool canUnlock,
        string memory reason,
        uint256 expiryTimestamp,
        address ownerAddress,
        string memory lockerName
    ) {
        Locker storage locker = lockers[lockerId];
        if (locker.id == 0) {
            return (false, "Locker does not exist", 0, address(0), "");
        }

        (bool authorized, string memory statusMsg) = isAuthorized(lockerId, user);
        uint256 expiry = accessExpiry[lockerId][user];
        if (user == locker.owner) {
            expiry = type(uint256).max;
        }

        return (authorized, statusMsg, expiry, locker.owner, locker.name);
    }

    /**
     * @notice Optional on-chain transaction to log a virtual unlock attempt on BOT Chain.
     * @param lockerId ID of the locker being virtually unlocked
     */
    function recordVirtualUnlock(uint256 lockerId) external returns (bool) {
        (bool authorized, ) = isAuthorized(lockerId, msg.sender);
        emit VirtualUnlockRecorded(lockerId, msg.sender, authorized, block.timestamp);
        return authorized;
    }

    // --- ENUMERATION & VIEW HELPERS ---

    /**
     * @notice Total registered locker count.
     */
    function totalLockers() external view returns (uint256) {
        return _lockerIdCounter;
    }

    /**
     * @notice Returns locker details.
     */
    function getLocker(uint256 lockerId) external view returns (Locker memory) {
        if (lockers[lockerId].id == 0) revert LockerNotFound(lockerId);
        return lockers[lockerId];
    }

    /**
     * @notice Returns list of all locker IDs registered on the contract.
     */
    function getAllLockerIds() external view returns (uint256[] memory) {
        return _allLockerIds;
    }

    /**
     * @notice Returns full array of all registered lockers.
     */
    function getAllLockers() external view returns (Locker[] memory) {
        uint256 total = _allLockerIds.length;
        Locker[] memory allItems = new Locker[](total);
        for (uint256 i = 0; i < total; i++) {
            allItems[i] = lockers[_allLockerIds[i]];
        }
        return allItems;
    }

    /**
     * @notice Returns all locker IDs owned by an address.
     */
    function getLockerIdsByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerLockerIds[owner];
    }

    /**
     * @notice Returns all lockers owned by an address.
     */
    function getLockersByOwner(address owner) external view returns (Locker[] memory) {
        uint256[] storage ids = _ownerLockerIds[owner];
        uint256 count = ids.length;
        Locker[] memory ownerLockersList = new Locker[](count);

        for (uint256 i = 0; i < count; i++) {
            ownerLockersList[i] = lockers[ids[i]];
        }
        return ownerLockersList;
    }

    /**
     * @notice Returns all authorized users and their expiration times for a locker.
     */
    function getAuthorizedUsers(uint256 lockerId) external view returns (
        address[] memory users,
        uint256[] memory expirations,
        bool[] memory activeFlags
    ) {
        address[] storage userList = _lockerAuthorizedUsers[lockerId];
        uint256 count = userList.length;

        users = new address[](count);
        expirations = new uint256[](count);
        activeFlags = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            address u = userList[i];
            users[i] = u;
            uint256 exp = accessExpiry[lockerId][u];
            expirations[i] = exp;
            activeFlags[i] = (exp == type(uint256).max || (exp > 0 && exp > block.timestamp));
        }

        return (users, expirations, activeFlags);
    }
}


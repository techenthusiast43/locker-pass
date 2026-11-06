import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { 
  BOT_CHAIN_ID, 
  BOT_CHAIN_RPC, 
  BOT_CHAIN_PARAMS, 
  BOT_CHAIN_EXPLORER,
  botChainTestnet
} from '../utils/botChainConfig';
import { LOCKER_PASS_ADDRESS } from '../utils/contractAddress';
import contractAbi from '../utils/contractABI.json';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '39aa70f889eb69efc6ea7cd8c6488fff';

let appKitModal = null;
try {
  const wagmiAdapter = new WagmiAdapter({
    networks: [botChainTestnet],
    projectId,
    ssr: false
  });

  appKitModal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [botChainTestnet],
    projectId,
    metadata: {
      name: 'LockerPass',
      description: 'Web3 Locker Permission Management on BOT Chain',
      url: window.location.origin,
      icons: ['https://scan.bohr.life/favicon.ico']
    },
    themeMode: 'dark',
    features: {
      analytics: false
    }
  });
} catch (e) {
  console.warn('Reown AppKit initialized in fallback mode:', e);
}

const Web3Context = createContext();

export function useWeb3() {
  return useContext(Web3Context);
}

// Fallback demo state when contract address is not yet deployed or in offline mode
const LOCAL_STORAGE_KEY_LOCKERS = 'lockerpass_mock_lockers_botchain';
const LOCAL_STORAGE_KEY_USERS = 'lockerpass_mock_users_botchain';
const LOCAL_STORAGE_KEY_EVENTS = 'lockerpass_mock_events_botchain';

function getStoredMockData() {
  try {
    const rawLockers = localStorage.getItem(LOCAL_STORAGE_KEY_LOCKERS);
    const rawUsers = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    const rawEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);

    const now = Math.floor(Date.now() / 1000);

    const defaultLockers = [
      {
        id: '1',
        name: 'Master Vault Station 01',
        locationDescription: 'BOT Chain Terminal A, Level 2',
        owner: '0x71C8360f7924F8b40efFa896c2168972Ea36F9A2',
        isActive: true,
        createdAt: now - 86400 * 3,
      },
      {
        id: '2',
        name: 'Engineering Tool Locker #44',
        locationDescription: 'R&D Virtual Lab, Sector 8',
        owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        isActive: true,
        createdAt: now - 86400 * 2,
      },
      {
        id: '3',
        name: 'Guest Storage Cabinet #09',
        locationDescription: 'Public Concierge Terminal',
        owner: '0x71C8360f7924F8b40efFa896c2168972Ea36F9A2',
        isActive: false,
        createdAt: now - 86400,
      }
    ];

    const defaultUsers = {
      '1': [
        {
          user: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
          validUntil: now + 86400 * 5,
          isActive: true
        },
        {
          user: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          validUntil: 0, // Revoked
          isActive: false
        }
      ],
      '2': [
        {
          user: '0x71C8360f7924F8b40efFa896c2168972Ea36F9A2',
          validUntil: Number.MAX_SAFE_INTEGER,
          isActive: true
        }
      ]
    };

    const defaultEvents = [
      {
        type: 'LockerRegistered',
        lockerId: '1',
        owner: '0x71C8360f7924F8b40efFa896c2168972Ea36F9A2',
        name: 'Master Vault Station 01',
        location: 'BOT Chain Terminal A',
        timestamp: now - 86400 * 3,
        txHash: '0x9fa8372648194ad8274028472918471928471928471928471928471928471928'
      },
      {
        type: 'AccessGranted',
        lockerId: '1',
        user: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
        validUntil: now + 86400 * 5,
        owner: '0x71C8360f7924F8b40efFa896c2168972Ea36F9A2',
        timestamp: now - 86400 * 2,
        txHash: '0x3bc8472948291048291048291048291048291048291048291048291048291048'
      }
    ];

    return {
      lockers: rawLockers ? JSON.parse(rawLockers) : defaultLockers,
      users: rawUsers ? JSON.parse(rawUsers) : defaultUsers,
      events: rawEvents ? JSON.parse(rawEvents) : defaultEvents,
    };
  } catch (e) {
    return { lockers: [], users: {}, events: [] };
  }
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractAddress, setContractAddress] = useState(LOCKER_PASS_ADDRESS);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);

  // App state
  const [lockers, setLockers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const isContractConfigured =
    contractAddress &&
    contractAddress !== '0x0000000000000000000000000000000000000000' &&
    ethers.isAddress(contractAddress);

  // Initialize read-only provider for BOT Chain Testnet
  const getReadOnlyProvider = useCallback(() => {
    try {
      return new ethers.JsonRpcProvider(BOT_CHAIN_RPC, {
        chainId: BOT_CHAIN_ID,
        name: 'BOT Chain Testnet',
      });
    } catch (e) {
      console.warn('Failed to initialize BOT Chain JSON-RPC provider:', e);
      return null;
    }
  }, []);

  // Check network
  const checkNetwork = (currentId) => {
    const numId = Number(currentId);
    const correct = numId === BOT_CHAIN_ID;
    setIsCorrectNetwork(correct);
    return correct;
  };

  // Switch network to BOT Chain Testnet (0x3c8 / 968)
  const switchNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask or an EIP-1193 compatible wallet extension is required to switch networks.');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOT_CHAIN_PARAMS.chainId }],
      });
    } catch (switchError) {
      // 4902 error code means the chain has not been added to MetaMask yet
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BOT_CHAIN_PARAMS],
          });
        } catch (addError) {
          console.error('Failed to add BOT Chain to wallet:', addError);
          alert('Could not add BOT Chain to wallet: ' + (addError?.message || addError));
        }
      } else {
        console.error('Failed to switch to BOT Chain:', switchError);
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('No Web3 wallet detected. Please install MetaMask, Rabby, or an EVM wallet.');
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (accounts && accounts.length > 0) {
        const userSigner = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(userSigner);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        checkNetwork(network.chainId);

        // Fetch balance
        const bal = await browserProvider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(bal));

        // Auto switch network if wrong
        if (Number(network.chainId) !== BOT_CHAIN_ID) {
          await switchNetwork();
        }
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setBalance(null);
  };

  // Setup contracts when address or signer changes
  useEffect(() => {
    const rpcProvider = getReadOnlyProvider();
    if (isContractConfigured && rpcProvider && contractAbi) {
      try {
        const roContract = new ethers.Contract(contractAddress, contractAbi, rpcProvider);
        setReadOnlyContract(roContract);

        if (signer && isCorrectNetwork) {
          const rwContract = new ethers.Contract(contractAddress, contractAbi, signer);
          setContract(rwContract);
        } else {
          setContract(null);
        }
      } catch (e) {
        console.error('Failed to instantiate contract:', e);
      }
    } else {
      setReadOnlyContract(null);
      setContract(null);
    }
  }, [contractAddress, signer, isCorrectNetwork, isContractConfigured, getReadOnlyProvider]);

  // Handle wallet events (accountsChanged, chainChanged)
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        if (provider) {
          const userSigner = await provider.getSigner();
          setSigner(userSigner);
          const bal = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(bal));
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      const numId = parseInt(newChainId, 16);
      setChainId(numId);
      checkNetwork(numId);
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Auto connect if previously authorized
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts && accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const userSigner = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(userSigner);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        checkNetwork(network.chainId);

        const bal = await browserProvider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(bal));
      }
    }).catch(() => { });

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Load lockers from chain or local engine
  const fetchLockers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isContractConfigured && (readOnlyContract || contract)) {
        const targetContract = contract || readOnlyContract;
        const total = await targetContract.totalLockers();
        const totalNum = Number(total);

        const loadedLockers = [];
        for (let i = 1; i <= totalNum; i++) {
          try {
            const l = await targetContract.getLocker(i);
            loadedLockers.push({
              id: l.id.toString(),
              name: l.name,
              locationDescription: l.locationDescription,
              owner: l.owner,
              isActive: l.isActive,
              createdAt: Number(l.createdAt),
            });
          } catch (itemErr) {
            console.warn(`Could not load locker #${i}:`, itemErr);
          }
        }
        setLockers(loadedLockers);
      } else {
        // Fallback local mock engine
        const mock = getStoredMockData();
        setLockers(mock.lockers);
      }
    } catch (err) {
      console.warn('Error fetching from contract, using local engine:', err);
      const mock = getStoredMockData();
      setLockers(mock.lockers);
    } finally {
      setIsLoading(false);
    }
  }, [isContractConfigured, contract, readOnlyContract]);

  // Load events
  const fetchEvents = useCallback(async () => {
    if (isContractConfigured && (readOnlyContract || contract)) {
      try {
        const targetContract = contract || readOnlyContract;
        const currentBlock = await (provider || getReadOnlyProvider()).getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 5000); // query recent 5000 blocks

        const regFilter = targetContract.filters.LockerRegistered();
        const grantFilter = targetContract.filters.AccessGranted();
        const revokeFilter = targetContract.filters.AccessRevoked();
        const statusFilter = targetContract.filters.LockerStatusChanged();
        const unlockFilter = targetContract.filters.VirtualUnlockRecorded();

        const [regs, grants, revokes, statuses, unlocks] = await Promise.all([
          targetContract.queryFilter(regFilter, fromBlock).catch(() => []),
          targetContract.queryFilter(grantFilter, fromBlock).catch(() => []),
          targetContract.queryFilter(revokeFilter, fromBlock).catch(() => []),
          targetContract.queryFilter(statusFilter, fromBlock).catch(() => []),
          targetContract.queryFilter(unlockFilter, fromBlock).catch(() => []),
        ]);

        const parsedEvents = [];
        regs.forEach((e) => {
          parsedEvents.push({
            type: 'LockerRegistered',
            lockerId: e.args[0].toString(),
            owner: e.args[1],
            name: e.args[2],
            location: e.args[3],
            timestamp: Number(e.args[4]),
            txHash: e.transactionHash,
          });
        });
        grants.forEach((e) => {
          parsedEvents.push({
            type: 'AccessGranted',
            lockerId: e.args[0].toString(),
            user: e.args[1],
            validUntil: Number(e.args[2]),
            owner: e.args[3],
            timestamp: Number(e.args[4]),
            txHash: e.transactionHash,
          });
        });
        revokes.forEach((e) => {
          parsedEvents.push({
            type: 'AccessRevoked',
            lockerId: e.args[0].toString(),
            user: e.args[1],
            owner: e.args[2],
            timestamp: Number(e.args[3]),
            txHash: e.transactionHash,
          });
        });
        statuses.forEach((e) => {
          parsedEvents.push({
            type: 'LockerStatusChanged',
            lockerId: e.args[0].toString(),
            isActive: e.args[1],
            owner: e.args[2],
            timestamp: Number(e.args[3]),
            txHash: e.transactionHash,
          });
        });
        unlocks.forEach((e) => {
          parsedEvents.push({
            type: 'VirtualUnlockRecorded',
            lockerId: e.args[0].toString(),
            user: e.args[1],
            success: e.args[2],
            timestamp: Number(e.args[3]),
            txHash: e.transactionHash,
          });
        });

        parsedEvents.sort((a, b) => b.timestamp - a.timestamp);
        setEvents(parsedEvents);
        return;
      } catch (e) {
        console.warn('Could not query contract events:', e);
      }
    }

    const mock = getStoredMockData();
    setEvents(mock.events);
  }, [isContractConfigured, contract, readOnlyContract, provider, getReadOnlyProvider]);

  useEffect(() => {
    fetchLockers();
    fetchEvents();
  }, [fetchLockers, fetchEvents]);

  // Actions
  const registerLocker = async (name, locationDescription) => {
    if (!account) throw new Error('Please connect your wallet first.');

    if (isContractConfigured && contract) {
      const tx = await contract.registerLocker(name, locationDescription);
      const receipt = await tx.wait();

      let newId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'LockerRegistered') {
            newId = parsed.args[0].toString();
            break;
          }
        } catch (_) { }
      }

      await fetchLockers();
      await fetchEvents();
      return { success: true, id: newId, txHash: receipt.hash };
    }

    // Local simulated mode
    const mock = getStoredMockData();
    const newId = (mock.lockers.length + 1).toString();
    const now = Math.floor(Date.now() / 1000);
    const newLocker = {
      id: newId,
      name,
      locationDescription,
      owner: account,
      isActive: true,
      createdAt: now,
    };

    const newEvent = {
      type: 'LockerRegistered',
      lockerId: newId,
      owner: account,
      name,
      location: locationDescription,
      timestamp: now,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    mock.lockers.push(newLocker);
    mock.events.unshift(newEvent);
    localStorage.setItem(LOCAL_STORAGE_KEY_LOCKERS, JSON.stringify(mock.lockers));
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(mock.events));

    setLockers(mock.lockers);
    setEvents(mock.events);
    return { success: true, id: newId, txHash: newEvent.txHash };
  };

  const grantAccess = async (lockerId, user, validUntil) => {
    if (!account) throw new Error('Please connect your wallet first.');

    if (isContractConfigured && contract) {
      const tx = await contract.grantAccess(lockerId, user, validUntil);
      const receipt = await tx.wait();
      await fetchLockers();
      await fetchEvents();
      return { success: true, txHash: receipt.hash };
    }

    // Local simulated mode
    const mock = getStoredMockData();
    if (!mock.users[lockerId]) mock.users[lockerId] = [];

    // Check if user already exists in list
    const existingIdx = mock.users[lockerId].findIndex((u) => u.user.toLowerCase() === user.toLowerCase());
    const actualExpiry = validUntil === 0 ? Number.MAX_SAFE_INTEGER : validUntil;

    if (existingIdx >= 0) {
      mock.users[lockerId][existingIdx].validUntil = actualExpiry;
      mock.users[lockerId][existingIdx].isActive = true;
    } else {
      mock.users[lockerId].push({
        user,
        validUntil: actualExpiry,
        isActive: true,
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const newEvent = {
      type: 'AccessGranted',
      lockerId: lockerId.toString(),
      user,
      validUntil: actualExpiry,
      owner: account,
      timestamp: now,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    mock.events.unshift(newEvent);
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(mock.users));
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(mock.events));

    setEvents(mock.events);
    return { success: true, txHash: newEvent.txHash };
  };

  const revokeAccess = async (lockerId, user) => {
    if (!account) throw new Error('Please connect your wallet first.');

    if (isContractConfigured && contract) {
      const tx = await contract.revokeAccess(lockerId, user);
      const receipt = await tx.wait();
      await fetchLockers();
      await fetchEvents();
      return { success: true, txHash: receipt.hash };
    }

    // Local simulated mode
    const mock = getStoredMockData();
    if (mock.users[lockerId]) {
      const existing = mock.users[lockerId].find((u) => u.user.toLowerCase() === user.toLowerCase());
      if (existing) {
        existing.validUntil = 0;
        existing.isActive = false;
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const newEvent = {
      type: 'AccessRevoked',
      lockerId: lockerId.toString(),
      user,
      owner: account,
      timestamp: now,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    mock.events.unshift(newEvent);
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(mock.users));
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(mock.events));

    setEvents(mock.events);
    return { success: true, txHash: newEvent.txHash };
  };

  const setLockerStatus = async (lockerId, isActive) => {
    if (!account) throw new Error('Please connect your wallet first.');
    setActionLoading(lockerId.toString());

    try {
      if (isContractConfigured && contract) {
        const tx = await contract.setLockerStatus(lockerId, isActive);
        const receipt = await tx.wait();
        await fetchLockers();
        await fetchEvents();
        return { success: true, txHash: receipt.hash };
      }

      // Local simulated mode
      const mock = getStoredMockData();
      const locker = mock.lockers.find((l) => l.id.toString() === lockerId.toString());
      if (locker) {
        locker.isActive = isActive;
      }

      const now = Math.floor(Date.now() / 1000);
      const newEvent = {
        type: 'LockerStatusChanged',
        lockerId: lockerId.toString(),
        isActive,
        owner: account,
        timestamp: now,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      };

      mock.events.unshift(newEvent);
      localStorage.setItem(LOCAL_STORAGE_KEY_LOCKERS, JSON.stringify(mock.lockers));
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(mock.events));

      setLockers([...mock.lockers]);
      setEvents(mock.events);
      return { success: true, txHash: newEvent.txHash };
    } finally {
      setActionLoading(null);
    }
  };

  const getAuthorizedUsersForLocker = async (lockerId) => {
    if (isContractConfigured && (readOnlyContract || contract)) {
      try {
        const target = contract || readOnlyContract;
        const [users, expiries, flags] = await target.getAuthorizedUsers(lockerId);
        return users.map((u, i) => ({
          user: u,
          validUntil: Number(expiries[i]),
          isActive: flags[i],
        }));
      } catch (err) {
        console.warn('Could not query users from contract:', err);
      }
    }

    const mock = getStoredMockData();
    return mock.users[lockerId.toString()] || [];
  };

  const checkVirtualUnlockOnChain = async (lockerId, targetUser) => {
    if (isContractConfigured && (readOnlyContract || contract)) {
      try {
        const target = contract || readOnlyContract;
        const res = await target.checkVirtualUnlock(lockerId, targetUser);
        return {
          authorized: res[0],
          reason: res[1],
          validUntil: Number(res[2]),
          owner: res[3],
          name: res[4],
        };
      } catch (err) {
        console.warn('On-chain unlock check failed, trying isAuthorized fallback:', err);
      }
    }

    // Local simulated verification
    const mock = getStoredMockData();
    const locker = mock.lockers.find((l) => l.id.toString() === lockerId.toString());

    if (!locker) {
      return { authorized: false, reason: 'Locker does not exist.', validUntil: 0 };
    }

    if (!locker.isActive) {
      return { authorized: false, reason: 'Locker is currently deactivated by the owner.', validUntil: 0 };
    }

    if (locker.owner.toLowerCase() === targetUser.toLowerCase()) {
      return { authorized: true, reason: 'Authorized: You are the verified locker owner.', validUntil: Number.MAX_SAFE_INTEGER };
    }

    const userList = mock.users[lockerId.toString()] || [];
    const record = userList.find((u) => u.user.toLowerCase() === targetUser.toLowerCase());

    if (!record || Number(record.validUntil) === 0) {
      return { authorized: false, reason: 'Access denied: Wallet has not been authorized or was revoked.', validUntil: 0 };
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(record.validUntil) > now || Number(record.validUntil) > 10000000000) {
      return {
        authorized: true,
        reason: Number(record.validUntil) > 10000000000 ? 'Authorized: Permanent access pass active.' : 'Authorized: Time-bound pass is valid.',
        validUntil: record.validUntil,
      };
    }

    return { authorized: false, reason: 'Access denied: Temporary authorization has expired.', validUntil: record.validUntil };
  };

  const recordVirtualUnlockOnChain = async (lockerId) => {
    if (!account) throw new Error('Connect wallet to record unlock on BOT Chain.');

    if (isContractConfigured && contract) {
      const tx = await contract.recordVirtualUnlock(lockerId);
      const receipt = await tx.wait();
      await fetchEvents();
      return receipt.hash;
    }

    // Simulated log
    const now = Math.floor(Date.now() / 1000);
    const mock = getStoredMockData();
    const unlockCheck = await checkVirtualUnlockOnChain(lockerId, account);

    const newEvent = {
      type: 'VirtualUnlockRecorded',
      lockerId: lockerId.toString(),
      user: account,
      success: unlockCheck.authorized,
      timestamp: now,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    mock.events.unshift(newEvent);
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(mock.events));
    setEvents(mock.events);
    return newEvent.txHash;
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        chainId,
        isCorrectNetwork,
        contractAddress,
        setContractAddress,
        isContractConfigured,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        openAppKitModal: () => (appKitModal ? appKitModal.open() : connectWallet()),
        lockers,
        events,
        isLoading,
        actionLoading,
        fetchLockers,
        fetchEvents,
        registerLocker,
        grantAccess,
        revokeAccess,
        setLockerStatus,
        getAuthorizedUsersForLocker,
        checkVirtualUnlockOnChain,
        recordVirtualUnlockOnChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}


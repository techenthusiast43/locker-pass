# LockerPass 🔐

**LockerPass** is a lightweight, decentralized Web3 locker permission management dApp built natively for **BOT Chain Testnet** (Chain ID: `968`).

It enables locker owners to register virtual lockers on-chain, grant time-bound or permanent access to wallet addresses, revoke permissions immediately, and run interactive virtual unlock verifications with smart contract proof.

---

## 🌟 Key Features

1. **Locker Registration on BOT Chain:**
   - Owners register virtual lockers with unique numeric IDs.
   - Transparent metadata storage (name, location/station description, creation timestamp).
2. **Granular Access Permissions:**
   - Grant permanent or time-bound access (hours, days, or custom expiration timestamps).
   - Instant permission revocation at any time by the locker owner.
   - Deactivate or reactivate lockers with a single click.
3. **Interactive Virtual Unlock Simulation:**
   - 3D perspective simulated locker door with status LEDs and electronic dial.
   - Real-time cryptographic authorization verification against the BOT Chain smart contract.
   - Web Audio API acoustic solenoid bolt click & feedback.
   - Auditor mode: verify any address without switching wallet accounts.
   - Clearly designated as a virtual simulation (no physical hardware required).
4. **On-Chain Audit History:**
   - Real-time indexing and display of all `LockerRegistered`, `AccessGranted`, `AccessRevoked`, and `LockerStatusChanged` events directly from BOT Chain blocks.
5. **Modern Tech Stack:**
   - React 18 + Vite + Tailwind CSS + Lucide Icons
   - Reown AppKit + Wagmi v2 + Viem + Ethers.js v6
   - Solidity `^0.8.20` smart contract

---

## 🌐 BOT Chain Testnet Network Configuration

| Property | Value |
| :--- | :--- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` (`0x3c8`) |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Currency** | `BOT` (18 Decimals) |
| **Total Supply** | `150,000,000 BOT` |
| **Block Explorer** | [https://scan.bohr.life/](https://scan.bohr.life/) |

---

## 📁 Repository Structure

```
locker-pass/
├── contracts/
│   └── LockerPass.sol            # Solidity ^0.8.20 Smart Contract
├── scripts/
│   ├── compile.cjs               # Compiles contract to ABI and Bytecode using solc
│   └── deploy.cjs                # Ethers.js deployer script targeting BOT Chain
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation, network pill & wallet connect
│   │   ├── Footer.jsx            # BOT Chain network specs & explorer links
│   │   ├── StatusBadge.jsx       # Active, Expired, Revoked, and Owner badges
│   │   ├── NetworkModal.jsx      # Network switch helper modal
│   │   └── VirtualLockerVisualizer.jsx # 3D animated virtual locker with bolt feedback
│   ├── context/
│   │   └── Web3Context.jsx       # Wallet connection & on-chain contract methods
│   ├── pages/
│   │   ├── LandingPage.jsx       # Hero, BOT Chain stats & architecture overview
│   │   ├── DashboardPage.jsx     # "My Lockers" dashboard with filter/search
│   │   ├── RegisterLockerPage.jsx # On-chain locker registration form
│   │   ├── LockerDetailsPage.jsx # Full locker metadata & access list
│   │   ├── GrantAccessPage.jsx   # Grant access with custom duration
│   │   ├── ManageAuthorizedUsersPage.jsx # List & revoke authorized wallets
│   │   ├── AccessVerificationPage.jsx    # Virtual Unlock demonstration
│   │   └── AccessHistoryPage.jsx # Smart contract event logs reader
│   ├── utils/
│   │   ├── botChainConfig.js     # Viem / Ethers BOT Chain testnet definitions
│   │   ├── contractABI.json      # Generated contract ABI
│   │   ├── contractAddress.js    # Target contract address on BOT Chain
│   │   └── formatters.js         # Address truncation & date formatters
│   ├── App.jsx                   # View routing & layout
│   ├── main.jsx                  # React entry point with QueryClientProvider
│   └── index.css                 # Tailwind base styles & 3D locker animations
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **MetaMask** or any EVM Web3 wallet browser extension.

### 2. Install Dependencies
```bash
npm install
```

### 3. Compile the Smart Contract
Compiles `contracts/LockerPass.sol` and writes the ABI and Bytecode to `artifacts/LockerPass.json` and `src/utils/contractABI.json`:
```bash
npm run compile:contract
```

### 4. Deploy to BOT Chain Testnet
1. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Set your deployer wallet private key:
   ```env
   PRIVATE_KEY=your_testnet_private_key_here
   BOT_CHAIN_RPC=https://rpc.bohr.life
   ```
3. Run the deployment script:
   ```bash
   npm run deploy:contract
   ```
   *The script will deploy to Chain ID 968, wait for block confirmations, and automatically update `src/utils/contractAddress.js`.*

### 5. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔒 Smart Contract Details (`LockerPass.sol`)

### Core Methods:
- `registerLocker(string name, string locationDescription)`: Creates a new locker with an incremental unique ID and assigns the sender as owner.
- `grantAccess(uint256 lockerId, address user, uint256 validUntil)`: Grants permission for a target user until a specified Unix timestamp (or pass `0` / max uint for permanent).
- `revokeAccess(uint256 lockerId, address user)`: Revokes user permission immediately.
- `setLockerStatus(uint256 lockerId, bool isActive)`: Enables the owner to toggle active/deactivated state.
- `isAuthorized(uint256 lockerId, address user)`: Read-only call returning authorization status and human-readable reason.
- `checkVirtualUnlock(uint256 lockerId, address user)`: Comprehensive unlock simulation verification.
- `recordVirtualUnlock(uint256 lockerId)`: Optional on-chain transaction that logs unlock events to the blockchain audit log.

---

## 🛡️ Security & Design Considerations
- **No Sensitive Information:** Private keys or off-chain secrets are never requested or stored.
- **Granular Access Control:** Non-owners cannot grant, revoke, or toggle locker status.
- **Gas Efficiency:** Custom Solidity errors (`error NotLockerOwner()`, etc.) and storage packing reduce gas consumption.
- **Fail-safe Verification:** Deactivated lockers deny access regardless of previously active permissions.


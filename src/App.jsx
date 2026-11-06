import React, { useState } from 'react';
import { useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NetworkModal from './components/NetworkModal';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegisterLockerPage from './pages/RegisterLockerPage';
import LockerDetailsPage from './pages/LockerDetailsPage';
import GrantAccessPage from './pages/GrantAccessPage';
import ManageAuthorizedUsersPage from './pages/ManageAuthorizedUsersPage';
import AccessVerificationPage from './pages/AccessVerificationPage';
import AccessHistoryPage from './pages/AccessHistoryPage';

import { BOT_CHAIN_ID, BOT_CHAIN_EXPLORER } from './utils/botChainConfig';
import { truncateAddress } from './utils/formatters';
import { Shield, Sparkles, ExternalLink, Settings, CheckCircle2, Terminal } from 'lucide-react';

export default function App() {
  const {
    account,
    balance,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
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
    contractAddress,
    setContractAddress,
    isContractConfigured,
    openAppKitModal
  } = useWeb3();

  const [currentTab, setCurrentTab] = useState('landing');
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [isContractConfigModalOpen, setIsContractConfigModalOpen] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState(contractAddress || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleRegisterLocker = async (name, location) => {
    setIsSubmitting(true);
    try {
      return await registerLocker(name, location);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantAccess = async (lockerId, user, validUntil) => {
    setIsSubmitting(true);
    try {
      return await grantAccess(lockerId, user, validUntil);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (lockerId, user) => {
    return await revokeAccess(lockerId, user);
  };

  const handleToggleLockerStatus = async (lockerId, nextStatus) => {
    return await setLockerStatus(lockerId, nextStatus);
  };

  const handleSaveContractAddress = (e) => {
    e.preventDefault();
    if (customAddressInput.trim()) {
      setContractAddress(customAddressInput.trim());
      setIsContractConfigModalOpen(false);
      fetchLockers();
      fetchEvents();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Network Warning Modal if wallet connected but on wrong chain */}
      <NetworkModal
        isOpen={Boolean(account && !isCorrectNetwork && showNetworkModal)}
        onClose={() => setShowNetworkModal(false)}
        currentChainId={chainId}
        onSwitchNetwork={switchNetwork}
      />

      {/* Top Contract Status Pill Banner */}
      <div className="w-full bg-[#0a101d] border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isContractConfigured ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live BOT Contract:</span>
                <a
                  href={`${BOT_CHAIN_EXPLORER}/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-emerald-300 flex items-center gap-1"
                >
                  {truncateAddress(contractAddress)}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-teal-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Interactive Virtual Staging Mode: Ready for deployment to BOT Chain Testnet (968)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsContractConfigModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-mono"
            >
              <Settings className="w-3 h-3 text-slate-400" />
              <span>{isContractConfigured ? 'Change Address' : 'Set Contract Address'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        account={account}
        balance={balance}
        chainId={chainId}
        isCorrectNetwork={isCorrectNetwork}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        switchNetwork={switchNetwork}
        openAppKitModal={openAppKitModal}
      />

      {/* Contract Address Config Modal */}
      {isContractConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Contract Deployment Configuration</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your deployed LockerPass contract address on BOT Chain Testnet (Chain ID 968).
            </p>

            <form onSubmit={handleSaveContractAddress} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-300 uppercase block mb-1">
                  Contract Address:
                </label>
                <input
                  type="text"
                  value={customAddressInput}
                  onChange={(e) => setCustomAddressInput(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-300 font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>Deployment Command:</span>
                </div>
                <code className="block bg-slate-900 p-2 rounded text-emerald-300 font-mono text-[10px] break-all">
                  npm run deploy:contract
                </code>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContractConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Page View */}
      <main className="flex-1 w-full">
        {currentTab === 'landing' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            account={account}
            connectWallet={connectWallet}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            lockers={lockers}
            isLoading={isLoading}
            onRefresh={fetchLockers}
            onSelectLocker={setSelectedLocker}
            setCurrentTab={setCurrentTab}
            account={account}
            onToggleLockerStatus={handleToggleLockerStatus}
            actionLoading={actionLoading}
          />
        )}

        {currentTab === 'register' && (
          <RegisterLockerPage
            onRegisterLocker={handleRegisterLocker}
            isSubmitting={isSubmitting}
            setCurrentTab={setCurrentTab}
            account={account}
            isCorrectNetwork={isCorrectNetwork}
            switchNetwork={switchNetwork}
          />
        )}

        {currentTab === 'details' && (
          <LockerDetailsPage
            locker={selectedLocker || lockers[0]}
            onBack={() => setCurrentTab('dashboard')}
            setCurrentTab={setCurrentTab}
            onSelectLocker={setSelectedLocker}
            account={account}
            onToggleStatus={handleToggleLockerStatus}
            isActionLoading={Boolean(actionLoading)}
            getAuthorizedUsersForLocker={getAuthorizedUsersForLocker}
          />
        )}

        {currentTab === 'grant' && (
          <GrantAccessPage
            lockers={lockers}
            selectedLocker={selectedLocker}
            onSelectLocker={setSelectedLocker}
            onGrantAccess={handleGrantAccess}
            isSubmitting={isSubmitting}
            setCurrentTab={setCurrentTab}
            account={account}
            isCorrectNetwork={isCorrectNetwork}
          />
        )}

        {currentTab === 'manage-users' && (
          <ManageAuthorizedUsersPage
            lockers={lockers}
            selectedLocker={selectedLocker}
            onSelectLocker={setSelectedLocker}
            setCurrentTab={setCurrentTab}
            account={account}
            getAuthorizedUsersForLocker={getAuthorizedUsersForLocker}
            onRevokeAccess={handleRevokeAccess}
            isRevoking={isSubmitting}
          />
        )}

        {currentTab === 'verify' && (
          <AccessVerificationPage
            lockers={lockers}
            selectedLocker={selectedLocker}
            onSelectLocker={setSelectedLocker}
            setCurrentTab={setCurrentTab}
            account={account}
            checkVirtualUnlockOnChain={checkVirtualUnlockOnChain}
            recordVirtualUnlockOnChain={recordVirtualUnlockOnChain}
            isRecording={isSubmitting}
          />
        )}

        {currentTab === 'history' && (
          <AccessHistoryPage
            events={events}
            isLoading={isLoading}
            onRefresh={fetchEvents}
            setCurrentTab={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}


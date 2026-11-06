import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Cpu,
  UserCheck,
  Radio
} from 'lucide-react';
import VirtualLockerVisualizer from '../components/VirtualLockerVisualizer';
import StatusBadge from '../components/StatusBadge';
import { truncateAddress, isValidAddress } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER, BOT_CHAIN_ID } from '../utils/botChainConfig';

export default function AccessVerificationPage({ 
  lockers = [], 
  selectedLocker, 
  onSelectLocker, 
  setCurrentTab, 
  account, 
  checkVirtualUnlockOnChain, 
  recordVirtualUnlockOnChain, 
  isRecording 
}) {
  const [lockerId, setLockerId] = useState(selectedLocker?.id?.toString() || '');
  const [testAddress, setTestAddress] = useState(account || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [customLockerInput, setCustomLockerInput] = useState('');

  useEffect(() => {
    if (selectedLocker) {
      setLockerId(selectedLocker.id.toString());
    } else if (lockers.length > 0 && !lockerId) {
      setLockerId(lockers[0].id.toString());
    }
  }, [selectedLocker, lockers]);

  useEffect(() => {
    if (account && !testAddress) {
      setTestAddress(account);
    }
  }, [account]);

  const activeLocker = lockers.find((l) => l.id.toString() === lockerId) || (
    lockerId ? { id: lockerId, name: `Locker #${lockerId}`, locationDescription: 'BOT Chain Virtual Node', isActive: true } : null
  );

  const handleUnlockAttempt = async () => {
    if (!lockerId) return null;
    const targetAddress = (testAddress && isValidAddress(testAddress)) ? testAddress : account;

    if (!targetAddress) {
      setAuthStatus({
        authorized: false,
        reason: 'Please connect your wallet or enter a target address to test.',
        validUntil: 0,
      });
      return { authorized: false };
    }

    setIsVerifying(true);
    try {
      const result = await checkVirtualUnlockOnChain(lockerId, targetAddress);
      setAuthStatus(result);
      return result;
    } catch (err) {
      const failure = {
        authorized: false,
        reason: err?.message || 'Failed to verify on BOT Chain.',
        validUntil: 0,
      };
      setAuthStatus(failure);
      return failure;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecordOnChain = async () => {
    if (!lockerId || !recordVirtualUnlockOnChain) return;
    try {
      await recordVirtualUnlockOnChain(lockerId);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = account && activeLocker?.owner && activeLocker.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <span>Virtual Unlock Verification</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate cryptographic locker door unlocking directly against the BOT Chain smart contract.
          </p>
        </div>

        {/* Live Network Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono self-start sm:self-auto">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>BOT Chain ({BOT_CHAIN_ID})</span>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Locker Select */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
            Target Locker
          </label>
          <div className="flex gap-2">
            <select
              value={lockerId}
              onChange={(e) => {
                setLockerId(e.target.value);
                const found = lockers.find((l) => l.id.toString() === e.target.value);
                if (found) onSelectLocker(found);
                setAuthStatus(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {lockers.map((l) => (
                <option key={l.id.toString()} value={l.id.toString()}>
                  #{l.id.toString()} — {l.name} {l.isActive ? '(Active)' : '(Deactivated)'}
                </option>
              ))}
            </select>

            {/* Custom ID direct input if desired */}
            <input
              type="number"
              placeholder="Custom ID"
              value={customLockerInput}
              onChange={(e) => setCustomLockerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customLockerInput) {
                  setLockerId(customLockerInput);
                  setAuthStatus(null);
                }
              }}
              className="w-28 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Test Address Configuration */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Verifier Address (Tester)
            </label>
            {account && (
              <button
                type="button"
                onClick={() => setTestAddress(account)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Use My Connected Wallet
              </button>
            )}
          </div>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => {
              setTestAddress(e.target.value);
              setAuthStatus(null);
            }}
            placeholder="0x... (defaults to connected wallet)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            You can verify any wallet address against this locker without switching MetaMask accounts.
          </p>
        </div>
      </div>

      {/* Centerpiece: Virtual Locker 3D Visualizer */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-2xl flex flex-col items-center">
        <VirtualLockerVisualizer
          locker={activeLocker}
          isOwner={isOwner}
          authStatus={authStatus}
          userAddress={(testAddress && isValidAddress(testAddress)) ? testAddress : account}
          onUnlockAttempt={handleUnlockAttempt}
          isVerifying={isVerifying}
          onRecordOnChain={recordVirtualUnlockOnChain ? handleRecordOnChain : null}
          isRecording={isRecording}
        />
      </div>

    </div>
  );
}


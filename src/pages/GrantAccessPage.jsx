import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Calendar,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { isValidAddress, truncateAddress } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER, BOT_NATIVE_TOKEN } from '../utils/botChainConfig';

export default function GrantAccessPage({
  lockers = [],
  selectedLocker,
  onSelectLocker,
  onGrantAccess,
  isSubmitting,
  setCurrentTab,
  account,
  isCorrectNetwork
}) {
  const [lockerId, setLockerId] = useState(selectedLocker?.id?.toString() || '');
  const [userAddress, setUserAddress] = useState('');
  const [expiryType, setExpiryType] = useState('permanent'); // '1h', '24h', '7d', 'custom', 'permanent'
  const [customDateTime, setCustomDateTime] = useState('');
  const [error, setError] = useState(null);
  const [grantResult, setGrantResult] = useState(null);

  // Filter to owned lockers only
  const myLockers = lockers.filter(
    (l) => account && l.owner && l.owner.toLowerCase() === account.toLowerCase()
  );

  useEffect(() => {
    if (selectedLocker) {
      setLockerId(selectedLocker.id.toString());
    } else if (myLockers.length > 0 && !lockerId) {
      setLockerId(myLockers[0].id.toString());
    }
  }, [selectedLocker, myLockers]);

  const calculateExpiryTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    switch (expiryType) {
      case '1h':
        return now + 3600;
      case '24h':
        return now + 86400;
      case '7d':
        return now + 86400 * 7;
      case '30d':
        return now + 86400 * 30;
      case 'custom':
        if (!customDateTime) return null;
        return Math.floor(new Date(customDateTime).getTime() / 1000);
      case 'permanent':
      default:
        return 0; // Contract normalizes 0 to max uint256 for permanent
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!lockerId) {
      setError('Please select a locker.');
      return;
    }

    if (!isValidAddress(userAddress)) {
      setError('Invalid Ethereum/EVM wallet address. Must start with 0x followed by 40 hexadecimal characters.');
      return;
    }

    if (userAddress.toLowerCase() === account?.toLowerCase()) {
      setError('You are the locker owner and already possess perpetual access. You do not need to grant access to yourself.');
      return;
    }

    const expiryTimestamp = calculateExpiryTimestamp();
    if (expiryType === 'custom' && (!expiryTimestamp || expiryTimestamp <= Math.floor(Date.now() / 1000))) {
      setError('Custom expiration date and time must be set in the future.');
      return;
    }

    try {
      const result = await onGrantAccess(lockerId, userAddress.trim(), expiryTimestamp);
      if (result && result.success) {
        setGrantResult({
          ...result,
          targetUser: userAddress.trim(),
          lockerId,
          expiryTimestamp,
        });
      }
    } catch (err) {
      setError(err?.message || 'Transaction rejected or failed.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* Back button */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <span>Grant Locker Access</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Authorize another wallet address with customized expiration timestamps on BOT Chain.
        </p>
      </div>

      {grantResult ? (
        /* Success Screen */
        <div className="p-8 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Access Successfully Granted!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Permission written on-chain to BOT Chain Testnet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Target Locker:</span>
              <span className="text-white font-bold">Locker #{grantResult.lockerId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Authorized Wallet:</span>
              <a
                href={`${BOT_CHAIN_EXPLORER}/address/${grantResult.targetUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                {truncateAddress(grantResult.targetUser)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Access Validity:</span>
              <span className="text-emerald-400 font-semibold">
                {grantResult.expiryTimestamp === 0 ? 'Permanent Pass' : new Date(grantResult.expiryTimestamp * 1000).toLocaleString()}
              </span>
            </div>
            {grantResult.txHash && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Transaction:</span>
                <a
                  href={`${BOT_CHAIN_EXPLORER}/tx/${grantResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View on BOT Scan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setGrantResult(null);
                setUserAddress('');
              }}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Grant to Another User
            </button>
            <button
              onClick={() => setCurrentTab('manage-users')}
              className="py-2.5 px-5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              View Authorized Users
            </button>
          </div>
        </div>
      ) : (
        /* Grant Access Form */
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Locker Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Target Locker <span className="text-emerald-400">*</span>
            </label>
            {myLockers.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300">
                You do not own any lockers yet. Please register a locker first.
              </div>
            ) : (
              <select
                value={lockerId}
                onChange={(e) => {
                  setLockerId(e.target.value);
                  const found = myLockers.find((l) => l.id.toString() === e.target.value);
                  if (found) onSelectLocker(found);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {myLockers.map((l) => (
                  <option key={l.id.toString()} value={l.id.toString()}>
                    #{l.id.toString()} — {l.name} {l.isActive ? '(Active)' : '(Deactivated)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* User Address Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Recipient Wallet Address <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Full 42-character Ethereum address (e.g. 0x71C...4982).
            </p>
          </div>

          {/* Expiration Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Permission Validity Duration</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'permanent', label: 'Permanent' },
                { id: '1h', label: '1 Hour' },
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: 'custom', label: 'Custom' },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setExpiryType(preset.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${expiryType === preset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {expiryType === 'custom' && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <label className="text-[11px] text-slate-400">Choose expiration date & time:</label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Contract Access Guarantee:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only you (the verified locker owner on BOT Chain) can grant or revoke this permission. Once granted, the user can immediately run virtual unlock verifications against the contract until expiration or owner revocation.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || myLockers.length === 0 || !account || !isCorrectNetwork}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isSubmitting
              ? 'bg-cyan-600/70 text-slate-200 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Grant on BOT Chain...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Authorize Wallet Address</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}


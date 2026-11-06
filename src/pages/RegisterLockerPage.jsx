import React, { useState } from 'react';
import { 
  PlusCircle, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { BOT_CHAIN_ID, BOT_CHAIN_EXPLORER, BOT_NATIVE_TOKEN } from '../utils/botChainConfig';

export default function RegisterLockerPage({ 
  onRegisterLocker, 
  isSubmitting, 
  setCurrentTab, 
  account, 
  isCorrectNetwork, 
  switchNetwork 
}) {
  const [name, setName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [registeredLocker, setRegisteredLocker] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a descriptive name for your locker.');
      return;
    }

    try {
      const result = await onRegisterLocker(name.trim(), locationDescription.trim());
      if (result && result.success) {
        setRegisteredLocker(result);
      }
    } catch (err) {
      setError(err?.message || 'Transaction failed. Please check your BOT balance for gas.');
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
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span>Register New Locker</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Mint a new virtual locker on BOT Chain. You will be registered as the sole owner with permission granting rights.
        </p>
      </div>

      {/* Network Warning Banner if needed */}
      {!account ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Please connect your wallet to register lockers on BOT Chain Testnet.</span>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Wrong network: Please switch to BOT Chain Testnet (Chain ID 968).</span>
          </div>
          <button
            onClick={switchNetwork}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold text-xs text-rose-200"
          >
            Switch Network
          </button>
        </div>
      ) : null}

      {/* Success Card */}
      {registeredLocker ? (
        <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Locker Successfully Registered!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your locker has been permanently recorded on BOT Chain blocks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs font-mono">
            {registeredLocker.id && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Assigned Locker ID:</span>
                <span className="text-emerald-400 font-bold">#{registeredLocker.id.toString()}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Locker Name:</span>
              <span className="text-white font-semibold">{name}</span>
            </div>
            {registeredLocker.txHash && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Transaction Hash:</span>
                <a
                  href={`${BOT_CHAIN_EXPLORER}/tx/${registeredLocker.txHash}`}
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
              onClick={() => setCurrentTab('grant')}
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Grant Access to a Wallet Now
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="py-2.5 px-5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
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

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Locker Name / Designation <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Vault #101 or Gym Locker 4B"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              A recognizable title for your locker stored on-chain.
            </p>
          </div>

          {/* Location / Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Location Description / Virtual Station
            </label>
            <textarea
              rows={3}
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. Sector 7, Science Wing or Cloud Virtual Locker Instance #9"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
            <p className="text-[11px] text-slate-500">
              Optional description or virtual terminal coordinates.
            </p>
          </div>

          {/* Blockchain & Gas Notice */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Network:</span>
              <span className="text-white font-mono">BOT Chain Testnet (968)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Estimated Gas Fee:</span>
              <span className="text-emerald-400 font-mono">~0.001 {BOT_NATIVE_TOKEN}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Owner Address:</span>
              <span className="text-slate-300 font-mono">{account || 'Connect Wallet'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !account || !isCorrectNetwork}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isSubmitting
                ? 'bg-emerald-600/70 text-slate-200 cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting to BOT Chain...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Confirm Registration on BOT Chain</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}


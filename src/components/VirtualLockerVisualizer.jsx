import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck, ShieldAlert, Key, Radio, Sparkles, CheckCircle2, AlertOctagon } from 'lucide-react';
import { truncateAddress, formatRemainingTime } from '../utils/formatters';

export default function VirtualLockerVisualizer({
  locker,
  isOwner,
  authStatus, // { authorized: boolean, reason: string, validUntil: number }
  userAddress,
  onUnlockAttempt,
  isVerifying,
  onRecordOnChain,
  isRecording
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialAngle, setDialAngle] = useState(0);
  const [showContents, setShowContents] = useState(false);

  // Play synthetic feedback sound using Web Audio API
  const playSolenoidSound = (unlocked) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (unlocked) {
        // High click-clack solenoid sound
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        // Low buzz error sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext not allowed or unsupported
    }
  };

  const handleUnlockClick = async () => {
    setDialAngle((prev) => prev + 360);
    const result = await onUnlockAttempt();
    if (result && result.authorized) {
      playSolenoidSound(true);
      setIsOpen(true);
      setShowContents(true);
    } else {
      playSolenoidSound(false);
      setIsOpen(false);
      setShowContents(false);
    }
  };

  const handleCloseLocker = () => {
    setIsOpen(false);
    setTimeout(() => setShowContents(false), 800);
  };

  const isAuthorized = authStatus?.authorized;
  const reason = authStatus?.reason;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Notice Banner */}
      <div className="w-full mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
          <span>
            <strong>Virtual Demonstration:</strong> This simulation verifies cryptographic permissions on BOT Chain Testnet. No physical locker hardware is connected.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 text-[10px] font-mono shrink-0">
          BOT-968
        </span>
      </div>

      {/* Locker Physical Frame Simulation */}
      <div className="relative w-full max-w-md h-96 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-slate-700 shadow-2xl overflow-hidden perspective-container flex items-center justify-center p-6">
        {/* Subtle Locker Internal Compartment (visible when open) */}
        <div className="absolute inset-4 rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Compartment Accessible</h4>
          <p className="text-xs text-slate-400 max-w-xs mb-3">
            Permission cryptographically verified on BOT Chain. Locker contents unlocked.
          </p>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            VAULT-TOKEN: 0x{locker?.id?.toString(16).padStart(4, '0')}...AUTHORIZED
          </div>
          <button
            onClick={handleCloseLocker}
            className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close Locker Door
          </button>
        </div>

        {/* Swinging Locker Door (3D transformed) */}
        <div
          className={`absolute inset-4 rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-600 shadow-2xl flex flex-col items-center justify-between p-6 locker-door ${
            isOpen ? 'unlocked' : ''
          }`}
          style={{
            transformOrigin: 'left center',
          }}
        >
          {/* Top vents / slots */}
          <div className="w-full flex justify-center gap-1.5">
            <div className="w-8 h-1 rounded bg-slate-700 shadow-inner"></div>
            <div className="w-8 h-1 rounded bg-slate-700 shadow-inner"></div>
            <div className="w-8 h-1 rounded bg-slate-700 shadow-inner"></div>
          </div>

          {/* Name & ID Plaque */}
          <div className="w-full text-center py-2 px-4 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              BOT Chain Secure Locker
            </div>
            <div className="text-xl font-black text-white tracking-wide">
              {locker?.name || `Locker #${locker?.id || '—'}`}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              ID: #{locker?.id?.toString() || '0'} • {locker?.locationDescription || 'Virtual Hub'}
            </div>
          </div>

          {/* Center Digital Electronic Dial */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-700 border-4 flex items-center justify-center shadow-xl transition-all duration-700 ${
                isOpen
                  ? 'border-emerald-400 shadow-emerald-500/20'
                  : authStatus && !isAuthorized
                  ? 'border-rose-500 shadow-rose-500/20'
                  : 'border-slate-500 shadow-black'
              }`}
              style={{
                transform: `rotate(${dialAngle}deg)`,
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-inner">
                {isOpen ? (
                  <Unlock className="w-8 h-8 text-emerald-400 animate-pulse" />
                ) : (
                  <Lock className={`w-8 h-8 ${authStatus && !isAuthorized ? 'text-rose-400' : 'text-slate-300'}`} />
                )}
              </div>
            </div>

            {/* LED Status Light */}
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOpen
                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse'
                    : authStatus && !isAuthorized
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-ping'
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                }`}
              ></span>
              <span className="text-xs font-mono font-medium text-slate-300 uppercase">
                {isOpen ? 'BOLT DISENGAGED' : authStatus && !isAuthorized ? 'ACCESS REFUSED' : 'SECURED & ARMED'}
              </span>
            </div>
          </div>

          {/* Bottom handle */}
          <div className="w-24 h-4 rounded-full bg-slate-700 border border-slate-600 shadow-inner"></div>
        </div>
      </div>

      {/* Control Action Panel */}
      <div className="w-full max-w-md mt-6 space-y-4">
        <button
          onClick={handleUnlockClick}
          disabled={isVerifying}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            isOpen
              ? 'bg-emerald-600 text-white shadow-emerald-500/25 hover:bg-emerald-500'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/30'
          } ${isVerifying ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying BOT Chain Permissions...</span>
            </>
          ) : isOpen ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Locker Unlocked (Click to Re-verify)</span>
            </>
          ) : (
            <>
              <Key className="w-5 h-5" />
              <span>Simulate Virtual Unlock</span>
            </>
          )}
        </button>

        {/* Verification Status Card */}
        {authStatus && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              isAuthorized
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {isAuthorized ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <div className="font-bold flex items-center justify-between">
                  <span>{isAuthorized ? 'Access Granted' : 'Access Denied'}</span>
                  <span className="text-xs font-mono font-normal opacity-80">
                    {formatRemainingTime(authStatus.validUntil)}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300">
                  {reason || (isAuthorized ? 'Wallet permission is active on BOT Chain' : 'Wallet address is not authorized for this locker')}
                </p>

                {isAuthorized && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-200/90 font-mono flex flex-wrap justify-between gap-1">
                    <span>Caller: {truncateAddress(userAddress)}</span>
                    <span>Valid Until: {new Date(Number(authStatus.validUntil) * 1000).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional On-Chain Recording */}
            {onRecordOnChain && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Record this unlock event on BOT Chain?</span>
                <button
                  onClick={onRecordOnChain}
                  disabled={isRecording}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isRecording ? 'Submitting...' : 'Write Log Tx'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


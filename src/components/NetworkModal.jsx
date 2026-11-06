import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { BOT_CHAIN_ID, BOT_CHAIN_EXPLORER, BOT_CHAIN_PARAMS } from '../utils/botChainConfig';

export default function NetworkModal({ isOpen, onClose, currentChainId, onSwitchNetwork }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Wrong Network Detected</h3>
        <p className="text-sm text-slate-300 mb-6">
          LockerPass is deployed on <span className="text-emerald-400 font-semibold">BOT Chain Testnet</span> (Chain ID: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">{BOT_CHAIN_ID}</code>).
          Your wallet is currently connected to Chain ID <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">{currentChainId || 'Unknown'}</code>.
        </p>

        <div className="space-y-3">
          <button
            onClick={onSwitchNetwork}
            className="w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Switch to BOT Chain Testnet
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all text-sm"
          >
            Continue in Read-Only Mode
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-400">
          <a
            href={BOT_CHAIN_EXPLORER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            BOT Scan Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  PlusCircle, 
  ArrowRight, 
  History, 
  Users, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { 
  BOT_CHAIN_ID, 
  BOT_CHAIN_RPC, 
  BOT_CHAIN_EXPLORER, 
  BOT_NATIVE_TOKEN, 
  BOT_TOTAL_SUPPLY 
} from '../utils/botChainConfig';

export default function LandingPage({ setCurrentTab, account, connectWallet }) {
  return (
    <div className="w-full space-y-24 py-6">
      
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6">
        {/* Glowing backdrop circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Network Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs font-medium text-emerald-400 mb-8 shadow-lg shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Deployed on BOT Chain Testnet (Chain ID: {BOT_CHAIN_ID})</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono">150M {BOT_NATIVE_TOKEN}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
          Decentralized Locker <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Permission Management
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Register lockers, grant time-bound or permanent access to wallet addresses, revoke permissions instantly, and verify virtual unlocks via on-chain smart contracts.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setCurrentTab('register')}
            className="py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register a Locker</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentTab('verify')}
            className="py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Test Virtual Unlock</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className="py-3.5 px-6 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <span>View My Lockers</span>
          </button>
        </div>

        {/* Live Chain Stats Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
          <div className="p-3">
            <div className="text-xs text-slate-400">Chain ID</div>
            <div className="text-lg font-bold text-white font-mono">{BOT_CHAIN_ID}</div>
            <div className="text-[11px] text-emerald-400">0x3c8 (BOT Testnet)</div>
          </div>
          <div className="p-3 border-l border-slate-800">
            <div className="text-xs text-slate-400">Native Asset</div>
            <div className="text-lg font-bold text-white font-mono">{BOT_NATIVE_TOKEN}</div>
            <div className="text-[11px] text-slate-400">Gas & Execution</div>
          </div>
          <div className="p-3 border-l border-slate-800">
            <div className="text-xs text-slate-400">Total Supply</div>
            <div className="text-lg font-bold text-white font-mono">{BOT_TOTAL_SUPPLY}</div>
            <div className="text-[11px] text-slate-400">Fixed Supply</div>
          </div>
          <div className="p-3 border-l border-slate-800">
            <div className="text-xs text-slate-400">RPC Status</div>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </div>
            <a 
              href={BOT_CHAIN_EXPLORER} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 mt-0.5"
            >
              Scan Explorer <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Architecture Workflow
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            How LockerPass Operates
          </h3>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Zero centralized backends. All permission registries and expiration rules reside directly on BOT Chain blocks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold mb-1">STEP 01</div>
            <h4 className="text-lg font-bold text-white mb-2">Register Virtual Locker</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mint a unique on-chain locker identity with customizable metadata and location descriptions. You retain full cryptographic ownership.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">STEP 02</div>
            <h4 className="text-lg font-bold text-white mb-2">Grant or Revoke Access</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorize any EVM wallet address with optional expiration timestamps (hours, days, or permanent). Revoke permissions at any second on-chain.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Unlock className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-purple-400 font-semibold mb-1">STEP 03</div>
            <h4 className="text-lg font-bold text-white mb-2">Virtual Unlock Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Users connect their wallet and test access against the smart contract. Authorized callers trigger the unlocked state with full audit proof.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 border border-slate-800">
          <div className="max-w-2xl mb-8">
            <h3 className="text-2xl font-bold text-white">
              Built Specifically for BOT Chain
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              High throughput, negligible transaction costs, and deterministic cryptographic permission checks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Gas Minimized</div>
                <div className="text-xs text-slate-400 mt-0.5">Optimized storage slot packing and custom Solidity errors.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Granular Expirations</div>
                <div className="text-xs text-slate-400 mt-0.5">Set precise Unix timestamp cutoffs or grant permanent passes.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Instant Deactivation</div>
                <div className="text-xs text-slate-400 mt-0.5">Owners can pause locker access instantly without deleting grants.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Public Verification</div>
                <div className="text-xs text-slate-400 mt-0.5">Anyone can query authorization status without gas fees via view calls.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Event Audit Trail</div>
                <div className="text-xs text-slate-400 mt-0.5">Complete transparent history of every grant, revocation, and registration.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white">Zero Private Data</div>
                <div className="text-xs text-slate-400 mt-0.5">Only public addresses and cryptographic permissions are stored.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}


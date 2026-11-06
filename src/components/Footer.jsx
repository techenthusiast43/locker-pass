import React from 'react';
import { Shield, ExternalLink, Globe, Cpu, Hash } from 'lucide-react';
import { 
  BOT_CHAIN_ID, 
  BOT_CHAIN_RPC, 
  BOT_CHAIN_EXPLORER, 
  BOT_NATIVE_TOKEN, 
  BOT_TOTAL_SUPPLY 
} from '../utils/botChainConfig';

export default function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-slate-800/80 bg-[#060910] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white font-mono">
                Locker<span className="text-emerald-400">Pass</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BOT Chain dApp
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Decentralized locker permission management built for high security and transparent access controls.
              Enables granular time-bound authorizations and verifiable virtual unlocks on the official BOT Chain.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-300">Notice:</strong> This is a virtual access demonstration environment.
              Permissions are verified against real on-chain smart contracts without requiring physical hardware actuators.
            </div>
          </div>

          {/* Col 2: BOT Chain Testnet Specs */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Network Specifications
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Network:</span>
                <span className="text-slate-200">BOT Chain Testnet</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Chain ID:</span>
                <span className="text-emerald-400 font-bold">{BOT_CHAIN_ID}</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Native Asset:</span>
                <span className="text-slate-200">{BOT_NATIVE_TOKEN}</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-500">Total Supply:</span>
                <span className="text-slate-200">{BOT_TOTAL_SUPPLY}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Links */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Developer Resources
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={BOT_CHAIN_EXPLORER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>BOT Scan Explorer</span>
                </a>
              </li>
              <li>
                <a
                  href={BOT_CHAIN_RPC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors font-mono text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>RPC: {BOT_CHAIN_RPC}</span>
                </a>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Deployed using Solidity ^0.8.20 and Ethers v6.
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} LockerPass on BOT Chain. All smart contract permissions verifiable on-chain.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              BOT Chain Testnet Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


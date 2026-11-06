import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  Wallet, 
  LogOut, 
  ChevronDown, 
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { BOT_CHAIN_ID, BOT_CHAIN_EXPLORER, BOT_NATIVE_TOKEN } from '../utils/botChainConfig';
import { truncateAddress } from '../utils/formatters';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  account, 
  balance, 
  chainId, 
  isCorrectNetwork, 
  connectWallet, 
  disconnectWallet, 
  switchNetwork,
  openAppKitModal
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'My Lockers', icon: LayoutDashboard },
    { id: 'register', label: 'Register Locker', icon: PlusCircle },
    { id: 'verify', label: 'Virtual Unlock', icon: Key },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  const handleConnectClick = () => {
    if (openAppKitModal) {
      openAppKitModal();
    } else {
      connectWallet();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                Locker<span className="text-emerald-400">Pass</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                BOT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Web3 Locker Permission Manager
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Network Status & Wallet */}
        <div className="flex items-center gap-3">
          {/* BOT Chain Testnet Indicator */}
          {account && (
            <button
              onClick={!isCorrectNetwork ? switchNetwork : undefined}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isCorrectNetwork
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/50 text-rose-300 border-rose-500/40 hover:bg-rose-900/50 cursor-pointer animate-pulse'
              }`}
              title={isCorrectNetwork ? 'Connected to BOT Chain Testnet' : 'Click to switch network'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCorrectNetwork ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              ></span>
              <span>
                {isCorrectNetwork ? 'BOT Chain (968)' : 'Switch to BOT Chain'}
              </span>
            </button>
          )}

          {/* Wallet Button */}
          {!account ? (
            <button
              onClick={handleConnectClick}
              className="py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                <div className="text-left">
                  <div className="text-xs font-mono font-semibold text-white">
                    {truncateAddress(account)}
                  </div>
                  {balance !== null && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      {parseFloat(balance).toFixed(3)} {BOT_NATIVE_TOKEN}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Connected Address</div>
                    <div className="text-slate-200 break-all">{truncateAddress(account)}</div>
                  </div>
                  <a
                    href={`${BOT_CHAIN_EXPLORER}/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 rounded-lg mt-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View on BOT Scan</span>
                  </a>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg mt-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/90 py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}


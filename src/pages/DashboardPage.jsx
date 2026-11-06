import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Users, 
  Key, 
  Settings, 
  Power, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp, truncateAddress } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER } from '../utils/botChainConfig';

export default function DashboardPage({ 
  lockers = [], 
  isLoading, 
  onRefresh, 
  onSelectLocker, 
  setCurrentTab, 
  account, 
  onToggleLockerStatus,
  actionLoading 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [viewScope, setViewScope] = useState('mine'); // 'mine' or 'all'

  const myLockers = lockers.filter(
    (l) => account && l.owner && l.owner.toLowerCase() === account.toLowerCase()
  );

  const displayedList = viewScope === 'mine' ? myLockers : lockers;

  const filteredLockers = displayedList.filter((locker) => {
    const matchesSearch = 
      locker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locker.locationDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locker.id?.toString().includes(searchQuery);

    if (statusFilter === 'active') return matchesSearch && locker.isActive;
    if (statusFilter === 'inactive') return matchesSearch && !locker.isActive;
    return matchesSearch;
  });

  const activeCount = myLockers.filter((l) => l.isActive).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span>Locker Dashboard</span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh from BOT Chain"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your registered lockers and active wallet permissions on BOT Chain Testnet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('register')}
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Locker</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">My Owned Lockers</div>
            <div className="text-3xl font-black text-white mt-1 font-mono">{myLockers.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Registered by {account ? truncateAddress(account) : 'Guest'}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Lockers</div>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">{activeCount}</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Ready for access grants</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Global Network Lockers</div>
            <div className="text-3xl font-black text-teal-300 mt-1 font-mono">{lockers.length}</div>
            <div className="text-[11px] text-teal-500/80 mt-0.5">Total on BOT Chain</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and View Toggles */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Scope Toggle: Mine vs All */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewScope('mine')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewScope === 'mine'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Lockers ({myLockers.length})
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewScope === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Lockers ({lockers.length})
            </button>
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Lockers Grid */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-slate-900/30 border border-slate-800 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm font-semibold text-white">Fetching Lockers from BOT Chain...</div>
          <div className="text-xs text-slate-400 mt-1">Reading contract state on Chain ID 968</div>
        </div>
      ) : filteredLockers.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/20 border border-slate-800/80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {viewScope === 'mine' ? 'You have not registered any lockers yet' : 'No lockers match your query'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Register your first virtual locker on BOT Chain to start granting and revoking permissions.
          </p>
          <button
            onClick={() => setCurrentTab('register')}
            className="py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register First Locker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLockers.map((locker) => {
            const isOwner = account && locker.owner && locker.owner.toLowerCase() === account.toLowerCase();
            return (
              <div
                key={locker.id.toString()}
                className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Locker ID & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ID #{locker.id.toString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {isOwner && <StatusBadge type="owner" />}
                      <StatusBadge type="lockerStatus" status={locker.isActive} />
                    </div>
                  </div>

                  {/* Locker Name & Location */}
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {locker.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {locker.locationDescription || 'Virtual Access Station'}
                  </p>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5 text-xs font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Owner:</span>
                      <a
                        href={`${BOT_CHAIN_EXPLORER}/address/${locker.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-emerald-400 flex items-center gap-1"
                      >
                        {truncateAddress(locker.owner)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created:</span>
                      <span className="text-slate-300">{formatTimestamp(locker.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Simulate Unlock shortcut */}
                    <button
                      onClick={() => {
                        onSelectLocker(locker);
                        setCurrentTab('verify');
                      }}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Virtual Unlock Simulation"
                    >
                      <Key className="w-4 h-4" />
                    </button>

                    {/* Manage Users shortcut (if owner) */}
                    {isOwner && (
                      <button
                        onClick={() => {
                          onSelectLocker(locker);
                          setCurrentTab('manage-users');
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Manage Authorized Users"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}

                    {/* Toggle Active Status */}
                    {isOwner && onToggleLockerStatus && (
                      <button
                        onClick={() => onToggleLockerStatus(locker.id, !locker.isActive)}
                        disabled={actionLoading === locker.id.toString()}
                        className={`p-2 rounded-lg transition-colors ${
                          locker.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                        }`}
                        title={locker.isActive ? 'Deactivate Locker' : 'Activate Locker'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Details Button */}
                  <button
                    onClick={() => {
                      onSelectLocker(locker);
                      setCurrentTab('details');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}


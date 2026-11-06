import React, { useState } from 'react';
import { 
  History, 
  ArrowLeft, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  UserPlus, 
  UserMinus, 
  Lock, 
  Power, 
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { truncateAddress, formatTimestamp } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER } from '../utils/botChainConfig';

export default function AccessHistoryPage({ 
  events = [], 
  isLoading, 
  onRefresh, 
  setCurrentTab 
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [filterLockerId, setFilterLockerId] = useState('');

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'ALL' && ev.type !== filterType) return false;
    if (filterLockerId && ev.lockerId?.toString() !== filterLockerId.trim()) return false;
    return true;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'LockerRegistered':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case 'AccessGranted':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'AccessRevoked':
        return <UserMinus className="w-4 h-4 text-rose-400" />;
      case 'LockerStatusChanged':
        return <Power className="w-4 h-4 text-amber-400" />;
      case 'VirtualUnlockRecorded':
        return <Key className="w-4 h-4 text-purple-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'LockerRegistered':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Registered
          </span>
        );
      case 'AccessGranted':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Access Granted
          </span>
        );
      case 'AccessRevoked':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Access Revoked
          </span>
        );
      case 'LockerStatusChanged':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Status Changed
          </span>
        );
      case 'VirtualUnlockRecorded':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Unlock Logged
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      
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
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span>Access Audit History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of all locker registrations, access grants, revocations, and unlock attempts recorded on BOT Chain.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Chain Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'LockerRegistered', 'AccessGranted', 'AccessRevoked', 'LockerStatusChanged', 'VirtualUnlockRecorded'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All Events' : t.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-44">
          <input
            type="number"
            placeholder="Filter by Locker ID..."
            value={filterLockerId}
            onChange={(e) => setFilterLockerId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
          <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-xs text-slate-300 font-medium">Scanning BOT Chain event logs...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/30 border border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Blockchain Events Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Interact with LockerPass (register a locker or grant access) to view immutable transaction logs here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Event</th>
                <th className="py-4 px-5">Locker</th>
                <th className="py-4 px-5">Initiator / Target</th>
                <th className="py-4 px-5">Details</th>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-800/80">
                        {getEventIcon(ev.type)}
                      </div>
                      {getEventBadge(ev.type)}
                    </div>
                  </td>

                  <td className="py-4 px-5 text-white font-bold">
                    #{ev.lockerId?.toString()}
                  </td>

                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      {ev.user && (
                        <div className="flex items-center gap-1 text-slate-200">
                          <span className="text-[10px] text-slate-500 uppercase">Target:</span>
                          <a
                            href={`${BOT_CHAIN_EXPLORER}/address/${ev.user}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400"
                          >
                            {truncateAddress(ev.user)}
                          </a>
                        </div>
                      )}
                      {ev.owner && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <span className="text-[10px] text-slate-500 uppercase">Owner:</span>
                          <a
                            href={`${BOT_CHAIN_EXPLORER}/address/${ev.owner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400"
                          >
                            {truncateAddress(ev.owner)}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5 text-slate-300">
                    {ev.type === 'LockerRegistered' && <span>{ev.name} ({ev.location})</span>}
                    {ev.type === 'AccessGranted' && (
                      <span className="text-cyan-300">
                        Valid: {Number(ev.validUntil) > 10000000000 ? 'Permanent' : new Date(Number(ev.validUntil) * 1000).toLocaleDateString()}
                      </span>
                    )}
                    {ev.type === 'AccessRevoked' && <span className="text-rose-400">Access terminated</span>}
                    {ev.type === 'LockerStatusChanged' && (
                      <span className={ev.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                        {ev.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    )}
                    {ev.type === 'VirtualUnlockRecorded' && (
                      <span className={ev.success ? 'text-emerald-400' : 'text-rose-400'}>
                        {ev.success ? 'Unlock Confirmed' : 'Denied'}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-slate-400 text-[11px]">
                    {formatTimestamp(ev.timestamp)}
                  </td>

                  <td className="py-4 px-5 text-right">
                    {ev.txHash ? (
                      <a
                        href={`${BOT_CHAIN_EXPLORER}/tx/${ev.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-xs"
                      >
                        <span>{truncateAddress(ev.txHash)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}


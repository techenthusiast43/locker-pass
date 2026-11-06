import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Key, 
  UserPlus, 
  Users, 
  Power, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp, truncateAddress, formatRemainingTime } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER } from '../utils/botChainConfig';

export default function LockerDetailsPage({ 
  locker, 
  onBack, 
  setCurrentTab, 
  onSelectLocker, 
  account, 
  onToggleStatus, 
  isActionLoading, 
  getAuthorizedUsersForLocker 
}) {
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (locker && getAuthorizedUsersForLocker) {
      loadUsers();
    }
  }, [locker]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAuthorizedUsersForLocker(locker.id);
      setUsersList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!locker) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">No locker selected.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isOwner = account && locker.owner && locker.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lockers</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Locker ID #{locker.id.toString()}
              </span>
              <StatusBadge type="lockerStatus" status={locker.isActive} />
              {isOwner && <StatusBadge type="owner" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {locker.name}
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl">
              {locker.locationDescription || 'Virtual Access Station'}
            </p>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onSelectLocker(locker);
                setCurrentTab('verify');
              }}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Key className="w-4 h-4" />
              <span>Simulate Unlock</span>
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => {
                    onSelectLocker(locker);
                    setCurrentTab('grant');
                  }}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Grant Access</span>
                </button>

                <button
                  onClick={() => {
                    onSelectLocker(locker);
                    setCurrentTab('manage-users');
                  }}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Manage Users</span>
                </button>

                {onToggleStatus && (
                  <button
                    onClick={() => onToggleStatus(locker.id, !locker.isActive)}
                    disabled={isActionLoading}
                    className={`py-2.5 px-4 rounded-xl font-semibold text-xs border flex items-center gap-2 transition-all ${
                      locker.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{locker.isActive ? 'Deactivate Locker' : 'Activate Locker'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Registered Owner</div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-sm text-slate-200">
              <a
                href={`${BOT_CHAIN_EXPLORER}/address/${locker.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 text-xs"
              >
                {truncateAddress(locker.owner)}
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              {isOwner && <span className="text-[10px] text-emerald-400 font-bold">(You)</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Registration Date</div>
            <div className="mt-1 font-mono text-xs text-slate-200">
              {formatTimestamp(locker.createdAt)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Network Verification</div>
            <div className="mt-1 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              BOT Chain Testnet (968)
            </div>
          </div>
        </div>
      </div>

      {/* Authorized Users Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Authorized Users</span>
            </h3>
            <p className="text-xs text-slate-400">
              Wallet addresses granted cryptographic access to this locker on-chain.
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => {
                onSelectLocker(locker);
                setCurrentTab('grant');
              }}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          )}
        </div>

        {loadingUsers ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading authorized wallets from BOT Chain...
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">No delegated users have been authorized for this locker yet.</p>
            {isOwner && (
              <button
                onClick={() => {
                  onSelectLocker(locker);
                  setCurrentTab('grant');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Grant Access Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-slate-900/50 border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Authorized Wallet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expiration Time</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {usersList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <a
                        href={`${BOT_CHAIN_EXPLORER}/address/${item.user}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 flex items-center gap-1.5"
                      >
                        {truncateAddress(item.user)}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge 
                        type="permission" 
                        status={
                          Number(item.validUntil) === 0 
                            ? 'revoked' 
                            : Number(item.validUntil) > 10000000000 
                            ? 'permanent' 
                            : item.isActive 
                            ? 'active' 
                            : 'expired'
                        } 
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {formatTimestamp(item.validUntil)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatRemainingTime(item.validUntil)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isOwner && (
                        <button
                          onClick={() => {
                            onSelectLocker(locker);
                            setCurrentTab('manage-users');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-[11px] transition-colors"
                        >
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}


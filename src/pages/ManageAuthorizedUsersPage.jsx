import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowLeft, 
  UserMinus, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp, truncateAddress, formatRemainingTime } from '../utils/formatters';
import { BOT_CHAIN_EXPLORER } from '../utils/botChainConfig';

export default function ManageAuthorizedUsersPage({ 
  lockers = [], 
  selectedLocker, 
  onSelectLocker, 
  setCurrentTab, 
  account, 
  getAuthorizedUsersForLocker, 
  onRevokeAccess, 
  isRevoking 
}) {
  const [lockerId, setLockerId] = useState(selectedLocker?.id?.toString() || '');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [message, setMessage] = useState(null);

  const myLockers = lockers.filter(
    (l) => account && l.owner && l.owner.toLowerCase() === account.toLowerCase()
  );

  useEffect(() => {
    if (selectedLocker) {
      setLockerId(selectedLocker.id.toString());
      fetchUsers(selectedLocker.id);
    } else if (myLockers.length > 0 && !lockerId) {
      setLockerId(myLockers[0].id.toString());
      fetchUsers(myLockers[0].id);
    }
  }, [selectedLocker, myLockers]);

  const fetchUsers = async (targetId) => {
    if (!targetId || !getAuthorizedUsersForLocker) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await getAuthorizedUsersForLocker(targetId);
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (userAddr) => {
    setActionUser(userAddr);
    setMessage(null);
    try {
      const result = await onRevokeAccess(lockerId, userAddr);
      if (result && result.success) {
        setMessage({ type: 'success', text: `Access revoked for ${truncateAddress(userAddr)}.` });
        // Refresh users
        await fetchUsers(lockerId);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Revocation failed.' });
    } finally {
      setActionUser(null);
    }
  };

  const currentLocker = lockers.find((l) => l.id.toString() === lockerId);
  const isOwner = account && currentLocker?.owner && currentLocker.owner.toLowerCase() === account.toLowerCase();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span>Manage Authorized Users</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View active wallet permissions, expiration schedules, or immediately revoke access on-chain.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setCurrentTab('grant')}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Access to New User</span>
          </button>
        )}
      </div>

      {/* Locker Selector Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Selected Locker:
          </label>
          <div className="flex items-center gap-2">
            <select
              value={lockerId}
              onChange={(e) => {
                setLockerId(e.target.value);
                const found = lockers.find((l) => l.id.toString() === e.target.value);
                if (found) onSelectLocker(found);
                fetchUsers(e.target.value);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {lockers.map((l) => (
                <option key={l.id.toString()} value={l.id.toString()}>
                  #{l.id.toString()} — {l.name} ({l.owner && account && l.owner.toLowerCase() === account.toLowerCase() ? 'You own this' : 'Other'})
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchUsers(lockerId)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh from BOT Chain"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {currentLocker && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="text-right hidden sm:block">
              <div className="text-slate-400">{currentLocker.name}</div>
              <div className="text-slate-500 text-[11px]">{currentLocker.locationDescription}</div>
            </div>
            <StatusBadge type="lockerStatus" status={currentLocker.isActive} />
          </div>
        )}
      </div>

      {/* Notification banner */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
          <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-xs text-slate-300 font-medium">Fetching authorizations from BOT Chain...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/30 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Users Authorized For This Locker</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Authorize a wallet address to grant permission to unlock this virtual locker.
          </p>
          {isOwner && (
            <button
              onClick={() => setCurrentTab('grant')}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Grant Access</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Authorized Wallet</th>
                <th className="py-4 px-5">Access Status</th>
                <th className="py-4 px-5">Expiration Date</th>
                <th className="py-4 px-5">Remaining Time</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((item, idx) => {
                const isRevoked = Number(item.validUntil) === 0;
                const isPermanent = Number(item.validUntil) > 10000000000;
                const isProcessing = actionUser === item.user && isRevoking;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`${BOT_CHAIN_EXPLORER}/address/${item.user}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-emerald-400 flex items-center gap-1.5 font-bold"
                        >
                          {item.user}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge
                        type="permission"
                        status={
                          isRevoked
                            ? 'revoked'
                            : isPermanent
                            ? 'permanent'
                            : item.isActive
                            ? 'active'
                            : 'expired'
                        }
                      />
                    </td>

                    <td className="py-4 px-5 text-slate-300">
                      {formatTimestamp(item.validUntil)}
                    </td>

                    <td className="py-4 px-5 text-slate-400">
                      {formatRemainingTime(item.validUntil)}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {isOwner && !isRevoked ? (
                        <button
                          onClick={() => handleRevoke(item.user)}
                          disabled={isProcessing}
                          className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>{isProcessing ? 'Revoking...' : 'Revoke Access'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}


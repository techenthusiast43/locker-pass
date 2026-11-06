import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, Crown } from 'lucide-react';

export default function StatusBadge({ status, type = 'active' }) {
  if (type === 'owner') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Crown className="w-3.5 h-3.5" />
        Owner
      </span>
    );
  }

  if (type === 'lockerStatus') {
    if (status) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        Deactivated
      </span>
    );
  }

  if (type === 'permission') {
    if (status === 'permanent' || status === 'Permanent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Permanent Pass
        </span>
      );
    }
    if (status === 'active' || status === 'Active' || status === true) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Authorized
        </span>
      );
    }
    if (status === 'expired' || status === 'Expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        Revoked / Denied
      </span>
    );
  }

  return null;
}


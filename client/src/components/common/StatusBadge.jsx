import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const StatusBadge = ({ status, isStale, size = 'md' }) => {
  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        Stale / Offline
      </span>
    );
  }

  let badgeStyle = '';
  let Icon = HelpCircle;

  switch (status) {
    case 'Critical':
      badgeStyle = 'bg-red-50 text-red-700 border-red-200 shadow-sm animate-critical-light';
      Icon = AlertOctagon;
      break;
    case 'Warning':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      Icon = AlertTriangle;
      break;
    case 'Healthy':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      Icon = CheckCircle;
      break;
    default:
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-300';
      Icon = HelpCircle;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-xs font-bold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5" />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

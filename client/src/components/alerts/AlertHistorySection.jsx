import React, { useState } from 'react';
import { acknowledgeAlert } from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const AlertHistorySection = ({ alerts, onRefresh }) => {
  const { canEdit } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  const handleAcknowledge = async (alertId) => {
    setLoadingId(alertId);
    try {
      await acknowledgeAlert(alertId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center white-panel rounded-2xl">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">No alerts recorded</p>
        <p className="text-xs text-slate-500 mt-1">This transformer has no historical critical alerts.</p>
      </div>
    );
  }

  return (
    <div className="white-panel rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-mono border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold">Severity</th>
              <th className="px-4 py-3 font-bold">Alert Type</th>
              <th className="px-4 py-3 font-bold">Trigger Context</th>
              <th className="px-4 py-3 font-bold">Created At</th>
              <th className="px-4 py-3 font-bold">Status</th>
              {canEdit && <th className="px-4 py-3 text-right font-bold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {alerts.map((al) => (
              <tr key={al._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${
                      al.severity === 'Critical'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {al.severity}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 font-semibold">{al.type}</td>
                <td className="px-4 py-3 font-mono text-slate-700">
                  {al.valueContext ? `Score: ${al.valueContext.score}` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-500 font-medium">
                  {new Date(al.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {al.status === 'resolved' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolved ({new Date(al.resolvedAt).toLocaleTimeString()})
                    </span>
                  ) : al.status === 'acknowledged' ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Acknowledged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Open Fault
                    </span>
                  )}
                </td>

                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    {al.status === 'open' && (
                      <button
                        disabled={loadingId === al._id}
                        onClick={() => handleAcknowledge(al._id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        {loadingId === al._id ? 'Acking...' : 'Acknowledge'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistorySection;

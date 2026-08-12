import React, { useState } from 'react';
import { updateMaintenanceRecord } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle2, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const MaintenanceHistoryTable = ({ records, pagination, onRefresh }) => {
  const { canEdit } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (recordId, newStatus) => {
    setUpdatingId(recordId);
    try {
      await updateMaintenanceRecord(recordId, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update maintenance status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center white-panel rounded-2xl">
        <Wrench className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">No maintenance records found</p>
        <p className="text-xs text-slate-500 mt-1">This transformer has no reported maintenance history yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0072CE] border border-sky-200 animate-pulse">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Open
          </span>
        );
    }
  };

  return (
    <div className="white-panel rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-mono border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold">Issue Type</th>
              <th className="px-4 py-3 font-bold">Reported Date</th>
              <th className="px-4 py-3 font-bold">Technician</th>
              <th className="px-4 py-3 font-bold">Work & Parts</th>
              <th className="px-4 py-3 font-bold">Status Lifecycle</th>
              {canEdit && <th className="px-4 py-3 text-right font-bold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map((rec) => (
              <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900">{rec.issueType}</td>
                <td className="px-4 py-3 text-slate-500 font-medium">
                  {new Date(rec.reportedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-800 font-semibold">
                  {rec.technician || 'Unassigned'}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="line-clamp-1 font-medium text-slate-700">{rec.workPerformed || 'N/A'}</p>
                  {rec.partsUsed && (
                    <p className="text-[10px] text-slate-500 line-clamp-1">Parts: {rec.partsUsed}</p>
                  )}
                </td>
                <td className="px-4 py-3">{getStatusBadge(rec.status)}</td>

                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <select
                      value={rec.status}
                      disabled={updatingId === rec._id}
                      onChange={(e) => handleStatusChange(rec._id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0072CE]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-medium">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onRefresh && onRefresh(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onRefresh && onRefresh(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistoryTable;

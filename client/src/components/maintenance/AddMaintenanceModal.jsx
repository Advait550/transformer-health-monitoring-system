import React, { useState } from 'react';
import { createMaintenanceRecord } from '../../services/maintenanceService';
import { X, Wrench, AlertCircle } from 'lucide-react';

const AddMaintenanceModal = ({ isOpen, onClose, transformerId, onSuccess }) => {
  const [formData, setFormData] = useState({
    issueType: 'Routine Inspection',
    reportedAt: new Date().toISOString().split('T')[0],
    status: 'Open',
    technician: '',
    workPerformed: '',
    partsUsed: '',
    observations: '',
    nextMaintenanceDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        issueType: formData.issueType,
        reportedAt: new Date(formData.reportedAt),
        status: formData.status,
        technician: formData.technician,
        workPerformed: formData.workPerformed,
        partsUsed: formData.partsUsed,
        observations: formData.observations,
        nextMaintenanceDate: formData.nextMaintenanceDate ? new Date(formData.nextMaintenanceDate) : null,
      };

      const res = await createMaintenanceRecord(transformerId, payload);
      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            Add Maintenance Record
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue / Service Type *</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
              >
                <option value="Routine Inspection">Routine Inspection</option>
                <option value="Overheating Fault">Overheating Fault</option>
                <option value="Voltage Spike Check">Voltage Spike Check</option>
                <option value="Oil Refill / Leakage Fix">Oil Refill / Leakage Fix</option>
                <option value="Bushing Repair">Bushing Repair</option>
                <option value="General Overhaul">General Overhaul</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reported Date *</label>
              <input
                type="date"
                name="reportedAt"
                required
                value={formData.reportedAt}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Technician / Lead</label>
              <input
                type="text"
                name="technician"
                placeholder="e.g. Er. Rajesh Patil"
                value={formData.technician}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Work Performed</label>
            <textarea
              name="workPerformed"
              rows="2"
              placeholder="Describe repairs or inspections executed..."
              value={formData.workPerformed}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Parts / Consumables Used</label>
            <input
              type="text"
              name="partsUsed"
              placeholder="e.g. Transformer Oil 20L, Gasket seals"
              value={formData.partsUsed}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Next Scheduled Maintenance Date</label>
            <input
              type="date"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
            <strong>Important Rule:</strong> Completing a maintenance record does <em>not</em> directly change the transformer's health score or status. Recovery depends solely on new sensor readings.
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenanceModal;

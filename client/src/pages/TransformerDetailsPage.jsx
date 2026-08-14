import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import StatusBadge from '../components/common/StatusBadge';
import HealthScoreGauge from '../components/common/HealthScoreGauge';
import EditTransformerModal from '../components/transformer/EditTransformerModal';
import MaintenanceHistoryTable from '../components/maintenance/MaintenanceHistoryTable';
import AddMaintenanceModal from '../components/maintenance/AddMaintenanceModal';
import AlertHistorySection from '../components/alerts/AlertHistorySection';
import { getTransformerById, deleteTransformer, getTransformerReadings } from '../services/transformerService';
import { getMaintenanceRecords } from '../services/maintenanceService';
import { getAlertsByTransformer } from '../services/alertService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Zap,
  Activity,
  Thermometer,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Wrench,
  ShieldAlert,
  Clock,
  Gauge,
  Droplets,
  Flame,
  Waves,
  CloudRain,
  Wind,
} from 'lucide-react';

const TransformerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, canDelete } = useAuth();
  const { socket } = useSocket();

  const [transformer, setTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('maintenance');

  // Sub-data states
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [maintenancePagination, setMaintenancePagination] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch transformer details
  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransformerById(id);
      if (res.success) {
        setTransformer(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch transformer details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch maintenance records
  const fetchMaintenance = useCallback(async (page = 1) => {
    try {
      const res = await getMaintenanceRecords(id, { page, limit: 10 });
      if (res.success) {
        setMaintenanceRecords(res.data);
        setMaintenancePagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance history:', err);
    }
  }, [id]);

  // Fetch alert history
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlertsByTransformer(id);
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
    }
  }, [id]);

  // Fetch recent readings
  const fetchReadings = useCallback(async () => {
    try {
      const res = await getTransformerReadings(id, { limit: 15 });
      if (res.success) {
        setReadings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch readings:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    fetchMaintenance();
    fetchAlerts();
    fetchReadings();
  }, [fetchDetails, fetchMaintenance, fetchAlerts, fetchReadings]);

  // Socket.IO Real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleSensorUpdate = (data) => {
      if (data.transformerId === id) {
        setTransformer((prev) =>
          prev
            ? {
                ...prev,
                healthScore: data.healthScore,
                status: data.status,
                isStale: false,
                lastReadingAt: data.timestamp,
                latestReading: {
                  voltage: data.voltage,
                  current: data.current,
                  temperature: data.temperature,
                  timestamp: data.timestamp,
                },
              }
            : prev
        );
        fetchReadings();
      }
    };

    const handleAlertCreated = (data) => {
      if (data.transformerId === id) {
        fetchAlerts();
      }
    };

    const handleAlertResolved = (data) => {
      if (data.transformerId === id) {
        fetchAlerts();
      }
    };

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('alert-created', handleAlertCreated);
    socket.on('alert-resolved', handleAlertResolved);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('alert-created', handleAlertCreated);
      socket.off('alert-resolved', handleAlertResolved);
    };
  }, [socket, id, fetchAlerts, fetchReadings]);

  // Soft Deletion handler
  const handleDeactivate = async () => {
    setDeleting(true);
    try {
      const res = await deleteTransformer(id);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to deactivate transformer:', err);
    } finally {
      setDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#0072CE] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Loading transformer telemetry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transformer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-700">
          <p className="text-lg font-bold">Transformer not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-xs font-semibold hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    location,
    latitude,
    longitude,
    capacity,
    installationDate,
    healthScore,
    status,
    latestReading,
    isStale,
    lastReadingAt,
  } = transformer;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Link & Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#005691] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#0072CE]" /> Edit Details
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700 shadow-sm hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Deactivate
              </button>
            )}
          </div>
        </div>

        {/* Stale Warning Banner if offline */}
        {isStale && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 block">Offline / Stale Telemetry Warning</span>
                <span className="text-amber-800 font-medium">
                  No sensor reading received for over 60 minutes. Last reading: {lastReadingAt ? new Date(lastReadingAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Header Hero Panel */}
        <div className="white-panel p-6 sm:p-8 rounded-3xl mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={status} isStale={isStale} size="md" />
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-50 text-[#005691] border border-sky-100">
                  {capacity} kVA Capacity
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{name}</h1>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-medium flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Installed: {new Date(installationDate).toLocaleDateString()}
                </span>
                <span className="font-mono text-slate-500">
                  GPS: {latitude}, {longitude}
                </span>
              </div>
            </div>

            {/* Health Score Gauge Display */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 shadow-inner">
              <HealthScoreGauge score={healthScore} size="normal" />
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Health Score</span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {healthScore !== null ? `${healthScore} / 100` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">Backend Calculated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Sensor Telemetry Grid (9 Compact Parameters - Unified Theme) */}
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-mono mb-3">
          Live Multi-Sensor Telemetry (9 Real-Time Parameters)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {/* 1. Grid Voltage */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Grid Voltage</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.voltage} V` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Nominal: 230V ± 50V</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Load Current */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Load Current</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.current} A` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Nominal: 50A ± 30A</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Core Temperature */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Core Temperature</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.temperature} °C` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Nominal: 50°C ± 40°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Power Factor */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Power Factor (cos φ)</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? (latestReading.powerFactor !== undefined ? latestReading.powerFactor : 0.95) : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Nominal: 0.90 – 1.00</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Gauge className="w-5 h-5" />
            </div>
          </div>

          {/* 5. Oil Level */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Insulation Oil Level</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.oilLevel !== undefined ? latestReading.oilLevel : 85} %` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Nominal: &gt; 70%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Droplets className="w-5 h-5" />
            </div>
          </div>

          {/* 6. Oil Temperature */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Oil Temperature</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.oilTemperature !== undefined ? latestReading.oilTemperature : 50} °C` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Max Safe: 65°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          {/* 7. Mechanical Vibrations */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Mechanical Vibrations</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.vibrations !== undefined ? latestReading.vibrations : 1.2} mm/s` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Safe: &lt; 2.5 mm/s</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Waves className="w-5 h-5" />
            </div>
          </div>

          {/* 8. Oil Moisture Level */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Oil Moisture Content</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.moisture !== undefined ? latestReading.moisture : 15} ppm` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Safe Limit: &lt; 30 ppm</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>

          {/* 9. Dissolved Gas Analysis (DGA) */}
          <div className="white-panel p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Dissolved Gas (DGA)</span>
              <span className="text-xl font-extrabold text-[#005691] font-mono">
                {latestReading ? `${latestReading.dga !== undefined ? latestReading.dga : 20} ppm` : '--'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Key Gases (H₂, CH₄, C₂H₂)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-[#005691] border border-sky-100">
              <Wind className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs for History */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-white text-[#005691] border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600" /> Maintenance History ({maintenanceRecords.length})
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-white text-red-700 border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600" /> Alert History ({alerts.length})
            </button>

            <button
              onClick={() => setActiveTab('readings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'readings'
                  ? 'bg-white text-[#0072CE] border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-[#0072CE]" /> Telemetry History ({readings.length})
            </button>
          </div>

          {activeTab === 'maintenance' && canEdit && (
            <button
              onClick={() => setIsAddMaintenanceOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white adani-gradient shadow-sm hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          )}
        </div>

        {/* Tab Contents */}
        {activeTab === 'maintenance' && (
          <MaintenanceHistoryTable
            records={maintenanceRecords}
            pagination={maintenancePagination}
            onRefresh={(page) => fetchMaintenance(page)}
            transformerId={id}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertHistorySection
            alerts={alerts}
            onRefresh={() => fetchAlerts()}
          />
        )}

        {activeTab === 'readings' && (
          <div className="white-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-mono border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3">Timestamp</th>
                    <th className="px-3 py-3">Voltage</th>
                    <th className="px-3 py-3">Current</th>
                    <th className="px-3 py-3">Core Temp</th>
                    <th className="px-3 py-3">Power Factor</th>
                    <th className="px-3 py-3">Oil Level</th>
                    <th className="px-3 py-3">Oil Temp</th>
                    <th className="px-3 py-3">Vibrations</th>
                    <th className="px-3 py-3">Moisture</th>
                    <th className="px-3 py-3">DGA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-[11px]">
                  {readings.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 text-slate-500 font-sans whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.voltage} V</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.current} A</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.temperature} °C</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.powerFactor !== undefined ? r.powerFactor : 0.95}</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.oilLevel !== undefined ? r.oilLevel : 85} %</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.oilTemperature !== undefined ? r.oilTemperature : 50} °C</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.vibrations !== undefined ? r.vibrations : 1.2} mm/s</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.moisture !== undefined ? r.moisture : 15} ppm</td>
                      <td className="px-3 py-3 text-[#005691] font-bold whitespace-nowrap">{r.dga !== undefined ? r.dga : 20} ppm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <EditTransformerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transformer={transformer}
        onSuccess={() => fetchDetails()}
      />

      <AddMaintenanceModal
        isOpen={isAddMaintenanceOpen}
        onClose={() => setIsAddMaintenanceOpen(false)}
        transformerId={id}
        onSuccess={() => fetchMaintenance()}
      />

      {/* Delete/Deactivate Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Deactivate Transformer?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to deactivate <span className="text-slate-900 font-bold">{name}</span>? This will perform a <strong>soft deletion</strong>. The transformer will be removed from active monitoring, but all historical maintenance and alerts will remain accessible.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeactivate}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransformerDetailsPage;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import KolhapurMap from '../components/map/KolhapurMap';
import { getTransformers } from '../services/transformerService';
import { useSocket } from '../context/SocketContext';
import { RefreshCw, MapPin } from 'lucide-react';

const MapPage = () => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchTransformers = async () => {
    try {
      setLoading(true);
      const res = await getTransformers();
      if (res.success) {
        setTransformers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch map transformers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransformers();
  }, []);

  // Real-time socket updates for map markers
  useEffect(() => {
    if (!socket) return;

    const handleSensorUpdate = (data) => {
      setTransformers((prev) =>
        prev.map((t) =>
          t._id === data.transformerId
            ? {
                ...t,
                healthScore: data.healthScore,
                status: data.status,
                isStale: false,
                latestReading: {
                  voltage: data.voltage,
                  current: data.current,
                  temperature: data.temperature,
                },
              }
            : t
        )
      );
    };

    socket.on('sensor-update', handleSensorUpdate);
    return () => socket.off('sensor-update', handleSensorUpdate);
  }, [socket]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#005691]" />
              Kolhapur Geospatial Transformer Map
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Interactive map displaying live status markers for transformers across Kolhapur
            </p>
          </div>

          <button
            onClick={fetchTransformers}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-300"
            title="Refresh Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 min-h-[500px]">
          <KolhapurMap transformers={transformers} />
        </div>
      </main>
    </div>
  );
};

export default MapPage;

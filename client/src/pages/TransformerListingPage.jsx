import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import TransformerCard from '../components/transformer/TransformerCard';
import AddTransformerModal from '../components/transformer/AddTransformerModal';
import { getTransformers } from '../services/transformerService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, SlidersHorizontal, RefreshCw } from 'lucide-react';

const TransformerListingPage = () => {
  const { isAdmin } = useAuth();
  const { socket, isConnected } = useSocket();

  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('lowest-score'); // lowest health score first
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initial Data Fetch
  const fetchTransformersData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransformers();

      if (res.success) {
        setTransformers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch transformers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransformersData();
  }, [fetchTransformersData]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!socket) return;

    const handleSensorUpdate = (data) => {
      setTransformers((prevList) => {
        const index = prevList.findIndex((t) => t._id === data.transformerId);
        if (index === -1) return prevList;

        const updatedList = [...prevList];
        const target = updatedList[index];

        updatedList[index] = {
          ...target,
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
        };

        return updatedList;
      });
    };

    const handleStatusChange = (data) => {
      setTransformers((prevList) =>
        prevList.map((t) =>
          t._id === data.transformerId
            ? { ...t, status: data.newStatus, healthScore: data.score }
            : t
        )
      );
    };

    const handleStale = (data) => {
      setTransformers((prevList) =>
        prevList.map((t) =>
          t._id === data.transformerId ? { ...t, isStale: true } : t
        )
      );
    };

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('transformer-status-change', handleStatusChange);
    socket.on('transformer-stale', handleStale);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('transformer-status-change', handleStatusChange);
      socket.off('transformer-stale', handleStale);
    };
  }, [socket]);

  // Instant Client-Side Filter, Search & Sort
  const filteredTransformers = useMemo(() => {
    let result = [...transformers];

    // 1. Status Filter (Check status or healthScore threshold)
    if (statusFilter !== 'All') {
      result = result.filter((tx) => {
        if (statusFilter === 'Critical') {
          return tx.status === 'Critical' || (tx.healthScore !== null && tx.healthScore < 60);
        }
        if (statusFilter === 'Warning') {
          return tx.status === 'Warning' || (tx.healthScore !== null && tx.healthScore >= 60 && tx.healthScore < 80);
        }
        if (statusFilter === 'Healthy') {
          return tx.status === 'Healthy' || (tx.healthScore !== null && tx.healthScore >= 80);
        }
        return true;
      });
    }

    // 2. Search Query (Name, Location, Capacity)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((tx) => {
        const matchName = tx.name ? tx.name.toLowerCase().includes(q) : false;
        const matchLocation = tx.location ? tx.location.toLowerCase().includes(q) : false;
        const matchCapacity = tx.capacity ? tx.capacity.toString().includes(q) : false;
        return matchName || matchLocation || matchCapacity;
      });
    }

    // 3. Sorting
    if (sortBy === 'lowest-score') {
      result.sort((a, b) => {
        const scoreA = a.healthScore !== null ? a.healthScore : 999;
        const scoreB = b.healthScore !== null ? b.healthScore : 999;
        return scoreA - scoreB;
      });
    } else if (sortBy === 'highest-score') {
      result.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [transformers, searchQuery, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Title & Add Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Transformer Fleet Overview
              {isConnected && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Feed
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real-time telemetry & health score monitoring for Kolhapur city grid
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTransformersData()}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-300 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white adani-gradient shadow-md shadow-sky-600/20 hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Add Transformer
              </button>
            )}
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="white-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transformer name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0072CE] focus:bg-white transition-all"
            />
          </div>

          {/* Filter Chips & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['All', 'Critical', 'Warning', 'Healthy'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#005691] shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none"
              >
                <option value="lowest-score">Lowest Health Score First</option>
                <option value="highest-score">Highest Score First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transformer Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl white-card border border-slate-200 animate-pulse bg-white" />
            ))}
          </div>
        ) : filteredTransformers.length === 0 ? (
          <div className="white-panel p-12 text-center rounded-2xl">
            <p className="text-base font-bold text-slate-700">No matching transformers found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or switching status filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransformers.map((tx) => (
              <TransformerCard key={tx._id} transformer={tx} />
            ))}
          </div>
        )}
      </main>

      {/* Add Transformer Modal (Admin Only) */}
      <AddTransformerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchTransformersData()}
      />
    </div>
  );
};

export default TransformerListingPage;

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { ExternalLink } from 'lucide-react';

const KOLHAPUR_CENTER = [16.7050, 74.2433];

const MapBoundsUpdater = ({ transformers }) => {
  const map = useMap();

  useEffect(() => {
    if (transformers && transformers.length > 0) {
      const validPoints = transformers
        .filter((t) => t.latitude && t.longitude)
        .map((t) => [t.latitude, t.longitude]);

      if (validPoints.length > 0) {
        map.fitBounds(validPoints, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [transformers, map]);

  return null;
};

const KolhapurMap = ({ transformers }) => {
  const getMarkerColor = (status, isStale) => {
    if (isStale) return '#64748b'; // Slate
    switch (status) {
      case 'Critical':
        return '#dc2626'; // Red
      case 'Warning':
        return '#d97706'; // Amber / Yellow
      case 'Healthy':
        return '#059669'; // Emerald
      default:
        return '#0072ce'; // Blue
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-9rem)] rounded-3xl overflow-hidden white-panel shadow-sm">
      <MapContainer
        center={KOLHAPUR_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsUpdater transformers={transformers} />

        {transformers.map((tx) => {
          const color = getMarkerColor(tx.status, tx.isStale);
          return (
            <CircleMarker
              key={tx._id}
              center={[tx.latitude, tx.longitude]}
              radius={14}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 3,
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-slate-800 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-sm text-slate-900">{tx.name}</h4>
                    <span className="font-mono text-xs font-bold text-[#005691]">
                      Score: {tx.healthScore !== null ? tx.healthScore : '--'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">{tx.location}</p>

                  <div className="py-1">
                    <StatusBadge status={tx.status} isStale={tx.isStale} size="sm" />
                  </div>

                  {tx.latestReading && (
                    <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-center font-mono">
                      <div>
                        <span className="text-slate-400 block">Volt</span>
                        <span className="text-[#0072CE] font-bold">{tx.latestReading.voltage}V</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Curr</span>
                        <span className="text-amber-600 font-bold">{tx.latestReading.current}A</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Temp</span>
                        <span className="text-rose-600 font-bold">{tx.latestReading.temperature}°C</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-right">
                    <Link
                      to={`/transformers/${tx._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#005691] hover:text-[#0072CE]"
                    >
                      Open Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-xs shadow-lg space-y-1.5">
        <span className="font-bold text-slate-800 font-mono block mb-1">Kolhapur Status Legend</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="text-slate-700 font-medium">Critical (&lt;60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-700 font-medium">Warning (60–79)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-slate-700 font-medium">Healthy (≥80)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-slate-600 font-medium">Stale / Offline</span>
        </div>
      </div>
    </div>
  );
};

export default KolhapurMap;

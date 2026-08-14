import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import HealthScoreGauge from '../common/HealthScoreGauge';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const TransformerCard = ({ transformer }) => {
  const navigate = useNavigate();

  const {
    _id,
    name,
    location,
    capacity,
    healthScore,
    status,
    isStale,
    lastReadingAt,
  } = transformer;

  const formattedTime = lastReadingAt
    ? new Date(lastReadingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No readings';

  let cardBorder = 'border-slate-200 hover:border-sky-300';
  if (isStale) {
    cardBorder = 'border-slate-200 bg-slate-50/60 opacity-80';
  } else if (status === 'Critical') {
    cardBorder = 'border-red-300 bg-red-50/20';
  } else if (status === 'Warning') {
    cardBorder = 'border-amber-300 bg-amber-50/20';
  }

  return (
    <div
      onClick={() => navigate(`/transformers/${_id}`)}
      className={`group relative rounded-2xl white-card ${cardBorder} p-5 cursor-pointer flex flex-col justify-between hover:shadow-md transition-all`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="space-y-1 pr-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#005691] transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {location}
            </p>
          </div>

          <HealthScoreGauge score={healthScore} size="small" />
        </div>

        {/* Status Badge & Capacity Tag */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <StatusBadge status={status} isStale={isStale} size="sm" />
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#005691] border border-sky-100 font-mono">
            {capacity} kVA
          </span>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formattedTime}
        </span>
        <span className="flex items-center gap-1 font-bold text-[#005691] group-hover:translate-x-1 transition-transform">
          Details <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export default TransformerCard;

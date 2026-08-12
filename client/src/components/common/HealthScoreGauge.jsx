import React from 'react';

const HealthScoreGauge = ({ score, size = 'normal' }) => {
  const numScore = score !== null && score !== undefined ? score : 0;

  let colorClass = 'text-emerald-600 stroke-emerald-500';
  let bgGradient = 'from-emerald-50 to-white';
  let borderClass = 'border-emerald-200';

  if (numScore < 60) {
    colorClass = 'text-red-600 stroke-red-500';
    bgGradient = 'from-red-50 to-white';
    borderClass = 'border-red-200';
  } else if (numScore < 80) {
    colorClass = 'text-amber-600 stroke-amber-500';
    bgGradient = 'from-amber-50 to-white';
    borderClass = 'border-amber-200';
  }

  const isSmall = size === 'small';
  const dimension = isSmall ? 52 : 72;
  const strokeWidth = isSmall ? 4.5 : 6;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numScore / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-b ${bgGradient} border ${borderClass} shadow-sm`}>
      <svg width={dimension} height={dimension} className="transform -rotate-90">
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
          fill="transparent"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700 ease-out`}
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-extrabold ${isSmall ? 'text-xs' : 'text-base'} ${colorClass}`}>
          {score !== null ? score : '--'}
        </span>
      </div>
    </div>
  );
};

export default HealthScoreGauge;

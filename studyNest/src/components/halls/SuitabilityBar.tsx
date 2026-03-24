import React from 'react';

interface SuitabilityBarProps {
  score: number; // 0 to 100
  breakdown?: Record<string, any>;
}

export function SuitabilityBar({ score, breakdown }: SuitabilityBarProps) {
  const getColor = (s: number) => {
    if (s >= 75) return 'bg-emerald-500';
    if (s >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const color = getColor(score);
  const percentage = Math.min(Math.max(score, 0), 100);

  return (
    <div className="w-full group relative">
      <div className="flex justify-between items-center mb-1 text-xs text-neutral-500">
        <span>Suitability match</span>
        <span className="font-semibold text-neutral-700">{Math.round(score)}%</span>
      </div>
      <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="absolute z-10 hidden group-hover:block bottom-full left-0 mb-2 w-48 p-2 bg-white border border-neutral-200 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-xs">
          <p className="font-semibold mb-1 border-b border-neutral-100 pb-1 text-neutral-700">Score Breakdown</p>
          <ul className="space-y-1 mt-1 text-neutral-600">
            {Object.entries(breakdown).map(([key, val]) => (
              <li key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium">{String(val)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface UsageInsightChipProps {
  availabilityPercentage: number; // 0 to 100
  timeString: string; // e.g. "Tue 2-4 PM"
}

export function UsageInsightChip({ availabilityPercentage, timeString }: UsageInsightChipProps) {
  let icon, color, text;
  
  if (availabilityPercentage >= 75) {
    icon = <TrendingUp className="w-3.5 h-3.5" />;
    color = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    text = `Usually free ${timeString}`;
  } else if (availabilityPercentage <= 25) {
    icon = <TrendingDown className="w-3.5 h-3.5" />;
    color = 'bg-red-500/10 text-red-600 dark:text-red-400';
    text = `Usually busy ${timeString}`;
  } else {
    icon = <Minus className="w-3.5 h-3.5" />;
    color = 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400';
    text = `Moderate usage ${timeString}`;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

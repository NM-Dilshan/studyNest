interface OccupancyIndicatorProps {
  percentage: number;
  label?: string;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getLevel(value: number) {
  if (value <= 35) {
    return { text: "Low Occupancy", color: "bg-emerald-500", pill: "text-emerald-300" };
  }

  if (value <= 70) {
    return { text: "Medium Occupancy", color: "bg-amber-500", pill: "text-amber-300" };
  }

  return { text: "High Occupancy", color: "bg-rose-500", pill: "text-rose-300" };
}

export default function OccupancyIndicator({ percentage, label }: OccupancyIndicatorProps) {
  const safe = clamp(percentage);
  const level = getLevel(safe);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-slate-300">{label || "Occupancy"}</p>
        <p className={`text-xs font-semibold ${level.pill}`}>{level.text}</p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/75">
        <div
          className={`h-full rounded-full ${level.color} transition-[width] duration-700 ease-out`}
          style={{ width: `${safe}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs text-slate-400">{safe.toFixed(0)}%</p>
    </div>
  );
}

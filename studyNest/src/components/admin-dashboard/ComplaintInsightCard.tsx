import { Eye } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import AppLinkButton from "@/components/ui/AppLinkButton";

interface ComplaintInsightCardProps {
  location: string;
  issueCategory: string;
  priorityLabel: "High" | "Medium" | "Normal";
  status: string;
  timeText: string;
}

const PriorityBadge = ({ priority }: { priority: "High" | "Medium" | "Normal" }) => {
  const colors = {
    High: "border-rose-300/40 bg-rose-400/20 text-rose-100",
    Medium: "border-amber-300/40 bg-amber-400/20 text-amber-100",
    Normal: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
  };

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[priority]}`}>{priority}</span>;
};

export default function ComplaintInsightCard({
  location,
  issueCategory,
  priorityLabel,
  status,
  timeText,
}: ComplaintInsightCardProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-slate-950/45 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{location}</p>
          <p className="mt-0.5 text-xs text-slate-300">{issueCategory}</p>
        </div>
        <PriorityBadge priority={priorityLabel} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <StatusBadge status={status} className="normal-case tracking-normal" />
        <p className="text-xs text-slate-400">{timeText}</p>
      </div>

      <AppLinkButton
        href="/admin/complaints"
        size="sm"
        variant="secondary"
        className="mt-3"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </AppLinkButton>
    </div>
  );
}

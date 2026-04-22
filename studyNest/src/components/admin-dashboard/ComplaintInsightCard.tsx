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
    High: "border-rose-500/20 bg-rose-500/10 text-rose-600",
    Medium: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    Normal: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
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
    <div className="themed-inset rounded-xl p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-main)]">{location}</p>
          <p className="mt-0.5 text-xs text-[var(--text-soft)]">{issueCategory}</p>
        </div>
        <PriorityBadge priority={priorityLabel} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <StatusBadge status={status} className="normal-case tracking-normal" />
        <p className="text-xs text-[var(--text-muted)]">{timeText}</p>
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

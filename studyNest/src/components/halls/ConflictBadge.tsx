import React from 'react';
import { AlertTriangle, Slash, CheckCircle } from 'lucide-react';
import { LectureHall } from '../../types/halls';

interface ConflictBadgeProps {
  status: LectureHall['maintenance_status'];
}

export function ConflictBadge({ status }: ConflictBadgeProps) {
  const config = {
    available: { icon: CheckCircle, text: 'Available', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    under_maintenance: { icon: AlertTriangle, text: 'Under Maintenance', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    reserved_exam: { icon: Slash, text: 'Reserved for Exam', color: 'text-red-500', bg: 'bg-red-500/10' },
    reserved_event: { icon: Slash, text: 'Reserved for Event', color: 'text-red-500', bg: 'bg-red-500/10' },
    closed: { icon: Slash, text: 'Closed', color: 'text-neutral-500', bg: 'bg-neutral-500/10' },
  };

  const { icon: Icon, text, color, bg } = config[status] || config.closed;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} ${bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}

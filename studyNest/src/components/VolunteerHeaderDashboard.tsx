'use client';

import { useState, useEffect, useRef } from 'react';
import { FiAward } from 'react-icons/fi';
import { VolunteerStatsPopup } from '@/components/volunteer/VolunteerStatsPopup';

interface UserData {
  user_id: string;
  student_id: string;
  name: string;
  role: 'student' | 'volunteer' | 'admin';
  volunteer_id?: string;
}

export default function VolunteerHeaderDashboard() {
  const [user] = useState<UserData | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return null;
      }
      return JSON.parse(storedUser) as UserData;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  });
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsStatsOpen(false);
      }
    }

    if (isStatsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isStatsOpen]);

  if (!user || user.role !== 'volunteer') {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Volunteer Stats Button */}
      <button
        onClick={() => setIsStatsOpen(!isStatsOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] px-4 py-2 transition hover:brightness-110"
        title="View your volunteer stats"
      >
        <FiAward className="h-5 w-5 text-[var(--header-accent-text)]" />
        <div className="flex flex-col text-left">
          <p className="text-xs font-semibold uppercase text-[var(--header-accent-text)]">
            Stats
          </p>
          <p className="text-sm font-bold text-[var(--header-text)]">
            {user.volunteer_id || 'Volunteer'}
          </p>
        </div>
      </button>

      {/* Stats Popup */}
      <VolunteerStatsPopup
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        volunteerId={user.user_id}
      />
    </div>
  );
}

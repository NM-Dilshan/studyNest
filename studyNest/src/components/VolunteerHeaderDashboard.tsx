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
  const [user, setUser] = useState<UserData | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        console.log('Stored user:', storedUser);

        if (storedUser) {
          const userData = JSON.parse(storedUser) as UserData;
          console.log('Parsed user:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

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

  if (loading || !user || user.role !== 'volunteer') {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Volunteer Stats Button */}
      <button
        onClick={() => setIsStatsOpen(!isStatsOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
        title="View your volunteer stats"
      >
        <FiAward className="w-5 h-5 text-purple-600" />
        <div className="flex flex-col text-left">
          <p className="text-xs font-semibold text-purple-600 uppercase">
            Stats
          </p>
          <p className="text-sm font-bold text-purple-900">
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

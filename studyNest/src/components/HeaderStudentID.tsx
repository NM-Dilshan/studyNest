'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface UserData {
  student_id: string;
  name: string;
  role: 'student' | 'volunteer' | 'admin';
}

export default function HeaderStudentID() {
  const [user] = useState<UserData | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as UserData;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] px-4 py-2">
      <BookOpen className="h-5 w-5 text-[var(--header-accent-text)]" />
      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase text-[var(--header-accent-text)]">ID</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[var(--header-text)]">{user.student_id}</p>
        </div>
      </div>
    </div>
  );
}

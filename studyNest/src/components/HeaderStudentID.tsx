'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface UserData {
  student_id: string;
  name: string;
  role: 'student' | 'volunteer' | 'admin';
}

export default function HeaderStudentID() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as UserData;
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <BookOpen className="w-5 h-5 text-blue-600" />
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-blue-600 uppercase">ID</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-blue-900">{user.student_id}</p>
        </div>
      </div>
    </div>
  );
}

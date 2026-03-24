'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface UserData {
  student_id: string;
}

export default function HeaderStudentID() {
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Load student ID from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as UserData;
          setStudentId(user.student_id);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
  }, []);

  if (!studentId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <BookOpen className="w-5 h-5 text-blue-600" />
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-blue-600 uppercase">Student ID</p>
        <p className="text-sm font-bold text-blue-900">{studentId}</p>
      </div>
    </div>
  );
}

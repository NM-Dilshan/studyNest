'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Mail } from 'lucide-react';

interface UserData {
  user_id: string;
  student_id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'student' | 'volunteer' | 'admin';
  department?: string;
  is_active: boolean;
  reputation_score?: number;
  created_at: string;
}

export default function UserProfile() {
  const router = useRouter();
  
  // Load user data once on mount using initializer (no setState in effect)
  const [userData] = useState<UserData | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
    return null;
  });

  // Effect only handles redirect - no setState
  useEffect(() => {
    if (!userData) {
      router.push('/login/signIN');
    }
  }, [userData, router]);

  if (!userData) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="mb-8">
      {/* Main Profile Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your User ID</h2>
        <p className="text-gray-600 text-sm">Your unique system identifier</p>
      </div>

      {/* User ID - Large Prominent Card (Main Focus) */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-10 text-white shadow-lg hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wide mb-3">User ID</p>
              <p className="text-5xl font-bold break-all">{userData.user_id}</p>
              <p className="text-blue-100 text-sm mt-3">Your unique identifier in StudyNest system</p>
            </div>
            <div className="h-20 w-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase">Name</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{userData.name}</p>
        </div>

        {/* Email Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase">Email</p>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{userData.email}</p>
        </div>

        {/* Student ID Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase">Student ID</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{userData.student_id || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useRouter } from 'next/navigation';
import AuthMainHeader from '@/components/auth/AuthMainHeader';

interface SignInResponse {
  user?: {
    user_id: string;
    student_id: string;
    name: string;
    email: string;
    role: 'student' | 'volunteer' | 'admin';
    is_active: boolean;
    created_at: string;
  };
  message?: string;
  error?: string;
}

function TypingText() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Unlock Your Perfect Study Spot...";
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else if (currentIndex > fullText.length + 20) {
        currentIndex = 0;
        setDisplayedText('');
      } else {
        currentIndex++;
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 min-h-[120px]">
      {displayedText}
      <span className="animate-pulse text-[#A3D1D1]">|</span>
    </h2>
  );
}

// Validation Functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z]{2}\d{8}@my\.sliit\.lk$/;
  return emailRegex.test(email);
};

const validateStudentId = (studentId: string): boolean => {
  const idRegex = /^[a-zA-Z]{2}\d{8}$/;
  return idRegex.test(studentId);
};

export default function SignIn(): React.ReactElement {
  const router = useRouter();
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate identifier (can be email or student ID)
    const isEmail = validateEmail(identifier);
    const isStudentId = validateStudentId(identifier);

    if (!isEmail && !isStudentId) {
      setError('Please enter a valid email (it23839410@my.sliit.lk) or student ID (it23839410)');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEmail ? { email: identifier } : { studentId: identifier }),
          password,
        }),
      });

      const data: SignInResponse = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Sign in failed');
        setLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('studentId', data.user.user_id);
      }
      
      setSuccess(true);
      setTimeout(() => { router.push('/home'); }, 1000);
    } catch {
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFD] antialiased">
      <AuthMainHeader />
      <div className="flex items-center justify-center px-4 py-6 md:py-8">
        <div className="flex w-full max-w-[1400px] min-h-[90vh] bg-white rounded-[40px] shadow-2xl shadow-slate-200/70 overflow-hidden border border-slate-100 relative">
        
        {/* --- LEFT SIDE --- */}
        <div className="relative hidden lg:flex flex-1 bg-slate-900 p-16 flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35 z-10" />
          <Image src="/login.png" alt="Students" fill className="object-cover" priority />

          <div className="relative z-20 max-w-md mt-auto pb-6">
            <TypingText />
            <p className="text-white/90 text-lg font-medium leading-relaxed">
              Find your quiet corner in a busy campus. Real-time data for real-time success.
            </p>
          </div>
          
          <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-white rounded-full blur-[100px] opacity-15 animate-blob" />
        </div>

        {/* --- RIGHT SIDE: FORM WITH SMOOTH LINES --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 relative bg-white">
          
          {/* --- SMOOTH LINE BACKGROUND PATTERN --- */}
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="line-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L40 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#line-pattern)" />
            </svg>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Form Header */}
            <div className="mb-10 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 overflow-hidden border border-slate-100">
                  <Image src="/logo.jpeg" alt="StudyNest Logo" width={40} height={40} className="object-contain" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">StudyNest</h1>
              </Link>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
              <div className="h-1 w-12 bg-[#2E6F95] rounded-full mt-3 mb-2 hidden lg:block"></div>
              <p className="text-slate-500 font-medium">Log in to access your dashboard</p>
            </div>

            {/* Alert Messages */}
            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-bold animate-shake">{error}</div>}
            {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-sm font-bold flex items-center gap-2"> <CheckCircle2 size={18}/> Success! Taking you home...</div>}

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email or Student ID</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#2E6F95] transition-colors" />
                  <input
                    type="text"
                    placeholder="it23456789 or it23456789@my.sliit.lk"
                    value={identifier}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] transition-all text-sm font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Code</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#2E6F95] transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] transition-all text-sm font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-200 accent-[#2E6F95]" />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Remember device</span>
                </label>
                <Link href="/login/forgot-password" className="text-xs font-black text-[#2E6F95] hover:underline uppercase tracking-tighter">Recover Key</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2E6F95] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#2E6F95]/20 hover:shadow-[#2E6F95]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Sign IN'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Not registered? <Link href="/login/signUP" className="text-[#2E6F95] font-black hover:underline ml-1">Start here →</Link>
              </p>
            </div>

          </div>
        </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-blob { animation: blob 10s infinite ease-in-out; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
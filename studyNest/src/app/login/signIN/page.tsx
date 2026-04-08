'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Mail, Lock, CheckCircle2, ShieldCheck, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignInResponse {
  success?: boolean;
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

const parseApiResponse = async (response: Response): Promise<SignInResponse> => {
  const contentType = response.headers.get('content-type') ?? '';
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return { error: `Server returned an empty response (status ${response.status})` };
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    console.error('Non-JSON sign-in response:', rawBody);
    return { error: `Server returned non-JSON response (status ${response.status})` };
  }

  try {
    return JSON.parse(rawBody) as SignInResponse;
  } catch {
    console.error('Malformed sign-in JSON response:', rawBody);
    return { error: 'Server returned malformed JSON response' };
  }
};

export default function SignIn(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: SignInResponse = await parseApiResponse(response);

      if (!response.ok) {
        setError(data?.error || 'Sign in failed');
        setLoading(false);
        return;
      }

      if (data?.success === false) {
        setError(data?.error || 'Sign in failed');
        setLoading(false);
        return;
      }

      // Always store user data in localStorage (for home page access)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setSuccess(true);
      setEmail('');
      setPassword('');

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-[#E9F2F1]">
      
      {/* --- VIBRANT BACKGROUND ANIMATION --- */}
      <div className="absolute inset-0 z-0">
        {/* Top Right - Strong Blue Blob */}
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#2E6F95] rounded-full blur-[120px] opacity-40 animate-blob" />
        
        {/* Bottom Left - Deep Teal/Aqua Blob */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#4FA3C7] rounded-full blur-[100px] opacity-50 animate-blob animation-delay-2000" />
        
        {/* Center Right - Accent Blue Blob */}
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-[#2E6F95] rounded-full blur-[90px] opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl transition-transform hover:scale-110 duration-300"
            style={{ backgroundColor: "#2E6F95" }}
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">StudyNest</h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">Campus Free Space Finder</p>
        </div>

        {/* Main Card with Glassmorphism */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/60">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-2">Sign in to find your perfect study space</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm font-medium">✓ Sign in successful! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#2E6F95] transition-colors" />
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] transition-all placeholder:text-gray-300 text-sm disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#2E6F95] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] transition-all placeholder:text-gray-300 text-sm disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#2E6F95] cursor-pointer disabled:opacity-50"
                  disabled={loading}
                />
                <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-xs font-bold text-[#2E6F95] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.97] mt-2 shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#2E6F95" }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/login/signUP" className="font-bold text-[#2E6F95] hover:underline">
              Register here
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-100"></div>
            <span className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Quick Access</span>
            <div className="flex-1 border-t border-gray-100"></div>
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl font-bold text-xs text-[#2E6F95] transition-all hover:bg-white hover:shadow-md active:scale-95">
              <ShieldCheck size={16} /> Admin
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl font-bold text-xs text-[#4FA3C7] transition-all hover:bg-white hover:shadow-md active:scale-95">
              <UserCircle2 size={16} /> Volunteer
            </button>
          </div>
        </div>

        <footer className="mt-10 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} StudyNest Platform
        </footer>
      </div>

      {/* --- ANIMATION STYLES --- */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.2); }
          66% { transform: translate(-40px, 40px) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

'use client';

import { User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUp() {
  const [userRole, setUserRole] = useState<'student' | 'volunteer'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: userRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login/signIN';
      }, 2000);
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-[#F0F7F6] overflow-hidden">
      {/* Background Blobs - Reduced opacity for better readability */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2E6F95] rounded-full blur-[120px] opacity-20 animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4FA3C7] rounded-full blur-[120px] opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#2E6F95] rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <CheckCircle2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">StudyNest</h1>
        </div>

        {/* Main Form Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 border border-white">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-1">Fill in the details to get started</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Role & ID Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Type</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'student' | 'volunteer')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F95] outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Your ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    name="studentId"
                    placeholder={userRole === 'student' ? 'e.g. ST1234' : 'e.g. VL1234'}
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F95] outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" name="fullName" icon={User} type="text" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} />
              <Field label="Email Address" name="email" icon={Mail} type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
            </div>

            {/* Mobile Number - Full Width */}
            <Field label="Mobile Number" name="mobileNumber" icon={Phone} type="tel" placeholder="+94 7X XXX XXXX" value={formData.mobileNumber} onChange={handleInputChange} />

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F95] outline-none text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-[#2E6F95]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none text-sm transition-all ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-400 focus:ring-red-100' 
                        : 'border-gray-200 focus:ring-[#2E6F95]'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 accent-[#2E6F95] cursor-pointer"
                required
              />
              <span className="text-xs text-gray-500">
                I agree to the <Link href="#" className="text-[#2E6F95] font-bold">Terms</Link> and <Link href="#" className="text-[#2E6F95] font-bold">Privacy Policy</Link>
              </span>
            </div>

            {/* Alerts */}
            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium animate-pulse">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs rounded-xl font-medium flex items-center gap-2"><CheckCircle2 size={14}/> Account created! Redirecting...</div>}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 bg-[#2E6F95] text-white rounded-xl font-bold shadow-lg hover:bg-[#255a7a] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account? <Link href="/login/signIN" className="text-[#2E6F95] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Field Component to keep code clean
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ComponentType<{ className: string }>;
}

function Field({ label, icon: Icon, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 transition-colors" />
        <input
          {...props}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E6F95] outline-none transition-all text-sm"
          required
        />
      </div>
    </div>
  );
}
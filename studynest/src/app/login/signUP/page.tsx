'use client';

import { User, Mail, Lock, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUp() {
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
    setSuccess(false);
    setLoading(true);

    // Client-side validation
    if (!agreeTerms) {
      setError('Please agree to the Terms and Privacy Policy.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setFormData({
        studentId: '',
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to login after 2 seconds
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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-[#E9F2F1]">
      
      {/* --- VIBRANT BACKGROUND ANIMATION --- */}
      <div className="absolute inset-0 z-0">
        {/* Top Right - Strong Blue Blob */}
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#2E6F95] rounded-full blur-[120px] opacity-40 animate-blob" />
        
        {/* Bottom Left - Deep Teal/Aqua Blob */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#4FA3C7] rounded-full blur-[100px] opacity-50 animate-blob animation-delay-2000" />
        
        {/* Center Right - Accent Blue Blob */}
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-[#2E6F95] rounded-full blur-[90px] opacity-30 animate-blob animation-delay-4000" />
        
        {/* Extra Bottom Right for more color */}
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#A3D1D1] rounded-full blur-[80px] opacity-40 animate-blob animation-delay-3000" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl transition-transform hover:scale-110 duration-300"
            style={{ backgroundColor: '#2E6F95' }}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">StudyNest</h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">Create your account</p>
        </div>

        {/* Main Card with Glassmorphism */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/60">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Register</h2>
            <p className="text-gray-500 text-sm mt-2">Join StudyNest to find free study spaces</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {[
              { id: 'studentId', name: 'studentId', label: 'Student ID', icon: User, placeholder: 'ST20230001', type: 'text' },
              { id: 'fullName', name: 'fullName', label: 'Full Name', icon: User, placeholder: 'John Doe', type: 'text' },
              { id: 'email', name: 'email', label: 'Email', icon: Mail, placeholder: 'student@university.edu', type: 'email' },
              { id: 'mobileNumber', name: 'mobileNumber', label: 'Mobile Number', icon: Phone, placeholder: '+1 (555) 123-4567', type: 'tel' },
              { id: 'password', name: 'password', label: 'Password', icon: Lock, placeholder: '••••••••', type: 'password' },
              { id: 'confirmPassword', name: 'confirmPassword', label: 'Confirm Password', icon: Lock, placeholder: '••••••••', type: 'password' },
            ].map((field) => (
              <div key={field.id} className="group">
                <label htmlFor={field.id} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#2E6F95] transition-colors" />
                  <input
                    id={field.id}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    //@ts-expect-error - Dynamic field name access
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] transition-all placeholder:text-gray-300 text-sm"
                    required
                  />
                </div>
              </div>
            ))}

            <div className="flex items-start gap-2 py-2">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer mt-1 accent-[#2E6F95]"
                required
              />
              <label htmlFor="agreeTerms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                I agree to the <Link href="/terms" className="font-bold text-[#2E6F95] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-bold text-[#2E6F95] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                Account created successfully! Redirecting to sign in...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.97] mt-4 shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#2E6F95' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Already have an account?{' '}
            <Link href="/login/signIN" className="font-bold text-[#2E6F95] hover:underline">Sign in here</Link>
          </p>
        </div>

        <div className="mt-10 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} StudyNest Platform
        </div>
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
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
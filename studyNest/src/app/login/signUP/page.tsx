'use client';

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2, ArrowRight, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useRouter } from 'next/navigation';


// Typing Animation Component
function TypingText() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Join the StudyNest Community...";
  
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
const validateStudentId = (id: string): string => {
  if (!id.trim()) return 'Student ID is required';
  if (id.length < 2) return 'Student ID must be at least 2 characters';
  if (id.length > 20) return 'Student ID cannot exceed 20 characters';
  return '';
};

const validateFullName = (name: string): string => {
  if (!name.trim()) return '';
  if (/\d/.test(name)) return 'Name cannot contain numbers';
  return '';
};

const validateStudentId = (studentId: string, strict = false): string => {
  const value = studentId.trim();
  if (!value) return '';

  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return 'Student ID can contain only letters and numbers';
  }

  // Must start with exactly 2 letters.
  if (value.length >= 3 && /^[a-zA-Z]{3}/.test(value)) {
    return 'Student ID must start with only 2 letters';
  }

  if (!/^[a-zA-Z]{0,2}\d*$/.test(value)) {
    return 'After first 2 letters, only numbers are allowed';
  }

  const digitPart = value.replace(/^[a-zA-Z]{0,2}/, '');
  if (digitPart.length > 8) {
    return 'Only 8 numbers are allowed after first 2 letters';
  }

  if (strict && !/^[a-zA-Z]{2}\d{8}$/.test(value)) {
    return 'Student ID must be 2 letters followed by 8 numbers (e.g., IT12345678)';
  }

  return '';
};

const validateEmail = (email: string): string => {
  if (!email.trim()) return '';
  // Format: 2 letters + 8 digits + @my.sliit.lk
  const emailRegex = /^[a-zA-Z]{2}\d{8}@my\.sliit\.lk$/;
  if (!emailRegex.test(email)) {
    return 'Email must be like: it23839410@my.sliit.lk (2 letters + 8 digits + @my.sliit.lk)';
  }
  return '';
};

const validateMobileNumber = (mobile: string): string => {
  if (!mobile.trim()) return '';
  // Format: 07 followed by 8 digits (10 characters total)
  const mobileRegex = /^07\d{8}$/;
  if (!mobileRegex.test(mobile)) {
    return 'Mobile number must start with 07 followed by 8 digits (e.g., 0712345678)';
  }
  return '';
};

const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const levels = [
    { strength: 0, label: 'Very Weak', color: '#DC2626' },
    { strength: 1, label: 'Weak', color: '#F97316' },
    { strength: 2, label: 'Fair', color: '#EAB308' },
    { strength: 3, label: 'Good', color: '#84CC16' },
    { strength: 4, label: 'Strong', color: '#22C55E' },
    { strength: 6, label: 'Very Strong', color: '#16A34A' },
  ];

  const level = levels.reduce((prev, curr) => (curr.strength <= strength ? curr : prev));
  return { strength: Math.min(strength, 6), label: level.label, color: level.color };
};

export default function SignUp(): React.ReactElement {
  const router = useRouter();
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    // Auto-format mobile number: only accept 8 digits (without the 07 prefix)
    if (name === 'mobileNumber') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Keep only the first 8 digits (max)
      value = digitsOnly.slice(0, 8);
    }

    if (name === 'studentId') {
      value = value.replace(/\s/g, '');
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate email from student ID
      if (name === 'studentId' && value.trim()) {
        updated.email = `${value.toLowerCase()}@my.sliit.lk`;
      }
      
      return updated;
    });

    // Real-time validation
    let errorMsg = '';
    if (name === 'studentId') errorMsg = validateStudentId(value);
    else if (name === 'fullName') errorMsg = validateFullName(value);
    else if (name === 'email') errorMsg = validateEmail(value);
    else if (name === 'mobileNumber') errorMsg = validateMobileNumber('07' + value);

    setFieldErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const studentIdError = validateStudentId(formData.studentId);
    const nameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const mobileError = validateMobileNumber('07' + formData.mobileNumber);

    if (studentIdError || nameError || emailError || mobileError) {
      setFieldErrors({
        studentId: studentIdError,
        fullName: nameError,
        email: emailError,
        mobileNumber: mobileError,
      });
      setError('Please fix all the validation errors above');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength.strength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mobileNumber: '07' + formData.mobileNumber, role: userRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Failed to create account.');
        setError(errorMsg);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => { router.push('/login/signIN'); }, 2000);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFD] antialiased">
      <div className="flex items-center justify-center px-4 py-6 md:py-8">
        <div className="flex w-full max-w-[1400px] min-h-[90vh] bg-white rounded-[40px] shadow-2xl shadow-slate-200/70 overflow-hidden border border-slate-100 relative">
        
        {/* --- LEFT SIDE (Matching Sign In) --- */}
        <div className="relative hidden lg:flex flex-1 bg-slate-900 p-16 flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35 z-10" />
          <Image src="/login.png" alt="Students" fill className="object-cover" priority />

          <div className="relative z-20 max-w-md mt-auto pb-6">
            <TypingText />
            <p className="text-white/90 text-lg font-medium leading-relaxed">
              Create an account to discover, reserve, and share the best study spots on campus.
            </p>
          </div>
          
          <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-white rounded-full blur-[100px] opacity-15 animate-blob" />
        </div>

        {/* --- RIGHT SIDE: SIGN UP FORM --- */}
        <div className="flex-[1.2] flex flex-col justify-center items-center p-8 md:p-12 relative bg-white overflow-y-auto">
          
          {/* SMOOTH LINE BACKGROUND PATTERN */}
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

          <div className="w-full max-w-xl relative z-10">
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 overflow-hidden border border-slate-100">
                  <Image src="/logo.jpeg" alt="StudyNest Logo" width={40} height={40} className="object-contain" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">StudyNest</h1>
              </Link>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h3>
              <div className="h-1 w-12 bg-[#2E6F95] rounded-full mt-3 mb-2 hidden lg:block"></div>
              <p className="text-slate-500 font-medium">Join thousands of students on campus</p>
            </div>

            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold animate-shake">{error}</div>}
            {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-bold flex items-center gap-2"> <CheckCircle2 size={16}/> Success! Account Created.</div>}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Row 1: Role and ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Account Type
                  </label>
                  <div className="relative mt-1.5">
                    {/* Icon (UserCircle2) */}
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#2E6F95] transition-colors pointer-events-none" />
                    
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as 'student' | 'volunteer')}
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="volunteer">Volunteer</option>
                    </select>

                    {/* Dropdown Arrow (Custom Smooth Arrow) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-[#2E6F95]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <Field
                  label="Your ID"
                  name="studentId"
                  icon={User}
                  placeholder="e.g., IT12345678"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  error={fieldErrors.studentId}
                />
              </div>

              {/* Row 2: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" name="fullName" icon={User} placeholder="Kamidu WA" value={formData.fullName} onChange={handleInputChange} error={fieldErrors.fullName} />
                <div className="group flex-1 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Email <span className="text-slate-300 text-[8px]">(auto-generated)</span></label>
                  <div className="relative mt-1.5">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${fieldErrors.email ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-[#2E6F95]'}`} />
                    <input
                      type="email"
                      name="email"
                      placeholder="it12345678@my.sliit.lk"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all text-sm font-semibold ${
                        fieldErrors.email 
                          ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 text-slate-700' 
                          : 'border-slate-100 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] text-slate-700'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-1">{fieldErrors.email}</p>}
                </div>
              </div>

              {/* Row 3: Mobile */}
              <div className="group flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                <div className="relative mt-1.5">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${fieldErrors.mobileNumber ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-[#2E6F95]'}`} />
                  
                  {/* Static "07" Prefix */}
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-900 pointer-events-none">
                    07
                  </div>
                  
                  {/* Input for remaining 8 digits */}
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder="........"
                    maxLength={8}
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-20 pr-4 py-3.5 bg-slate-50/50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all text-sm font-semibold ${
                      fieldErrors.mobileNumber 
                        ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 text-slate-700' 
                        : 'border-slate-100 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] text-slate-700'
                    }`}
                    required
                  />
                </div>
                {fieldErrors.mobileNumber && <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-1">{fieldErrors.mobileNumber}</p>}
              </div>

              {/* Row 4: Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#2E6F95]" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] outline-none text-sm font-semibold"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#2E6F95]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-500">Password Strength</span>
                        <span className="text-xs font-bold" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(passwordStrength.strength / 6) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Field 
                  label="Confirm" 
                  name="confirmPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  icon={Lock} 
                  placeholder="••••••••" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange}
                  error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-[#2E6F95] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#2E6F95]/20 hover:shadow-[#2E6F95]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Now'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-8 font-medium">
              Already a member? <Link href="/login/signIN" className="text-[#2E6F95] font-black hover:underline ml-1">Log in here →</Link>
            </p>
          </div>
        </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -30px) scale(1.1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-blob { animation: blob 10s infinite ease-in-out; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}

// Reusable Field Component Types
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ComponentType<{ className: string }>;
  error?: string;
}

// Reusable Field Component
function Field({ label, icon: Icon, error, ...props }: FieldProps) {
  return (
    <div className="group flex-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative mt-1.5">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${error ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-[#2E6F95]'}`} />
        <input
          {...props}
          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all text-sm font-semibold ${
            error 
              ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 text-slate-700' 
              : 'border-slate-100 focus:ring-[#2E6F95]/5 focus:border-[#2E6F95] text-slate-700'
          }`}
          required
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-semibold mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
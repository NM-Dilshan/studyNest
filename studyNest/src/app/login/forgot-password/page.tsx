'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AuthMainHeader from '@/components/auth/AuthMainHeader';
import { isEmailJsConfigured, sendPasswordRecoveryCodeEmail } from '@/lib/email/sendEmail';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [itNumber, setItNumber] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastAutoSentItNumber, setLastAutoSentItNumber] = useState('');

  const normalizedItNumber = itNumber.trim().toUpperCase();

  const generateCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const requestRecoveryCode = async (studentId: string) => {
    if (!isEmailJsConfigured()) {
      setError('Email recovery service is not configured. Please set NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in .env.local and restart the app.');
      return;
    }

    setLoading(true);

    try {
      const lookupResponse = await fetch('/api/auth/recovery-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      const lookupData = await lookupResponse.json();
      if (!lookupResponse.ok) {
        setError(lookupData.error || 'No account found for this IT number.');
        return;
      }

      const resolvedEmail = String(lookupData.email || '').trim().toLowerCase();
      const resolvedStudentId = String(lookupData.studentId || studentId).trim().toUpperCase();

      if (!resolvedEmail) {
        setError('Registered email was not found for this IT number.');
        return;
      }

      const code = generateCode();
      const result = await sendPasswordRecoveryCodeEmail(resolvedEmail, resolvedStudentId, code);
      if (!result.ok) {
        setError(result.error || 'Failed to send recovery code. Please try again.');
        return;
      }

      setEmail(resolvedEmail);
      setItNumber(resolvedStudentId);
      setSentCode(code);
      setCodeExpiry(Date.now() + 10 * 60 * 1000);
      setStep('verify');
      setLastAutoSentItNumber(resolvedStudentId);
      setSuccess('Recovery code sent automatically to your registered email. Enter the 6-digit code from your email.');
    } catch (err) {
      console.error('Password recovery request error:', err);
      setError('Failed to send recovery code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'request') {
      return;
    }

    if (!normalizedItNumber || normalizedItNumber.length < 5) {
      return;
    }

    if (normalizedItNumber === lastAutoSentItNumber) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setError('');
      setSuccess('');
      void requestRecoveryCode(normalizedItNumber);
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [normalizedItNumber, lastAutoSentItNumber, step]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (step === 'request') {
      if (!normalizedItNumber) {
        setError('IT number is required.');
        return;
      }

      await requestRecoveryCode(normalizedItNumber);
      return;
    }

    if (step === 'verify') {
      if (!enteredCode.trim()) {
        setError('Please enter the recovery code.');
        return;
      }

      if (codeExpiry && Date.now() > codeExpiry) {
        setError('Recovery code expired. Please resend a new code.');
        return;
      }

      if (enteredCode.trim() !== sentCode) {
        setError('Incorrect recovery code. Please try again.');
        return;
      }

      setStep('reset');
      setSuccess('Code verified. Enter your new password.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          studentId: normalizedItNumber,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to reset password.');
        return;
      }

      setSuccess('Password changed successfully. You can now sign in with your new password.');
      setStep('request');
      setLastAutoSentItNumber('');
      setEnteredCode('');
      setSentCode('');
      setCodeExpiry(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    if (!normalizedItNumber) {
      setError('IT number is required.');
      return;
    }

    await requestRecoveryCode(normalizedItNumber);
  };

  return (
    <div className="min-h-screen bg-[#FBFDFD] antialiased">
      <AuthMainHeader />

      <main className="mx-auto flex w-full max-w-[760px] px-4 py-10 md:py-14">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Recover Password</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Enter your registered IT number. A recovery code will be sent automatically to your account email.
          </p>

          {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
          {success && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">IT Number</label>
              <input
                value={normalizedItNumber}
                onChange={(e) => {
                  setItNumber(e.target.value.toUpperCase());
                  if (step === 'request') {
                    setLastAutoSentItNumber('');
                    setEmail('');
                  }
                }}
                placeholder="IT12345678"
                disabled={step !== 'request'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10"
              />
            </div>

            {step !== 'request' && email && (
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">Registered Email</label>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 outline-none"
                />
              </div>
            )}

            {step === 'verify' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">Recovery Code</label>
                  <input
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full rounded-xl border border-[#2E6F95]/30 px-4 py-3 text-sm font-black uppercase tracking-wide text-[#2E6F95] transition hover:bg-[#2E6F95]/5 disabled:opacity-60"
                >
                  Resend Code
                </button>
              </>
            )}

            {step === 'reset' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#2E6F95] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#255b79] disabled:opacity-60"
            >
              {loading ? 'Processing...' : step === 'request' ? 'Send Now' : step === 'verify' ? 'Verify Code' : 'Change Password'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Back to
            <Link href="/login/signIN" className="ml-1 font-black text-[#2E6F95] hover:underline">
              Sign In
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

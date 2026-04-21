'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeaderShell from '@/components/navigation/HeaderShell';
import ThemeToggle from '@/components/navigation/ThemeToggle';

export default function AuthMainHeader() {
  return (
    <HeaderShell className="z-30">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-[var(--header-border)] bg-[var(--header-button-bg)] p-1 shadow-sm">
            <Image src="/logo.jpeg" alt="StudyNest Logo" fill className="object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--header-text)]">StudyNest</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-bold">
          <ThemeToggle />
          <Link href="/login/signIN" className="rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] px-3 py-2 text-[var(--header-text-soft)] hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">
            Sign In
          </Link>
          <Link href="/login/signUP" className="rounded-xl border border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] px-3 py-2 text-[var(--header-accent-text)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">
            Sign Up
          </Link>
        </nav>
      </div>
    </HeaderShell>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthMainHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-100 bg-white p-1 shadow-sm">
            <Image src="/logo.jpeg" alt="StudyNest Logo" fill className="object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">StudyNest</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link href="/login/signIN" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            Sign In
          </Link>
          <Link href="/login/signUP" className="rounded-lg bg-[#2E6F95] px-3 py-2 text-white hover:bg-[#255b79]">
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}

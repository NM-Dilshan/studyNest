'use client';

import Link from 'next/link';
import { BookOpen, Map, Users, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F9F8] text-gray-900 font-sans selection:bg-[#2E6F95] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2E6F95] flex items-center justify-center shadow-lg shadow-[#2E6F95]/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">StudyNest</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login/signIN"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-[#2E6F95] bg-[#2E6F95]/5 hover:bg-[#2E6F95]/10 rounded-full transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/login/signUP"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-[#2E6F95] hover:bg-[#1f4b66] hover:shadow-lg hover:-translate-y-0.5 rounded-full transition-all shadow-[#2E6F95]/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -ml-[40rem] w-[80rem] h-[60rem] opacity-20 pointer-events-none animate-blob">
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-[#4FA3C7]/40 to-transparent blur-3xl opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#2E6F95]/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E6F95] to-[#4FA3C7]">
              Study Space Now
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Discover available lecture halls, reserve study areas, and track campus crowds in real-time. Built specifically for your university experience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/student"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#2E6F95] hover:bg-[#1f4b66] rounded-full transition-all shadow-xl shadow-[#2E6F95]/30 group hover:-translate-y-1"
            >
              Find Free Halls
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#2E6F95] bg-white border-2 border-[#2E6F95]/10 hover:border-[#2E6F95]/30 hover:bg-[#2E6F95]/5 rounded-full transition-all group"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 lg:mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#2E6F95]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6 text-[#2E6F95]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Availability</h3>
              <p className="text-gray-600 leading-relaxed">
                Check which lecture halls and study areas are free right now without wandering around campus.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#4FA3C7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-[#4FA3C7]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Timetables</h3>
              <p className="text-gray-600 leading-relaxed">
                We track the university's master timetable so you know exactly how long a room will stay empty.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#7FB89B]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-[#7FB89B]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crowd Sourcing</h3>
              <p className="text-gray-600 leading-relaxed">
                Help friends by updating live crowd levels, and earn volunteer badges and reputation points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

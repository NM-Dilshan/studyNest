"use client";

import { MapPin, ShieldCheck, X } from "lucide-react";

interface GPSPermissionModalProps {
  show: boolean;
  status: "idle" | "requesting" | "enabled" | "denied";
  onEnable: () => void;
  onSkip: () => void;
}

export default function GPSPermissionModal({ show, status, onEnable, onSkip }: GPSPermissionModalProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cyan-300/25 bg-slate-900/95 p-4 shadow-[0_25px_70px_-35px_rgba(6,182,212,0.55)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
            <MapPin className="h-5 w-5" />
          </div>
          <button
            onClick={onSkip}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-white/30 hover:text-white"
            aria-label="Close location permission dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-white">Enable Smart Location</h2>
        <p className="mt-2 text-sm text-slate-300">
          Activate location to power live occupancy signals and faster study-space discovery near your current campus zone.
        </p>

        <div className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          <p className="inline-flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" /> Privacy-first design
          </p>
          <p className="mt-1 text-emerald-50/90">Raw coordinates are not shown to other users and temporary location data expires automatically.</p>
        </div>

        {status === "enabled" ? (
          <p className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
            Location access enabled successfully.
          </p>
        ) : null}

        {status === "denied" ? (
          <p className="mt-4 rounded-lg border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100">
            Permission denied. You can enable location later from browser settings.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onSkip}
            className="min-h-11 w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/5 sm:w-auto"
          >
            Skip for now
          </button>
          <button
            onClick={onEnable}
            disabled={status === "requesting"}
            className="min-h-11 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {status === "requesting" ? "Requesting access..." : "Enable location"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[color:color-mix(in_srgb,var(--bg-main)_42%,rgba(15,23,42,0.42))] p-3 backdrop-blur-md sm:p-4">
      <div className="themed-hero-surface max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-text)]">
            <MapPin className="h-5 w-5" />
          </div>
          <button
            onClick={onSkip}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--surface-border)] text-[var(--text-soft)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-main)]"
            aria-label="Close location permission dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-[var(--text-main)]">Enable Smart Location</h2>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          Activate location to power live occupancy signals and faster study-space discovery near your current campus zone.
        </p>

        <div className="themed-panel-success mt-4 rounded-xl p-3 text-sm">
          <p className="inline-flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" /> Privacy-first design
          </p>
          <p className="mt-1">Raw coordinates are not shown to other users and temporary location data expires automatically.</p>
        </div>

        {status === "enabled" ? (
          <p className="themed-panel-success mt-4 rounded-lg p-3 text-sm">
            Location access enabled successfully.
          </p>
        ) : null}

        {status === "denied" ? (
          <p className="themed-panel-danger mt-4 rounded-lg p-3 text-sm">
            Permission denied. You can enable location later from browser settings.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onSkip}
            className="min-h-11 w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-inset)] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-main)] sm:w-auto"
          >
            Skip for now
          </button>
          <button
            onClick={onEnable}
            disabled={status === "requesting"}
            className="min-h-11 w-full rounded-lg bg-[var(--button-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-primary-text)] transition hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {status === "requesting" ? "Requesting access..." : "Enable location"}
          </button>
        </div>
      </div>
    </div>
  );
}

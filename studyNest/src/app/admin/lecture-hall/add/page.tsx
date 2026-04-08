'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Layers,
  Hash,
  Users,
  Monitor,
  Wifi,
  Wind,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Plus,
  HelpCircle,
} from 'lucide-react';

export default function AddLectureHallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    hall_name: '',
    building: '',
    block: '',
    floor: '',
    hall_number: '',
    capacity: '',
    hall_type: 'lecture_hall',
    projector: false,
    wifi: false,
    ac: false,
    whiteboard: false,
    maintenance_status: 'available',
  });

  const buildings = {
    'New Building': {
      blocks: ['G', 'F'],
      floors: Array.from({ length: 14 }, (_, i) => i + 1),
    },
    'Main Building': {
      blocks: ['A', 'B'],
      floors: ['B', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
  };

  const baseInput =
    'w-full min-h-[52px] rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-[#2E6F95] focus:ring-4 focus:ring-[#2E6F95]/10';

  const normalInput = 'border-slate-200 hover:border-slate-300';
  const errorInput =
    'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/60';

  const validateField = (name: string, value: unknown) => {
    switch (name) {
      case 'building':
        return !value ? 'Building is required' : '';
      case 'block':
        return !value ? 'Block is required' : '';
      case 'floor':
        return !value ? 'Floor is required' : '';
      case 'hall_number': {
        if (!value) return 'Hall number is required';
        const hallNumber = String(value).trim();
        if (!/^\d+$/.test(hallNumber)) {
          return 'Hall number must contain digits only';
        }
        const num = parseInt(hallNumber, 10);
        if (isNaN(num) || num < 1 || num > 10) {
          return 'Hall number must be between 1 and 10';
        }
        return '';
      }
      case 'capacity': {
        if (!value) return '';
        const num = parseInt(String(value), 10);
        if (isNaN(num) || num <= 0) return 'Capacity must be a positive number';
        return '';
      }
      default:
        return '';
    }
  };

  const errors = {
    building: touched.building ? validateField('building', formData.building) : '',
    block: touched.block ? validateField('block', formData.block) : '',
    floor: touched.floor ? validateField('floor', formData.floor) : '',
    hall_number: touched.hall_number ? validateField('hall_number', formData.hall_number) : '',
    capacity: touched.capacity ? validateField('capacity', formData.capacity) : '',
  };

  const isFormValid = () => {
    return (
      !!formData.building &&
      !!formData.block &&
      !!formData.floor &&
      !!formData.hall_number &&
      validateField('hall_number', formData.hall_number) === '' &&
      validateField('capacity', formData.capacity) === ''
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    const updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'building') {
      updatedData.block = '';
      updatedData.floor = '';
      updatedData.hall_number = '';
      updatedData.hall_name = '';
    }

    if (name === 'hall_number') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 2);
      if (!numericOnly) {
        updatedData.hall_number = '';
      } else {
        const parsed = parseInt(numericOnly, 10);
        if (!isNaN(parsed) && parsed <= 10) {
          updatedData.hall_number = String(parsed);
        }
      }
    }

    if (name === 'block' || name === 'floor' || name === 'hall_number' || name === 'building') {
      if (updatedData.block && updatedData.floor && updatedData.hall_number) {
        const floorStr = String(updatedData.floor).padStart(2, '0');
        const hallNumStr = String(updatedData.hall_number).padStart(2, '0');
        updatedData.hall_name = `${updatedData.block}${floorStr}${hallNumStr}`;
      } else {
        updatedData.hall_name = '';
      }
    }

    setFormData(updatedData);

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    if (error) setError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (!isFormValid()) {
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/lecture-halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
          floor: isNaN(Number(formData.floor)) ? formData.floor : parseInt(formData.floor, 10),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create lecture hall');
      }

      setMessage('Lecture hall created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/lecture-hall'), 1200);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFD] antialiased pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/lecture-hall"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Back to lecture halls"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2E6F95]">
                StudyNest Admin
              </p>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Add Lecture Hall
              </h1>
            </div>
          </div>

          <Link
            href="/admin/lecture-hall"
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
          >
            Hall List
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-8 max-w-4xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Add New Lecture Hall
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
            Configure hall location, capacity, and available resources with a clean and consistent setup flow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
                <Building2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Location Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormGroup label="Building Name" error={errors.building}>
                <select
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${baseInput} ${errors.building ? errorInput : normalInput}`}
                >
                  <option value="">Select Building</option>
                  <option value="New Building">New Building</option>
                  <option value="Main Building">Main Building</option>
                </select>
              </FormGroup>

              {formData.building && (
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Block" error={errors.block}>
                    <select
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${baseInput} ${errors.block ? errorInput : normalInput}`}
                    >
                      <option value="">--</option>
                      {buildings[formData.building as keyof typeof buildings]?.blocks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup label="Floor" error={errors.floor}>
                    <select
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${baseInput} ${errors.floor ? errorInput : normalInput}`}
                    >
                      <option value="">--</option>
                      {buildings[formData.building as keyof typeof buildings]?.floors.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormGroup
                label="Hall Number"
                error={errors.hall_number}
                tooltip="Enter digits only. Allowed range is 1 to 10."
              >
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="hall_number"
                    value={formData.hall_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={2}
                    placeholder="e.g. 10"
                    className={`${baseInput} pl-12 ${errors.hall_number ? errorInput : normalInput}`}
                  />
                </div>
              </FormGroup>

              <FormGroup
                label="Generated Hall ID"
                tooltip="Automatically generated from Block + Floor + Hall Number."
              >
                <input
                  type="text"
                  value={formData.hall_name}
                  readOnly
                  placeholder="Auto-generated"
                  className="w-full min-h-[52px] rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-[#2E6F95] shadow-inner"
                />
              </FormGroup>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Specifications &amp; Status</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormGroup label="Max Capacity" error={errors.capacity}>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"
                    className={`${baseInput} pl-12 ${errors.capacity ? errorInput : normalInput}`}
                  />
                </div>
              </FormGroup>

              <FormGroup label="Hall Type">
                <select
                  name="hall_type"
                  value={formData.hall_type}
                  onChange={handleChange}
                  className={`${baseInput} ${normalInput}`}
                >
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab">Computer Lab</option>
                </select>
              </FormGroup>

              <FormGroup label="Initial Status">
                <select
                  name="maintenance_status"
                  value={formData.maintenance_status}
                  onChange={handleChange}
                  className={`${baseInput} ${normalInput} font-bold text-[#2E6F95]`}
                >
                  <option value="available">Available</option>
                  <option value="under_maintenance">Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </FormGroup>
            </div>

            <div className="mt-10">
              <label className="mb-4 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Available Resources
              </label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <FeatureToggle
                  name="projector"
                  label="Projector"
                  active={formData.projector}
                  onChange={handleChange}
                  icon={Monitor}
                />
                <FeatureToggle
                  name="wifi"
                  label="WiFi"
                  active={formData.wifi}
                  onChange={handleChange}
                  icon={Wifi}
                />
                <FeatureToggle
                  name="ac"
                  label="AirCon"
                  active={formData.ac}
                  onChange={handleChange}
                  icon={Wind}
                />
                <FeatureToggle
                  name="whiteboard"
                  label="Whiteboard"
                  active={formData.whiteboard}
                  onChange={handleChange}
                  icon={PenTool}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-3 rounded-2xl bg-[#2E6F95] px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#2E6F95]/20 transition-all hover:-translate-y-0.5 hover:shadow-[#2E6F95]/35 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? 'Processing...' : 'Confirm & Add Hall'}
              <Plus size={18} />
            </button>

            <Link
              href="/admin/lecture-hall"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormGroup({
  label,
  children,
  error,
  tooltip,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  tooltip?: string;
}) {
  return (
    <div className="group">
      <div className="mb-1.5 ml-1 flex items-center gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-[#2E6F95]">
          {label}
        </label>
        {tooltip && (
          <div className="group/tooltip relative">
            <HelpCircle size={12} className="cursor-help text-slate-300" />
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-56 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover/tooltip:opacity-100">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {children}
      {error && <p className="ml-1 mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}

interface FeatureToggleProps {
  name: string;
  label: string;
  active: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

function FeatureToggle({ name, label, active, onChange, icon: Icon }: FeatureToggleProps) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all ${
        active
          ? 'border-[#2E6F95] bg-[#2E6F95]/5 text-[#2E6F95] shadow-sm'
          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={active}
        onChange={onChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <Icon size={24} className={active ? 'animate-pulse' : ''} />
      <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
      {active && <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2E6F95]" />}
    </label>
  );
}
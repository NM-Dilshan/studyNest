'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Pencil, Trash2 } from 'lucide-react';

interface LectureHall {
  hall_id: string;
  hall_name: string;
  building: string | null;
  block: string | null;
  floor: number | null;
  hall_number: string | null;
  capacity: number | null;
  hall_type: string | null;
  projector: boolean | null;
  wifi: boolean | null;
  ac: boolean | null;
  whiteboard: boolean | null;
  is_active: boolean | null;
  maintenance_status: string | null;
  created_at: string | null;
}

export default function LectureHallViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [hall, setHall] = useState<LectureHall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadHall = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lecture-halls/${params.id}`);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(data?.error || 'Failed to load lecture hall');
          return;
        }

        setHall(data?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lecture hall');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      void loadHall();
    }
  }, [params?.id]);

  const handleDelete = async () => {
    if (!hall?.hall_id) {
      return;
    }

    const confirmed = window.confirm('Delete this lecture hall?');
    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/lecture-halls/${hall.hall_id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || 'Failed to delete lecture hall');
        return;
      }

      router.push('/admin/lecture-hall');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lecture hall');
    } finally {
      setDeleting(false);
    }
  };

  const featureList = [
    hall?.projector ? 'Projector' : null,
    hall?.wifi ? 'WiFi' : null,
    hall?.ac ? 'AC' : null,
    hall?.whiteboard ? 'Whiteboard' : null,
  ].filter(Boolean) as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading lecture hall...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-slate-700">Lecture hall not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/lecture-hall"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to Halls
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/admin/lecture-hall/${hall.hall_id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Pencil size={16} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Building2 size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{hall.hall_name}</h1>
              <p className="text-sm text-slate-500">Lecture Hall Details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="Building" value={hall.building || '-'} />
            <DetailItem label="Block" value={hall.block || '-'} />
            <DetailItem label="Floor" value={hall.floor != null ? String(hall.floor) : '-'} />
            <DetailItem label="Hall Number" value={hall.hall_number || '-'} />
            <DetailItem label="Capacity" value={hall.capacity != null ? String(hall.capacity) : '-'} />
            <DetailItem label="Hall Type" value={hall.hall_type || '-'} />
            <DetailItem label="Maintenance" value={hall.maintenance_status || '-'} />
            <DetailItem label="Active" value={hall.is_active ? 'Yes' : 'No'} />
            <DetailItem
              label="Created At"
              value={hall.created_at ? new Date(hall.created_at).toLocaleString() : '-'}
            />
            <DetailItem label="Features" value={featureList.length ? featureList.join(', ') : 'None'} />
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

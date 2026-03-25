'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Check,
  LoaderCircle,
  MessageSquare,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  AlertCircle,
  Camera,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MainHeader from '@/components/MainHeader'

type ComplaintUpdate = {
  status: string
  date: string
  message: string
}

type Complaint = {
  complaint_id: string
  issue_category: string
  description: string
  photo_url?: string | null
  status: string
  priority: string
  created_at: string
  updates?: ComplaintUpdate[]
  lecture_halls?: {
    hall_name?: string
  } | null
  study_areas?: {
    area_name?: string
  } | null
}

export default function ComplaintDetailPage() {
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id as string

  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const studentId = localStorage.getItem('studentId')

    if (!storedUser || !studentId) {
      router.push('/login/signIN')
      return
    }

    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${complaintId}`)
        const data = await response.json()

        if (data.success && data.data) {
          setComplaint(data.data)
        } else {
          setComplaint(null)
        }
      } catch (err) {
        console.error('Error fetching complaint:', err)
        setComplaint(null)
      } finally {
        setLoading(false)
      }
    }

    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId, router])

  const handleEdit = () => {
    router.push(`/Naveen/my-complaints/edit/${complaintId}`)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return
    }

    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        router.push('/Naveen/my-complaints')
      } else {
        alert('Failed to delete: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Error deleting complaint')
    }
  }

  const cardClass =
    'rounded-[30px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md shadow-[0_18px_45px_rgba(30,41,59,0.10)]'

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl border-4 border-[#2E6F95]/20 border-t-[#2E6F95] animate-spin" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#2E6F95]">
            Loading Details
          </p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6">
        <div className={`${cardClass} max-w-md p-12 text-center`}>
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-black uppercase tracking-tight text-slate-800">
            Complaint Not Found
          </p>
          <Link
            href="/Naveen/my-complaints"
            className="mt-6 inline-block text-sm font-bold text-[#2E6F95] underline"
          >
            Back to List
          </Link>
        </div>
      </div>
    )
  }

  const timelineStages = ['Submitted', 'Pending', 'In Progress', 'Resolved']
  const locationValue =
    complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name || '-'

  const getTimelineStage = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('resolve')) return 'Resolved'
    if (s.includes('progress')) return 'In Progress'
    if (s.includes('submit')) return 'Submitted'
    return 'Pending'
  }

  const activeStage = getTimelineStage(complaint.status)
  const activeStageIndex = timelineStages.indexOf(activeStage)

  const statusNote: Record<string, string> = {
    Submitted:
      'Your complaint has been submitted successfully and is queued for initial review.',
    Pending:
      'Your complaint has been successfully submitted and is currently waiting for admin review. Thank you for your patience.',
    'In Progress':
      'The maintenance team is actively working on this complaint. Updates will appear in your activity log.',
    Resolved:
      'This complaint has been marked as resolved. If the issue persists, you can submit a new complaint.',
  }

  const activityLog =
    complaint.updates && complaint.updates.length > 0
      ? complaint.updates
      : [
          {
            status: 'Submitted',
            date: complaint.created_at,
            message: 'Complaint has been created and submitted for review.',
          },
        ]

  return (
    <div className="min-h-screen bg-[var(--bg-main)] antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(46,111,149,0.12),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(79,163,199,0.1),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <MainHeader />

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center sm:text-left">
          <p className="text-lg font-black tracking-tight text-slate-900">
            Space Complaint{' '}
            <span className="font-black text-[#5B90AC]">- Reference #{complaint.complaint_id}</span>
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            {complaint.issue_category}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-slate-700">{locationValue}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {complaint.photo_url && (
              <div className="group overflow-hidden rounded-[30px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md shadow-[0_18px_40px_rgba(30,41,59,0.09)]">
                <div className="relative aspect-video w-full">
                  <Image
                    src={complaint.photo_url}
                    alt="Evidence"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                    <Camera size={14} />
                    Submission Photo
                  </div>
                </div>
              </div>
            )}

            <div className={`${cardClass} p-8 sm:p-10`}>
              <h3 className="mb-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">
                Complaint Timeline
              </h3>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
                <p className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Current Status: {activeStage}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
                  {statusNote[activeStage]}
                </p>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-2">
                  {timelineStages.map((stage, idx) => {
                    const completed = idx < activeStageIndex
                    const current = idx === activeStageIndex
                    const lineCompleted = idx < activeStageIndex

                    return (
                      <div key={stage} className="flex flex-1 items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                            completed
                              ? 'border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-400/40'
                              : current
                                ? 'border-[#2E6F95] bg-[#2E6F95] text-white ring-8 ring-[#2E6F95]/20'
                                : 'border-slate-300 bg-slate-200 text-slate-400'
                          }`}
                        >
                          {completed ? (
                            <Check size={20} strokeWidth={3} />
                          ) : current ? (
                            <LoaderCircle size={20} className="animate-spin" />
                          ) : null}
                        </div>

                        {idx < timelineStages.length - 1 && (
                          <div
                            className={`mx-2 h-1 flex-1 rounded-full ${
                              lineCompleted ? 'bg-emerald-400' : 'bg-slate-300'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {timelineStages.map((stage) => (
                    <p
                      key={`label-${stage}`}
                      className="text-sm font-semibold text-slate-700"
                    >
                      {stage}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-8 sm:p-10`}>
              <h3 className="mb-6 flex items-center gap-3 text-lg font-black uppercase tracking-tight text-slate-900">
                <MessageSquare size={20} className="text-[#2E6F95]" />
                Activity Log
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-[var(--bg-card)]/70">
                {activityLog.map((update, idx) => (
                  <div
                    key={idx}
                    className={`px-5 py-4 ${idx !== activityLog.length - 1 ? 'border-b border-slate-200/80' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-2xl font-semibold text-slate-900">{update.status}</p>
                      <p className="text-xl font-medium text-slate-600">
                        {new Date(update.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {update.message && (
                      <p className="mt-1 text-sm text-slate-500">{update.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="grid grid-cols-1 gap-4">
              <InfoCard
                icon={<MapPin size={16} />}
                label="Location"
                value={locationValue}
              />
              <InfoCard
                icon={<Clock size={16} />}
                label="Submission Date"
                value={new Date(complaint.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
            </div>

            <div className="space-y-4 p-2">
              <button
                onClick={handleEdit}
                className="w-full rounded-full bg-[#2E6F95] py-4 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-md shadow-[#2E6F95]/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2E6F95]/35 active:scale-95"
              >
                <span className="flex items-center justify-center gap-3">
                  <Edit2 size={16} />
                  Edit Details
                </span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full rounded-full border border-rose-300 bg-transparent py-4 text-[13px] font-black uppercase tracking-[0.16em] text-rose-500 transition-all hover:bg-rose-50"
              >
                <span className="flex items-center justify-center gap-3">
                  <Trash2 size={16} />
                  Remove Record
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-l-4 border-slate-100 border-l-[#2E6F95] bg-[var(--bg-soft)] p-6 shadow-sm shadow-slate-100/50">
      <div className="mb-3 flex items-center gap-2 text-[#2E6F95]">
        <div className="rounded-lg bg-[#2E6F95]/5 p-1.5">{icon}</div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-black tracking-tight text-slate-800">{value}</p>
    </div>
  )
}
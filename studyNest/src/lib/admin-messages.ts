export interface AdminMessage {
  message_id: number
  title: string
  message: string
  scheduled_at: string
  expires_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

interface AdminMessageRow {
  message_id: number
  title: string
  message: string
  scheduled_at: Date | string
  expires_at: Date | string | null
  is_active: boolean | null
  created_by: string | null
  created_at: Date | string
  updated_at: Date | string
}

const toIsoString = (value: Date | string | null): string | null => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const mapAdminMessageRow = (row: AdminMessageRow): AdminMessage => ({
  message_id: row.message_id,
  title: row.title,
  message: row.message,
  scheduled_at: toIsoString(row.scheduled_at) || new Date().toISOString(),
  expires_at: toIsoString(row.expires_at),
  is_active: row.is_active ?? false,
  created_by: row.created_by,
  created_at: toIsoString(row.created_at) || new Date().toISOString(),
  updated_at: toIsoString(row.updated_at) || new Date().toISOString(),
})

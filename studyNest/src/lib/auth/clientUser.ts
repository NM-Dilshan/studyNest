export type ClientRole = 'student' | 'volunteer' | 'admin'

export interface ClientUser {
  user_id: string
  student_id?: string
  name?: string
  email?: string
  role: ClientRole
  is_active?: boolean
  created_at?: string
  volunteer_id?: string
}

const VALID_ROLES: ClientRole[] = ['student', 'volunteer', 'admin']

function isValidRole(value: unknown): value is ClientRole {
  return typeof value === 'string' && VALID_ROLES.includes(value as ClientRole)
}

export function readStoredUser(): ClientUser | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem('user')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<ClientUser>

    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.user_id !== 'string' || !parsed.user_id.trim()) return null
    if (!isValidRole(parsed.role)) return null

    return {
      ...parsed,
      user_id: parsed.user_id.trim(),
      role: parsed.role,
    }
  } catch {
    return null
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('user')
  window.localStorage.removeItem('studentId')
}

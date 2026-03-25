import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Check if Supabase is configured
export const isSupabaseConfigured = 
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE'

export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please update your .env.local file with valid Supabase credentials.'
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

import { createClient } from '@supabase/supabase-js';

// Fallback to dummy values if environment variables are missing to prevent Next.js from crashing on boot
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars are missing. The app will fail to communicate with Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

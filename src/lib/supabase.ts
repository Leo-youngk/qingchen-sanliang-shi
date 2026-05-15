import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // This app has no user login — always use the anon key directly.
        // Disabling session persistence prevents the SDK from reading a
        // stale/invalid session token from localStorage (e.g. left behind
        // by another app sharing the same Supabase project), which was
        // causing "Headers.set: non ISO-8859-1 code point" errors.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null

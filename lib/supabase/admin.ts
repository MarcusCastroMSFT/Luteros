import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 * 
 * Uses the service role key which bypasses Row Level Security (RLS).
 * ONLY use this in secure server-side code (API routes, Server Actions).
 * 
 * ⚠️ WARNING: Never use this client in Client Components or expose
 * the service role key to the browser. It has full database access.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables for admin client'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

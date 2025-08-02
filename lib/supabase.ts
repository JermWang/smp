import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

// Create client only if configured, otherwise return a mock client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseKey!)
  : null

// Database types
export interface GlobalStats {
  id: number
  total_echoes: number
  created_at: string
  updated_at: string
} 
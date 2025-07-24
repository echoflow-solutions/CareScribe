import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we should use local storage instead
const useLocalStorage = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true'

export const supabase = useLocalStorage || !supabaseUrl || !supabaseAnonKey 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey)
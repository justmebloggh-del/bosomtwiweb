import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_CONFIGURED = !!supabaseUrl && !!supabaseAnonKey;

// Initialize as null if not configured to avoid "URL required" crash at runtime
export const supabase = SUPABASE_CONFIGURED 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

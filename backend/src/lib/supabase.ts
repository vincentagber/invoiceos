import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  _supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('Supabase credentials missing - running without Supabase');
}

export const supabase = _supabase || ({} as SupabaseClient);

export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =              import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role key

//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL ) {
  console.error('Missing Supabase SUPABASE_URL environment variable');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Initialize Supabase client with service role key
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
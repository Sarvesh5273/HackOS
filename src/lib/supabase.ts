import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key. Check your .env file.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvkbqjcghvpgnyczgmna.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a2JxamNnaHZwZ255Y3pnbW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNTY4MTIsImV4cCI6MjEwOTgzMjgxMn0.VpHw3GodJyNfBSpNGeMujwiufAFCx9xJJinDzWRucwI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

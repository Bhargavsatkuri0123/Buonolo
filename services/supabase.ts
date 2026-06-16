import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = url && url.startsWith('http') ? url : 'https://ycjpyxgrksealooqvcsu.supabase.co';
const supabaseKey = key && key.length > 0 ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljanB5eGdya3NlYWxvb3F2Y3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NjUwOTYsImV4cCI6MjA5NzE0MTA5Nn0.syyWoqLU3G-4LfV2A5q5jQHUykdZUBncoLHh9fETSIg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const initAnalytics = async () => {
  return null;
};

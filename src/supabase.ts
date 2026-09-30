import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://unuuvevlewpygtszezlu.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudXV2ZXZsZXdweWd0c3plemx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDg5NjEsImV4cCI6MjA5ODQyNDk2MX0.GA9LupBqA5-6Yl6ZjSSSshBXUN6dJYFahVrICmcnmGI';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = envUrl && envUrl.startsWith('http') ? envUrl : defaultUrl;
const supabaseKey = envKey && envKey.length > 10 ? envKey : defaultKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

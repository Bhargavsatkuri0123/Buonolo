import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://unuuvevlewpygtszezlu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudXV2ZXZsZXdweWd0c3plemx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDg5NjEsImV4cCI6MjA5ODQyNDk2MX0.GA9LupBqA5-6Yl6ZjSSSshBXUN6dJYFahVrICmcnmGI');
async function test() {
  const { data, error } = await supabase.from('posts').select('*');
  console.log("Posts:", data, error);
}
test();

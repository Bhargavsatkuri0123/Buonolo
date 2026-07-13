import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const file = fs.readFileSync('./supabase.ts', 'utf-8');
const urlMatch = file.match(/supabaseUrl = '([^']+)'/);
const keyMatch = file.match(/supabaseKey = '([^']+)'/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function test() {
  const { data, error } = await supabase.from('posts').select('*');
  console.log(data, error);
}
test();

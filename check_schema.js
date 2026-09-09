import { supabase } from './supabase.ts';
async function main() {
  const { data, error } = await supabase.from('chat_rooms').select('*').contains('participants', ['123e4567-e89b-12d3-a456-426614174000']);
  console.log("Data:", data, "Error:", error);
}
main();

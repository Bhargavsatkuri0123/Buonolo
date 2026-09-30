const fs = require('fs');
let code = fs.readFileSync('src/supabase.ts', 'utf8');
code = code.replace(/import\.meta\.env/g, '(import.meta as any).env');
fs.writeFileSync('src/supabase.ts', code);

try {
  let code2 = fs.readFileSync('supabase.ts', 'utf8');
  code2 = code2.replace(/import\.meta\.env/g, '(import.meta as any).env');
  fs.writeFileSync('supabase.ts', code2);
} catch (e) {}

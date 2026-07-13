const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('links?: { label: string; url: string; type: "video" | "web" | "doc" }[];')) {
  code = code.replace(
    'tool: string;',
    'tool: string;\n  links?: { label: string; url: string; type: "video" | "web" | "doc" }[];'
  );
  fs.writeFileSync('src/types.ts', code);
}

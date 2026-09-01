const fs = require('fs');

let toolsCode = fs.readFileSync('src/components/ToolsTab.tsx', 'utf8');

const replaceTarget = `<button key={it.name} onClick={() => setOpenTool(it.name)} className={\`\${T.card} rounded-2xl p-3.5 text-left cardin border border-orange-50 dark:border-zinc-800\`}>
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-700 flex items-center justify-center mb-2">`;

const replacement = `<button key={it.name} onClick={() => setOpenTool(it.name)} className={\`\${T.card} rounded-2xl p-3.5 text-left cardin border border-orange-50 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95\`}>
                <div className={\`w-9 h-9 rounded-lg \${it.bg || 'bg-orange-500/10'} \${it.color || 'text-orange-700'} flex items-center justify-center mb-2\`}>`;

toolsCode = toolsCode.replace(replaceTarget, replacement);

fs.writeFileSync('src/components/ToolsTab.tsx', toolsCode);

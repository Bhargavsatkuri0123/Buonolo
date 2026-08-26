const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const t = `          <button 
            onClick={() => onInviteClick(group)}
            className={\`flex-1 py-2.5 rounded-xl \${T.card} \${T.text} font-bold text-sm flex items-center justify-center gap-2 border border-orange-200 dark:border-zinc-800\`}
          >`;

const r = `          <button 
            onClick={() => onInviteClick && onInviteClick(group)}
            className={\`flex-1 py-2.5 rounded-xl \${T.card} \${T.text} font-bold text-sm flex items-center justify-center gap-2 border border-orange-200 dark:border-zinc-800\`}
          >`;

if (code.includes(t)) {
  code = code.replace(t, r);
  fs.writeFileSync('src/components/CommunityTab.tsx', code);
  console.log("Fixed onInviteClick");
} else {
  console.log("Could not find onInviteClick target");
}

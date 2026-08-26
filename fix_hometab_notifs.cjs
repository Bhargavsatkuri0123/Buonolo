const fs = require('fs');
let code = fs.readFileSync('src/components/HomeTab.tsx', 'utf8');

const target = `<button onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setShowNotifs(false); }} className="text-xs text-orange-500 font-semibold">Mark all as read</button>`;
const replacement = `<button onClick={async () => { 
                setNotifications(prev => prev.map(n => ({ ...n, read: true }))); 
                setShowNotifs(false); 
                if (user) await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
              }} className="text-xs text-orange-500 font-semibold">Mark all as read</button>`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('src/components/HomeTab.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}

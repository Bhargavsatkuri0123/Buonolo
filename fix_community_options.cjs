const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

// Update imports
code = code.replace(
  'import { Search, Plus, Users',
  'import { Search, Plus, Users, Settings, Shield, LogOut'
);

// Update GroupView
const groupViewStart = code.indexOf('export const GroupView = ({ group, onClose, T, onUserClick, onEventClick }: any) => {');
if (groupViewStart === -1) {
  console.log("Could not find GroupView");
  process.exit(1);
}

// Find the start of the return statement
const groupViewReturn = code.indexOf('return (', groupViewStart);

// Before return (, insert states
const insertState = `  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="pb-24 bg-white dark:bg-black min-h-screen">
        <Header T={T} title={\`\${group.name} Settings\`} back={() => setShowSettings(false)} />
        <div className={\`mx-4 mt-4 space-y-4\`}>
          <div className={\`\${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800\`}>
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Notifications</p>
            <div className="flex justify-between items-center">
              <p className={\`text-sm \${T.text}\`}>All group posts</p>
              <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
            <div className="flex justify-between items-center">
              <p className={\`text-sm \${T.text}\`}>Group events</p>
              <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
          </div>

          <div className={\`\${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800\`}>
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Privacy & Security</p>
            <button className={\`flex items-center justify-between w-full text-left\`}>
              <span className={\`text-sm \${T.text}\`}>Blocked Users</span>
              <ChevronRight size={16} className={T.sub} />
            </button>
            <button className={\`flex items-center justify-between w-full text-left\`}>
              <span className={\`text-sm \${T.text}\`}>Reported content</span>
              <ChevronRight size={16} className={T.sub} />
            </button>
          </div>

          <div className={\`\${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800\`}>
            <button className={\`w-full text-left text-sm font-bold text-red-500\`}>Leave Group</button>
          </div>
        </div>
      </div>
    );
  }

  `;

code = code.substring(0, groupViewReturn) + insertState + code.substring(groupViewReturn);

// Find the MoreHorizontal button and replace it
const moreButtonStr = `<button className={\`p-2.5 rounded-xl \${T.card} \${T.text} border border-orange-200 dark:border-zinc-800 flex items-center justify-center\`}>
            <MoreHorizontal size={18} />
          </button>`;

const newMoreButton = `<div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className={\`p-2.5 rounded-xl \${T.card} \${T.text} border border-orange-200 dark:border-zinc-800 flex items-center justify-center\`}>
              <MoreHorizontal size={18} />
            </button>
            {showOptions && (
              <div className={\`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border \${T.line} \${T.card2} z-50 p-2 flex flex-col\`}>
                <button onClick={() => { setShowOptions(false); setShowSettings(true); }} className={\`text-left px-3 py-2 text-sm \${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2\`}><Settings size={16} /> Group Settings</button>
                <button className={\`text-left px-3 py-2 text-sm \${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2\`}><Shield size={16} /> Report Group</button>
                <button className={\`text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2\`}><LogOut size={16} /> Leave Group</button>
              </div>
            )}
          </div>`;

code = code.replace(moreButtonStr, newMoreButton);

fs.writeFileSync('src/components/CommunityTab.tsx', code);

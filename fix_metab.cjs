const fs = require('fs');

let code = fs.readFileSync('src/components/MeTab.tsx', 'utf8');

// Insert imports
code = code.replace(
  'import { LOCATIONS, LANGS, SAF } from "../constants";',
  'import { LOCATIONS, LANGS, SAF } from "../constants";\nimport { GroupView, EventView, UserView } from "./CommunityTab";'
);

// We need to rewrite CommunitiesScreen
const communitiesScreenStart = code.indexOf('const CommunitiesScreen = () => (');
const editProfileScreenStart = code.indexOf('const EditProfileScreen = () => {');

const oldCommunitiesScreen = code.substring(communitiesScreenStart, editProfileScreenStart);

const newCommunitiesScreen = `
  const CommunitiesScreen = () => {
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showSettings, setShowSettings] = useState(false);

    if (selectedUser) {
      return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} />;
    }

    if (selectedEvent) {
      return <EventView event={selectedEvent} onClose={() => setSelectedEvent(null)} T={T} onUserClick={setSelectedUser} />;
    }

    if (selectedGroup) {
      return <GroupView group={selectedGroup} onClose={() => setSelectedGroup(null)} T={T} onUserClick={setSelectedUser} onEventClick={setSelectedEvent} />;
    }

    if (showSettings) {
      return (
        <div className="pb-24">
          <Header T={T} title="Community Settings" back={() => setShowSettings(false)} />
          <div className={\`\${T.card} mx-4 mt-4 rounded-2xl p-4 space-y-4\`}>
            <div>
              <p className={\`text-sm font-bold \${T.text}\`}>Notifications</p>
              <div className="flex justify-between items-center mt-3">
                <p className={\`text-sm \${T.sub}\`}>New events in my groups</p>
                <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className={\`text-sm \${T.sub}\`}>Group messages</p>
                <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
            </div>
            <div className={\`border-t \${T.line} pt-4\`}>
              <p className={\`text-sm font-bold text-red-500\`}>Leave all groups</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <Header T={T} title="Communities" back={() => setMeScreen("root")} right={<button onClick={() => setShowSettings(true)} className={\`p-2 rounded-full \${T.card}\`}><Settings size={18} className={T.text} /></button>} />
        {communitiesData.map(c => (
          <div key={c.name} onClick={() => setSelectedGroup(c)} className={\`\${T.card} mx-4 mb-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer\`}>
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1">
              <p className={\`text-sm font-semibold \${T.text}\`}>{c.name}</p>
              <p className={\`text-xs \${T.sub}\`}>{c.members} members</p>
            </div>
            <ChevronRight size={16} className={T.sub} />
          </div>
        ))}
      </div>
    );
  };

`;

code = code.replace(oldCommunitiesScreen, newCommunitiesScreen);

fs.writeFileSync('src/components/MeTab.tsx', code);

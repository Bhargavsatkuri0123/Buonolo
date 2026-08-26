const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const tGroupView = `export const GroupView = ({ group, onClose, T, onUserClick, onEventClick, onInviteClick, user }: any) => {`;
const rGroupView = `export const GroupView = ({ group, onClose, T, onUserClick, onEventClick, onInviteClick, user, events }: any) => {`;

const tGroupViewRender = `<GroupView 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        T={T} 
        onUserClick={setSelectedUser} 
        onEventClick={setSelectedEvent} 
        onInviteClick={() => {
          setGroupToInvite(selectedGroup);
          setIsInviteModalOpen(true);
        }}
        user={user}
      />`;
const rGroupViewRender = `<GroupView 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        T={T} 
        onUserClick={setSelectedUser} 
        onEventClick={setSelectedEvent} 
        onInviteClick={() => {
          setGroupToInvite(selectedGroup);
          setIsInviteModalOpen(true);
        }}
        user={user}
        events={events}
      />`;

const tDUMMY_EVENTS = `{DUMMY_EVENTS.map(e => (`;
const rDUMMY_EVENTS = `{(events || []).map((e: any) => (`;

const tUserView = `export const UserView = ({ user, onClose, T, onGroupClick }: any) => {`;
const rUserView = `export const UserView = ({ user, onClose, T, onGroupClick, groups }: any) => {`;

const tUserViewRender = `return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} />;`;
const rUserViewRender = `return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} groups={data} />;`;

const tDUMMY_COMM = `{DUMMY_COMMUNITIES.slice(0, 2).map(c => (`;
const rDUMMY_COMM = `{(groups || []).slice(0, 2).map((c: any) => (`;


code = code.replace(tGroupView, rGroupView);
code = code.replace(tGroupViewRender, rGroupViewRender);
code = code.replace(tDUMMY_EVENTS, rDUMMY_EVENTS);
code = code.replace(tUserView, rUserView);
code = code.replace(tUserViewRender, rUserViewRender);
code = code.replace(tDUMMY_COMM, rDUMMY_COMM);

fs.writeFileSync('src/components/CommunityTab.tsx', code);
console.log("fixed UserView and GroupView");

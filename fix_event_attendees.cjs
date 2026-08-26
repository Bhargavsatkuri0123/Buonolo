const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const target1 = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id)");
    if (!error && evs && evs.length > 0) {
      setEvents(evs.map((e: any) => ({
        ...e,
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };`;

const replacement1 = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    if (!error && evs && evs.length > 0) {
      setEvents(evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };`;

const target2 = `            <div className="flex -space-x-3">
              {DUMMY_PEOPLE.slice(0, Math.min(3, Math.max(0, attendees))).map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick(p)}>
                  <Avatar name={p.name} />
                </div>
              ))}
            </div>`;

const replacement2 = `            <div className="flex -space-x-3">
              {(selectedEvent.attendeesList || []).slice(0, Math.min(3, Math.max(0, attendees))).map((p: any, i: number) => (
                <div key={p.user_id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick({id: p.user_id, name: p.user_name})}>
                  <Avatar name={p.user_name} />
                </div>
              ))}
            </div>`;

if (!code.includes(target1)) console.log("Target 1 not found");
if (!code.includes(target2)) console.log("Target 2 not found");
if (code.includes(target1) && code.includes(target2)) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  fs.writeFileSync('src/components/CommunityTab.tsx', code);
  console.log("Replaced successfully!");
}

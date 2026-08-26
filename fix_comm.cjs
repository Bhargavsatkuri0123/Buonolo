const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const tCom = `  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && groups) {
      setData(groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category,
        emoji: g.image || "🏘️",
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };`;
const rCom = `  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    let dbGroups = [];
    if (!error && groups) {
      dbGroups = groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category,
        emoji: g.image || "🏘️",
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      }));
    }
    const o = profile?.origin || "USA";
    const c = profile?.city || "Berlin";
    const h = profile?.host || "Germany";
    const dummyGroups = GENERATE_DUMMY_COMMUNITIES(o, c, h);
    setData([...dummyGroups, ...dbGroups]);
  };`;

const tEv = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    if (!error && evs && evs.length > 0) {
      setEvents(evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };`;
const rEv = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    let dbEvents = [];
    if (!error && evs) {
      dbEvents = evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      }));
    }
    const o = profile?.origin || "USA";
    const c = profile?.city || "Berlin";
    const h = profile?.host || "Germany";
    const dummyEvents = GENERATE_DUMMY_EVENTS(o, c, h);
    setEvents([...dummyEvents, ...dbEvents]);
  };`;

const tPeop = `  const fetchPeople = async () => {
    const { data: pros, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(10);
    if (!error && pros && pros.length > 0) {
      setPeople(pros.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        origin: p.origin,
        bio: p.bio
      })));
    }
  };`;
const rPeop = `  const fetchPeople = async () => {
    const { data: pros, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(10);
    let dbPeople = [];
    if (!error && pros) {
      dbPeople = pros.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.handle || "User",
        origin: p.origin || "Unknown",
        bio: p.bio || "No bio yet.",
        avatar: (p.full_name || p.handle || "U").substring(0, 2).toUpperCase()
      }));
    }
    const o = profile?.origin || "USA";
    const c = profile?.city || "Berlin";
    const h = profile?.host || "Germany";
    const dummyPeople = GENERATE_DUMMY_PEOPLE(o, c, h);
    setPeople([...dummyPeople, ...dbPeople]);
  };`;

if (code.includes(tCom)) code = code.replace(tCom, rCom);
else console.log("c not found");

if (code.includes(tEv)) code = code.replace(tEv, rEv);
else console.log("e not found");

if (code.includes(tPeop)) code = code.replace(tPeop, rPeop);
else console.log("p not found");

const targetImport = `import { DUMMY_EVENTS, DUMMY_PEOPLE } from "../constants";`;
const replacementImport = `import { GENERATE_DUMMY_EVENTS, GENERATE_DUMMY_PEOPLE, GENERATE_DUMMY_COMMUNITIES } from "../constants";`;
if (code.includes(targetImport)) code = code.replace(targetImport, replacementImport);
else console.log("import not found");

fs.writeFileSync('src/components/CommunityTab.tsx', code);
console.log("replaced Comm");

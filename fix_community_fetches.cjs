const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const targetFetchEvents = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    if (!error && evs && evs.length > 0) {
      setEvents(evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((a: any) => a.user_id === user?.id)
      })));
    }
  };`;
const replacementFetchEvents = `  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    let dbEvents = [];
    if (!error && evs) {
      dbEvents = evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((a: any) => a.user_id === user?.id)
      }));
    }
    const o = profile?.origin || "USA";
    const c = profile?.city || "Berlin";
    const h = profile?.host || "Germany";
    const dummyEvents = GENERATE_DUMMY_EVENTS(o, c, h);
    setEvents([...dummyEvents, ...dbEvents]);
  };`;

const targetFetchPeople = `  const fetchPeople = async () => {
    const { data: peeps, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(10);
    if (!error && peeps && peeps.length > 0) {
      setPeople(peeps.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.handle || "User",
        origin: p.origin || "Unknown",
        bio: p.bio || "No bio yet.",
        avatar: (p.full_name || p.handle || "U").substring(0, 2).toUpperCase()
      })));
    }
  };`;
const replacementFetchPeople = `  const fetchPeople = async () => {
    const { data: peeps, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(10);
    let dbPeople = [];
    if (!error && peeps) {
      dbPeople = peeps.map((p: any) => ({
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

const targetFetchCommunities = `  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && groups) {
      setData(groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category,
        emoji: g.image || "🏘️",
        members: (g.group_members?.length || 0) + 1,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };`;
const replacementFetchCommunities = `  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    let dbGroups = [];
    if (!error && groups) {
      dbGroups = groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category,
        emoji: g.image || "🏘️",
        members: (g.group_members?.length || 0) + 1,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      }));
    }
    const o = profile?.origin || "USA";
    const c = profile?.city || "Berlin";
    const h = profile?.host || "Germany";
    const dummyGroups = GENERATE_DUMMY_COMMUNITIES(o, c, h);
    setData([...dummyGroups, ...dbGroups]);
  };`;

const targetImports = `import { GENERATE_DUMMY_COMMUNITIES } from "../constants";`; // Check if we already imported something, or replace DUMMY_EVENTS
// We might just need to replace DUMMY_EVENTS with GENERATE_DUMMY_EVENTS, DUMMY_PEOPLE with GENERATE_DUMMY_PEOPLE, etc.

if (code.includes(targetFetchEvents)) code = code.replace(targetFetchEvents, replacementFetchEvents);
else console.log("events not found");

if (code.includes(targetFetchPeople)) code = code.replace(targetFetchPeople, replacementFetchPeople);
else console.log("people not found");

if (code.includes(targetFetchCommunities)) code = code.replace(targetFetchCommunities, replacementFetchCommunities);
else console.log("groups not found");

fs.writeFileSync('src/components/CommunityTab.tsx', code);
console.log("Replaced CommunityTab successfully!");

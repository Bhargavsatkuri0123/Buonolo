const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

const targetPeople = `export const DUMMY_PEOPLE = [
  { id: "p1", name: "Sarah Miller", origin: "USA", bio: "Moved here 2 months ago. Product Designer.", avatar: "SM" },
  { id: "p2", name: "Ahmed Khan", origin: "Pakistan", bio: "Software Engineer at a fintech startup.", avatar: "AK" },
  { id: "p3", name: "Elena Rossi", origin: "Italy", bio: "Art lover and coffee enthusiast.", avatar: "ER" },
];`;

const replacementPeople = `export const GENERATE_DUMMY_PEOPLE = (origin: string, city: string, host: string) => [
  { id: "p1", name: "Sarah Miller", origin: "USA", bio: \`Moved to \${city} 2 months ago. Product Designer.\`, avatar: "SM" },
  { id: "p2", name: "Ahmed Khan", origin: origin, bio: \`Software Engineer from \${origin}, enjoying \${host}.\`, avatar: "AK" },
  { id: "p3", name: "Elena Rossi", origin: "Italy", bio: \`Art lover and coffee enthusiast exploring \${city}.\`, avatar: "ER" },
];

export const DUMMY_PEOPLE = GENERATE_DUMMY_PEOPLE("USA", "Berlin", "Germany"); // Fallback`;

const targetFeed = `export const DUMMY_FEED: any[] = [
  { id: "f1", name: "Sarah Miller", text: "Just got my Anmeldung done! It was easier than expected. If anyone needs tips on the Berlin process, let me know!", time: "2h ago", likes: 12, liked: false, comments: 3, privacy: "Public", tags: ["Berlin", "Anmeldung"] },
  { id: "f2", name: "Elena Rossi", text: "Found this amazing little Italian cafe near Mitte that actually tastes like home ☕️", time: "5h ago", likes: 45, liked: true, comments: 8, privacy: "Public", tags: ["Food", "Mitte"] },
  { id: "f3", name: "Ahmed Khan", text: "Does anyone know a good English-speaking tax consultant? The forms are overwhelming.", time: "1d ago", likes: 8, liked: false, comments: 12, privacy: "Friends", tags: ["Help", "Taxes"] }
];`;

const replacementFeed = `export const GENERATE_DUMMY_FEED = (origin: string, city: string, host: string): any[] => [
  { id: "f1", name: "Sarah Miller", text: \`Just got my registration done in \${city}! It was easier than expected. If anyone needs tips on the \${host} process, let me know!\`, time: "2h ago", likes: 12, liked: false, comments: 3, privacy: "Public", tags: [city, "Registration"] },
  { id: "f2", name: "Elena Rossi", text: \`Found this amazing little cafe in \${city} that actually tastes like home ☕️\`, time: "5h ago", likes: 45, liked: true, comments: 8, privacy: "Public", tags: ["Food", city] },
  { id: "f3", name: "Ahmed Khan", text: \`Does anyone know a good \${origin}-friendly tax consultant in \${city}? The local forms are overwhelming.\`, time: "1d ago", likes: 8, liked: false, comments: 12, privacy: "Friends", tags: ["Help", "Taxes"] }
];

export const DUMMY_FEED = GENERATE_DUMMY_FEED("USA", "Berlin", "Germany"); // Fallback`;

const targetEvents = `export const DUMMY_EVENTS = [
  { id: "e1", title: "Language Exchange Mixer", date: "Tomorrow, 7:00 PM", location: "Cafe St. Oberholz, Berlin", attendees: 24, image: "🗣️", joined: false },
  { id: "e2", title: "Expats in Tech Networking", date: "Friday, 6:30 PM", location: "Betahaus, Kreuzberg", attendees: 56, image: "💻", joined: true },
  { id: "e3", title: "Sunday Tempelhofer Feld Picnic", date: "Sunday, 2:00 PM", location: "Tempelhofer Feld", attendees: 12, image: "🧺", joined: false },
];`;

const replacementEvents = `export const GENERATE_DUMMY_EVENTS = (origin: string, city: string, host: string) => [
  { id: "e1", title: "Language Exchange Mixer", date: "Tomorrow, 7:00 PM", location: \`Central Cafe, \${city}\`, attendees: 24, image: "🗣️", joined: false },
  { id: "e2", title: \`Expats from \${origin} Meetup\`, date: "Friday, 6:30 PM", location: \`Downtown \${city}\`, attendees: 56, image: "🎉", joined: true },
  { id: "e3", title: \`Sunday Park Picnic in \${city}\`, date: "Sunday, 2:00 PM", location: \`City Park, \${city}\`, attendees: 12, image: "🧺", joined: false },
];

export const DUMMY_EVENTS = GENERATE_DUMMY_EVENTS("USA", "Berlin", "Germany"); // Fallback`;

const targetCommunities = `export const DUMMY_COMMUNITIES = [
  { id: "c1", name: "Berlin Expats", desc: "General group for all expats living in Berlin.", members: 12400, emoji: "🌍", joined: true, category: "General" },
  { id: "c2", name: "Tech in Berlin", desc: "For software engineers, designers, and PMs.", members: 8200, emoji: "💻", joined: false, category: "Career" },
  { id: "c3", name: "Foodies of Berlin", desc: "Restaurant recommendations and meetups.", members: 3100, emoji: "🥑", joined: false, category: "Social" },
];`;

const replacementCommunities = `export const GENERATE_DUMMY_COMMUNITIES = (origin: string, city: string, host: string) => [
  { id: "c1", name: \`\${city} Expats\`, desc: \`General group for all expats living in \${city}.\`, members: 12400, emoji: "🌍", joined: true, category: "General" },
  { id: "c2", name: \`\${origin} Expats in \${host}\`, desc: \`For people from \${origin} living in \${host}.\`, members: 8200, emoji: "🤝", joined: false, category: "Social" },
  { id: "c3", name: \`Foodies of \${city}\`, desc: "Restaurant recommendations and meetups.", members: 3100, emoji: "🥑", joined: false, category: "Social" },
];

export const DUMMY_COMMUNITIES = GENERATE_DUMMY_COMMUNITIES("USA", "Berlin", "Germany"); // Fallback`;


if (code.includes(targetPeople)) code = code.replace(targetPeople, replacementPeople);
if (code.includes(targetFeed)) code = code.replace(targetFeed, replacementFeed);
if (code.includes(targetEvents)) code = code.replace(targetEvents, replacementEvents);
if (code.includes(targetCommunities)) code = code.replace(targetCommunities, replacementCommunities);

fs.writeFileSync('src/constants.ts', code);
console.log("Replaced successfully!");

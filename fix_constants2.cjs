const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

const targetCommunities = `export const DUMMY_COMMUNITIES = [
  { id: "c1", name: "Berlin Expats", members: "12.4k", emoji: "🇩🇪", category: "General", joined: true },
  { id: "c2", name: "Tech in Berlin", members: "8.2k", emoji: "💻", category: "Professional", joined: false },
  { id: "c3", name: "Vegan Foodies", members: "3.1k", emoji: "🥑", category: "Lifestyle", joined: false },
  { id: "c4", name: "Hiking Enthusiasts", members: "1.5k", emoji: "🥾", category: "Sports", joined: true },
  { id: "c5", name: "Spanish Speakers", members: "5.6k", emoji: "🇪🇸", category: "Language", joined: false },
];`;

const replacementCommunities = `export const GENERATE_DUMMY_COMMUNITIES = (origin: string, city: string, host: string) => [
  { id: "c1", name: \`\${city} Expats\`, members: "12.4k", emoji: "🌍", category: "General", joined: true },
  { id: "c2", name: \`\${origin} Expats in \${host}\`, members: "8.2k", emoji: "🤝", category: "Social", joined: false },
  { id: "c3", name: \`Foodies of \${city}\`, members: "3.1k", emoji: "🥑", category: "Lifestyle", joined: false },
];

export const DUMMY_COMMUNITIES = GENERATE_DUMMY_COMMUNITIES("USA", "Berlin", "Germany");`;

const targetEvents = `export const DUMMY_EVENTS = [
  { id: "e1", title: "Friday Night Drinks", location: "Prater Biergarten", date: "Friday, 19:00", attendees: 45, image: "🍻" },
  { id: "e2", title: "Language Exchange", location: "Mauerpark", date: "Sunday, 14:00", attendees: 12, image: "🗣️" },
  { id: "e3", title: "Startups Meetup", location: "Factory Berlin", date: "Tuesday, 18:30", attendees: 80, image: "🚀" },
];`;

const replacementEvents = `export const GENERATE_DUMMY_EVENTS = (origin: string, city: string, host: string) => [
  { id: "e1", title: "Language Exchange Mixer", date: "Tomorrow, 7:00 PM", location: \`Central Cafe, \${city}\`, attendees: 24, image: "🗣️", joined: false },
  { id: "e2", title: \`Expats from \${origin} Meetup\`, date: "Friday, 6:30 PM", location: \`Downtown \${city}\`, attendees: 56, image: "🎉", joined: true },
  { id: "e3", title: \`Sunday Park Picnic in \${city}\`, date: "Sunday, 2:00 PM", location: \`City Park, \${city}\`, attendees: 12, image: "🧺", joined: false },
];

export const DUMMY_EVENTS = GENERATE_DUMMY_EVENTS("USA", "Berlin", "Germany");`;

if (code.includes(targetCommunities)) {
  code = code.replace(targetCommunities, replacementCommunities);
} else {
  console.log("Could not find communities");
}

if (code.includes(targetEvents)) {
  code = code.replace(targetEvents, replacementEvents);
} else {
  console.log("Could not find events");
}

fs.writeFileSync('src/constants.ts', code);
console.log("Replaced constants");

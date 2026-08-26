const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

const targetEvents = `export const DUMMY_EVENTS = [
  { id: "e1", title: "Friday Night Drinks", location: "Prater Biergarten", date: "Friday, 19:00", attendees: 45, image: "🍻" },
  { id: "e2", title: "Language Exchange", location: "Mauerpark", date: "Sunday, 14:00", attendees: 12, image: "🗣️" },
  { id: "e3", title: "Newcomer Workshop", location: "Online", date: "Monday, 18:30", attendees: 88, image: "🏢" },
];`;

const replacementEvents = `export const GENERATE_DUMMY_EVENTS = (origin: string, city: string, host: string) => [
  { id: "e1", title: "Language Exchange Mixer", date: "Tomorrow, 7:00 PM", location: \`Central Cafe, \${city}\`, attendees: 24, image: "🗣️", joined: false },
  { id: "e2", title: \`Expats from \${origin} Meetup\`, date: "Friday, 6:30 PM", location: \`Downtown \${city}\`, attendees: 56, image: "🎉", joined: true },
  { id: "e3", title: \`Sunday Park Picnic in \${city}\`, date: "Sunday, 2:00 PM", location: \`City Park, \${city}\`, attendees: 12, image: "🧺", joined: false },
];

export const DUMMY_EVENTS = GENERATE_DUMMY_EVENTS("USA", "Berlin", "Germany");`;

if (code.includes(targetEvents)) {
  code = code.replace(targetEvents, replacementEvents);
} else {
  console.log("Could not find events");
}

fs.writeFileSync('src/constants.ts', code);
console.log("Replaced constants");

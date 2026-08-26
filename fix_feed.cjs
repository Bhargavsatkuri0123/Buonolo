const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

const targetFeed = `export const DUMMY_FEED: any[] = [
  { id: "f1", name: "Sarah Miller", text: "Just got my Anmeldung done! It was easier than expected. If anyone needs tips on the Berlin process, let me know!", time: "2h ago", likes: 12, liked: false, comments: 3, privacy: "Public", tags: ["Berlin", "Anmeldung"] },
  { id: "f2", name: "Ahmed Khan", text: "Looking for a good coworking space in Prenzlauer Berg. Any recommendations?", time: "5h ago", likes: 5, liked: true, comments: 8, privacy: "Public", tags: ["Coworking", "Berlin"] },
  { id: "f3", name: "Elena Rossi", text: "Beautiful sunny day at Tempelhofer Feld! Finally feels like summer is here.", time: "8h ago", likes: 34, liked: false, comments: 2, privacy: "Friends", tags: ["Summer", "Outdoors"] },
  { id: "f4", name: "James Wei", text: "Does anyone know how long the Blue Card processing takes right now? I applied 6 weeks ago and haven't heard back.", time: "1d ago", likes: 8, liked: false, comments: 14, privacy: "Public", tags: ["Visa", "BlueCard"] },
  { id: "f5", name: "Maria Garcia", text: "Hosted my first dinner party in the new apartment! 🍷 Made some traditional Spanish tapas.", time: "2d ago", likes: 45, liked: true, comments: 5, privacy: "Public", tags: ["Food", "MovingIn"], bgTheme: "bg-gradient-to-r from-orange-400 to-red-500" }
];`;

const replacementFeed = `export const GENERATE_DUMMY_FEED = (origin: string, city: string, host: string): any[] => [
  { id: "f1", name: "Sarah Miller", text: \`Just got my registration done in \${city}! It was easier than expected. If anyone needs tips on the \${host} process, let me know!\`, time: "2h ago", likes: 12, liked: false, comments: 3, privacy: "Public", tags: [city, "Registration"] },
  { id: "f2", name: "Elena Rossi", text: \`Found this amazing little cafe in \${city} that actually tastes like home ☕️\`, time: "5h ago", likes: 45, liked: true, comments: 8, privacy: "Public", tags: ["Food", city] },
  { id: "f3", name: "Ahmed Khan", text: \`Does anyone know a good \${origin}-friendly tax consultant in \${city}? The local forms are overwhelming.\`, time: "1d ago", likes: 8, liked: false, comments: 12, privacy: "Friends", tags: ["Help", "Taxes"] },
  { id: "f4", name: "James Wei", text: \`Does anyone know how long visa processing takes right now in \${host}? I applied 6 weeks ago.\`, time: "1d ago", likes: 8, liked: false, comments: 14, privacy: "Public", tags: ["Visa", host] },
  { id: "f5", name: "Maria Garcia", text: \`Hosted my first dinner party in the new apartment in \${city}! 🍷\`, time: "2d ago", likes: 45, liked: true, comments: 5, privacy: "Public", tags: ["Food", "MovingIn"], bgTheme: "bg-gradient-to-r from-orange-400 to-red-500" }
];

export const DUMMY_FEED = GENERATE_DUMMY_FEED("USA", "Berlin", "Germany");`;

if (code.includes(targetFeed)) {
  code = code.replace(targetFeed, replacementFeed);
} else {
  console.log("Could not find feed");
}

fs.writeFileSync('src/constants.ts', code);
console.log("Replaced constants");

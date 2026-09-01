const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

// Remove from Emergency
code = code.replace(
  `        {
          name: "Language Exchange",
          desc: "Meet same-language speakers and locals.",
          icon: MessageCircle,
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          color: "text-orange-600 dark:text-orange-400",
          details: {
            steps: [
              { title: "Find Meetups", desc: "Local groups to practice languages.", links: [{ label: "Language Exchange Events (Web)", url: "https://google.com/search?q=language+exchange+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
`, ''
);

// Add to Community
code = code.replace(
  `        {
          name: "Community Centers",`,
  `        {
          name: "Language Exchange",
          desc: "Meet same-language speakers and locals.",
          icon: MessageCircle,
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          color: "text-orange-600 dark:text-orange-400",
          details: {
            steps: [
              { title: "Find Meetups", desc: "Local groups to practice languages.", links: [{ label: "Language Exchange Events (Web)", url: "https://google.com/search?q=language+exchange+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Community Centers",`
);

fs.writeFileSync('src/constants.ts', code);

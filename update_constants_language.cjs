const fs = require('fs');

let code = fs.readFileSync('src/constants.ts', 'utf8');

code = code.replace(
  '        {',
  '        {\n          name: "Language Exchange",\n          desc: "Meet same-language speakers and locals.",\n          icon: MessageCircle,\n          bg: "bg-orange-500/10 dark:bg-orange-500/20",\n          color: "text-orange-600 dark:text-orange-400",\n          details: {\n            steps: [\n              { title: "Find Meetups", desc: "Local groups to practice languages.", links: [{ label: "Language Exchange Events (Web)", url: "https://google.com/search?q=language+exchange+" + encodeURIComponent(city), type: "web" }] }\n            ]\n          }\n        },\n        {'
);

fs.writeFileSync('src/constants.ts', code);

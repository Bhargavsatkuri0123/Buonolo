const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

if (!code.includes('Passport & Embassy')) {
  // First add Globe icon import if missing
  if (!code.includes('Globe')) {
    code = code.replace('from "lucide-react";', ', Globe } from "lucide-react";');
  }

  code = code.replace(
    '        { \n          name: "Visas & Permits", ',
    `        {
          name: "Passport & Embassy",
          desc: "Renew your passport, find your embassy, and handle consular services.",
          icon: Globe,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          color: "text-blue-600 dark:text-blue-400",
          details: {
            steps: [
              { title: "Phase 1: Find Your Embassy", desc: "Locate the nearest embassy or consulate for your home country.", links: [{ label: "Find Embassy (Map)", url: "https://www.google.com/maps/search/embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 2: Prepare Documents", desc: "Check your embassy's website for required documents (photos, forms, fees).", links: [{ label: "Embassy Services (Web)", url: "https://google.com/search?q=embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(host) + "+passport+renewal", type: "web" }] },
              { title: "Phase 3: Book Appointment", desc: "Most embassies require prior appointments for passport renewals." },
              { title: "Phase 4: Processing Time", desc: "Expect 2-6 weeks for passport processing from abroad." }
            ],
            groups: [\`\${origin} Expats in \${host}\`]
          }
        },
        { 
          name: "Visas & Permits", `
  );

  fs.writeFileSync('src/constants.ts', code);
}

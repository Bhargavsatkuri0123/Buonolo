const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// fix fetchEvents signature
code = code.replace(`  const fetchEvents = async () => {`, `  const fetchEvents = async (origin?: string, city?: string, host?: string) => {`);

// fix import
code = code.replace(`import { LOCATIONS, SAF, DUMMY_FEED, TEMPLATE_HOST_INFO } from "./src/constants";`, `import { LOCATIONS, SAF, DUMMY_FEED, TEMPLATE_HOST_INFO, GENERATE_DUMMY_FEED } from "./src/constants";`);

fs.writeFileSync('App.tsx', code);
console.log("fixed App.tsx errors");

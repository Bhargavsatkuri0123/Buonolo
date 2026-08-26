const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const targetImport = `import { DUMMY_COMMUNITIES, DUMMY_EVENTS, DUMMY_PEOPLE, SAF } from "../constants";`;
const replacementImport = `import { GENERATE_DUMMY_COMMUNITIES, GENERATE_DUMMY_EVENTS, GENERATE_DUMMY_PEOPLE, SAF, DUMMY_COMMUNITIES, DUMMY_EVENTS, DUMMY_PEOPLE } from "../constants";`;

code = code.replace(targetImport, replacementImport);
fs.writeFileSync('src/components/CommunityTab.tsx', code);
console.log("replaced imports");

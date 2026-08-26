const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

const tGoal = `export const GOAL_TEMPLATES = [
  { id: "t1", icon: FileText, title: "Register your address (Anmeldung)", cat: "Documentation", weeks: "1–3 weeks" },
  { id: "t2", icon: KeyRound, title: "Find long-term housing", cat: "Housing", weeks: "4–12 weeks" },
  { id: "t3", icon: CreditCard, title: "Open a local bank account", cat: "Finance", weeks: "1 week" },
  { id: "t4", icon: Languages, title: "Reach A2 in the local language", cat: "Language", weeks: "3–6 months" },
  { id: "t5", icon: Car, title: "Convert your driving license", cat: "Mobility", weeks: "4–8 weeks" },
  { id: "t6", icon: Briefcase, title: "Find your first local job", cat: "Career", weeks: "2–6 months" },
  { id: "t7", icon: Stethoscope, title: "Set up health insurance & a doctor", cat: "Health", weeks: "1–2 weeks" },
  { id: "t8", icon: Users, title: "Build a local support circle", cat: "Community", weeks: "ongoing" },
];`;
const rGoal = `export const GENERATE_GOAL_TEMPLATES = (origin: string, city: string, host: string) => [
  { id: "t1", icon: FileText, title: \`Register your address in \${city}\`, cat: "Documentation", weeks: "1–3 weeks" },
  { id: "t2", icon: KeyRound, title: \`Find long-term housing in \${city}\`, cat: "Housing", weeks: "4–12 weeks" },
  { id: "t3", icon: CreditCard, title: \`Open a \${host} bank account\`, cat: "Finance", weeks: "1 week" },
  { id: "t4", icon: Languages, title: "Reach A2 in the local language", cat: "Language", weeks: "3–6 months" },
  { id: "t5", icon: Car, title: \`Convert your \${origin} driving license\`, cat: "Mobility", weeks: "4–8 weeks" },
  { id: "t6", icon: Briefcase, title: "Find your first local job", cat: "Career", weeks: "2–6 months" },
  { id: "t7", icon: Stethoscope, title: "Set up health insurance & a doctor", cat: "Health", weeks: "1–2 weeks" },
  { id: "t8", icon: Users, title: "Build a local support circle", cat: "Community", weeks: "ongoing" },
];

export const GOAL_TEMPLATES = GENERATE_GOAL_TEMPLATES("USA", "Berlin", "Germany"); // Fallback`;

if (code.includes(tGoal)) code = code.replace(tGoal, rGoal);
fs.writeFileSync('src/constants.ts', code);
console.log("fixed constants Goal");

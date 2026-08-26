const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapTab.tsx', 'utf8');

const tProp = `interface RoadmapTabProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  openGoal: string | null;
  setOpenGoal: (val: string | null) => void;
  T: Theme;
  setTab: (val: string) => void;
  setOpenTool: (val: string | null) => void;
  user?: any;
}`;
const rProp = `interface RoadmapTabProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  openGoal: string | null;
  setOpenGoal: (val: string | null) => void;
  T: Theme;
  setTab: (val: string) => void;
  setOpenTool: (val: string | null) => void;
  user?: any;
  profile?: any;
}`;

const tComp = `export const RoadmapTab = ({ goals, setGoals, openGoal, setOpenGoal, T, setTab, setOpenTool, user }: RoadmapTabProps) => {`;
const rComp = `export const RoadmapTab = ({ goals, setGoals, openGoal, setOpenGoal, T, setTab, setOpenTool, user, profile }: RoadmapTabProps) => {`;

const tRender = `{GOAL_TEMPLATES.map(t => (`
const rRender = `{(GENERATE_GOAL_TEMPLATES(profile?.origin || "USA", profile?.city || "Berlin", profile?.host || "Germany")).map(t => (`

const tImport = `import { GOAL_TEMPLATES } from "../constants";`;
const rImport = `import { GENERATE_GOAL_TEMPLATES } from "../constants";`;

if (code.includes(tProp)) code = code.replace(tProp, rProp);
if (code.includes(tComp)) code = code.replace(tComp, rComp);
if (code.includes(tRender)) code = code.replace(tRender, rRender);
if (code.includes(tImport)) code = code.replace(tImport, rImport);

fs.writeFileSync('src/components/RoadmapTab.tsx', code);
console.log("fixed Roadmap");

const fs = require('fs');
let code = fs.readFileSync('src/components/ToolsTab.tsx', 'utf8');

const target1 = `interface ToolDetailProps {
  tool: any;
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setOpenTool: (val: string | null) => void;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
}

export const ToolDetail = ({ tool, profile, emergencyData, T, setOpenTool, setGoals, setTab }: ToolDetailProps) => {`;
const replacement1 = `import { supabase } from "../../supabase";

interface ToolDetailProps {
  tool: any;
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setOpenTool: (val: string | null) => void;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
  user?: any;
}

export const ToolDetail = ({ tool, profile, emergencyData, T, setOpenTool, setGoals, setTab, user }: ToolDetailProps) => {`;

const target2 = `              onClick={() => {
                const newGoal = {
                  id: "g" + Date.now(),
                  title: tool.name,
                  cat: "Tool Goal",
                  icon: tool.icon || Wrench,
                  steps: tool.details?.steps?.map((s: any) => ({
                    t: s.title,
                    d: s.desc,
                    done: false,
                    tool: tool.name,
                    links: s.links
                  })) || [{ t: "General Task", d: "Explore " + tool.name, done: false, tool: tool.name }]
                };
                setGoals((gs: any) => [...gs, newGoal]);
                setTab("roadmap");
                setOpenTool(null);
              }}`;
const replacement2 = `              onClick={async () => {
                const steps = tool.details?.steps?.map((s: any) => ({
                    t: s.title,
                    d: s.desc,
                    done: false,
                    tool: tool.name,
                    links: s.links
                  })) || [{ t: "General Task", d: "Explore " + tool.name, done: false, tool: tool.name }];
                const newGoal = {
                  id: "g" + Date.now(),
                  title: tool.name,
                  cat: "Tool Goal",
                  icon: tool.icon || Wrench,
                  steps
                };
                setGoals((gs: any) => [...gs, newGoal]);
                setTab("roadmap");
                setOpenTool(null);
                if (user) {
                  await supabase.from("user_goals").insert({
                    user_id: user.id,
                    title: tool.name,
                    category: "Tool Goal",
                    icon_name: "Wrench",
                    steps
                  });
                }
              }}`;

const target3 = `interface ToolsTabProps {
  openTool: string | null;
  setOpenTool: (val: string | null) => void;
  toolSectionsData: any[];
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
}

export const ToolsTab = ({ openTool, setOpenTool, toolSectionsData, profile, emergencyData, T, setGoals, setTab }: ToolsTabProps) => {
  const selectedToolObj = toolSectionsData.flatMap(s => s.items).find(i => i.name === openTool) || { name: openTool };

  if (openTool) {
    return <ToolDetail tool={selectedToolObj} profile={profile} emergencyData={emergencyData} T={T} setOpenTool={setOpenTool} setGoals={setGoals} setTab={setTab} />;
  }`;

const replacement3 = `interface ToolsTabProps {
  openTool: string | null;
  setOpenTool: (val: string | null) => void;
  toolSectionsData: any[];
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
  user?: any;
}

export const ToolsTab = ({ openTool, setOpenTool, toolSectionsData, profile, emergencyData, T, setGoals, setTab, user }: ToolsTabProps) => {
  const selectedToolObj = toolSectionsData.flatMap(s => s.items).find(i => i.name === openTool) || { name: openTool };

  if (openTool) {
    return <ToolDetail tool={selectedToolObj} profile={profile} emergencyData={emergencyData} T={T} setOpenTool={setOpenTool} setGoals={setGoals} setTab={setTab} user={user} />;
  }`;

if (!code.includes(target1)) console.log("T1 not found");
if (!code.includes(target2)) console.log("T2 not found");
if (!code.includes(target3)) console.log("T3 not found");
if (code.includes(target1) && code.includes(target2) && code.includes(target3)) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  code = code.replace(target3, replacement3);
  fs.writeFileSync('src/components/ToolsTab.tsx', code);
  console.log("Replaced successfully!");
}

const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `{tab === "tools" && <ToolsTab openTool={openTool} setOpenTool={setOpenTool} toolSectionsData={toolSectionsData} profile={profile!} emergencyData={emergencyData} T={T} setGoals={setGoals} setTab={setTab} />}`;
const replacement = `{tab === "tools" && <ToolsTab openTool={openTool} setOpenTool={setOpenTool} toolSectionsData={toolSectionsData} profile={profile!} emergencyData={emergencyData} T={T} setGoals={setGoals} setTab={setTab} user={user} />}`;

if (code.includes(target)) {
  fs.writeFileSync('App.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
} else {
  console.log("Target not found!");
}

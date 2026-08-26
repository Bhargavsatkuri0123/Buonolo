const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const tRender = `{tab === "roadmap" && <RoadmapTab goals={goals} setGoals={setGoals} openGoal={openGoal} setOpenGoal={setOpenGoal} T={T} setTab={setTab} setOpenTool={setOpenTool} user={user} />}`;
const rRender = `{tab === "roadmap" && <RoadmapTab goals={goals} setGoals={setGoals} openGoal={openGoal} setOpenGoal={setOpenGoal} T={T} setTab={setTab} setOpenTool={setOpenTool} user={user} profile={profile} />}`;

if (code.includes(tRender)) code = code.replace(tRender, rRender);
fs.writeFileSync('App.tsx', code);
console.log("fixed app roadmap");

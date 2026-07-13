const fs = require('fs');
['src/components/RoadmapTab.tsx', 'src/components/ToolsTab.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/Youtube/g, 'PlayCircle');
  fs.writeFileSync(file, code);
});

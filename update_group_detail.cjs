const fs = require('fs');

const path = 'src/components/CommunityTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// I will define the GroupDetail component and replace the `if (selectedGroup)` block with it.

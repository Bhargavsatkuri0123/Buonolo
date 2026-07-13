const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

code = code.replace(
  '} , Globe } from "lucide-react";',
  ', Globe } from "lucide-react";'
);

fs.writeFileSync('src/constants.ts', code);

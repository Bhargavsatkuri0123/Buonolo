const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const t = `setFeed(postsRes.data.map((p: any) => {`;
const r = `const mappedPosts = postsRes.data.map((p: any) => {`;

const t2 = `        };
      });
      const dummyPosts = GENERATE_DUMMY_FEED(o, c, h);`;
const r2 = `        };
      });
      const dummyPosts = GENERATE_DUMMY_FEED(o, c, h);`;

code = code.replace(t, r);
// it already has `});` instead of `}));` because I replaced it in earlier replace
fs.writeFileSync('App.tsx', code);
console.log("fixed App map");

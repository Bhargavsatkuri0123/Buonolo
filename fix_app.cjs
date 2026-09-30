const fs = require('fs');

let code = fs.readFileSync('App.tsx', 'utf8');
code = code.replace(
  'const addReaction = (id: string, emoji: string) => {};',
  `const addReaction = (id: string, emoji: string) => {
    setFeed(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          myReaction: emoji,
          liked: true,
          likes: p.myReaction || p.liked ? p.likes : p.likes + 1
        };
      }
      return p;
    }));
  };`
);

fs.writeFileSync('App.tsx', code);

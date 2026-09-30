const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Fix postsChannel undefined
code = code.replace(`supabase.removeChannel(postsChannel);`, `// supabase.removeChannel(postsChannel);`);

// Find where to put the fetchPosts and postsChannel
code = code.replace(`const fetchPosts = async () => {`, `
  useEffect(() => {
    if (user) {
      fetchPosts();
      const postsChannel = supabase.channel('realtime_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts();
        })
        .subscribe();
      return () => { supabase.removeChannel(postsChannel); };
    }
  }, [user]);

  const fetchPosts = async () => {`);

fs.writeFileSync('App.tsx', code);

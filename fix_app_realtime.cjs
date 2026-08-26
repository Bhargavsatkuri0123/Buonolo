const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserChange(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);`;

const replacement = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserChange(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchFeed();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
        fetchGroups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('App.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}

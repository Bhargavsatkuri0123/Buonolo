const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetFunction = `  const fetchProfiles = async () => {`;
const replacementFunction = `  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const formattedPosts = data.map(p => ({
          id: p.id,
          name: p.author_name || "User",
          author_id: p.author_id,
          author_name: p.author_name,
          text: p.content,
          content: p.content,
          time: new Date(p.created_at).toLocaleString(),
          likes: p.likes?.length || 0,
          liked: p.likes?.some((l: any) => l.userId === user?.id || l === user?.id) || false,
          comments: p.comments_count || 0,
          privacy: p.privacy || 'Public',
          attachment: p.attachment,
          bgTheme: p.bg_theme
        }));
        // Merge with dummy feed if empty, or just use real feed.
        setFeed(formattedPosts.length > 0 ? formattedPosts : GENERATE_DUMMY_FEED(profile?.origin || "USA", profile?.city || "Berlin", profile?.host || "Germany"));
      }
    } catch (e) {
      console.error('Error fetching posts:', e);
    }
  };

  const fetchProfiles = async () => {`;

code = code.replace(targetFunction, replacementFunction);

const useEffectTarget = `    if (user) {
      fetchProfiles();
      fetchGroupInvites();
      const channel = supabase.channel('realtime_notifications')`;

const useEffectReplacement = `    if (user) {
      fetchPosts();
      fetchProfiles();
      fetchGroupInvites();
      
      const postsChannel = supabase.channel('realtime_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts();
        })
        .subscribe();
        
      const channel = supabase.channel('realtime_notifications')`;

code = code.replace(useEffectTarget, useEffectReplacement);

const cleanupTarget = `return () => {
      supabase.removeChannel(channel);`;

const cleanupReplacement = `return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(channel);`;

code = code.replace(cleanupTarget, cleanupReplacement);

fs.writeFileSync('App.tsx', code);

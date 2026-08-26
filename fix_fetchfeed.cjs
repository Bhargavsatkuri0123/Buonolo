const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  const fetchFeed = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("posts")
      .select("*")
      .or(\`privacy.eq.Public,author_id.eq.\${user.id}\`)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setFeed(data.map((p: any) => ({
        id: p.id,
        name: p.author_name,
        text: p.content,
        time: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes?.length || 0,
        liked: p.likes?.includes(user?.id),
        comments: p.comments_count || 0,
        privacy: p.privacy,
        tags: p.tags,
        bgTheme: p.bg_theme,
        attachment: p.attachment
      })));
    }
  };`;

const replacement = `  const fetchFeed = async () => {
    if (!user) return;
    
    const [postsRes, profileRes, followsRes] = await Promise.all([
      supabase.from("posts").select("*").or(\`privacy.eq.Public,author_id.eq.\${user.id}\`).order("created_at", { ascending: false }),
      supabase.from("profiles").select("saved_items").eq("id", user.id).single(),
      supabase.from("follows").select("following_id").eq("follower_id", user.id)
    ]);
    
    if (!postsRes.error && postsRes.data) {
      const savedItems = Array.isArray(profileRes.data?.saved_items) ? profileRes.data.saved_items : [];
      const followingIds = followsRes.data ? followsRes.data.map(f => f.following_id) : [];
      
      setFeed(postsRes.data.map((p: any) => {
        let myReaction = undefined;
        let isLiked = false;
        if (Array.isArray(p.likes)) {
          for (const l of p.likes) {
            if (typeof l === 'string' && l === user.id) isLiked = true;
            else if (l.userId === user.id) {
              isLiked = true;
              myReaction = l.emoji;
            }
          }
        }
        
        return {
          id: p.id,
          name: p.author_name,
          author_id: p.author_id,
          text: p.content,
          time: new Date(p.created_at).toLocaleDateString(),
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          liked: isLiked,
          myReaction,
          comments: p.comments_count || 0,
          privacy: p.privacy,
          tags: p.tags,
          bgTheme: p.bg_theme,
          attachment: p.attachment,
          saved: savedItems.includes(p.id),
          following: followingIds.includes(p.author_id)
        };
      }));
    }
  };`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('App.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}

const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  const toggleLike = async (post: Post) => {
    if (!user) return;
    setFeed(f => f.map(p => {
      if (p.id === post.id) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };
  
  const toggleSave = (id: string) => setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  const toggleFollow = (id: string) => setFeed(f => f.map(p => p.id === id ? { ...p, following: !p.following } : p));
  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
  };

  const addReaction = (id: string, emoji: string) => {
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
  };`;

const replacement = `  const toggleLike = async (post: Post) => {
    if (!user) return;
    const isLiked = post.liked;
    
    setFeed(f => f.map(p => {
      if (p.id === post.id) {
        return { ...p, liked: !isLiked, myReaction: undefined, likes: isLiked ? p.likes - 1 : (p.myReaction ? p.likes : p.likes + 1) };
      }
      return p;
    }));

    const { data: currentPost } = await supabase.from('posts').select('likes').eq('id', post.id).single();
    let currentLikes = currentPost?.likes || [];
    if (!Array.isArray(currentLikes)) currentLikes = [];
    
    let newLikes = [...currentLikes];
    newLikes = newLikes.filter((l: any) => typeof l === 'string' ? l !== user.id : l.userId !== user.id);
    
    if (!isLiked) {
      newLikes.push(user.id);
    }
    await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
  };
  
  const toggleSave = async (id: string) => {
    if (!user) return;
    setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    const { data: currentProfile } = await supabase.from('profiles').select('saved_items').eq('id', user.id).single();
    let savedItems = currentProfile?.saved_items || [];
    if (!Array.isArray(savedItems)) savedItems = [];
    
    let newSavedItems = [...savedItems];
    if (newSavedItems.includes(id)) {
      newSavedItems = newSavedItems.filter((i: any) => i !== id);
    } else {
      newSavedItems.push(id);
    }
    await supabase.from('profiles').update({ saved_items: newSavedItems }).eq('id', user.id);
  };

  const toggleFollow = async (id: string) => {
    if (!user) return;
    const post = feed.find(p => p.id === id);
    if (!post || !(post as any).author_id) return;
    
    setFeed(f => f.map(p => ((p as any).author_id === (post as any).author_id || p.name === post.name) ? { ...p, following: !p.following } : p));
    
    if (post.following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', (post as any).author_id);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: (post as any).author_id });
    }
  };

  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
    await supabase.from('posts').delete().eq('id', id);
  };

  const addReaction = async (id: string, emoji: string) => {
    if (!user) return;
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

    const { data: currentPost } = await supabase.from('posts').select('likes').eq('id', id).single();
    let currentLikes = currentPost?.likes || [];
    if (!Array.isArray(currentLikes)) currentLikes = [];
    
    let newLikes = [...currentLikes];
    newLikes = newLikes.filter((l: any) => typeof l === 'string' ? l !== user.id : l.userId !== user.id);
    newLikes.push({ userId: user.id, emoji });
    
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id);
  };`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('App.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}

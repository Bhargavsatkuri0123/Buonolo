const fs = require('fs');

let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

// We need to import LikeButton in CommunityTab.tsx
if (!code.includes('import { LikeButton }')) {
  code = code.replace(
    'import { Avatar } from "./Avatar";',
    'import { Avatar } from "./Avatar";\nimport { LikeButton } from "./LikeButton";'
  );
}

// In GroupView, replace useMemo with useState and a proper initial state with dummy comments
const searchStr = `  const groupPosts = useMemo(() => {
    return [
      { id: 'gp1', user: DUMMY_PEOPLE[0], text: \`Does anyone know the best place to find second-hand furniture around here? Need a desk for my home office!\`, time: "2h ago", likes: 14, comments: 5 },
      { id: 'gp2', user: DUMMY_PEOPLE[1], text: \`Just moved and want to say hi to the \${group.name} community! Let's organize a meetup soon 🍻\`, time: "5h ago", likes: 45, comments: 12 },
      { id: 'gp3', user: DUMMY_PEOPLE[2], text: \`Reminder: our weekly gathering is this Sunday. Check the events tab for details.\`, time: "1d ago", likes: 32, comments: 2 },
    ]
  }, [group.name]);`;

const replacement = `  const [activeReactions, setActiveReactions] = useState<string | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");

  const [posts, setPosts] = useState([
    { 
      id: 'gp1', user: DUMMY_PEOPLE[0], text: \`Does anyone know the best place to find second-hand furniture around here? Need a desk for my home office!\`, time: "2h ago", likes: 14, liked: false, myReaction: undefined, comments: 5,
      commentsList: [
        { id: 1, user: DUMMY_PEOPLE[1], text: "Check out eBay Kleinanzeigen, always lots of stuff!", time: "1h ago" },
        { id: 2, user: DUMMY_PEOPLE[2], text: "Also Facebook Marketplace is great around here.", time: "45m ago" }
      ]
    },
    { 
      id: 'gp2', user: DUMMY_PEOPLE[1], text: \`Just moved and want to say hi to the \${group.name} community! Let's organize a meetup soon 🍻\`, time: "5h ago", likes: 45, liked: false, myReaction: undefined, comments: 12,
      commentsList: [
        { id: 3, user: DUMMY_PEOPLE[0], text: "Welcome! We should definitely meet up next week.", time: "4h ago" }
      ]
    },
    { 
      id: 'gp3', user: DUMMY_PEOPLE[2], text: \`Reminder: our weekly gathering is this Sunday. Check the events tab for details.\`, time: "1d ago", likes: 32, liked: false, myReaction: undefined, comments: 2,
      commentsList: []
    },
  ]);

  const toggleLike = (p: any) => {
    setPosts(prev => prev.map(post => post.id === p.id ? { 
      ...post, 
      liked: !post.liked, 
      likes: post.liked ? post.likes - 1 : post.likes + 1,
      myReaction: post.liked ? undefined : post.myReaction
    } : post));
  };

  const addReaction = (id: string, emoji: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          myReaction: emoji,
          liked: true,
          likes: post.myReaction || post.liked ? post.likes : post.likes + 1
        };
      }
      return post;
    }));
    setActiveReactions(null);
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...post.commentsList, { id: Date.now(), user: { name: "You" }, text: commentInput, time: "Just now" }]
        };
      }
      return post;
    }));
    setCommentInput("");
  };
`;

code = code.replace(searchStr, replacement);

// Replace mapping of groupPosts with posts
const mapStr = `{groupPosts.map((p) => (`;
code = code.replace(mapStr, `{posts.map((p) => (`);

// Find the ThumbsUp button block
const likesBlock = `<div className={\`flex gap-6 mt-4 pt-3 border-t border-orange-50 dark:border-zinc-800/50 text-xs font-semibold \${T.sub}\`}>
                  <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <ThumbsUp size={16} /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <MessageSquare size={16} /> {p.comments}
                  </button>
                </div>`;

const newLikesBlock = `<div className={\`flex gap-6 mt-4 pt-3 border-t border-orange-50 dark:border-zinc-800/50 text-xs font-semibold \${T.sub}\`}>
                  <LikeButton 
                    p={p} 
                    user={{}} 
                    toggleLike={toggleLike} 
                    activeReactions={activeReactions} 
                    setActiveReactions={setActiveReactions} 
                    addReaction={addReaction} 
                  />
                  <button 
                    onClick={() => setActiveCommentsPost(activeCommentsPost === p.id ? null : p.id)}
                    className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
                  >
                    <MessageSquare size={16} /> {p.comments}
                  </button>
                </div>
                
                {activeCommentsPost === p.id && (
                  <div className="mt-4 pt-4 border-t border-orange-50 dark:border-zinc-800/50 space-y-4">
                    {p.commentsList.map((c: any) => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar name={c.user.name} size={6} />
                        <div className={\`flex-1 p-2.5 rounded-2xl \${T.card2} \${T.text}\`}>
                          <p className="font-semibold text-xs">{c.user.name} <span className="font-normal text-orange-500 ml-1">{c.time}</span></p>
                          <p className="text-sm mt-1">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 items-center mt-2">
                      <Avatar name="You" size={6} />
                      <div className={\`flex-1 flex items-center rounded-full px-3 py-1.5 \${T.card2}\`}>
                        <input 
                          type="text" 
                          value={commentInput} 
                          onChange={e => setCommentInput(e.target.value)} 
                          placeholder="Write a comment..." 
                          className={\`bg-transparent outline-none flex-1 text-sm \${T.text}\`}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddComment(p.id);
                          }}
                        />
                        <button 
                          onClick={() => handleAddComment(p.id)}
                          disabled={!commentInput.trim()} 
                          className={\`ml-2 \${commentInput.trim() ? "text-orange-500" : "text-gray-400"}\`}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}`;

code = code.replace(likesBlock, newLikesBlock);

fs.writeFileSync('src/components/CommunityTab.tsx', code);

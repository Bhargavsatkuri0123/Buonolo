
import React, { useState, useEffect } from 'react';
import { UserLocation } from '../types';
import { supabase } from '../services/supabase';

interface FeedPageProps {
  location: UserLocation;
}

interface PostData {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  likes: any[];
  comments_count: number;
}

const DUMMY_POSTS: PostData[] = [
  {
    id: "dummy-1",
    content: "Just moved to the new neighborhood! Anyone know the best local markets?",
    author_id: "system1",
    author_name: "Alex",
    created_at: new Date().toISOString(),
    likes: ["1"],
    comments_count: 2
  },
  {
    id: "dummy-2",
    content: "I created a shared map of all the free language classes around downtown. DM me if you'd like the link.",
    author_id: "system2",
    author_name: "Samira",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: ["1", "2", "3"],
    comments_count: 5
  }
];

const FeedPage: React.FC<FeedPageProps> = ({ location }) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error.message);
      } else if (data) {
        setPosts([...(data as PostData[]), ...DUMMY_POSTS]);
      }
      setLoading(false);
    };

    fetchPosts();

    // Setup realtime subscription
    subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        // Simple strategy: just refetch on any change to keep it simple and reliable
        fetchPosts();
      })
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center">
        <p className="text-slate-900 font-black text-xl">Loading community feed</p>
        <p className="text-slate-400 text-sm">Gathering the latest thoughts and updates...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between items-center gap-4 text-center">
        <div className="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center text-3xl shadow-sm">
          <i className="fa-solid fa-earth-americas"></i>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Global Feed</h2>
          <p className="text-slate-500 font-medium text-sm">See what other residents are discussing.</p>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa-solid fa-comments text-4xl mb-4 text-slate-200"></i>
            <p className="font-bold">No posts yet.</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary uppercase">
                    {post.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{post.author_name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                   onClick={(e) => {
                     e.currentTarget.innerText = e.currentTarget.innerText === 'FOLLOW' ? 'FOLLOWING' : 'FOLLOW';
                     e.currentTarget.classList.toggle('bg-orange-50');
                     e.currentTarget.classList.toggle('text-primary');
                     e.currentTarget.classList.toggle('bg-slate-800');
                     e.currentTarget.classList.toggle('text-white');
                   }}
                   className="text-xs font-bold text-primary bg-orange-50 px-3 py-1 rounded-full hover:opacity-80 transition-all tracking-widest uppercase shadow-sm">
                  Follow
                </button>
              </div>

              <p className="text-slate-700 text-base leading-relaxed tracking-wide whitespace-pre-line">
                {post.content}
              </p>

              <div className="pt-4 border-t border-slate-50 flex items-center gap-6">
                <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                  <i className="fa-regular fa-heart"></i>
                  <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                  <i className="fa-regular fa-comment"></i>
                  <span className="text-xs font-bold">{post.comments_count || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;

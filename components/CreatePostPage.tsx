import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface CreatePostPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({ onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('posts').insert([
        {
          content: content.trim(),
          author_id: user.id,
          author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          created_at: new Date().toISOString(),
          likes: [],
          comments_count: 0
        }
      ]);
      if (error) throw error;
      setContent('');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800">Create Post</h2>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</div>}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
              <i className="fa-solid fa-user"></i>
            </div>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share tips, ask questions, or connect with the community..."
              className="w-full h-32 bg-transparent text-slate-800 text-lg resize-none outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="px-8 py-3 bg-primary text-white font-black rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;

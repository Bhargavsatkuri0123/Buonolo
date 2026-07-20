import React, { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { api } from "../api";
import { Avatar } from "./Avatar";
import { Post, Profile, Theme } from "../types";

interface CommentSectionProps {
  p: Post;
  user: any;
  profile: Profile;
  T: Theme;
}

interface BackendComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string; handle: string };
}

export const CommentSection = ({ p, user, profile, T }: CommentSectionProps) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const { comments } = await api.get<{ comments: BackendComment[] }>(`/api/posts/${p.id}/comments`);
      setComments(comments);
    } finally {
      setLoading(false);
    }
  }, [p.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    const textToSubmit = commentText;
    setCommentText(""); // Clear early for better UX

    try {
      const { comment } = await api.post<{ comment: BackendComment }>(`/api/posts/${p.id}/comments`, { content: textToSubmit });
      setComments((prev) => [...prev, comment]);
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentText(textToSubmit); // Restore on error
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
      <div className="space-y-3 mb-3">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2 italic">No comments yet. Be the first to reply!</p>
        ) : comments.map(c => (
          <div key={c.id} className="flex gap-2 text-sm">
            <Avatar name={c.author.fullName} size={6} />
            <div className={`flex-1 p-2 rounded-xl ${T.card2} ${T.text}`}>
              <p className="font-semibold text-xs">{c.author.fullName} <span className="font-normal text-gray-500">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
              <p className="mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <Avatar name={profile?.name || "User"} size={6} />
        <div className={`flex-1 flex items-center rounded-full px-3 py-1.5 ${T.card2}`}>
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className={`bg-transparent outline-none flex-1 text-sm ${T.text}`}
            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className={`ml-2 ${commentText.trim() ? "text-orange-500" : "text-gray-400"}`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

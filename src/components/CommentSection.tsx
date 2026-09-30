import React, { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { api } from "../api";
import { wsClient } from "../ws";
import { Avatar } from "./Avatar";
import { Post, Profile, Theme } from "../types";

interface CommentSectionProps {
  p: Post;
  user: any;
  profile: Profile;
  T: Theme;
}

export const CommentSection = ({ p, user, profile, T }: CommentSectionProps) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const { comments: items } = await api.posts.comments(p.id);
      setComments(items.map((comment: any) => ({
        id: comment.id,
        author_name: comment.author?.fullName || (comment.authorId === user?.id ? profile?.name : "Community Member"),
        content: comment.content,
        created_at: comment.createdAt,
        user_id: comment.authorId,
      })));
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  }, [p.id, user?.id, profile?.name]);

  useEffect(() => {
    void fetchComments();
    return wsClient.subscribe("comment:new", (comment: any) => {
      if (comment.postId === p.id) void fetchComments();
    });
  }, [p.id, fetchComments]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    const textToSubmit = commentText;
    setCommentText(""); // Clear early for better UX
    
    try {
      await api.posts.addComment(p.id, textToSubmit);
      await fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentText(textToSubmit);
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
            <Avatar name={c.author_name} size={6} />
            <div className={`flex-1 p-2 rounded-xl ${T.card2} ${T.text}`}>
              <p className="font-semibold text-xs">{c.author_name} <span className="font-normal text-gray-500">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
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

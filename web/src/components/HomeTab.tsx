import React from "react";
import { Search, MessageCircle, Bell, ImageIcon, Users as UsersIcon, Globe, MoreHorizontal, Trash, MessageSquare, Share2, Bookmark, Send, Bot, Target, Share } from "lucide-react";
import { Avatar } from "./Avatar";
import { Header } from "./Header";
import { CreatePostModal } from "./CreatePostModal";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { Theme, Profile, Post } from "../types";
import { SAF } from "../constants";

interface HomeTabProps {
  profile: Profile;
  welcomeMessage: string;
  setTab: (val: string) => void;
  feed: Post[];
  user: any;
  T: Theme;
  activeComments: string | null;
  setActiveComments: (val: string | null) => void;
  activeReactions: string | null;
  setActiveReactions: (val: string | null) => void;
  activeShare: string | null;
  setActiveShare: (val: string | null) => void;
  activeOptions: string | null;
  setActiveOptions: (val: string | null) => void;
  isCreatePostOpen: boolean;
  onPostCreated: (post: any) => void;
  setIsCreatePostOpen: (val: boolean) => void;
  setMessengerOpen: (val: boolean) => void;
  toggleLike: (p: Post) => void;
  toggleFollow: (id: string) => void;
  deletePost: (id: string) => void;
  addReaction: (id: string, emoji: string) => void;
  handleShareToMessenger: (p: Post) => void;
  toggleSave: (id: string) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  showNotifs: boolean;
  setShowNotifs: (val: boolean) => void;
}

export const HomeTab = ({
  profile, welcomeMessage, setTab, feed, user, T,
  activeComments, setActiveComments, activeReactions, setActiveReactions,
  activeShare, setActiveShare, activeOptions, setActiveOptions,
  isCreatePostOpen, setIsCreatePostOpen, onPostCreated, setMessengerOpen,
  toggleLike, toggleFollow, deletePost, addReaction, handleShareToMessenger, toggleSave,
  notifications, setNotifications, showNotifs, setShowNotifs
}: HomeTabProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="pb-24">
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} onCreated={onPostCreated} profile={profile} user={user} T={T} />
      <Header T={T} onLogoClick={() => setTab("bot")} right={
        <div className="flex gap-2">
          <button onClick={() => setTab("bot")} className={`p-2 rounded-full ${T.card} relative group`}>
            <Bot size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
          </button>
          <button className={`p-2 rounded-full ${T.card}`}><Search size={18} className={T.text} /></button>
          <button onClick={() => setMessengerOpen(true)} className={`p-2 rounded-full ${T.card} relative`}>
            <MessageCircle size={18} className={T.text} />
          </button>
          <button onClick={() => setShowNotifs(true)} className={`p-2 rounded-full ${T.card} relative`}>
            <Bell size={18} className={T.text} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />}
          </button>
        </div>} />
      
      {showNotifs && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowNotifs(false)}>
          <div className={`${T.card} w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] flex flex-col shadow-2xl cardin`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`disp font-bold text-xl ${T.text}`}>Notifications</h2>
              <button onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setShowNotifs(false); }} className="text-xs text-orange-500 font-semibold">Mark all as read</button>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className={T.sub}>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-2xl mb-2 flex gap-3 transition-colors ${n.read ? "opacity-60" : `${T.card2} border border-orange-200/50 dark:border-slate-700`}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'goal' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                      {n.type === 'goal' ? <Target size={18} /> : <Bell size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T.text}`}>{n.title}</p>
                      <p className={`text-xs ${T.sub} line-clamp-2 mt-0.5`}>{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    <div className={`mx-4 mb-4 rounded-2xl p-4 text-white cardin`} style={{ background: SAF }}>
      <p className="disp font-bold text-lg leading-tight">{welcomeMessage || `Welcome to ${profile.city}, ${(profile.name || "User").split(' ')[0]} 👋`}</p>
      <p className="text-sm text-orange-100 mt-1">2 goals in progress · next step: attend your Bürgeramt appointment</p>
      <button onClick={() => setTab("roadmap")} className="mt-3 bg-white text-orange-600 text-sm font-semibold px-3 py-1.5 rounded-full">Open roadmap</button>
    </div>

    <div className={`mx-4 mb-4 rounded-2xl p-4 flex gap-3 items-center ${T.card}`}>
      <Avatar name={profile?.name || "User"} />
      <button onClick={() => setIsCreatePostOpen(true)} className={`flex-1 text-left px-4 py-2.5 rounded-full text-sm ${T.input} border ${T.line}`}>
        What's on your mind?
      </button>
      <button onClick={() => setIsCreatePostOpen(true)} className="text-green-500"><ImageIcon size={20} /></button>
    </div>

    {feed.map((p: Post) => (
      <div key={p.id} className={`${T.card} mx-4 mb-3 rounded-2xl p-4 cardin`}>
        <div className="flex items-start gap-3">
          <Avatar name={p.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${T.text}`}>
                  {p.name}
                  {p.feeling && <span className="font-normal text-gray-500"> is feeling {p.feeling}</span>}
                  {p.location && <span className="font-normal text-gray-500"> at <span className="text-orange-500">{p.location}</span></span>}
                  <span className="text-xs font-normal ml-1 text-gray-400">{(p as any).origin && `· ${(p as any).origin}`}</span>
                </p>
                <p className={`text-xs ${T.sub} flex items-center gap-1`}>
                   {p.time} {p.privacy === "Friends" ? <UsersIcon size={10} /> : <Globe size={10} />}
                </p>
              </div>
              {(p.author_id && p.author_id === user?.id) || (!p.author_id && p.name === profile?.name) ? (
                <div className="relative">
                  <button onClick={() => setActiveOptions(activeOptions === p.id ? null : p.id)} className={`p-1 rounded-full hover:${T.card2} ${T.sub}`}>
                    <MoreHorizontal size={18} />
                  </button>
                  {activeOptions === p.id && (
                    <div className={`absolute right-0 top-full mt-1 p-2 rounded-xl shadow-lg w-32 flex flex-col ${T.card} border ${T.line} z-10`}>
                      <button onClick={() => { deletePost(p.id); setActiveOptions(null); }} className={`text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2`}><Trash size={14}/> Delete</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => toggleFollow(p.author_id!)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${p.following ? `${T.card2} ${T.sub}` : "bg-orange-500 text-white"}`}>
                  {p.following ? "Following" : "Follow"}
                </button>
              )}
            </div>
            {p.bgTheme && !p.attachment ? (
              <div className={`mt-3 -mx-4 px-4 py-8 flex items-center justify-center text-center ${p.bgTheme} text-white font-bold text-xl`}>
                {p.text}
              </div>
            ) : (
              <p className={`text-sm mt-2 leading-relaxed ${T.text}`}>{p.text}</p>
            )}
            {p.attachment && (
              <div className="mt-3 -mx-4">
                <img src={p.attachment} alt="Attachment" className="w-full h-auto object-cover max-h-[400px]" />
              </div>
            )}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {p.tags.map(t => <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">{t}</span>)}
              </div>
            )}
            <div className={`flex gap-6 mt-3 text-xs relative ${T.sub}`}>
              <LikeButton p={p} user={user} toggleLike={toggleLike} activeReactions={activeReactions} setActiveReactions={setActiveReactions} addReaction={addReaction} />
              <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-1">
                <MessageSquare size={15} /> {p.comments}
              </button>
              <div className="relative">
                <button onClick={() => setActiveShare(activeShare === p.id ? null : p.id)} className="flex items-center gap-1">
                  <Share2 size={15} /> Share
                </button>
                {activeShare === p.id && (
                  <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-xl shadow-lg w-48 flex flex-col ${T.card} border ${T.line} z-10`}>
                    <button 
                      onClick={() => { handleShareToMessenger(p); setActiveShare(null); }} 
                      className={`text-left px-3 py-2.5 text-sm ${T.text} hover:${T.card2} rounded-lg flex items-center gap-2 transition-colors`}
                    >
                      <Send size={14}/> Send in Messenger
                    </button>
                    <button 
                      onClick={async () => {
                        setActiveShare(null);
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: `Post by ${p.name}`,
                              text: p.text,
                              url: window.location.href
                            });
                          } else {
                            // Fallback
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('Error sharing:', err);
                          }
                        }
                      }} 
                      className={`text-left px-3 py-2.5 text-sm ${T.text} hover:${T.card2} rounded-lg flex items-center gap-2 transition-colors`}
                    >
                      <Share size={14}/> Share via...
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => toggleSave(p.id)} className={`ml-auto ${p.saved ? "text-orange-500" : ""}`}>
                <Bookmark size={15} fill={p.saved ? "currentColor" : "none"} />
              </button>
            </div>
            {activeComments === p.id && (
              <CommentSection p={p} user={user} profile={profile} T={T} />
            )}
          </div>
        </div>
      </div>
    ))}
    </div>
  );
};

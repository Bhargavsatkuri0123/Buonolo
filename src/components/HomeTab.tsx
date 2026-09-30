import React, { useState } from "react";
import { 
  Search, MessageCircle, Bell, ImageIcon, Users as UsersIcon, Globe, 
  MoreHorizontal, Trash, MessageSquare, Share2, Bookmark, Send, Target, 
  Share, MapPin, PhoneCall, Sparkles, ArrowRight, Bot 
} from "lucide-react";
import { Avatar } from "./Avatar";
import { Header, PeanutLogo } from "./Header";
import { api } from "../api";
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
  isCreatePostOpen, setIsCreatePostOpen, setMessengerOpen,
  toggleLike, toggleFollow, deletePost, addReaction, handleShareToMessenger, toggleSave,
  notifications, setNotifications, showNotifs, setShowNotifs
}: HomeTabProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="pb-24">
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} profile={profile} user={user} T={T} />
      <Header T={T} hideOnDesktop={true} right={
        <div className="flex gap-2">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowNotifs(false)}>
          <div className={`${T.card} w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] sm:max-h-[80vh] flex flex-col shadow-2xl cardin`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`disp font-bold text-xl ${T.text}`}>Notifications</h2>
              <button onClick={async () => { 
                setNotifications(prev => prev.map(n => ({ ...n, read: true }))); 
                setShowNotifs(false); 
                if (user) await api.notifications.readAll();
              }} className="text-xs text-orange-500 font-semibold">Mark all as read</button>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className={T.sub}>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={async () => {
                    if (!n.read) {
                      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                      if (user) await api.notifications.markRead(n.id);
                    }
                  }} className={`p-3 rounded-2xl mb-2 flex gap-3 transition-colors cursor-pointer ${n.read ? "opacity-60" : `${T.card2} border border-orange-200/50 dark:border-slate-700`}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      n.type === 'goal' ? 'bg-green-500/20 text-green-600' : 
                      n.type === 'message' ? 'bg-blue-500/20 text-blue-600' :
                      n.type === 'system' ? 'bg-purple-500/20 text-purple-600' :
                      'bg-orange-500/20 text-orange-600'
                    }`}>
                      {n.type === 'goal' ? <Target size={18} /> : 
                       n.type === 'message' ? <MessageSquare size={18} /> :
                       n.type === 'system' ? <Globe size={18} /> :
                       <Bell size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T.text}`}>{n.title}</p>
                      <p className={`text-xs ${T.sub} line-clamp-2 mt-0.5`}>{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between py-1">
                      {!n.read ? <div className="w-2 h-2 bg-orange-500 rounded-full" /> : <div className="w-2 h-2" />}
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                        if (user) await api.notifications.remove(n.id);
                      }} className="text-gray-400 hover:text-red-500 p-1 -mr-1 -mb-1">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      {/* Main Feed Column */}
      <div className="lg:col-span-8">
        <div className={`mx-4 lg:mx-0 mb-4 rounded-2xl p-4 text-white cardin shadow-lg shadow-orange-500/10`} style={{ background: SAF }}>
          <p className="disp font-bold text-lg leading-tight">{welcomeMessage || `Welcome to ${profile.city || profile.host_city || "your city"}, ${(profile.name || profile.full_name || "User").split(' ')[0]} 👋`}</p>
          <p className="text-sm text-orange-100 mt-1">2 goals in progress · next step: attend your Bürgeramt appointment</p>
          <button onClick={() => setTab("roadmap")} className="mt-3 bg-white text-orange-600 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors">Open roadmap</button>
        </div>

        <div className={`mx-4 lg:mx-0 mb-4 rounded-2xl p-4 flex gap-3 items-center ${T.card} border ${T.line} shadow-sm`}>
          <Avatar name={profile?.name || profile?.full_name || "User"} />
          <button onClick={() => setIsCreatePostOpen(true)} className={`flex-1 text-left px-4 py-2.5 rounded-full text-sm ${T.input} border ${T.line} hover:border-orange-400 transition-colors`}>
            What's on your mind?
          </button>
          <button onClick={() => setIsCreatePostOpen(true)} className="text-green-500 hover:scale-110 transition-transform"><ImageIcon size={20} /></button>
        </div>

        {feed.map((p: Post) => (
          <div key={p.id} className={`${T.card} mx-4 lg:mx-0 mb-3 rounded-2xl p-4 cardin border ${T.line} shadow-sm`}>
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
                    <button onClick={() => toggleFollow(p.id)}
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

      {/* Right Desktop Sidebar */}
      <aside className="hidden lg:block lg:col-span-4 space-y-6">
        {/* City Passport Snapshot */}
        <div className={`${T.card} border ${T.line} rounded-3xl p-5 shadow-sm space-y-3`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" />
              <h3 className="font-bold disp text-base text-slate-800 dark:text-white">
                {profile.host_city || profile.city || "Berlin"}, {profile.host_country || "Germany"}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              Active Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
            Relocating from <strong className="text-slate-700 dark:text-neutral-200">{profile.origin_country || "Abroad"}</strong> as a <strong className="text-slate-700 dark:text-neutral-200">{profile.situation || "Newcomer"}</strong>.
          </p>
          <div className="pt-2 flex justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-neutral-800">
            <span>Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Temp: ~19°C · Clear</span>
          </div>
        </div>

        {/* Emergency 1-Tap Dial Widget */}
        <div className={`${T.card} border border-red-200/80 dark:border-red-900/60 rounded-3xl p-5 shadow-sm space-y-3 bg-red-50/20 dark:bg-red-950/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <PhoneCall size={16} />
              <span>Emergency Hotlines</span>
            </div>
            <button onClick={() => setTab("tools")} className="text-[11px] text-red-600 dark:text-red-400 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-900/60">
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">Ambulance</p>
              <p className="text-lg font-black text-red-600">112</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-900/60">
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">Police</p>
              <p className="text-lg font-black text-blue-600">110</p>
            </div>
          </div>
        </div>

        {/* Ask Peanut AI Prompt Widget */}
        <div className={`${T.card} border border-orange-200/80 dark:border-orange-900/60 rounded-3xl p-5 shadow-sm space-y-3 bg-gradient-to-br from-orange-50/40 to-amber-50/30 dark:from-neutral-900 dark:to-neutral-900`}>
          <div className="flex items-center gap-2">
            <PeanutLogo size={22} />
            <h4 className="font-bold text-sm disp text-slate-900 dark:text-white">Ask Peanut AI</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-neutral-300">
            Got a confusing government letter or visa question? Peanut can decode it in seconds.
          </p>
          <button 
            onClick={() => setTab("bot")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/15 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Ask a question now</span>
          </button>
        </div>

        {/* Trending Communities */}
        <div className={`${T.card} border ${T.line} rounded-3xl p-5 shadow-sm space-y-3`}>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm disp text-slate-900 dark:text-white">Popular Local Channels</h4>
            <button onClick={() => setTab("community")} className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline">
              Explore
            </button>
          </div>
          <div className="space-y-2">
            {[
              { name: "Housing & Flatshares", members: "3.2k members", tag: "#housing" },
              { name: "Bureaucracy & Legal Q&A", members: "4.8k members", tag: "#legal" },
              { name: "Language Exchange", members: "1.9k members", tag: "#social" },
            ].map((c, i) => (
              <div key={i} onClick={() => setTab("community")} className={`p-2.5 rounded-xl ${T.card2} hover:border-orange-300 cursor-pointer transition-all flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.members}</p>
                </div>
                <span className="text-[10px] text-orange-500 font-semibold">{c.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
    </div>
  );
};

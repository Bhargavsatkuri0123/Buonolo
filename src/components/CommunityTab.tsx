
import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Users, Settings, Shield, LogOut, MapPin, User, ChevronRight, MessageCircle, ChevronLeft, Globe, Calendar, Clock, Share2, CheckCircle2, MoreHorizontal, UserPlus, Image as ImageIcon, ThumbsUp, MessageSquare, X, Share, Send } from "lucide-react";
import { Header } from "./Header";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { Theme, Profile } from "../types";
import { DUMMY_COMMUNITIES, DUMMY_EVENTS, DUMMY_PEOPLE, SAF } from "../constants";
import { supabase } from "../../supabase";

interface CommunityTabProps {
  communitiesData: any[];
  activeCommunityTab: string;
  setActiveCommunityTab: (val: string) => void;
  profile: Profile;
  user: any;
  T: Theme;
  onRefreshGroups: () => void;
}

export const UserView = ({ user, onClose, T, onGroupClick }: any) => {
  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b border-orange-100 dark:border-zinc-800 bg-white dark:bg-black`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: user.name,
                  text: `Check out ${user.name} on Buonolo!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            } catch (err: any) {
              if (err.name !== 'AbortError') console.error('Error sharing:', err);
            }
          }}
          className={`p-2 -mr-2 rounded-full ${T.card}`}
        >
          <Share size={20} className={T.text} />
        </button>
      </div>
      <div className="px-4 py-8 flex flex-col items-center border-b border-orange-100 dark:border-zinc-800">
        <div className="w-24 h-24 mb-4">
          <Avatar name={user.name} />
        </div>
        <h1 className={`text-2xl font-bold ${T.text}`}>{user.name}</h1>
        <p className={`text-sm ${T.sub} mt-1 flex items-center gap-1`}><Globe size={14} /> from {user.origin}</p>
        
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button className="flex-1 py-2.5 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20">
            <MessageCircle size={18} /> Message
          </button>
          <button className={`flex-1 py-2.5 rounded-full ${T.card} ${T.text} font-bold text-sm border border-orange-200 dark:border-zinc-800`}>
            Follow
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 cardin">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2`}>About</p>
          <p className={`text-sm ${T.text} leading-relaxed`}>
            {user.bio || "I love exploring new places and meeting people from different cultures. Always up for a coffee or a language exchange!"}
          </p>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Interests</p>
          <div className="flex flex-wrap gap-2">
            {['Photography', 'Coffee', 'Hiking', 'Language Exchange'].map(tag => (
              <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${T.card2} ${T.text} border border-orange-100 dark:border-zinc-800`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Shared Groups</p>
          {DUMMY_COMMUNITIES.slice(0, 2).map(c => (
            <div key={c.name} onClick={() => onGroupClick(c)} className={`${T.card} rounded-2xl p-3 flex items-center gap-3 shadow-sm mb-2 cursor-pointer`}>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${T.text}`}>{c.name}</p>
                <p className={`text-xs ${T.sub}`}>{c.members} members</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventView = ({ event: selectedEvent, onClose, T, onUserClick }: any) => {
  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={`sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: selectedEvent.title,
                  text: `Check out this event: ${selectedEvent.title} on Buonolo!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            } catch (err: any) {
              if (err.name !== 'AbortError') console.error('Error sharing:', err);
            }
          }}
          className={`p-2 -mr-2 rounded-full ${T.card}`}
        >
          <Share size={20} className={T.text} />
        </button>
      </div>
      
      <div className="w-full h-56 bg-orange-100 dark:bg-zinc-900 flex flex-col items-center justify-center">
        <div className="text-6xl drop-shadow-md mb-2">{selectedEvent.image}</div>
      </div>
      
      <div className="p-4 space-y-6 cardin -mt-4 relative z-10 bg-white dark:bg-black rounded-t-2xl">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-bold text-orange-600 mb-1 flex items-center gap-1.5`}><Calendar size={14} /> {selectedEvent.date}</p>
              <h2 className={`text-2xl font-bold ${T.text} leading-tight mb-3`}>{selectedEvent.title}</h2>
            </div>
          </div>
          <div className={`flex flex-col gap-3 p-4 rounded-xl ${T.card} border border-orange-100 dark:border-zinc-800`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-orange-600" />
              </div>
              <div>
                <p className={`text-sm font-bold ${T.text}`}>{selectedEvent.location}</p>
                <p className={`text-xs ${T.sub}`}>Show on map</p>
              </div>
            </div>
            <div className="w-full h-[1px] bg-orange-100 dark:bg-zinc-800" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Users size={16} className="text-orange-600" />
              </div>
              <div>
                <p className={`text-sm font-bold ${T.text}`}>{selectedEvent.attendees} attendees</p>
                <p className={`text-xs ${T.sub}`}>+15 spots left</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className={`flex-1 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30`}>
            <CheckCircle2 size={18} /> RSVP Going
          </button>
          <button className={`px-6 py-3.5 rounded-xl ${T.card} ${T.text} font-bold text-center border border-orange-200 dark:border-zinc-800`}>
            Maybe
          </button>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>About this event</p>
          <p className={`text-sm ${T.text} leading-relaxed`}>
            Join us for a wonderful time! This is a great opportunity to meet new people and share experiences. Don't forget to bring your enthusiasm and good vibes. Look out for the group with the orange balloon.
          </p>
        </div>

        <div>
           <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Attendees</p>
            <button className="text-xs font-semibold text-orange-600">See all {selectedEvent.attendees}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {DUMMY_PEOPLE.map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick(p)}>
                  <Avatar name={p.name} />
                </div>
              ))}
            </div>
            <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-black ${T.card2} flex items-center justify-center text-[10px] font-bold ${T.text} -ml-3 relative`} style={{ zIndex: 0 }}>
              +{selectedEvent.attendees - 3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GroupView = ({ group, onClose, T, onUserClick, onEventClick, onInviteClick, user }: any) => {
  const [activeTab, setActiveTab] = useState("discussion");

  const [activeReactions, setActiveReactions] = useState<string | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [newUpdateText, setNewUpdateText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, [group.id]);

  const fetchUpdates = async () => {
    const { data: updates, error } = await supabase
      .from("group_updates")
      .select("*")
      .eq("group_id", group.id)
      .order("timestamp", { ascending: false });
    
    if (!error && updates) {
      setPosts(updates.map(u => ({
        id: u.id,
        user: { name: u.author_name },
        text: u.content,
        time: new Date(u.timestamp).toLocaleDateString(),
        likes: 0,
        liked: false,
        comments: 0,
        commentsList: []
      })));
    }
  };

  const handlePostUpdate = async () => {
    if (!newUpdateText.trim() || isPosting) return;
    setIsPosting(true);
    const { error } = await supabase.from("group_updates").insert({
      group_id: group.id,
      content: newUpdateText,
      author_name: user?.user_metadata?.full_name || "User"
    });
    if (!error) {
      setNewUpdateText("");
      fetchUpdates();
    }
    setIsPosting(false);
  };

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


    const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="pb-24 bg-white dark:bg-black min-h-screen">
        <Header T={T} title={`${group.name} Settings`} back={() => setShowSettings(false)} />
        <div className={`mx-4 mt-4 space-y-4`}>
          <div className={`${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Notifications</p>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${T.text}`}>All group posts</p>
              <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${T.text}`}>Group events</p>
              <div className="w-10 h-6 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
            </div>
          </div>

          <div className={`${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Privacy & Security</p>
            <button className={`flex items-center justify-between w-full text-left`}>
              <span className={`text-sm ${T.text}`}>Blocked Users</span>
              <ChevronRight size={16} className={T.sub} />
            </button>
            <button className={`flex items-center justify-between w-full text-left`}>
              <span className={`text-sm ${T.text}`}>Reported content</span>
              <ChevronRight size={16} className={T.sub} />
            </button>
          </div>

          <div className={`${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800`}>
            <button className={`w-full text-left text-sm font-bold text-red-500`}>Leave Group</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={`sticky top-0 z-20 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <div className="flex gap-2">
          <button className={`p-2 rounded-full ${T.card}`}><Search size={20} className={T.text} /></button>
          <button 
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: group.name,
                    text: `Join the ${group.name} community on Buonolo!`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              } catch (err: any) {
                if (err.name !== 'AbortError') console.error('Error sharing:', err);
              }
            }}
            className={`p-2 -mr-2 rounded-full ${T.card}`}
          >
            <Share size={20} className={T.text} />
          </button>
        </div>
      </div>
      
      {/* Cover */}
      <div className="w-full h-40 bg-orange-200 dark:bg-zinc-800 flex flex-col items-center justify-center -mt-16 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="text-7xl drop-shadow-lg z-10 mt-8">{group.emoji}</div>
      </div>
      
      <div className="px-4 pt-4 pb-0">
        <h1 className={`text-2xl font-bold leading-tight ${T.text}`}>{group.name}</h1>
        <p className={`text-sm mt-1 ${T.sub} flex items-center gap-1.5`}>
          <Globe size={14} /> Public Group · <span className="font-bold">{group.members}</span> members
        </p>
        
        <div className="flex gap-2 mt-4 mb-4">
          <button className={`flex-1 py-2.5 rounded-xl ${group.joined ? `${T.card2} ${T.text}` : 'bg-orange-500 text-white'} font-bold text-sm flex items-center justify-center gap-2`}>
            {group.joined ? <><CheckCircle2 size={16} /> Joined</> : 'Join Group'}
          </button>
          <button 
            onClick={() => onInviteClick(group)}
            className={`flex-1 py-2.5 rounded-xl ${T.card} ${T.text} font-bold text-sm flex items-center justify-center gap-2 border border-orange-200 dark:border-zinc-800`}
          >
            <UserPlus size={16} /> Invite
          </button>
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className={`p-2.5 rounded-xl ${T.card} ${T.text} border border-orange-200 dark:border-zinc-800 flex items-center justify-center`}>
              <MoreHorizontal size={18} />
            </button>
            {showOptions && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border ${T.line} ${T.card2} z-50 p-2 flex flex-col`}>
                <button onClick={() => { setShowOptions(false); setShowSettings(true); }} className={`text-left px-3 py-2 text-sm ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2`}><Settings size={16} /> Group Settings</button>
                <button className={`text-left px-3 py-2 text-sm ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2`}><Shield size={16} /> Report Group</button>
                <button className={`text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2`}><LogOut size={16} /> Leave Group</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex px-4 gap-4 border-b border-orange-100 dark:border-zinc-800 sticky top-[68px] bg-white dark:bg-black z-20`}>
        {[
          { id: "discussion", label: "Discussion" },
          { id: "about", label: "About" },
          { id: "events", label: "Events" },
          { id: "members", label: "Members" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === t.id ? "text-orange-600" : T.sub}`}
          >
            {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="p-4 bg-orange-50/50 dark:bg-zinc-900/20 min-h-[50vh] cardin">
        {activeTab === "discussion" && (
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl ${T.card} border border-orange-100 dark:border-zinc-800 flex gap-3 items-center shadow-sm`}>
              <Avatar name={user?.user_metadata?.full_name || "User"} />
              <div className="flex-1 flex items-center gap-2">
                <input 
                  value={newUpdateText}
                  onChange={e => setNewUpdateText(e.target.value)}
                  placeholder="Write something to the group..." 
                  className={`flex-1 text-left px-4 py-2.5 rounded-full text-sm ${T.input} border ${T.line} outline-none`}
                  onKeyDown={e => e.key === "Enter" && handlePostUpdate()}
                />
                <button 
                  disabled={!newUpdateText.trim() || isPosting}
                  onClick={handlePostUpdate}
                  className={`text-orange-500 p-2 rounded-full hover:${T.card2} transition-all disabled:opacity-50`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            
            {posts.map((p) => (
              <div key={p.id} className={`${T.card} rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-zinc-800`}>
                <div className="flex items-center gap-3 mb-3">
                  <div onClick={() => onUserClick(p.user)} className="cursor-pointer">
                    <Avatar name={p.user.name} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${T.text} cursor-pointer`} onClick={() => onUserClick(p.user)}>{p.user.name}</p>
                    <p className={`text-xs ${T.sub}`}>{p.time}</p>
                  </div>
                  <button className={`ml-auto p-2 rounded-full hover:${T.card2} ${T.sub}`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <p className={`text-sm leading-relaxed ${T.text}`}>{p.text}</p>
                <div className={`flex gap-6 mt-4 pt-3 border-t border-orange-50 dark:border-zinc-800/50 text-xs font-semibold ${T.sub}`}>
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
                        <div className={`flex-1 p-2.5 rounded-2xl ${T.card2} ${T.text}`}>
                          <p className="font-semibold text-xs">{c.user.name} <span className="font-normal text-orange-500 ml-1">{c.time}</span></p>
                          <p className="text-sm mt-1">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 items-center mt-2">
                      <Avatar name="You" size={6} />
                      <div className={`flex-1 flex items-center rounded-full px-3 py-1.5 ${T.card2}`}>
                        <input 
                          type="text" 
                          value={commentInput} 
                          onChange={e => setCommentInput(e.target.value)} 
                          placeholder="Write a comment..." 
                          className={`bg-transparent outline-none flex-1 text-sm ${T.text}`}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddComment(p.id);
                          }}
                        />
                        <button 
                          onClick={() => handleAddComment(p.id)}
                          disabled={!commentInput.trim()} 
                          className={`ml-2 ${commentInput.trim() ? "text-orange-500" : "text-gray-400"}`}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-3">
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <p className={`text-sm ${T.text} leading-relaxed`}>
                Welcome to <strong>{group.name}</strong>! This is a community space for sharing advice, organizing local meetups, and helping each other navigate life here. 
                <br/><br/>
                Please keep discussions respectful and relevant. No spam or commercial promotions.
              </p>
              <div className="flex gap-4 mt-5">
                <div>
                  <p className={`text-lg font-bold ${T.text}`}>{group.members}</p>
                  <p className={`text-xs ${T.sub}`}>Total Members</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${T.text}`}>Public</p>
                  <p className={`text-xs ${T.sub}`}>Anyone can see who's in the group and what they post.</p>
                </div>
              </div>
            </div>
            
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Group Rules</p>
              <div className="space-y-3">
                {[
                  "1. Be kind and courteous",
                  "2. No hate speech or bullying",
                  "3. No promotions or spam",
                  "4. Respect everyone's privacy"
                ].map(r => (
                  <p key={r} className={`text-sm ${T.text}`}>{r}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Upcoming Events</p>
              <button className="text-xs font-semibold text-orange-600">Create</button>
            </div>
            {DUMMY_EVENTS.map(e => (
              <div key={e.id} onClick={() => onEventClick(e)} className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer border border-orange-100 dark:border-zinc-800`}>
                <div className="w-24 bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">{e.image}</div>
                <div className="p-4 flex-1">
                  <p className={`text-xs font-bold text-orange-600 mb-0.5`}>{e.date}</p>
                  <p className={`text-sm font-bold ${T.text}`}>{e.title}</p>
                  <p className={`text-[11px] ${T.sub} flex items-center gap-1 mt-1`}><MapPin size={10} /> {e.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "members" && (
          <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm space-y-4`}>
            <div className={`p-2 rounded-xl border ${T.line} flex items-center gap-2 mb-2`}>
              <Search size={16} className={T.sub} />
              <input type="text" placeholder="Find a member..." className={`bg-transparent outline-none text-sm w-full ${T.text}`} />
            </div>
            {DUMMY_PEOPLE.map(p => (
              <div key={p.id} onClick={() => onUserClick(p)} className="flex items-center gap-3 cursor-pointer">
                <Avatar name={p.name} />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${T.text}`}>{p.name}</p>
                  <p className={`text-xs ${T.sub}`}>Joined recently</p>
                </div>
                <button className={`p-2 rounded-full ${T.card2}`}><UserPlus size={16} className={T.sub} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export const CommunityTab = ({ communitiesData, activeCommunityTab, setActiveCommunityTab, profile, user, T, onRefreshGroups }: CommunityTabProps) => {
  const [data, setData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>(DUMMY_EVENTS);
  const [people, setPeople] = useState<any[]>(DUMMY_PEOPLE);
  const [invites, setInvites] = useState<any[]>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [groupToInvite, setGroupToInvite] = useState<any>(null);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (inviteSearch.trim().length > 1) {
      const timer = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setInviteResults([]);
    }
  }, [inviteSearch]);

  const searchUsers = async () => {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, origin")
      .ilike("full_name", `%${inviteSearch}%`)
      .neq("id", user?.id)
      .limit(5);
    
    if (!error && users) {
      setInviteResults(users);
    }
  };

  const sendInvite = async (inviteeId: string) => {
    if (!user || !groupToInvite) return;
    setInvitingUserId(inviteeId);
    
    const { error } = await supabase.from("group_invites").insert({
      group_id: groupToInvite.id,
      inviter_id: user.id,
      invitee_id: inviteeId
    });

    if (!error) {
      // Create notification for invitee
      await supabase.from("notifications").insert({
        user_id: inviteeId,
        type: "group_invite",
        content: `${profile.name} invited you to join ${groupToInvite.name}`
      });
      alert("Invite sent!");
    } else if (error.code === "23505") {
      alert("This user is already invited or a member.");
    } else {
      alert(error.message);
    }
    setInvitingUserId(null);
  };
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCat, setNewGroupCat] = useState("General");
  const [newGroupEmoji, setNewGroupEmoji] = useState("🏘️");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchCommunities();
    fetchEvents();
    fetchPeople();
    fetchInvites();
  }, [user]);

  const fetchInvites = async () => {
    if (!user) return;
    const { data: invs, error } = await supabase
      .from("group_invites")
      .select("*, groups(name, image, description), profiles!inviter_id(full_name)")
      .eq("invitee_id", user.id)
      .eq("status", "pending");
    
    if (!error && invs) {
      setInvites(invs);
    }
  };

  const handleInviteAction = async (invite: any, action: "accepted" | "declined") => {
    const { error: updateError } = await supabase
      .from("group_invites")
      .update({ status: action })
      .eq("id", invite.id);

    if (!updateError && action === "accepted") {
      await supabase.from("group_members").insert({
        group_id: invite.group_id,
        user_id: user.id,
        user_name: profile.name
      });
      fetchCommunities();
    }
    fetchInvites();
  };

  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && groups) {
      setData(groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category,
        emoji: g.image || "🏘️",
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };

  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id)");
    if (!error && evs && evs.length > 0) {
      setEvents(evs.map((e: any) => ({
        ...e,
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };

  const fetchPeople = async () => {
    const { data: pros, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(10);
    if (!error && pros && pros.length > 0) {
      setPeople(pros.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        origin: p.origin,
        bio: p.bio
      })));
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    setIsCreating(true);
    setCreateError("");
    
    const { data: newGroup, error } = await supabase.from("groups").insert({
      name: newGroupName,
      description: newGroupDesc,
      category: newGroupCat,
      image: newGroupEmoji,
      admin_id: user.id,
      admin_name: profile.name || user.user_metadata?.full_name || "User"
    }).select().single();

    if (error) {
      setCreateError(error.message);
    } else if (newGroup) {
      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: newGroup.id,
        user_id: user.id,
        user_name: profile.name || user.user_metadata?.full_name || "User"
      });
      
      if (!memberError) {
        fetchCommunities();
        setIsCreateGroupOpen(false);
        setNewGroupName("");
        setNewGroupDesc("");
        setNewGroupCat("General");
        setNewGroupEmoji("🏘️");
      } else {
        setCreateError(memberError.message);
      }
    }
    setIsCreating(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id,
      user_name: profile.name
    });
    if (!error) fetchCommunities();
  };

  if (selectedUser) {
    return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} />;
  }

  if (selectedGroup) {
    return (
      <GroupView 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        T={T} 
        onUserClick={setSelectedUser} 
        onEventClick={setSelectedEvent} 
        onInviteClick={(g: any) => {
          setGroupToInvite(g);
          setIsInviteModalOpen(true);
        }}
        user={user}
      />
    );
  }

  if (selectedEvent) {
    return <EventView event={selectedEvent} onClose={() => setSelectedEvent(null)} T={T} onUserClick={setSelectedUser} />;
  }

  return (
    <div className="pb-24">
      <Header T={T} title="Community" right={
        <div className="flex gap-2">
          <button className={`p-2 rounded-full ${T.card}`}><Search size={18} className={T.text} /></button>
          <button onClick={() => setIsCreateGroupOpen(true)} className={`p-2 rounded-full ${T.card}`}><Plus size={18} className={T.text} /></button>
        </div>
      } />

      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin`}>
            <div className="p-6 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className={`text-xl font-bold ${T.text}`}>Create Group</h2>
              <button onClick={() => setIsCreateGroupOpen(false)} className={T.sub}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              {createError && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{createError}</p>}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Group Name</label>
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Berlin Hiking Club" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Icon / Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {["🏘️", "🍻", "👟", "🎨", "📚", "🍳", "💻", "🌱", "🧘", "🚲"].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => setNewGroupEmoji(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newGroupEmoji === emoji ? "bg-orange-500 scale-110 shadow-lg" : `${T.card2} hover:bg-orange-100 dark:hover:bg-zinc-800`}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {["General", "Hobby", "Support", "Professional", "Social"].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setNewGroupCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${newGroupCat === cat ? "bg-orange-500 text-white" : `${T.card2} ${T.text}`}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Description</label>
                <textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What is this group about?" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line} h-24 resize-none`} />
              </div>
              <button 
                disabled={isCreating || !newGroupName.trim()} 
                onClick={handleCreateGroup}
                className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20"
              >
                {isCreating ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex px-4 gap-4 mb-4 border-b border-orange-100 dark:border-zinc-800">
        {[
          { id: "groups", label: "Groups", icon: Users },
          { id: "events", label: "Events", icon: MapPin },
          { id: "people", label: "People", icon: User },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCommunityTab(t.id)}
            className={`pb-2 text-sm font-semibold transition-all relative ${activeCommunityTab === t.id ? "text-orange-600" : T.sub}`}
          >
            {t.label}
            {activeCommunityTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>
      {activeCommunityTab === "groups" && (
        <div className="mx-4 space-y-3 cardin">
          {invites.length > 0 && (
            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Group Invites</p>
              <div className="space-y-2">
                {invites.map(inv => (
                  <div key={inv.id} className={`${T.card} rounded-2xl p-4 shadow-md border-2 border-orange-200 dark:border-orange-500/30`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-xl shrink-0">
                        {inv.groups?.image || "🏘️"}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${T.text}`}>{inv.groups?.name}</p>
                        <p className={`text-xs ${T.sub}`}>Invited by {inv.profiles?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleInviteAction(inv, "accepted")}
                        className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleInviteAction(inv, "declined")}
                        className={`flex-1 py-2 rounded-xl ${T.card2} ${T.text} font-bold text-xs border ${T.line} active:scale-95 transition-all`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Your Groups</p>
            <button className="text-xs font-semibold text-orange-600">See all</button>
          </div>
          {data.filter(c => c.joined).map(c => (
            <div key={c.name} onClick={() => setSelectedGroup(c)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${T.text}`}>{c.name}</p>
                <p className={`text-xs ${T.sub}`}>{c.members} members</p>
              </div>
              <ChevronRight size={16} className={T.sub} />
            </div>
          ))}
          <div className="pt-4 mb-1">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Recommended for you</p>
          </div>
          {data.filter(c => !c.joined).map(c => (
            <div key={c.name} onClick={() => setSelectedGroup(c)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${T.text}`}>{c.name}</p>
                <p className={`text-xs ${T.sub}`}>{c.members} members</p>
              </div>
              <button className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full" onClick={(e) => { e.stopPropagation(); handleJoinGroup(c.id); }}>Join</button>
            </div>
          ))}
        </div>
      )}
      {activeCommunityTab === "events" && (
        <div className="mx-4 space-y-4 cardin">
          <div className={`p-4 rounded-2xl text-white mb-2 cursor-pointer`} style={{ background: SAF }} onClick={() => setSelectedEvent(DUMMY_EVENTS[0])}>
            <p className="disp font-bold text-lg">Next Meetup: Language Exchange</p>
            <p className="text-xs text-orange-100 mt-1">This Sunday at 14:00 · Mauerpark</p>
            <button className="mt-3 bg-white text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedEvent(DUMMY_EVENTS[0]); }}>Going</button>
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Upcoming Events</p>
          {events.map(e => (
            <div key={e.id} onClick={() => setSelectedEvent(e)} className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer`}>
              <div className="w-24 bg-orange-100 dark:bg-zinc-900 flex items-center justify-center text-4xl">{e.image || "📅"}</div>
              <div className="p-4 flex-1">
                <p className={`text-xs font-bold text-orange-600 mb-0.5`}>{e.date}</p>
                <p className={`text-sm font-bold ${T.text}`}>{e.title}</p>
                <p className={`text-xs ${T.sub} flex items-center gap-1 mt-1`}><MapPin size={10} /> {e.location}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-orange-400" />)}
                  </div>
                  <p className={`text-[10px] ${T.sub}`}>+{e.attendees || 0} joining</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeCommunityTab === "people" && (
        <div className="mx-4 space-y-3 cardin">
          <div className={`p-4 rounded-2xl ${T.card2} border border-orange-200 dark:border-zinc-800 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white"><MapPin size={20} /></div>
            <div>
              <p className={`text-sm font-bold ${T.text}`}>Expats nearby</p>
              <p className={`text-xs ${T.sub}`}>See who's in your neighborhood</p>
            </div>
            <button className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Enable Map</button>
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} pt-2`}>New members in {profile.city}</p>
          {people.map(p => (
            <div key={p.id} onClick={() => setSelectedUser(p)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
              <Avatar name={p.name} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${T.text}`}>{p.name} <span className="text-xs font-normal text-orange-600">from {p.origin}</span></p>
                <p className={`text-xs ${T.sub} line-clamp-1`}>{p.bio}</p>
              </div>
              <button className={`p-2 rounded-full ${T.card2}`} onClick={(e) => { e.stopPropagation(); setSelectedUser(p); }}><MessageCircle size={16} className="text-orange-600" /></button>
            </div>
          ))}
        </div>
      )}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin`}>
            <div className="p-6 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-lg">{groupToInvite?.emoji}</div>
                <h2 className={`text-xl font-bold ${T.text}`}>Invite to {groupToInvite?.name}</h2>
              </div>
              <button onClick={() => { setIsInviteModalOpen(false); setInviteSearch(""); setInviteResults([]); }} className={T.sub}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${T.line} ${T.input}`}>
                <Search size={18} className={T.sub} />
                <input 
                  autoFocus
                  placeholder="Search users by name..." 
                  className="bg-transparent outline-none w-full text-sm"
                  value={inviteSearch}
                  onChange={e => setInviteSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {inviteResults.length > 0 ? (
                  inviteResults.map(u => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-2xl ${T.card2} border ${T.line}`}>
                      <Avatar name={u.full_name} size={10} />
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${T.text}`}>{u.full_name}</p>
                        <p className={`text-xs ${T.sub}`}>{u.origin}</p>
                      </div>
                      <button 
                        disabled={invitingUserId === u.id}
                        onClick={() => sendInvite(u.id)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${invitingUserId === u.id ? "bg-gray-200 text-gray-500" : "bg-orange-500 text-white shadow-md shadow-orange-500/20 active:scale-95"}`}
                      >
                        {invitingUserId === u.id ? "Sending..." : "Invite"}
                      </button>
                    </div>
                  ))
                ) : inviteSearch.length > 1 ? (
                  <p className={`text-center py-8 text-sm ${T.sub}`}>No users found matching "{inviteSearch}"</p>
                ) : (
                  <p className={`text-center py-8 text-sm ${T.sub}`}>Type at least 2 characters to search</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

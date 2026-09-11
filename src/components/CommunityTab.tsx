import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Search, Plus, Users, Settings, Shield, LogOut, MapPin, User, ChevronRight, 
  MessageCircle, ChevronLeft, Globe, Calendar, Clock, Share2, CheckCircle2, 
  MoreHorizontal, UserPlus, Image as ImageIcon, ThumbsUp, MessageSquare, X, 
  Share, Send, ExternalLink, CalendarPlus, Check, Trash2, Heart, Copy, 
  Compass, Filter, Sparkles, AlertCircle, Radio, Crown, ShieldCheck, Pin, Info
} from "lucide-react";
import { Header } from "./Header";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { CommunityRolesModal, CommunityInviteModal } from "./CommunityModals";
import { Theme, Profile } from "../types";
import { 
  GENERATE_DUMMY_COMMUNITIES, 
  GENERATE_DUMMY_EVENTS, 
  GENERATE_DUMMY_PEOPLE, 
  DUMMY_COMMUNITIES, 
  DUMMY_EVENTS, 
  DUMMY_PEOPLE 
} from "../constants";
import { supabase } from "../../supabase";

interface CommunityTabProps {
  communitiesData: any[];
  activeCommunityTab: string;
  setActiveCommunityTab: (val: string) => void;
  profile: Profile;
  user: any;
  T: Theme;
  onRefreshGroups: () => void;
  onStartChat?: (id: string, name?: string) => void;
  onShareGroupToMessenger?: (group: any, targetThreadId?: string, targetThreadName?: string) => boolean | void;
  directMessages?: any[];
}

// Global Toast Notification Helper
const CommunityToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[150] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
    <CheckCircle2 size={15} className="text-emerald-400 dark:text-emerald-600" />
    <span>{message}</span>
  </div>
);

export const UserView = ({ user, onClose, T, onGroupClick, groups, onStartChat }: any) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`follow_user_${user.id || user.name}`) === "true";
    } catch {
      return false;
    }
  });
  const [followersCount, setFollowersCount] = useState<number>(user.followers || 34);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
    try {
      localStorage.setItem(`follow_user_${user.id || user.name}`, String(nextState));
    } catch {}
    showToast(nextState ? `You are now following ${user.name}` : `Unfollowed ${user.name}`);
  };

  const userInterests = user.interests && user.interests.length > 0 
    ? user.interests 
    : [
        `${user.origin || "Expat"} Community`, 
        "Language Exchange", 
        "Coffee & Cafes", 
        "City Walks", 
        "Tech & Careers"
      ];

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      {toastMessage && <CommunityToast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-orange-100 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: user.name,
                  text: `Connect with ${user.name} on Meet Peanut!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast("Profile link copied to clipboard!");
              }
            } catch (err: any) {
              if (err.name !== 'AbortError') console.error('Error sharing:', err);
            }
          }}
          className={`p-2 -mr-2 rounded-full ${T.card}`}
          title="Share profile"
        >
          <Share size={18} className={T.text} />
        </button>
      </div>

      <div className="px-4 py-8 flex flex-col items-center border-b border-orange-100 dark:border-zinc-800">
        <div className="w-24 h-24 mb-4">
          <Avatar name={user.name} />
        </div>
        <h1 className={`text-2xl font-bold ${T.text}`}>{user.name}</h1>
        <p className={`text-sm ${T.sub} mt-1 flex items-center gap-1.5`}>
          <Globe size={14} className="text-orange-500" /> from {user.origin || "International"}
        </p>

        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className={T.sub}><strong className={T.text}>{followersCount}</strong> Followers</span>
          <span className={T.sub}>·</span>
          <span className={T.sub}><strong className={T.text}>{(groups || []).length}</strong> Groups</span>
        </div>
        
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button 
            onClick={() => onStartChat?.(user.id || user.name, user.name || user.full_name)} 
            className="flex-1 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <MessageCircle size={18} /> Message
          </button>
          <button 
            onClick={handleToggleFollow}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm border flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
              isFollowing 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                : `${T.card} ${T.text} border-orange-200 dark:border-zinc-800 hover:border-orange-500`
            }`}
          >
            {isFollowing ? <><Check size={16} /> Following</> : "+ Follow"}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 cardin">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2`}>About</p>
          <p className={`text-sm ${T.text} leading-relaxed`}>
            {user.bio || "Passionate about exploring new places, learning languages, and building a supportive international community. Always happy to chat over a coffee!"}
          </p>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Interests & Topics</p>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((tag: string) => (
              <span key={tag} className={`px-3 py-1.5 rounded-xl text-xs font-medium ${T.card2} ${T.text} border border-orange-100 dark:border-zinc-800`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Shared Groups</p>
          {(groups || []).slice(0, 3).map((c: any) => (
            <div 
              key={c.id || c.name} 
              onClick={() => onGroupClick(c)} 
              className={`${T.card} rounded-2xl p-3 flex items-center gap-3 shadow-sm mb-2 cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-zinc-800 transition-all`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">{c.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${T.text} truncate`}>{c.name}</p>
                <p className={`text-xs ${T.sub}`}>{c.members} members</p>
              </div>
              <ChevronRight size={16} className={T.sub} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventView = ({ event: selectedEvent, onClose, T, onUserClick, user, onRSVP }: any) => {
  const [joined, setJoined] = useState(selectedEvent.joined || false);
  const [attendees, setAttendees] = useState(selectedEvent.attendees || 0);
  const [isRsvping, setIsRsvping] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRSVP = async () => {
    if (!user || isRsvping) return;
    setIsRsvping(true);
    if (joined) {
      const { error } = await supabase.from("event_attendees").delete().eq("event_id", selectedEvent.id).eq("user_id", user.id);
      if (!error) {
        setJoined(false);
        const newAttendees = Math.max(0, attendees - 1);
        setAttendees(newAttendees);
        await supabase.from("events").update({ attendees: newAttendees }).eq("id", selectedEvent.id);
        onRSVP && onRSVP(selectedEvent.id, false);
        showToast("RSVP cancelled");
      }
    } else {
      const { error } = await supabase.from("event_attendees").insert({ 
        event_id: selectedEvent.id, 
        user_id: user.id, 
        user_name: user.user_metadata?.full_name || "User" 
      });
      if (!error) {
        setJoined(true);
        const newAttendees = attendees + 1;
        setAttendees(newAttendees);
        await supabase.from("events").update({ attendees: newAttendees }).eq("id", selectedEvent.id);
        onRSVP && onRSVP(selectedEvent.id, true);
        showToast("RSVP confirmed! See you there 🎉");
      }
    }
    setIsRsvping(false);
  };

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${selectedEvent.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(selectedEvent.title);
    const details = encodeURIComponent(selectedEvent.description || "Community event organized on Meet Peanut");
    const loc = encodeURIComponent(selectedEvent.location);
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}`;
    window.open(gCalUrl, "_blank", "noopener,noreferrer");
    showToast("Opening calendar...");
  };

  const fullAttendeesList = selectedEvent.attendeesList && selectedEvent.attendeesList.length > 0 
    ? selectedEvent.attendeesList 
    : [
        { user_id: "u1", user_name: "Alex Rivera", origin: "Spain" },
        { user_id: "u2", user_name: "Maya Chen", origin: "Taiwan" },
        { user_id: "u3", user_name: "Lukas Schmidt", origin: "Germany" },
        { user_id: "u4", user_name: "Sarah Miller", origin: "USA" }
      ];

  const filteredAttendees = fullAttendeesList.filter((a: any) => 
    (a.user_name || "").toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      {toastMessage && <CommunityToast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin flex flex-col max-h-[80vh]`}>
            <div className="p-4 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-orange-500" />
                <h3 className={`text-base font-bold ${T.text}`}>Attendees ({attendees})</h3>
              </div>
              <button onClick={() => setShowAttendeesModal(false)} className={T.sub}><X size={20} /></button>
            </div>
            <div className="p-3 border-b border-orange-50 dark:border-zinc-800">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${T.line} ${T.input}`}>
                <Search size={15} className={T.sub} />
                <input 
                  placeholder="Search attendees..." 
                  className="bg-transparent outline-none w-full text-xs"
                  value={attendeeSearch}
                  onChange={e => setAttendeeSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1 no-scrollbar">
              {filteredAttendees.map((att: any, idx: number) => (
                <div 
                  key={att.user_id || idx} 
                  onClick={() => {
                    setShowAttendeesModal(false);
                    onUserClick({ id: att.user_id, name: att.user_name });
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl ${T.card2} cursor-pointer hover:border-orange-500 transition-all`}
                >
                  <Avatar name={att.user_name} size={9} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${T.text} truncate`}>{att.user_name}</p>
                    <p className={`text-[11px] ${T.sub}`}>{att.origin || "Community member"}</p>
                  </div>
                  <ChevronRight size={15} className={T.sub} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: selectedEvent.title,
                  text: `Join us at: ${selectedEvent.title} on Meet Peanut!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast("Event link copied to clipboard!");
              }
            } catch (err: any) {
              if (err.name !== 'AbortError') console.error('Error sharing:', err);
            }
          }}
          className={`p-2 -mr-2 rounded-full ${T.card}`}
          title="Share event"
        >
          <Share size={18} className={T.text} />
        </button>
      </div>
      
      <div className="w-full h-56 bg-gradient-to-b from-orange-100 to-orange-50 dark:from-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center">
        <div className="text-6xl drop-shadow-md mb-2 animate-pulse">{selectedEvent.image || "📅"}</div>
      </div>
      
      <div className="p-4 space-y-6 cardin -mt-4 relative z-10 bg-white dark:bg-black rounded-t-3xl shadow-lg">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-bold text-orange-600 mb-1 flex items-center gap-1.5 uppercase tracking-wider`}>
                <Calendar size={13} /> {selectedEvent.date}
              </p>
              <h2 className={`text-2xl font-bold ${T.text} leading-tight mb-3`}>{selectedEvent.title}</h2>
            </div>
          </div>

          <div className={`flex flex-col gap-3 p-4 rounded-2xl ${T.card} border border-orange-100 dark:border-zinc-800 shadow-sm`}>
            {/* Location with clickable map link */}
            <div 
              onClick={handleOpenMap}
              className="flex items-start gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-orange-600">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-bold ${T.text}`}>{selectedEvent.location}</p>
                  <ExternalLink size={13} className="text-orange-500 opacity-80" />
                </div>
                <p className={`text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5`}>Open in Google Maps →</p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-orange-100 dark:border-zinc-800" />
            
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-orange-600">
                <Users size={18} />
              </div>
              <div>
                <p className={`text-sm font-bold ${T.text}`}>{attendees} attendees registered</p>
                <p className={`text-xs ${T.sub}`}>Open community meetup</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* RSVP and Calendar Action Row */}
        <div className="flex gap-2.5">
          <button 
            disabled={isRsvping}
            onClick={handleRSVP}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              joined 
                ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700' 
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
            }`}
          >
            {joined ? <><CheckCircle2 size={18} className="text-emerald-500" /> Cancel RSVP</> : <><CheckCircle2 size={18} /> RSVP Going</>}
          </button>

          <button 
            onClick={handleAddToCalendar}
            className={`py-3.5 px-4 rounded-2xl ${T.card} ${T.text} border border-orange-200 dark:border-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95`}
            title="Add to Google Calendar"
          >
            <CalendarPlus size={18} className="text-orange-500 shrink-0" />
            <span>Calendar</span>
          </button>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2.5`}>About this event</p>
          <p className={`text-sm ${T.text} leading-relaxed whitespace-pre-wrap`}>
            {selectedEvent.description || "Join us for a friendly community gathering! Connect with locals and expats, exchange tips, and make meaningful friendships in your city."}
          </p>
        </div>

        {/* Attendees Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Attendees ({attendees})</p>
            <button 
              onClick={() => setShowAttendeesModal(true)} 
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              See all {attendees} →
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {fullAttendeesList.slice(0, 4).map((p: any, i: number) => (
                <div 
                  key={p.user_id || i} 
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative cursor-pointer hover:scale-105 transition-transform" 
                  style={{ zIndex: 10 - i }} 
                  onClick={() => onUserClick({ id: p.user_id, name: p.user_name })}
                  title={p.user_name}
                >
                  <Avatar name={p.user_name} />
                </div>
              ))}
            </div>
            {attendees > 4 && (
              <div 
                onClick={() => setShowAttendeesModal(true)}
                className={`w-10 h-10 rounded-full border-2 border-white dark:border-black ${T.card2} flex items-center justify-center text-[11px] font-bold ${T.text} -ml-3 relative cursor-pointer hover:bg-orange-100 transition-colors`}
              >
                +{attendees - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GroupView = ({ 
  group, 
  onClose, 
  T, 
  onUserClick, 
  onEventClick, 
  onInviteClick, 
  user, 
  profile, 
  events, 
  onToggleJoinGroup,
  onShareGroupToMessenger,
  directMessages,
  onStartChat
}: any) => {
  const [activeTab, setActiveTab] = useState("discussion");
  const [isJoined, setIsJoined] = useState(group.joined || false);
  const [membersCount, setMembersCount] = useState(group.members || 1);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [actualMembers, setActualMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "leadership" | "members">("all");
  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showInternalInviteModal, setShowInternalInviteModal] = useState(false);

  // Community Governance & Creator Identification
  const creatorId = group.creator_id || group.admin_id || "creator-1";
  const creatorName = group.creator_name || group.admin_name || "Community Founder";

  // Multi-Admin State Management (persisted in localStorage)
  const [adminIds, setAdminIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`group_admins_${group.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    if (Array.isArray(group.admin_ids) && group.admin_ids.length > 0) return group.admin_ids;
    return [creatorId, group.admin_id || "m1", "p1"].filter(Boolean);
  });

  // Pinned Posts State (persisted in localStorage)
  const [pinnedPostIds, setPinnedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`group_pinned_${group.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [`welcome_${group.id}`];
  });

  // Current Viewer Role Check
  const isCurrentUserCreator = Boolean(
    (user?.id && (user.id === creatorId || user.id === group.admin_id)) ||
    (profile?.name && creatorName && profile.name.toLowerCase() === creatorName.toLowerCase()) ||
    group.isUserCreator
  );

  const isCurrentUserAdmin = Boolean(
    isCurrentUserCreator ||
    (user?.id && adminIds.includes(user.id)) ||
    (profile?.name && (adminIds.includes(profile.name) || adminIds.includes(profile.name.toLowerCase())))
  );

  const currentUserRole: "creator" | "admin" | "member" = isCurrentUserCreator 
    ? "creator" 
    : isCurrentUserAdmin 
    ? "admin" 
    : "member";

  // Group Notification Toggles
  const [notifyPosts, setNotifyPosts] = useState<boolean>(() => {
    try { return localStorage.getItem(`notify_posts_${group.id}`) !== "false"; } catch { return true; }
  });
  const [notifyEvents, setNotifyEvents] = useState<boolean>(() => {
    try { return localStorage.getItem(`notify_events_${group.id}`) !== "false"; } catch { return true; }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    fetchUpdates();
    fetchMembers();
    const channel = supabase.channel(`realtime_group_posts_${group.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchUpdates();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${group.id}` }, () => {
        fetchMembers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [group.id]);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("group_members").select("user_id, user_name").eq("group_id", group.id);
    if (!error && data && data.length > 0) {
      setActualMembers(data.map((m: any) => ({
        id: m.user_id,
        name: m.user_name || "Community Member"
      })));
      setMembersCount(data.length);
    } else {
      // Fallback default members with role clarity
      setActualMembers([
        { id: creatorId, name: creatorName, role: "Creator" },
        { id: "p2", name: "Ahmed Khan", role: "Admin" },
        { id: "p3", name: "Elena Rossi", role: "Member" },
        { id: profile?.name || "m2", name: profile?.name || "You", role: "Member" },
        { id: "m3", name: "Sophie Taylor", role: "Member" }
      ]);
    }
  };

  const fetchUpdates = async () => {
    const { data: updates, error } = await supabase
      .from("posts")
      .select("*")
      .eq("location", `group:${group.id}`)
      .order("created_at", { ascending: false });
    
    if (!error && updates && updates.length > 0) {
      setPosts(updates.map(u => ({
        id: u.id,
        author_id: u.author_id,
        user: { name: u.author_name || "Member" },
        text: u.content,
        time: new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        likes: Array.isArray(u.likes) ? u.likes.length : 0,
        liked: Array.isArray(u.likes) && u.likes.includes(user?.id),
        comments: u.comments_count || 0
      })));
    } else {
      // Default welcome post
      setPosts([
        {
          id: `welcome_${group.id}`,
          author_id: creatorId,
          user: { name: creatorName },
          text: `Welcome everyone to ${group.name}! 🎉 Feel free to introduce yourself, share tips, or suggest a weekend meetup.`,
          time: "Pinned",
          likes: 5,
          liked: false,
          comments: 1
        }
      ]);
    }
  };

  // Promote Member to Admin (Multi-Admins Capability)
  const handlePromoteToAdmin = (memberId: string, memberName: string) => {
    setAdminIds(prev => {
      if (prev.includes(memberId) || prev.includes(memberName)) return prev;
      const updated = [...prev, memberId, memberName];
      try {
        localStorage.setItem(`group_admins_${group.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`${memberName} has been appointed as Community Admin! 🛡️`);
  };

  // Demote Admin to Member
  const handleDemoteAdmin = (memberId: string, memberName: string) => {
    if (memberId === creatorId || memberName.toLowerCase() === creatorName.toLowerCase()) {
      showToast("The Community Creator cannot be demoted!");
      return;
    }
    setAdminIds(prev => {
      const updated = prev.filter(id => id !== memberId && id !== memberName);
      try {
        localStorage.setItem(`group_admins_${group.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Admin privileges removed for ${memberName}.`);
  };

  // Remove Member from Group
  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === creatorId || memberName.toLowerCase() === creatorName.toLowerCase()) {
      showToast("Cannot remove the Community Creator!");
      return;
    }
    if (confirm(`Remove ${memberName} from ${group.name}?`)) {
      setActualMembers(prev => prev.filter(m => m.id !== memberId && m.name !== memberName));
      setMembersCount(prev => Math.max(0, prev - 1));
      showToast(`${memberName} has been removed from the community.`);
    }
  };

  // Toggle Pin Announcement (Admin & Creator Privilege)
  const handleTogglePin = (postId: string) => {
    setPinnedPostIds(prev => {
      const isPinned = prev.includes(postId);
      const updated = isPinned ? prev.filter(id => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem(`group_pinned_${group.id}`, JSON.stringify(updated));
      } catch {}
      showToast(isPinned ? "Post unpinned." : "Post pinned to community! 📌");
      return updated;
    });
    setActivePostMenu(null);
  };

  const handleToggleMembership = async () => {
    if (!user) {
      showToast("Please log in to join groups.");
      return;
    }
    const nextJoined = !isJoined;
    setIsJoined(nextJoined);
    const nextCount = nextJoined ? membersCount + 1 : Math.max(0, membersCount - 1);
    setMembersCount(nextCount);
    onToggleJoinGroup && onToggleJoinGroup(group.id, nextJoined);

    if (nextJoined) {
      await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        user_name: profile?.name || user.user_metadata?.full_name || "User"
      });
      fetchMembers();
      showToast(`Joined ${group.name}!`);
    } else {
      await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", user.id);
      fetchMembers();
      showToast(`Left ${group.name}`);
    }
  };

  const handleLeaveGroup = async () => {
    if (confirm(`Are you sure you want to leave ${group.name}?`)) {
      if (user) {
        await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", user.id);
      }
      setIsJoined(false);
      setMembersCount(Math.max(0, membersCount - 1));
      onToggleJoinGroup && onToggleJoinGroup(group.id, false);
      setShowOptions(false);
      setShowSettings(false);
      showToast(`Left ${group.name}`);
      onClose();
    }
  };

  const handlePostUpdate = async () => {
    if (!newUpdateText.trim() || isPosting) return;
    if (!user) {
      showToast("Please log in to post.");
      return;
    }
    setIsPosting(true);
    const textToSubmit = newUpdateText;
    setNewUpdateText("");

    const { error } = await supabase.from("posts").insert({
      content: textToSubmit,
      author_id: user.id,
      author_name: profile?.name || user?.user_metadata?.full_name || "Member",
      location: `group:${group.id}`,
      privacy: "Public",
      likes: []
    });

    if (!error) {
      fetchUpdates();
      showToast("Post shared with the group!");
    } else {
      setNewUpdateText(textToSubmit);
      showToast("Could not publish post. Please try again.");
    }
    setIsPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Delete this post from the group?")) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActivePostMenu(null);
      await supabase.from("posts").delete().eq("id", postId);
      showToast("Post removed");
    }
  };

  const handleCopyPostLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setActivePostMenu(null);
    showToast("Post content copied to clipboard!");
  };

  const handleOpenInvite = () => {
    if (onInviteClick) {
      onInviteClick(group);
    } else {
      setShowInternalInviteModal(true);
    }
  };

  // Sort posts with pinned ones at the top
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aPinned = pinnedPostIds.includes(a.id);
      const bPinned = pinnedPostIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [posts, pinnedPostIds]);

  // Leadership & Members categorization
  const { leadershipMembers, regularMembers } = useMemo(() => {
    const leadership: any[] = [];
    const regulars: any[] = [];

    actualMembers.forEach(m => {
      const isCreator = m.id === creatorId || (m.name && m.name.toLowerCase() === creatorName.toLowerCase()) || m.role === "Creator";
      const isAdmin = !isCreator && (adminIds.includes(m.id) || (m.name && (adminIds.includes(m.name) || adminIds.includes(m.name.toLowerCase()))) || m.role === "Admin" || m.role === "Organizer");
      if (isCreator || isAdmin) {
        leadership.push({ ...m, isCreator, isAdmin });
      } else {
        regulars.push({ ...m, isCreator: false, isAdmin: false });
      }
    });

    return { leadershipMembers: leadership, regularMembers: regulars };
  }, [actualMembers, creatorId, creatorName, adminIds]);

  const filteredMembers = useMemo(() => {
    let list = actualMembers;
    if (memberRoleFilter === "leadership") {
      list = actualMembers.filter(m => {
        const isCreator = m.id === creatorId || (m.name && m.name.toLowerCase() === creatorName.toLowerCase()) || m.role === "Creator";
        const isAdmin = adminIds.includes(m.id) || (m.name && (adminIds.includes(m.name) || adminIds.includes(m.name.toLowerCase()))) || m.role === "Admin" || m.role === "Organizer";
        return isCreator || isAdmin;
      });
    } else if (memberRoleFilter === "members") {
      list = actualMembers.filter(m => {
        const isCreator = m.id === creatorId || (m.name && m.name.toLowerCase() === creatorName.toLowerCase()) || m.role === "Creator";
        const isAdmin = adminIds.includes(m.id) || (m.name && (adminIds.includes(m.name) || adminIds.includes(m.name.toLowerCase()))) || m.role === "Admin" || m.role === "Organizer";
        return !isCreator && !isAdmin;
      });
    }

    if (!memberSearch.trim()) return list;
    return list.filter(m => (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()));
  }, [actualMembers, memberRoleFilter, memberSearch, creatorId, creatorName, adminIds]);

  const groupEvents = (events || []).filter((e: any) => 
    e.title?.toLowerCase().includes(group.name.toLowerCase()) || 
    group.name?.toLowerCase().includes("all") ||
    e.location?.toLowerCase().includes("park") ||
    e.id?.includes("1")
  );

  if (showSettings) {
    return (
      <div className="pb-24 bg-white dark:bg-black min-h-screen">
        <Header T={T} title={`${group.name} Settings`} back={() => setShowSettings(false)} />
        <div className="mx-4 mt-4 space-y-4">
          <div className={`${T.card} rounded-2xl p-4 space-y-4 shadow-sm border border-orange-100 dark:border-zinc-800`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Notifications</p>
            
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm font-semibold ${T.text}`}>All group posts</p>
                <p className={`text-xs ${T.sub}`}>Get alerted on new discussions</p>
              </div>
              <button 
                onClick={() => {
                  const next = !notifyPosts;
                  setNotifyPosts(next);
                  localStorage.setItem(`notify_posts_${group.id}`, String(next));
                  showToast("Notification preferences updated");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifyPosts ? "bg-orange-500" : "bg-slate-300 dark:bg-zinc-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifyPosts ? "right-1" : "left-1"}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-orange-50 dark:border-zinc-800/60">
              <div>
                <p className={`text-sm font-semibold ${T.text}`}>Group events</p>
                <p className={`text-xs ${T.sub}`}>Reminders for upcoming meetups</p>
              </div>
              <button 
                onClick={() => {
                  const next = !notifyEvents;
                  setNotifyEvents(next);
                  localStorage.setItem(`notify_events_${group.id}`, String(next));
                  showToast("Notification preferences updated");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifyEvents ? "bg-orange-500" : "bg-slate-300 dark:bg-zinc-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifyEvents ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </div>

          <div className={`${T.card} rounded-2xl p-4 space-y-3 shadow-sm border border-orange-100 dark:border-zinc-800`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Governance & Roles</p>
            <div className="flex items-center justify-between py-1">
              <span className={`text-sm ${T.text}`}>Your Role</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 capitalize">
                {currentUserRole === "creator" ? "👑 Community Creator" : currentUserRole === "admin" ? "🛡️ Community Admin" : "👤 Member"}
              </span>
            </div>
            <button
              onClick={() => setShowRolesModal(true)}
              className={`w-full py-2 rounded-xl text-xs font-bold ${T.card2} border ${T.line} ${T.text} hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2`}
            >
              <ShieldCheck size={14} className="text-orange-500" />
              <span>Understand Roles & Permissions</span>
            </button>
          </div>

          {isJoined && (
            <div className={`${T.card} rounded-2xl p-4 shadow-sm border border-red-100 dark:border-red-950/40`}>
              <button 
                onClick={handleLeaveGroup} 
                className="w-full text-center text-sm font-bold text-red-500 hover:text-red-600 flex items-center justify-center gap-2 py-1"
              >
                <LogOut size={16} /> Leave Group
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      {toastMessage && <CommunityToast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {/* Roles & Permissions Modal */}
      <CommunityRolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        T={T}
        group={group}
        currentUserRole={currentUserRole}
      />

      {/* Internal Invite Modal Fallback */}
      <CommunityInviteModal
        isOpen={showInternalInviteModal}
        onClose={() => setShowInternalInviteModal(false)}
        group={group}
        T={T}
        onShareGroupToMessenger={onShareGroupToMessenger}
        directMessages={directMessages}
        onStartChat={onStartChat}
        user={user}
        profile={profile}
        showToast={showToast}
      />

      {/* Header bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleOpenInvite}
            className={`p-2 rounded-full ${T.card}`}
            title="Invite to group"
          >
            <Share size={18} className={T.text} />
          </button>
        </div>
      </div>
      
      {/* Cover Banner */}
      <div className="w-full h-44 bg-gradient-to-tr from-orange-300 via-amber-200 to-orange-400 dark:from-zinc-800 dark:to-zinc-900 flex flex-col items-center justify-center -mt-16 relative z-10">
        <div className="absolute inset-0 bg-black/20" />
        <div className="text-7xl drop-shadow-lg z-10 mt-8 transform hover:scale-110 transition-transform">{group.emoji}</div>
      </div>
      
      <div className="px-4 pt-4 pb-2">
        <h1 className={`text-2xl font-bold leading-tight ${T.text}`}>{group.name}</h1>
        <p className={`text-xs mt-1 ${T.sub} flex items-center gap-1.5`}>
          <Globe size={13} className="text-orange-500" /> Public Community · <span className="font-bold text-orange-600 dark:text-orange-400">{membersCount}</span> members
        </p>
        
        {/* Creator Credit & Roles Button */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div 
            onClick={() => onUserClick && onUserClick({ name: creatorName })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 cursor-pointer hover:opacity-90 shadow-2xs transition-all"
            title="Community Creator / Founder"
          >
            <Crown size={12} className="text-amber-600 dark:text-amber-400" />
            <span>Created by <span className="underline decoration-amber-400">{creatorName}</span></span>
          </div>

          <button 
            onClick={() => setShowRolesModal(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${T.card2} border ${T.line} ${T.sub} hover:text-orange-500 transition-colors`}
            title="View Roles & Governance differences"
          >
            <ShieldCheck size={12} className="text-orange-500" />
            <span>Roles Explained</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 mb-1">
          <button 
            onClick={handleToggleMembership}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs ${
              isJoined 
                ? `${T.card2} ${T.text} border border-emerald-500/30 text-emerald-600 dark:text-emerald-400` 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isJoined ? <><CheckCircle2 size={16} /> Joined</> : '+ Join Group'}
          </button>

          <button 
            onClick={handleOpenInvite}
            className={`flex-1 py-2.5 rounded-xl ${T.card} ${T.text} font-bold text-sm flex items-center justify-center gap-2 border border-orange-200 dark:border-zinc-800 active:scale-95 transition-all shadow-xs`}
          >
            <UserPlus size={16} /> Invite
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)} 
              className={`p-2.5 rounded-xl ${T.card} ${T.text} border border-orange-200 dark:border-zinc-800 flex items-center justify-center active:scale-95`}
              title="Group options"
            >
              <MoreHorizontal size={18} />
            </button>
            {showOptions && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-xl border ${T.line} ${T.card2} z-50 p-2 flex flex-col animate-in fade-in zoom-in-95`}>
                <button 
                  onClick={() => { setShowOptions(false); setShowSettings(true); }} 
                  className={`text-left px-3 py-2 text-xs font-semibold ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2`}
                >
                  <Settings size={15} /> Group Settings
                </button>
                <button 
                  onClick={() => { setShowOptions(false); setShowRolesModal(true); }} 
                  className={`text-left px-3 py-2 text-xs font-semibold ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2`}
                >
                  <ShieldCheck size={15} /> Roles & Permissions
                </button>
                <button 
                  onClick={() => { setShowOptions(false); showToast("Group reported for review. Thank you!"); }}
                  className={`text-left px-3 py-2 text-xs font-semibold ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2`}
                >
                  <Shield size={15} /> Report Group
                </button>
                {isJoined && (
                  <button 
                    onClick={handleLeaveGroup}
                    className={`text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center gap-2`}
                  >
                    <LogOut size={15} /> Leave Group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current User Status Indicator */}
        <div className="flex items-center justify-between mt-1 px-1 py-1">
          <div className="text-[11px]">
            {isCurrentUserCreator ? (
              <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                <Crown size={12} className="text-amber-600 dark:text-amber-400" />
                <span>You are the <strong>Community Creator</strong></span>
              </span>
            ) : isCurrentUserAdmin ? (
              <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5">
                <Shield size={12} />
                <span>You are a <strong>Community Admin</strong> (Moderator)</span>
              </span>
            ) : isJoined ? (
              <span className={`${T.sub} flex items-center gap-1.5`}>
                <User size={12} />
                <span>You are a Community Member</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex px-4 gap-4 border-b border-orange-100 dark:border-zinc-800 sticky top-[60px] bg-white dark:bg-black z-20`}>
        {[
          { id: "discussion", label: "Discussion" },
          { id: "about", label: "About" },
          { id: "events", label: "Events" },
          { id: "members", label: `Members (${membersCount})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === t.id ? "text-orange-600" : T.sub}`}
          >
            {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="p-4 bg-white dark:bg-zinc-900/20 min-h-[50vh] cardin">
        {activeTab === "discussion" && (
          <div className="space-y-3.5">
            {/* Post Input Box */}
            <div className={`p-3.5 rounded-2xl ${T.card} border border-orange-100 dark:border-zinc-800 flex gap-3 items-center shadow-sm`}>
              <Avatar name={profile?.name || user?.user_metadata?.full_name || "User"} size={9} />
              <div className="flex-1 flex items-center gap-2">
                <input 
                  value={newUpdateText}
                  onChange={e => setNewUpdateText(e.target.value)}
                  placeholder={
                    isCurrentUserCreator 
                      ? "Post an announcement or discussion (Creator)..." 
                      : isCurrentUserAdmin 
                      ? "Post an update as Community Admin..." 
                      : "Share advice, question, or update..."
                  } 
                  className={`flex-1 text-left px-4 py-2.5 rounded-full text-xs ${T.input} border ${T.line} outline-none focus:border-orange-500`}
                  onKeyDown={e => e.key === "Enter" && handlePostUpdate()}
                />
                <button 
                  disabled={!newUpdateText.trim() || isPosting}
                  onClick={handlePostUpdate}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-all disabled:opacity-40 shadow-sm shrink-0"
                  title="Post to group"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
            
            {sortedPosts.length === 0 ? (
              <div className={`${T.card} p-8 rounded-2xl text-center border border-dashed border-orange-200 dark:border-zinc-800`}>
                <MessageSquare size={32} className="mx-auto text-orange-400 mb-2 opacity-60" />
                <p className={`text-sm font-bold ${T.text}`}>No discussions yet</p>
                <p className={`text-xs ${T.sub} mt-1 max-w-xs mx-auto`}>Be the first to say hello and introduce yourself to the community!</p>
              </div>
            ) : (
              sortedPosts.map((p) => {
                const isAuthor = user && (p.author_id === user.id || p.user?.name === profile?.name);
                const canModerate = isCurrentUserAdmin || isCurrentUserCreator;
                const isPostCreator = p.author_id === creatorId || (p.user?.name && p.user.name.toLowerCase() === creatorName.toLowerCase());
                const isPostAdmin = !isPostCreator && (adminIds.includes(p.author_id) || (p.user?.name && (adminIds.includes(p.user.name) || adminIds.includes(p.user.name.toLowerCase()))));
                const isPinned = pinnedPostIds.includes(p.id);

                return (
                  <div key={p.id} className={`${T.card} rounded-2xl p-4 shadow-sm border ${isPinned ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10" : "border-orange-100 dark:border-zinc-800"} transition-all`}>
                    {/* Pinned Announcement Header */}
                    {isPinned && (
                      <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold flex items-center justify-between border border-amber-300/60 dark:border-amber-700/50">
                        <span className="flex items-center gap-1.5">
                          <Pin size={11} className="text-amber-600 dark:text-amber-400 rotate-45" />
                          Pinned Community Announcement
                        </span>
                        {canModerate && (
                          <button 
                            onClick={() => handleTogglePin(p.id)}
                            className="text-[9px] underline opacity-80 hover:opacity-100"
                          >
                            Unpin
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2.5 relative">
                      <div onClick={() => onUserClick && onUserClick(p.user)} className="cursor-pointer">
                        <Avatar name={p.user.name} size={9} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`font-semibold text-xs ${T.text} cursor-pointer truncate`} onClick={() => onUserClick && onUserClick(p.user)}>
                            {p.user.name}
                          </p>
                          {/* Author Role Badge */}
                          {isPostCreator ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 flex items-center gap-1 shrink-0 shadow-2xs">
                              <Crown size={10} className="text-amber-600 dark:text-amber-400" /> Creator
                            </span>
                          ) : isPostAdmin ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/60 flex items-center gap-1 shrink-0 shadow-2xs">
                              <Shield size={10} className="text-orange-600 dark:text-orange-400" /> Admin
                            </span>
                          ) : null}
                        </div>
                        <p className={`text-[10px] ${T.sub}`}>{p.time}</p>
                      </div>

                      {/* Post Options Menu */}
                      <div className="relative">
                        <button 
                          onClick={() => setActivePostMenu(activePostMenu === p.id ? null : p.id)}
                          className={`p-1.5 rounded-full hover:${T.card2} ${T.sub}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activePostMenu === p.id && (
                          <div className={`absolute right-0 top-full mt-1 w-44 rounded-2xl shadow-xl border ${T.line} ${T.card2} z-40 p-1.5 flex flex-col`}>
                            <button 
                              onClick={() => handleCopyPostLink(p.text)}
                              className={`text-left px-2.5 py-1.5 text-xs font-semibold ${T.text} hover:bg-orange-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2`}
                            >
                              <Copy size={13} /> Copy Text
                            </button>
                            {canModerate && (
                              <button 
                                onClick={() => handleTogglePin(p.id)}
                                className={`text-left px-2.5 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2`}
                              >
                                <Pin size={13} /> {isPinned ? "Unpin Post" : "Pin Announcement"}
                              </button>
                            )}
                            {(isAuthor || canModerate) && (
                              <button 
                                onClick={() => handleDeletePost(p.id)}
                                className="text-left px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center gap-2"
                              >
                                <Trash2 size={13} /> Delete Post
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${T.text} whitespace-pre-wrap`}>{p.text}</p>
                    
                    {/* Real-time Comment Section */}
                    <div className="mt-3">
                      <CommentSection p={p} user={user} profile={profile} T={T} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-3.5">
            {/* About Group */}
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2`}>About Group</p>
              <p className={`text-xs ${T.text} leading-relaxed`}>
                {group.desc || `Welcome to ${group.name}! We're an open community of expats and locals dedicated to meeting up, sharing real experiences, and helping each other navigate daily life.`}
              </p>
              <div className="flex gap-4 mt-4 pt-3 border-t border-orange-50 dark:border-zinc-800/60">
                <div>
                  <p className={`text-base font-bold ${T.text}`}>{membersCount}</p>
                  <p className={`text-[10px] ${T.sub}`}>Members</p>
                </div>
                <div>
                  <p className={`text-base font-bold text-orange-600 dark:text-orange-400`}>Public</p>
                  <p className={`text-[10px] ${T.sub}`}>Open to everyone</p>
                </div>
              </div>
            </div>

            {/* Governance & Leadership Structure */}
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm space-y-3`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Community Leadership</p>
                <button 
                  onClick={() => setShowRolesModal(true)}
                  className="text-[11px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <Info size={13} /> Roles Explained
                </button>
              </div>

              {/* Creator Card */}
              <div className={`p-3 rounded-2xl border border-amber-300/80 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between gap-2`}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={creatorName} size={9} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-bold ${T.text}`}>{creatorName}</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <Crown size={9} /> Creator
                      </span>
                    </div>
                    <p className={`text-[10px] ${T.sub}`}>Community Founder · Highest authority</p>
                  </div>
                </div>
                {isCurrentUserCreator && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>

              {/* Multi-Admins Details */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${T.text} flex items-center gap-1.5`}>
                    <Shield size={13} className="text-orange-500" />
                    <span>Appointed Community Admins ({leadershipMembers.filter(m => !m.isCreator).length})</span>
                  </p>
                  <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                    Multi-Admin System
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {leadershipMembers.filter(m => !m.isCreator).length === 0 ? (
                    <p className={`text-xs ${T.sub} italic`}>No additional admins appointed yet.</p>
                  ) : (
                    leadershipMembers.filter(m => !m.isCreator).map(adm => (
                      <div key={adm.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${T.card2} border ${T.line}`}>
                        <Avatar name={adm.name} size={5} />
                        <span>{adm.name}</span>
                        <span className="text-[9px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.2 rounded-full">Admin</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Guidelines */}
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2.5`}>Community Guidelines</p>
              <div className="space-y-2">
                {[
                  "1. Be kind, supportive, and welcoming to all members",
                  "2. No commercial spam, self-promotion, or unsolicited ads",
                  "3. Protect privacy — never share someone else's personal contact info",
                  "4. Keep advice factual and constructively framed"
                ].map(r => (
                  <p key={r} className={`text-xs ${T.text} flex items-start gap-1.5`}>
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Community Events</p>
            </div>
            {groupEvents.length === 0 ? (
              <div className={`${T.card} p-6 rounded-2xl text-center border border-dashed border-orange-200 dark:border-zinc-800`}>
                <Calendar size={28} className="mx-auto text-orange-400 mb-2 opacity-60" />
                <p className={`text-sm font-bold ${T.text}`}>No upcoming events scheduled</p>
                <p className={`text-xs ${T.sub} mt-1`}>Keep an eye out or propose a meetup in the Discussion tab!</p>
              </div>
            ) : (
              groupEvents.map((e: any) => (
                <div 
                  key={e.id} 
                  onClick={() => onEventClick && onEventClick(e)} 
                  className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer border border-orange-100 dark:border-zinc-800 hover:border-orange-300 transition-all`}
                >
                  <div className="w-20 bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-3xl shrink-0">{e.image || "📅"}</div>
                  <div className="p-3.5 flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-orange-600 mb-0.5">{e.date}</p>
                    <p className={`text-xs font-bold ${T.text} truncate`}>{e.title}</p>
                    <p className={`text-[11px] ${T.sub} flex items-center gap-1 mt-1 truncate`}><MapPin size={11} className="shrink-0" /> {e.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm space-y-3`}>
            {/* Header with Roles Explainer Button */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Member Directory</p>
                <p className={`text-[11px] ${T.sub}`}>{actualMembers.length} active members in group</p>
              </div>
              <button 
                onClick={() => setShowRolesModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1.5 border border-orange-200 dark:border-zinc-700 hover:bg-orange-100 transition-colors shadow-2xs"
              >
                <ShieldCheck size={13} /> Roles Explained
              </button>
            </div>

            {/* Segmented Role Filter */}
            <div className={`flex border ${T.line} rounded-xl p-1 bg-orange-50/40 dark:bg-zinc-900/40 gap-1`}>
              <button
                onClick={() => setMemberRoleFilter("all")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  memberRoleFilter === "all" ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs" : `${T.sub} hover:text-orange-500`
                }`}
              >
                All ({actualMembers.length})
              </button>
              <button
                onClick={() => setMemberRoleFilter("leadership")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  memberRoleFilter === "leadership" ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs" : `${T.sub} hover:text-orange-500`
                }`}
              >
                <span>👑 Admins</span>
                <span>({leadershipMembers.length})</span>
              </button>
              <button
                onClick={() => setMemberRoleFilter("members")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  memberRoleFilter === "members" ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs" : `${T.sub} hover:text-orange-500`
                }`}
              >
                Members ({regularMembers.length})
              </button>
            </div>

            {/* Member Search */}
            <div className={`p-2 rounded-xl border ${T.line} flex items-center gap-2 mb-1`}>
              <Search size={15} className={T.sub} />
              <input 
                type="text" 
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Find member by name..." 
                className={`bg-transparent outline-none text-xs w-full ${T.text}`} 
              />
              {memberSearch && (
                <button onClick={() => setMemberSearch("")} className={T.sub}><X size={14} /></button>
              )}
            </div>

            {/* Member Rows */}
            <div className="space-y-2">
              {filteredMembers.length === 0 ? (
                <p className={`text-xs text-center py-6 ${T.sub}`}>No members match "{memberSearch}"</p>
              ) : (
                filteredMembers.map(m => {
                  const isMemCreator = m.id === creatorId || (m.name && m.name.toLowerCase() === creatorName.toLowerCase()) || m.role === "Creator";
                  const isMemAdmin = !isMemCreator && (adminIds.includes(m.id) || (m.name && (adminIds.includes(m.name) || adminIds.includes(m.name.toLowerCase()))) || m.role === "Admin" || m.role === "Organizer");
                  const isSelf = (user?.id && user.id === m.id) || (profile?.name && m.name && profile.name.toLowerCase() === m.name.toLowerCase());

                  return (
                    <div 
                      key={m.id} 
                      className={`flex items-center gap-3 p-2.5 rounded-2xl ${T.card2} border ${T.line} hover:border-orange-200 transition-all`}
                    >
                      <div onClick={() => onUserClick && onUserClick(m)} className="cursor-pointer">
                        <Avatar name={m.name} size={9} />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => onUserClick && onUserClick(m)}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-xs font-bold ${T.text} truncate cursor-pointer`}>{m.name}</p>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">You</span>
                          )}
                        </div>
                        
                        {/* Member Role Badge */}
                        <div className="mt-0.5">
                          {isMemCreator ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 shadow-2xs">
                              <Crown size={10} className="text-amber-600 dark:text-amber-400" /> Community Creator
                            </span>
                          ) : isMemAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/60 shadow-2xs">
                              <Shield size={10} className="text-orange-600 dark:text-orange-400" /> Admin
                            </span>
                          ) : (
                            <span className={`text-[10px] ${T.sub}`}>Member</span>
                          )}
                        </div>
                      </div>

                      {/* Role Actions (Creator & Admin powers) */}
                      <div className="flex items-center gap-1.5">
                        {/* Creator can promote to Admin (Multi-Admins), demote Admin, or remove member */}
                        {isCurrentUserCreator && !isSelf && (
                          <>
                            {isMemAdmin ? (
                              <button
                                onClick={() => handleDemoteAdmin(m.id, m.name)}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-zinc-800 border border-orange-200 dark:border-zinc-700 transition-colors"
                                title="Demote Admin to Member"
                              >
                                Demote
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteToAdmin(m.id, m.name)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-2xs active:scale-95 transition-all"
                                title="Promote to Community Admin (Multi-admin)"
                              >
                                + Make Admin
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(m.id, m.name)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Remove member from community"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        {/* Admin can remove regular members */}
                        {isCurrentUserAdmin && !isCurrentUserCreator && !isMemCreator && !isMemAdmin && !isSelf && (
                          <button
                            onClick={() => handleRemoveMember(m.id, m.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Remove member from community"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                        <button 
                          onClick={() => onUserClick && onUserClick(m)}
                          className={`p-1.5 rounded-full ${T.card2} hover:text-orange-500`}
                          title="View member profile"
                        >
                          <User size={13} className={T.sub} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CommunityTab = ({ 
  communitiesData, 
  activeCommunityTab, 
  setActiveCommunityTab, 
  profile, 
  user, 
  T, 
  onRefreshGroups, 
  onStartChat,
  onShareGroupToMessenger,
  directMessages
}: CommunityTabProps) => {
  const [data, setData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>(DUMMY_EVENTS);
  const [people, setPeople] = useState<any[]>(DUMMY_PEOPLE);
  const [invites, setInvites] = useState<any[]>([]);
  
  // Search & Filtering States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupCategory, setSelectedGroupCategory] = useState("All");
  const [selectedEventFilter, setSelectedEventFilter] = useState("All");
  const [selectedPeopleFilter, setSelectedPeopleFilter] = useState("All");

  // Sub-screens & Modals
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [groupToInvite, setGroupToInvite] = useState<any>(null);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [showAllYourGroupsModal, setShowAllYourGroupsModal] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group Creation States
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCat, setNewGroupCat] = useState("Social");
  const [newGroupEmoji, setNewGroupEmoji] = useState("🏘️");
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<"Public" | "Private">("Public");
  
  // Event Creation States
  const [newEventName, setNewEventName] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDateInput, setNewEventDateInput] = useState("");
  const [newEventTimeInput, setNewEventTimeInput] = useState("18:00");
  const [newEventEmoji, setNewEventEmoji] = useState("📅");

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    fetchCommunities();
    fetchEvents();
    fetchPeople();
    fetchInvites();
  }, [user]);

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
      await supabase.from("notifications").insert({
        user_id: inviteeId,
        type: "group_invite",
        content: `${profile.name} invited you to join ${groupToInvite.name}`
      });
      showToast(`Invitation sent for ${groupToInvite.name}!`);
      setIsInviteModalOpen(false);
      setInviteSearch("");
    } else if (error.code === "23505") {
      showToast("This user is already invited or a member.");
    } else {
      showToast(error.message);
    }
    setInvitingUserId(null);
  };

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
      showToast(`Joined ${invite.groups?.name}!`);
      fetchCommunities();
      onRefreshGroups && onRefreshGroups();
    }
    fetchInvites();
  };

  const fetchCommunities = async () => {
    const { data: groups, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && groups && groups.length > 0) {
      const dbGroups = groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        category: g.category || "General",
        emoji: g.image || (g.category === "Social" ? "🌍" : g.category === "Housing" ? "🏠" : g.category === "Professional" ? "💼" : "🏘️"),
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      }));
      setData(dbGroups);
    } else {
      const o = profile?.origin || "USA";
      const c = profile?.city || "Berlin";
      const h = profile?.host || "Germany";
      setData(GENERATE_DUMMY_COMMUNITIES(o, c, h));
    }
  };

  const fetchEvents = async () => {
    const { data: evs, error } = await supabase.from("events").select("*, event_attendees(user_id, user_name)");
    if (!error && evs && evs.length > 0) {
      const dbEvents = evs.map((e: any) => ({
        ...e,
        attendeesList: e.event_attendees || [],
        joined: e.event_attendees?.some((m: any) => m.user_id === user?.id)
      }));
      setEvents(dbEvents);
    } else {
      const o = profile?.origin || "USA";
      const c = profile?.city || "Berlin";
      const h = profile?.host || "Germany";
      setEvents(GENERATE_DUMMY_EVENTS(o, c, h));
    }
  };

  const fetchPeople = async () => {
    const { data: pros, error } = await supabase.from("profiles").select("*").neq("id", user?.id).limit(15);
    if (!error && pros && pros.length > 0) {
      const dbPeople = pros.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.handle || "Newcomer",
        origin: p.origin || "International",
        city: p.city || profile.city || "Berlin",
        bio: p.bio || "Enthusiastic expat exploring Germany.",
        avatar: (p.full_name || p.handle || "U").substring(0, 2).toUpperCase()
      }));
      setPeople(dbPeople);
    } else {
      const o = profile?.origin || "USA";
      const c = profile?.city || "Berlin";
      const h = profile?.host || "Germany";
      setPeople(GENERATE_DUMMY_PEOPLE(o, c, h));
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      showToast("Please log in to join groups.");
      return;
    }
    // Optimistic UI update
    setData(prev => prev.map(g => g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g));
    showToast("Joined group!");
    
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id,
      user_name: profile.name
    });
    if (!error) {
      onRefreshGroups && onRefreshGroups();
    }
  };

  const handleToggleJoinFromGroupView = (groupId: string, joined: boolean) => {
    setData(prev => prev.map(g => g.id === groupId ? { ...g, joined, members: joined ? g.members + 1 : Math.max(0, g.members - 1) } : g));
    onRefreshGroups && onRefreshGroups();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    if (!user) {
      showToast("Please log in to create a group.");
      return;
    }
    setIsCreating(true);
    setCreateError("");
    
    const { data: newGroup, error } = await supabase.from("groups").insert({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      category: newGroupCat,
      image: newGroupEmoji,
      admin_id: user.id,
      admin_name: profile.name || user.user_metadata?.full_name || "User"
    }).select().single();

    if (error) {
      setCreateError(error.message);
    } else if (newGroup) {
      await supabase.from("group_members").insert({
        group_id: newGroup.id,
        user_id: user.id,
        user_name: profile.name || user.user_metadata?.full_name || "User"
      });
      
      // Update local state instantly
      const createdObj = {
        id: newGroup.id,
        name: newGroup.name,
        desc: newGroup.description,
        category: newGroup.category,
        emoji: newGroup.image || newGroupEmoji,
        members: 1,
        joined: true
      };
      setData(prev => [createdObj, ...prev]);
      
      setIsCreateGroupOpen(false);
      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupCat("Social");
      setNewGroupEmoji("🏘️");
      showToast(`Group "${newGroup.name}" created!`);
      onRefreshGroups && onRefreshGroups();
    }
    setIsCreating(false);
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !newEventLocation.trim()) return;
    if (!user) {
      showToast("Please log in to create an event.");
      return;
    }
    setIsCreating(true);
    setCreateError("");

    // Format readable date
    let formattedDate = newEventDateInput;
    if (newEventDateInput) {
      try {
        const d = new Date(`${newEventDateInput}T${newEventTimeInput || '18:00'}`);
        formattedDate = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ` · ${newEventTimeInput || '18:00'}`;
      } catch {
        formattedDate = `${newEventDateInput} · ${newEventTimeInput}`;
      }
    } else {
      formattedDate = "This Weekend · 18:00";
    }
    
    const { data: newEvent, error } = await supabase.from("events").insert({
      title: newEventName.trim(),
      description: newEventDesc.trim(),
      image: newEventEmoji,
      date: formattedDate,
      location: newEventLocation.trim(),
      creator_id: user.id
    }).select().single();

    if (error) {
      setCreateError(error.message);
    } else if (newEvent) {
      await supabase.from("event_attendees").insert({
        event_id: newEvent.id,
        user_id: user.id,
        user_name: profile.name || user.user_metadata?.full_name || "User"
      });
      await supabase.from("events").update({ attendees: 1 }).eq("id", newEvent.id);
      
      const createdEventObj = {
        ...newEvent,
        joined: true,
        attendees: 1,
        attendeesList: [{ user_id: user.id, user_name: profile.name }]
      };
      setEvents(prev => [createdEventObj, ...prev]);
      
      setIsCreateEventOpen(false);
      setNewEventName("");
      setNewEventDesc("");
      setNewEventLocation("");
      setNewEventDateInput("");
      setNewEventEmoji("📅");
      showToast(`Event "${newEvent.title}" published!`);
    }
    setIsCreating(false);
  };

  // Filtered Lists Logic
  const filteredGroups = useMemo(() => {
    return data.filter(g => {
      const matchSearch = !searchQuery || 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (g.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedGroupCategory === "All" || 
        (g.category || "").toLowerCase() === selectedGroupCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [data, searchQuery, selectedGroupCategory]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = !searchQuery || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = selectedEventFilter === "All" ? true :
        selectedEventFilter === "Attending" ? e.joined :
        selectedEventFilter === "This Week" ? true : true;
      return matchSearch && matchFilter;
    });
  }, [events, searchQuery, selectedEventFilter]);

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.bio || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = selectedPeopleFilter === "All" ? true :
        selectedPeopleFilter === "From My Country" ? p.origin === profile.origin :
        selectedPeopleFilter === "In My City" ? p.city === profile.city : true;
      return matchSearch && matchFilter;
    });
  }, [people, searchQuery, selectedPeopleFilter, profile.origin, profile.city]);

  // Subscreen navigation
  if (selectedUser) {
    return (
      <UserView 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
        T={T} 
        onGroupClick={setSelectedGroup} 
        groups={data} 
        onStartChat={onStartChat} 
      />
    );
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
        profile={profile}
        events={events}
        onToggleJoinGroup={handleToggleJoinFromGroupView}
        onShareGroupToMessenger={onShareGroupToMessenger}
        directMessages={directMessages}
        onStartChat={onStartChat}
      />
    );
  }

  if (selectedEvent) {
    return (
      <EventView 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        T={T} 
        onUserClick={setSelectedUser} 
        user={user}
        onRSVP={(eventId: string, joined: boolean) => {
          setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, joined, attendees: ev.attendees + (joined ? 1 : -1) } : ev));
        }}
      />
    );
  }

  return (
    <div className="pb-24">
      {toastMessage && <CommunityToast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Main Header */}
      <Header 
        T={T} 
        title="Community" 
        right={
          <div className="flex gap-1.5">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isSearchOpen) setSearchQuery("");
              }} 
              className={`p-2 rounded-full transition-colors ${isSearchOpen ? "bg-orange-500 text-white" : `${T.card}`}`}
              title="Search community"
            >
              <Search size={18} className={isSearchOpen ? "text-white" : T.text} />
            </button>
            {activeCommunityTab === "groups" ? (
              <button 
                onClick={() => setIsCreateGroupOpen(true)} 
                className={`p-2 rounded-full ${T.card} hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors`}
                title="Create Group"
              >
                <Plus size={18} className="text-orange-500" />
              </button>
            ) : activeCommunityTab === "events" ? (
              <button 
                onClick={() => setIsCreateEventOpen(true)} 
                className={`p-2 rounded-full ${T.card} hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors`}
                title="Create Event"
              >
                <Plus size={18} className="text-orange-500" />
              </button>
            ) : null}
          </div>
        } 
      />

      {/* Expandable Active Search Bar */}
      {isSearchOpen && (
        <div className="mx-4 mb-3 flex items-center gap-2 p-2.5 rounded-2xl bg-orange-500/10 dark:bg-zinc-900 border border-orange-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
          <Search size={16} className="text-orange-500 shrink-0 ml-1" />
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeCommunityTab} by title, topic, or location...`}
            className={`bg-transparent outline-none text-xs w-full ${T.text}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex px-4 gap-4 mb-3 border-b border-orange-100 dark:border-zinc-800">
        {[
          { id: "groups", label: "Groups", icon: Users },
          { id: "events", label: "Events", icon: MapPin },
          { id: "people", label: "People", icon: User },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveCommunityTab(t.id);
              setSearchQuery("");
            }}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${activeCommunityTab === t.id ? "text-orange-600 dark:text-orange-400" : T.sub}`}
          >
            <t.icon size={15} />
            <span>{t.label}</span>
            {activeCommunityTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* GROUPS TAB */}
      {activeCommunityTab === "groups" && (
        <div className="mx-4 space-y-3.5 cardin">
          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["All", "Social", "Housing", "Professional", "Hobby", "Support"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedGroupCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGroupCategory === cat
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : `${T.card2} ${T.sub} hover:${T.text}`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="mb-4">
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2.5`}>Group Invites</p>
              <div className="space-y-2">
                {invites.map(inv => (
                  <div key={inv.id} className={`${T.card} rounded-2xl p-3.5 shadow-sm border-2 border-orange-200 dark:border-orange-500/30`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-xl shrink-0">
                        {inv.groups?.image || "🏘️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${T.text} truncate`}>{inv.groups?.name}</p>
                        <p className={`text-[11px] ${T.sub}`}>Invited by {inv.profiles?.full_name || "Community member"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => handleInviteAction(inv, "accepted")}
                        className="flex-1 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleInviteAction(inv, "declined")}
                        className={`flex-1 py-1.5 rounded-xl ${T.card2} ${T.text} font-bold text-xs border ${T.line} active:scale-95 transition-all`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Groups Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Your Groups</p>
              {data.filter(c => c.joined).length > 2 && (
                <button 
                  onClick={() => setShowAllYourGroupsModal(true)} 
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  See all ({data.filter(c => c.joined).length})
                </button>
              )}
            </div>

            {data.filter(c => c.joined).length === 0 ? (
              <div className={`${T.card} p-4 rounded-2xl border border-dashed border-orange-200 dark:border-zinc-800 text-center`}>
                <p className={`text-xs ${T.sub}`}>You haven't joined any groups yet.</p>
                <p className={`text-[11px] text-orange-600 font-semibold mt-1`}>Explore recommendations below!</p>
              </div>
            ) : (
              data.filter(c => c.joined).slice(0, 3).map(c => (
                <div 
                  key={c.id || c.name} 
                  onClick={() => setSelectedGroup(c)} 
                  className={`${T.card} rounded-2xl p-3.5 mb-2 flex items-center gap-3 shadow-sm cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-zinc-800 transition-all`}
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${T.text} truncate`}>{c.name}</p>
                    <p className={`text-[11px] ${T.sub}`}>{c.members} members · {c.category || "General"}</p>
                  </div>
                  <ChevronRight size={16} className={T.sub} />
                </div>
              ))
            )}
          </div>

          {/* Recommended / Discover Groups */}
          <div className="pt-2">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2`}>
              {selectedGroupCategory === "All" ? "Discover Communities" : `${selectedGroupCategory} Groups`}
            </p>
            {filteredGroups.filter(c => !c.joined).length === 0 ? (
              <p className={`text-xs text-center py-6 ${T.sub}`}>No matching groups found.</p>
            ) : (
              filteredGroups.filter(c => !c.joined).map(c => (
                <div 
                  key={c.id || c.name} 
                  onClick={() => setSelectedGroup(c)} 
                  className={`${T.card} rounded-2xl p-3.5 mb-2 flex items-center gap-3 shadow-sm cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-zinc-800 transition-all`}
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${T.text} truncate`}>{c.name}</p>
                    <p className={`text-[11px] ${T.sub} truncate`}>{c.desc || `${c.members} members · ${c.category || "Community"}`}</p>
                  </div>
                  <button 
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shrink-0 shadow-sm active:scale-95 transition-all" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleJoinGroup(c.id); 
                    }}
                  >
                    Join
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {activeCommunityTab === "events" && (
        <div className="mx-4 space-y-3.5 cardin">
          {/* Events Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["All", "Upcoming", "Attending", "This Week"].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedEventFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedEventFilter === filter
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : `${T.card2} ${T.sub} hover:${T.text}`
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Upcoming Gatherings</p>
          
          {filteredEvents.length === 0 ? (
            <div className={`${T.card} p-8 rounded-2xl text-center border border-dashed border-orange-200 dark:border-zinc-800`}>
              <Calendar size={32} className="mx-auto text-orange-400 mb-2 opacity-60" />
              <p className={`text-sm font-bold ${T.text}`}>No events found</p>
              <p className={`text-xs ${T.sub} mt-1`}>Create an event and bring people together!</p>
            </div>
          ) : (
            filteredEvents.map(e => (
              <div 
                key={e.id} 
                onClick={() => setSelectedEvent(e)} 
                className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-zinc-800 transition-all`}
              >
                <div className="w-24 bg-orange-100 dark:bg-zinc-900 flex items-center justify-center text-4xl shrink-0">
                  {e.image || "📅"}
                </div>
                <div className="p-3.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-orange-600 mb-0.5">{e.date}</p>
                    {e.joined && (
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        Going
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-bold ${T.text} truncate`}>{e.title}</p>
                  <p className={`text-[11px] ${T.sub} flex items-center gap-1 mt-1 truncate`}>
                    <MapPin size={11} className="shrink-0 text-orange-500" /> {e.location}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 bg-orange-400 text-[8px] text-white flex items-center justify-center font-bold">
                          {i}
                        </div>
                      ))}
                    </div>
                    <p className={`text-[10px] ${T.sub}`}>+{e.attendees || 0} attending</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PEOPLE TAB */}
      {activeCommunityTab === "people" && (
        <div className="mx-4 space-y-3.5 cardin">
          {/* Expats Nearby Radar Card */}
          <div className={`p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Expats in {profile.city}</p>
              <p className="text-xs text-orange-100 mt-0.5 truncate">Discover newcomers & neighbors nearby</p>
            </div>
            <button 
              onClick={() => setShowRadarModal(true)}
              className="bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm active:scale-95 transition-all shrink-0"
            >
              Radar
            </button>
          </div>

          {/* People Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["All", `In ${profile.city}`, `From ${profile.origin}`].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedPeopleFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedPeopleFilter === filter
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : `${T.card2} ${T.sub} hover:${T.text}`
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>New Members</p>
          
          {filteredPeople.length === 0 ? (
            <p className={`text-xs text-center py-6 ${T.sub}`}>No matching members found.</p>
          ) : (
            filteredPeople.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedUser(p)} 
                className={`${T.card} rounded-2xl p-3.5 flex items-center gap-3 shadow-sm cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-zinc-800 transition-all`}
              >
                <Avatar name={p.name} size={10} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${T.text} truncate`}>
                    {p.name} <span className="text-[11px] font-normal text-orange-600 dark:text-orange-400">from {p.origin}</span>
                  </p>
                  <p className={`text-[11px] ${T.sub} line-clamp-1 mt-0.5`}>{p.bio}</p>
                </div>
                <button 
                  className={`p-2 rounded-full ${T.card2} text-orange-500 hover:bg-orange-500 hover:text-white transition-colors shrink-0`} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onStartChat ? onStartChat(p.id, p.name) : setSelectedUser(p); 
                  }}
                  title="Direct message"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: See All Your Groups */}
      {showAllYourGroupsModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin flex flex-col max-h-[80vh]`}>
            <div className="p-4 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className={`text-base font-bold ${T.text}`}>Your Joined Groups</h3>
              <button onClick={() => setShowAllYourGroupsModal(false)} className={T.sub}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1 no-scrollbar">
              {data.filter(c => c.joined).map(c => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setShowAllYourGroupsModal(false);
                    setSelectedGroup(c);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl ${T.card2} cursor-pointer hover:border-orange-500 transition-all`}
                >
                  <div className="text-2xl">{c.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${T.text} truncate`}>{c.name}</p>
                    <p className={`text-[10px] ${T.sub}`}>{c.members} members</p>
                  </div>
                  <ChevronRight size={15} className={T.sub} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Neighborhood Radar */}
      {showRadarModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin flex flex-col max-h-[85vh]`}>
            <div className="p-4 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-orange-500" />
                <h3 className={`text-base font-bold ${T.text}`}>{profile.city} Community Radar</h3>
              </div>
              <button onClick={() => setShowRadarModal(false)} className={T.sub}><X size={20} /></button>
            </div>
            <div className="p-4 bg-orange-500/10 dark:bg-zinc-900 flex items-center justify-center py-6 border-b border-orange-100 dark:border-zinc-800">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping" />
                <div className="absolute inset-3 rounded-full border border-orange-500/40" />
                <div className="absolute inset-7 rounded-full border border-orange-500/60" />
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  You
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1 no-scrollbar">
              <p className={`text-[11px] font-bold uppercase tracking-wider ${T.sub} mb-1`}>Active nearby</p>
              {[
                { name: "Carlos Ramos", dist: "0.8 km away", area: "Mitte", origin: "Spain" },
                { name: "Ananya Sharma", dist: "1.4 km away", area: "Prenzlauer Berg", origin: "India" },
                { name: "Liam Vance", dist: "2.1 km away", area: "Kreuzberg", origin: "UK" },
                { name: "Elena Rossi", dist: "2.9 km away", area: "Friedrichshain", origin: "Italy" }
              ].map((p, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-2xl ${T.card2} hover:border-orange-500 transition-all`}
                >
                  <Avatar name={p.name} size={9} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${T.text} truncate`}>{p.name}</p>
                    <p className={`text-[10px] text-orange-600 font-semibold`}>{p.dist} · {p.area}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowRadarModal(false);
                      onStartChat ? onStartChat(p.name.toLowerCase().replace(/\s+/g, '-'), p.name) : showToast(`Connecting with ${p.name}...`);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm shrink-0"
                  >
                    Say Hi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Group */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin`}>
            <div className="p-5 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className={`text-lg font-bold ${T.text}`}>Create New Group</h2>
              <button onClick={() => setIsCreateGroupOpen(false)} className={T.sub}><X size={22} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {createError && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{createError}</p>}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Group Name</label>
                <input 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  placeholder="e.g. Munich Tech & Expat Network" 
                  className={`w-full ${T.input} rounded-xl px-3.5 py-2.5 text-xs outline-none border ${T.line}`} 
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Icon / Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {["🏘️", "🍻", "👟", "🎨", "📚", "🍳", "💻", "🌱", "🧘", "🚲"].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => setNewGroupEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${newGroupEmoji === emoji ? "bg-orange-500 text-white scale-110 shadow-md" : `${T.card2} hover:bg-orange-100 dark:hover:bg-zinc-800`}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Social", "Housing", "Professional", "Hobby", "Support"].map(cat => (
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
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Privacy</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy("Public")}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                      newGroupPrivacy === "Public" 
                        ? "border-orange-500 bg-orange-500/10 text-orange-600" 
                        : `${T.line} ${T.sub}`
                    }`}
                  >
                    <p className="font-bold">Public</p>
                    <p className="text-[10px] opacity-80">Anyone can join</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy("Private")}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                      newGroupPrivacy === "Private" 
                        ? "border-orange-500 bg-orange-500/10 text-orange-600" 
                        : `${T.line} ${T.sub}`
                    }`}
                  >
                    <p className="font-bold">Private</p>
                    <p className="text-[10px] opacity-80">Members only</p>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Description</label>
                <textarea 
                  value={newGroupDesc} 
                  onChange={e => setNewGroupDesc(e.target.value)} 
                  placeholder="What is the purpose of this group?" 
                  className={`w-full ${T.input} rounded-xl px-3.5 py-2.5 text-xs outline-none border ${T.line} h-20 resize-none`} 
                />
              </div>

              <button 
                disabled={isCreating || !newGroupName.trim()} 
                onClick={handleCreateGroup}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 text-xs"
              >
                {isCreating ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Event */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm ${T.bg} rounded-3xl overflow-hidden cardin`}>
            <div className="p-5 border-b border-orange-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className={`text-lg font-bold ${T.text}`}>Create New Event</h2>
              <button onClick={() => setIsCreateEventOpen(false)} className={T.sub}><X size={22} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {createError && <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{createError}</p>}
              
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Event Name</label>
                <input 
                  value={newEventName} 
                  onChange={e => setNewEventName(e.target.value)} 
                  placeholder="e.g. Sunday English-German Cafe Meetup" 
                  className={`w-full ${T.input} rounded-xl px-3.5 py-2.5 text-xs outline-none border ${T.line}`} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Date</label>
                  <input 
                    type="date"
                    value={newEventDateInput} 
                    onChange={e => setNewEventDateInput(e.target.value)} 
                    className={`w-full ${T.input} rounded-xl px-3 py-2 text-xs outline-none border ${T.line}`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Time</label>
                  <input 
                    type="time"
                    value={newEventTimeInput} 
                    onChange={e => setNewEventTimeInput(e.target.value)} 
                    className={`w-full ${T.input} rounded-xl px-3 py-2 text-xs outline-none border ${T.line}`} 
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Location</label>
                <input 
                  value={newEventLocation} 
                  onChange={e => setNewEventLocation(e.target.value)} 
                  placeholder="e.g. The Barn Coffee Roasters, Mitte" 
                  className={`w-full ${T.input} rounded-xl px-3.5 py-2.5 text-xs outline-none border ${T.line}`} 
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {["📅", "🍻", "👟", "🎨", "📚", "🍳", "💻", "🌱", "🧘", "🚲"].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => setNewEventEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${newEventEmoji === emoji ? "bg-orange-500 text-white scale-110 shadow-md" : `${T.card2} hover:bg-orange-100 dark:hover:bg-zinc-800`}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Description</label>
                <textarea 
                  value={newEventDesc} 
                  onChange={e => setNewEventDesc(e.target.value)} 
                  placeholder="Tell people what to expect, where to find you, etc." 
                  className={`w-full ${T.input} rounded-xl px-3.5 py-2.5 text-xs outline-none border ${T.line} h-20 resize-none`} 
                />
              </div>

              <button 
                disabled={isCreating || !newEventName.trim() || !newEventLocation.trim()} 
                onClick={handleCreateEvent}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 text-xs"
              >
                {isCreating ? "Publishing..." : "Publish Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Community Invite Modal (Messenger, Link, Search) */}
      {isInviteModalOpen && groupToInvite && (
        <CommunityInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setGroupToInvite(null);
          }}
          group={groupToInvite}
          T={T}
          onShareGroupToMessenger={onShareGroupToMessenger}
          directMessages={directMessages}
          onStartChat={onStartChat}
          user={user}
          profile={profile}
          showToast={showToast}
        />
      )}
    </div>
  );
};

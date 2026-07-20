import React, { useState, useEffect } from "react";
import { Search, Plus, Users, Settings, Shield, LogOut, MapPin, User, ChevronRight, MessageCircle, ChevronLeft, Globe, Calendar, Share2, CheckCircle2, MoreHorizontal, UserPlus, ThumbsUp, MessageSquare, X, Share, Send, UserX } from "lucide-react";
import { Header } from "./Header";
import { Avatar } from "./Avatar";
import { Theme, Profile } from "../types";
import { SAF } from "../constants";
import { api } from "../api";

interface CommunityTabProps {
  activeCommunityTab: string;
  setActiveCommunityTab: (val: string) => void;
  profile: Profile;
  user: any;
  T: Theme;
  onRefreshGroups: () => void;
  onMessageUser: (userId: string, userName: string) => void;
}

async function shareOrCopy(payload: { title: string; text: string; url: string }) {
  try {
    if (navigator.share) await navigator.share(payload);
    else {
      navigator.clipboard.writeText(payload.url);
      alert("Link copied to clipboard!");
    }
  } catch (err: any) {
    if (err.name !== "AbortError") console.error("Error sharing:", err);
  }
}

export const UserView = ({ user, onClose, T, onGroupClick, onMessageUser = () => {}, viewerId }: any) => {
  const [isFollowing, setIsFollowing] = useState(!!user.isFollowing);
  const [isBlocked, setIsBlocked] = useState(false);
  const isSelf = viewerId && viewerId === user.id;

  const toggleFollow = async () => {
    setIsFollowing((f: boolean) => !f);
    try {
      if (isFollowing) await api.delete(`/api/users/${user.id}/follow`);
      else await api.post(`/api/users/${user.id}/follow`);
    } catch {
      setIsFollowing((f: boolean) => !f);
    }
  };

  const toggleBlock = async () => {
    setIsBlocked((b) => !b);
    try {
      if (isBlocked) await api.delete(`/api/users/${user.id}/block`);
      else await api.post(`/api/users/${user.id}/block`);
    } catch {
      setIsBlocked((b) => !b);
    }
  };

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b border-orange-100 dark:border-zinc-800 bg-white dark:bg-black`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button onClick={() => shareOrCopy({ title: user.name, text: `Check out ${user.name} on Buonolo!`, url: window.location.href })} className={`p-2 -mr-2 rounded-full ${T.card}`}>
          <Share size={20} className={T.text} />
        </button>
      </div>
      <div className="px-4 py-8 flex flex-col items-center border-b border-orange-100 dark:border-zinc-800">
        <div className="w-24 h-24 mb-4">
          <Avatar name={user.name} />
        </div>
        <h1 className={`text-2xl font-bold ${T.text}`}>{user.name}</h1>
        <p className={`text-sm ${T.sub} mt-1 flex items-center gap-1`}><Globe size={14} /> from {user.origin}</p>

        {!isSelf && (
          <div className="flex gap-3 mt-6 w-full max-w-xs">
            <button onClick={() => onMessageUser(user.id, user.name)} className="flex-1 py-2.5 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20">
              <MessageCircle size={18} /> Message
            </button>
            <button onClick={toggleFollow} className={`flex-1 py-2.5 rounded-full ${isFollowing ? `${T.card2} ${T.text}` : T.card + " " + T.text} font-bold text-sm border border-orange-200 dark:border-zinc-800`}>
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}
        {!isSelf && (
          <button onClick={toggleBlock} className={`mt-3 text-xs font-semibold flex items-center gap-1.5 ${isBlocked ? "text-red-500" : T.sub}`}>
            <UserX size={13} /> {isBlocked ? "Blocked" : "Block user"}
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 cardin">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-2`}>About</p>
          <p className={`text-sm ${T.text} leading-relaxed`}>
            {user.bio || "This user hasn't written a bio yet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export const EventView = ({ event: selectedEvent, onClose, T }: any) => {
  const [attending, setAttending] = useState(!!selectedEvent.attending);
  const [attendeesCount, setAttendeesCount] = useState(selectedEvent.attendeesCount ?? 0);

  const toggleRsvp = async () => {
    const next = !attending;
    setAttending(next);
    setAttendeesCount((c: number) => c + (next ? 1 : -1));
    try {
      if (next) await api.post(`/api/events/${selectedEvent.id}/rsvp`);
      else await api.delete(`/api/events/${selectedEvent.id}/rsvp`);
    } catch {
      setAttending(!next);
      setAttendeesCount((c: number) => c - (next ? 1 : -1));
    }
  };

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={`sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${T.card}`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button onClick={() => shareOrCopy({ title: selectedEvent.title, text: `Check out this event: ${selectedEvent.title} on Buonolo!`, url: window.location.href })} className={`p-2 -mr-2 rounded-full ${T.card}`}>
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
              <p className={`text-sm font-bold text-orange-600 mb-1 flex items-center gap-1.5`}><Calendar size={14} /> {new Date(selectedEvent.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
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
              </div>
            </div>
            <div className="w-full h-[1px] bg-orange-100 dark:bg-zinc-800" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Users size={16} className="text-orange-600" />
              </div>
              <div>
                <p className={`text-sm font-bold ${T.text}`}>{attendeesCount} attendees</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={toggleRsvp} className={`flex-1 py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 ${attending ? `${T.card2} ${T.text}` : "bg-orange-500 text-white shadow-lg shadow-orange-500/30"}`}>
            <CheckCircle2 size={18} /> {attending ? "Going ✓" : "RSVP Going"}
          </button>
        </div>

        {selectedEvent.description && (
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>About this event</p>
            <p className={`text-sm ${T.text} leading-relaxed`}>{selectedEvent.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const GroupView = ({ group, onClose, T, onUserClick, onEventClick, onInviteClick = () => {}, user, onLeft }: any) => {
  const [activeTab, setActiveTab] = useState("discussion");
  const [newUpdateText, setNewUpdateText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>(group.members ?? []);
  const [events, setEvents] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [joined, setJoined] = useState(!!group.joined);
  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    fetchUpdates();
    fetchEvents();
  }, [group.id]);

  const fetchUpdates = async () => {
    const { updates } = await api.get<{ updates: any[] }>(`/api/groups/${group.id}/updates`);
    setPosts(updates);
  };

  const fetchEvents = async () => {
    const { events } = await api.get<{ events: any[] }>("/api/events");
    setEvents(events);
  };

  const handlePostUpdate = async () => {
    if (!newUpdateText.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const { update } = await api.post<{ update: any }>(`/api/groups/${group.id}/updates`, { content: newUpdateText });
      setPosts((prev) => [update, ...prev]);
      setNewUpdateText("");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLeaveGroup = async () => {
    await api.delete(`/api/groups/${group.id}/join`);
    onLeft?.();
    onClose();
  };

  const filteredMembers = members.filter((m: any) => m.fullName?.toLowerCase().includes(memberSearch.toLowerCase()));

  if (showSettings) {
    return (
      <div className="pb-24 bg-white dark:bg-black min-h-screen">
        <Header T={T} title={`${group.name} Settings`} back={() => setShowSettings(false)} />
        <div className={`mx-4 mt-4 space-y-4`}>
          <div className={`${T.card} rounded-2xl p-4 space-y-4`}>
            <button onClick={handleLeaveGroup} className={`w-full text-left text-sm font-bold text-red-500`}>Leave Group</button>
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
        <button onClick={() => shareOrCopy({ title: group.name, text: `Join the ${group.name} community on Buonolo!`, url: window.location.href })} className={`p-2 -mr-2 rounded-full ${T.card}`}>
          <Share size={20} className={T.text} />
        </button>
      </div>

      <div className="w-full h-40 bg-orange-200 dark:bg-zinc-800 flex flex-col items-center justify-center -mt-16 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="text-7xl drop-shadow-lg z-10 mt-8">{group.emoji}</div>
      </div>

      <div className="px-4 pt-4 pb-0">
        <h1 className={`text-2xl font-bold leading-tight ${T.text}`}>{group.name}</h1>
        <p className={`text-sm mt-1 ${T.sub} flex items-center gap-1.5`}>
          <Globe size={14} /> Public Group · <span className="font-bold">{group.membersCount ?? members.length}</span> members
        </p>

        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={async () => {
              if (joined) { await api.delete(`/api/groups/${group.id}/join`); setJoined(false); }
              else { await api.post(`/api/groups/${group.id}/join`); setJoined(true); }
            }}
            className={`flex-1 py-2.5 rounded-xl ${joined ? `${T.card2} ${T.text}` : 'bg-orange-500 text-white'} font-bold text-sm flex items-center justify-center gap-2`}
          >
            {joined ? <><CheckCircle2 size={16} /> Joined</> : 'Join Group'}
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
                <button onClick={() => { setShowOptions(false); handleLeaveGroup(); }} className={`text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2`}><LogOut size={16} /> Leave Group</button>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <Avatar name={user?.name || "User"} />
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
                  <div onClick={() => onUserClick(p.author)} className="cursor-pointer">
                    <Avatar name={p.author.fullName} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${T.text} cursor-pointer`} onClick={() => onUserClick(p.author)}>{p.author.fullName}</p>
                    <p className={`text-xs ${T.sub}`}>{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${T.text}`}>{p.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-3">
            <div className={`${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <p className={`text-sm ${T.text} leading-relaxed`}>
                {group.description || `Welcome to ${group.name}! This is a community space for sharing advice, organizing local meetups, and helping each other navigate life here.`}
              </p>
              <div className="flex gap-4 mt-5">
                <div>
                  <p className={`text-lg font-bold ${T.text}`}>{group.membersCount ?? members.length}</p>
                  <p className={`text-xs ${T.sub}`}>Total Members</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${T.text}`}>Public</p>
                  <p className={`text-xs ${T.sub}`}>Anyone can see who's in the group and what they post.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} px-1`}>Upcoming Events</p>
            {events.length === 0 && <p className={`text-sm ${T.sub} text-center py-6`}>No events yet.</p>}
            {events.map(e => (
              <div key={e.id} onClick={() => onEventClick(e)} className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer border border-orange-100 dark:border-zinc-800`}>
                <div className="w-24 bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">{e.image}</div>
                <div className="p-4 flex-1">
                  <p className={`text-xs font-bold text-orange-600 mb-0.5`}>{new Date(e.date).toLocaleDateString()}</p>
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
              <input type="text" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Find a member..." className={`bg-transparent outline-none text-sm w-full ${T.text}`} />
            </div>
            {filteredMembers.map((p: any) => (
              <div key={p.id} onClick={() => onUserClick({ id: p.id, name: p.fullName })} className="flex items-center gap-3 cursor-pointer">
                <Avatar name={p.fullName} />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${T.text}`}>{p.fullName}</p>
                  <p className={`text-xs ${T.sub} capitalize`}>{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommunityTab = ({ activeCommunityTab, setActiveCommunityTab, profile, user, T, onRefreshGroups, onMessageUser }: CommunityTabProps) => {
  const [data, setData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
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
      const timer = setTimeout(() => searchUsers(), 300);
      return () => clearTimeout(timer);
    } else {
      setInviteResults([]);
    }
  }, [inviteSearch]);

  const searchUsers = async () => {
    const { users } = await api.get<{ users: any[] }>(`/api/users/search?q=${encodeURIComponent(inviteSearch)}`);
    setInviteResults(users.map((u) => ({ id: u.id, full_name: u.fullName, origin: u.origin })));
  };

  const sendInvite = async (inviteeId: string) => {
    if (!groupToInvite) return;
    setInvitingUserId(inviteeId);
    try {
      await api.post(`/api/groups/${groupToInvite.id}/invites`, { inviteeId });
      alert("Invite sent!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setInvitingUserId(null);
    }
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
  }, []);

  const fetchInvites = async () => {
    const { invites } = await api.get<{ invites: any[] }>("/api/groups/invites/received");
    setInvites(invites);
  };

  const handleInviteAction = async (invite: any, action: "ACCEPTED" | "DECLINED") => {
    await api.patch(`/api/groups/invites/${invite.id}`, { status: action });
    if (action === "ACCEPTED") fetchCommunities();
    fetchInvites();
  };

  const fetchCommunities = async () => {
    const { groups } = await api.get<{ groups: any[] }>("/api/groups");
    setData(groups.map((g) => ({ ...g, members: g.membersCount })));
    onRefreshGroups();
  };

  const fetchEvents = async () => {
    const { events } = await api.get<{ events: any[] }>("/api/events");
    setEvents(events.map((e) => ({ ...e, attendees: e.attendeesCount })));
  };

  const fetchPeople = async () => {
    const { users } = await api.get<{ users: any[] }>("/api/users/search");
    setPeople(users.map((p) => ({ id: p.id, name: p.fullName, origin: p.origin, bio: p.bio })));
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    setCreateError("");
    try {
      await api.post("/api/groups", { name: newGroupName, description: newGroupDesc, category: newGroupCat, emoji: newGroupEmoji });
      await fetchCommunities();
      setIsCreateGroupOpen(false);
      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupCat("General");
      setNewGroupEmoji("🏘️");
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    await api.post(`/api/groups/${groupId}/join`);
    fetchCommunities();
  };

  const openGroup = async (g: any) => {
    const { group } = await api.get<{ group: any }>(`/api/groups/${g.id}`);
    setSelectedGroup(group);
  };

  if (selectedUser) {
    return <UserView user={selectedUser} viewerId={user?.id} onClose={() => setSelectedUser(null)} T={T} onGroupClick={openGroup} onMessageUser={onMessageUser} />;
  }

  if (selectedGroup) {
    return (
      <GroupView
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onLeft={fetchCommunities}
        T={T}
        onUserClick={setSelectedUser}
        onEventClick={setSelectedEvent}
        onInviteClick={(g: any) => { setGroupToInvite(g); setIsInviteModalOpen(true); }}
        user={profile}
      />
    );
  }

  if (selectedEvent) {
    return <EventView event={selectedEvent} onClose={() => setSelectedEvent(null)} T={T} onUserClick={setSelectedUser} />;
  }

  return (
    <div className="pb-24">
      <Header T={T} title="Community" right={
        <button onClick={() => setIsCreateGroupOpen(true)} className={`p-2 rounded-full ${T.card}`}><Plus size={18} className={T.text} /></button>
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
                        {inv.group?.emoji || "🏘️"}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${T.text}`}>{inv.group?.name}</p>
                        <p className={`text-xs ${T.sub}`}>Invited by {inv.inviter?.fullName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleInviteAction(inv, "ACCEPTED")} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all">
                        Accept
                      </button>
                      <button onClick={() => handleInviteAction(inv, "DECLINED")} className={`flex-1 py-2 rounded-xl ${T.card2} ${T.text} font-bold text-xs border ${T.line} active:scale-95 transition-all`}>
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
          </div>
          {data.filter(c => c.joined).length === 0 && <p className={`text-sm ${T.sub} py-2`}>You haven't joined any groups yet.</p>}
          {data.filter(c => c.joined).map(c => (
            <div key={c.id} onClick={() => openGroup(c)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
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
            <div key={c.id} onClick={() => openGroup(c)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
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
          {events.length > 0 && (
            <div className={`p-4 rounded-2xl text-white mb-2 cursor-pointer`} style={{ background: SAF }} onClick={() => setSelectedEvent(events[0])}>
              <p className="disp font-bold text-lg">{events[0].title}</p>
              <p className="text-xs text-orange-100 mt-1">{new Date(events[0].date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · {events[0].location}</p>
            </div>
          )}
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Upcoming Events</p>
          {events.length === 0 && <p className={`text-sm ${T.sub} py-4`}>No events yet.</p>}
          {events.map(e => (
            <div key={e.id} onClick={() => setSelectedEvent(e)} className={`${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer`}>
              <div className="w-24 bg-orange-100 dark:bg-zinc-900 flex items-center justify-center text-4xl">{e.image || "📅"}</div>
              <div className="p-4 flex-1">
                <p className={`text-xs font-bold text-orange-600 mb-0.5`}>{new Date(e.date).toLocaleDateString()}</p>
                <p className={`text-sm font-bold ${T.text}`}>{e.title}</p>
                <p className={`text-xs ${T.sub} flex items-center gap-1 mt-1`}><MapPin size={10} /> {e.location}</p>
                <p className={`text-[10px] ${T.sub} mt-3`}>{e.attendees || 0} joining</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeCommunityTab === "people" && (
        <div className="mx-4 space-y-3 cardin">
          <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} pt-2`}>New members in {profile.city}</p>
          {people.length === 0 && <p className={`text-sm ${T.sub} py-4`}>No one else here yet.</p>}
          {people.map(p => (
            <div key={p.id} onClick={() => setSelectedUser(p)} className={`${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer`}>
              <Avatar name={p.name} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${T.text}`}>{p.name} <span className="text-xs font-normal text-orange-600">from {p.origin}</span></p>
                <p className={`text-xs ${T.sub} line-clamp-1`}>{p.bio}</p>
              </div>
              <button className={`p-2 rounded-full ${T.card2}`} onClick={(e) => { e.stopPropagation(); onMessageUser(p.id, p.name); }}><MessageCircle size={16} className="text-orange-600" /></button>
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

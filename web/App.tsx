import React, { useState, useMemo, useEffect, useRef } from "react";
import { Home, Map, Wrench, User, Users, Target, Bot } from "lucide-react";
import { api, setAccessToken, connectWebSocket, ApiError } from "./src/api";

// Types & Constants
import { Profile, Post, Goal, Theme } from "./src/types";

// Components
import { AuthFlow } from "./src/components/AuthFlow";
import { MessengerModal } from "./src/components/MessengerModal";
import { HomeTab } from "./src/components/HomeTab";
import { RoadmapTab } from "./src/components/RoadmapTab";
import { BotTab } from "./src/components/BotTab";
import { ToolsTab } from "./src/components/ToolsTab";
import { CommunityTab } from "./src/components/CommunityTab";
import { MeTab } from "./src/components/MeTab";
import { resolveIcon } from "./src/lib/icons";

/* ─────────────────────────────  BUONOLO  ─────────────────────────────
   Brand: vivid orange, ink navy, flight-path green (dashed), warm cream.
   Signature: the dashed green "flight path" that threads roadmap steps.
──────────────────────────────────────────────────────────────────────── */

const FONT = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .disp { font-family: 'Baloo 2', sans-serif; }
    body, .bodyf { font-family: 'Inter', sans-serif; }
    .flightpath { border-left: 3px dashed #F97316; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes cardin { from { opacity:0; transform: translateY(10px) scale(.98);} to {opacity:1; transform:none;} }
    .cardin { animation: cardin .25s ease; }
  `}</style>
);

function toProfile(p: any): Profile {
  return {
    id: p.id,
    email: p.email,
    name: p.name || "User",
    handle: p.handle ? `@${p.handle}` : "",
    origin: p.origin ?? "",
    host: p.host ?? "",
    city: p.city ?? "",
    followers: p.followers ?? 0,
    following: p.following ?? 0,
    bio: p.bio ?? "",
    notificationsEnabled: p.notificationsEnabled ?? true,
  };
}

function toFrontendPost(p: any, followingAuthors: Set<string>): Post {
  return {
    id: p.id,
    name: p.author.fullName,
    author_id: p.author.id,
    text: p.content,
    time: new Date(p.createdAt).toLocaleDateString(),
    likes: p.likesCount,
    liked: !!p.myReaction,
    comments: p.commentsCount,
    privacy: p.privacy === "PUBLIC" ? "Public" : p.privacy === "FRIENDS" ? "Friends" : "Private",
    following: followingAuthors.has(p.author.id),
    saved: p.saved,
    attachment: p.attachment ?? undefined,
    bgTheme: p.bgTheme ?? undefined,
    feeling: p.feeling ?? undefined,
    location: p.location ?? undefined,
    tags: (p.tags ?? []).map((t: any) => t.fullName),
    myReaction: p.myReaction ?? undefined,
    created_at: p.createdAt,
  };
}

function toGoal(g: any): Goal {
  return {
    id: g.id,
    title: g.title,
    cat: g.category,
    icon: resolveIcon(g.iconName),
    steps: (g.steps ?? []).map((s: any) => ({ id: s.id, t: s.text, d: s.description, done: s.done, tool: s.tool, links: s.links })),
  };
}

export default function BuonoloApp() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  const [feed, setFeed] = useState<Post[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emergencyData, setEmergencyData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [communitiesData, setCommunitiesData] = useState<any[]>([]);
  const [toolSectionsData, setToolSectionsData] = useState<any[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isUpdatingHost, setIsUpdatingHost] = useState(false);
  const [toastError, setToastError] = useState("");
  const [openGoal, setOpenGoal] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [meScreen, setMeScreen] = useState("root");
  const [settingsSubScreen, setSettingsSubScreen] = useState("root");
  const [newsMode, setNewsMode] = useState("cards");
  const [newsIdx, setNewsIdx] = useState(0);
  const [notif, setNotif] = useState({ goals: true, community: true, news: false });
  const [activeCommunityTab, setActiveCommunityTab] = useState("groups");

  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [activeShare, setActiveShare] = useState<string | null>(null);
  const [activeReactions, setActiveReactions] = useState<string | null>(null);
  const [activeOptions, setActiveOptions] = useState<string | null>(null);

  const [messengerOpen, setMessengerOpen] = useState(false);
  const [activeMessageThread, setActiveMessageThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const conversationPartners = useRef<Record<string, string>>({}); // display name -> user id
  const followingAuthors = useRef<Set<string>>(new Set());

  const [botMessages, setBotMessages] = useState<any[]>([
    { id: "b1", sender: "Mr O", text: "Hello! I am Mr O, your immigration assistant. Ask me anything!", time: "Now", isMe: false }
  ]);
  const [botLoading, setBotLoading] = useState(false);

  const [user, setUser] = useState<any>(undefined);
  const [authScreen, setAuthScreen] = useState("intro");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authOrigin, setAuthOrigin] = useState("");
  const [authHost, setAuthHost] = useState("");
  const [authCity, setAuthCity] = useState("");
  const [authCustomHost, setAuthCustomHost] = useState("");
  const [authCustomCity, setAuthCustomCity] = useState("");
  const [authSituation, setAuthSituation] = useState("");
  const [authFocus, setAuthFocus] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const T: Theme = useMemo(() => ({
    bg: dark ? "bg-slate-950" : "bg-orange-50",
    card: dark ? "bg-slate-900" : "bg-white",
    card2: dark ? "bg-slate-800" : "bg-orange-100",
    text: dark ? "text-slate-50" : "text-slate-900",
    sub: dark ? "text-slate-400" : "text-slate-500",
    line: dark ? "border-slate-800" : "border-orange-100",
    input: dark ? "bg-slate-800 text-slate-100 placeholder-slate-500" : "bg-white text-slate-900 placeholder-slate-400",
  }), [dark]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const disconnectWs = useRef<(() => void) | null>(null);

  const fetchHostInfo = async (origin: string, newHost: string, newCity: string) => {
    setIsUpdatingHost(true);
    try {
      const { hostInfo } = await api.get<{ hostInfo: any }>(
        `/api/content/host-info?host=${encodeURIComponent(newHost)}&city=${encodeURIComponent(newCity)}&origin=${encodeURIComponent(origin)}`
      );
      if (hostInfo) {
        setWelcomeMessage(hostInfo.welcomeMessage || "");
        setEmergencyData(hostInfo.emergency || []);
        setNewsData(hostInfo.news || []);
        setCommunitiesData((prev) => hostInfo.communities?.length ? hostInfo.communities : prev);
        setToolSectionsData(hostInfo.toolSections || []);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setIsUpdatingHost(false);
    }
  };

  const fetchFeed = async () => {
    const { posts } = await api.get<{ posts: any[] }>("/api/posts");
    setFeed(posts.map((p) => toFrontendPost(p, followingAuthors.current)));
  };

  const fetchGoals = async () => {
    const { goals } = await api.get<{ goals: any[] }>("/api/goals");
    setGoals(goals.map(toGoal));
  };

  const fetchGroups = async () => {
    const { groups } = await api.get<{ groups: any[] }>("/api/groups");
    setCommunitiesData(groups.map((g) => ({ id: g.id, name: g.name, desc: g.description, emoji: g.emoji, members: g.membersCount, joined: g.joined })));
  };

  const fetchNotifications = async () => {
    const { notifications } = await api.get<{ notifications: any[] }>("/api/notifications");
    setNotifications(notifications.map((n) => ({ id: n.id, title: n.title, body: n.body, time: new Date(n.createdAt).toLocaleString(), read: n.isRead, type: n.type })));
  };

  const fetchFollowing = async () => {
    const { users } = await api.get<{ users: any[] }>("/api/users/me/following");
    followingAuthors.current = new Set(users.map((u) => u.id));
  };

  const fetchConversations = async () => {
    const { conversations } = await api.get<{ conversations: any[] }>("/api/messages/conversations");
    const partners: Record<string, string> = {};
    const seeded = conversations.map((c: any) => {
      partners[c.counterpart.fullName] = c.counterpart.id;
      return {
        id: c.lastMessage.id,
        threadId: c.counterpart.fullName,
        sender: c.lastMessage.senderId === user?.id ? "Me" : c.counterpart.fullName,
        text: c.lastMessage.content,
        time: new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: c.lastMessage.senderId === user?.id,
      };
    });
    conversationPartners.current = { ...conversationPartners.current, ...partners };
    setDirectMessages((prev) => {
      const openThreadMessages = activeMessageThread ? prev.filter((m) => m.threadId === activeMessageThread) : [];
      return [...seeded.filter((m) => m.threadId !== activeMessageThread), ...openThreadMessages];
    });
  };

  const loadSession = async (currentUser: { id: string; email: string }, profileData: any) => {
    const p = toProfile(profileData);
    setUser(currentUser);
    setProfile(p);
    setNotif((n) => ({ ...n, community: p.notificationsEnabled }));

    if (!p.origin || !p.host || !p.city) {
      setAuthScreen("setup");
      return;
    }
    setAuthScreen("");
    await Promise.all([
      fetchHostInfo(p.origin, p.host, p.city),
      fetchFollowing().then(fetchFeed),
      fetchGoals(),
      fetchGroups(),
      fetchNotifications(),
      fetchConversations(),
    ]);
    startRealtime();
  };

  const startRealtime = () => {
    disconnectWs.current?.();
    disconnectWs.current = connectWebSocket((event) => {
      if (event.type === "notification:new") {
        const n = event.payload;
        setNotifications((prev) => [{ id: n.id, title: n.title, body: n.body, time: "Now", read: false, type: n.type }, ...prev]);
      } else if (event.type === "message:new") {
        fetchConversations();
      } else if (event.type === "post:new") {
        setUser((u: any) => {
          if (u && event.payload.author.id !== u.id) {
            setFeed((prev) => [toFrontendPost(event.payload, followingAuthors.current), ...prev]);
          }
          return u;
        });
      } else if (event.type === "comment:new") {
        setFeed((prev) => prev.map((p) => p.id === event.payload.postId ? { ...p, comments: p.comments + 1 } : p));
      } else if (event.type === "reaction:new") {
        setFeed((prev) => prev.map((p) => p.id === event.payload.postId ? { ...p, likes: p.likes + 1 } : p));
      }
    });
  };

  useEffect(() => {
    (async () => {
      const restored = await api.restoreSession();
      if (!restored) {
        setUser(null);
        return;
      }
      try {
        const { profile: profileData } = await api.get<{ profile: any }>("/api/auth/me");
        await loadSession({ id: profileData.id, email: profileData.email }, profileData);
      } catch {
        setUser(null);
      }
    })();
    return () => disconnectWs.current?.();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setToastError("");
    try {
      const data = await api.post<{ accessToken: string; profile: any }>("/api/auth/login", { email: authEmail, password: authPassword });
      setAccessToken(data.accessToken);
      await loadSession({ id: data.profile.id, email: data.profile.email }, data.profile);
    } catch (err: any) {
      setToastError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setToastError("");
    try {
      const data = await api.post<{ accessToken: string; profile: any }>("/api/auth/register", {
        email: authEmail, password: authPassword, fullName: authName,
      });
      setAccessToken(data.accessToken);
      setUser({ id: data.profile.id, email: data.profile.email });
      setProfile(toProfile(data.profile));
      setAuthScreen("setup");
    } catch (err: any) {
      setToastError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setAuthLoading(true);
    setToastError("");
    try {
      const data = await api.post<{ accessToken: string; profile: any; isNewUser: boolean }>("/api/auth/google", { idToken });
      setAccessToken(data.accessToken);
      if (data.isNewUser) {
        setAuthName(data.profile.name);
        setUser({ id: data.profile.id, email: data.profile.email });
        setProfile(toProfile(data.profile));
        setAuthScreen("setup");
      } else {
        await loadSession({ id: data.profile.id, email: data.profile.email }, data.profile);
      }
    } catch (err: any) {
      setToastError(err instanceof ApiError ? err.message : "Google sign-in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetupSave = async (
    name: string,
    origin: string,
    host: string,
    customHost: string,
    city: string,
    customCity: string,
    situation: string,
    focus: string
  ) => {
    if (!user) return;
    setAuthLoading(true);
    setToastError("");

    const finalHost = host === "Other" ? customHost : host;
    const finalCity = city === "Other" ? customCity : city;

    try {
      const { profile: updated } = await api.patch<{ profile: any }>("/api/users/me", {
        fullName: name, origin, host: finalHost, city: finalCity,
        bio: `Moving for ${situation}. Currently focused on ${focus}.`,
      });
      setProfile(toProfile(updated));
      await fetchHostInfo(origin, finalHost, finalCity);

      if (focus && focus !== "General") {
        await api.post("/api/goals", {
          title: `Start with ${focus}`,
          category: focus === "Anmeldung" ? "Documentation" : focus === "Housing" ? "Housing" : "General",
          iconName: "Target",
          steps: [{ text: `Research ${focus} in ${finalCity}`, description: `Initial research step for ${focus}.`, tool: "" }],
        });
        await fetchGoals();
      }
      await Promise.all([fetchFollowing().then(fetchFeed), fetchGroups(), fetchNotifications(), fetchConversations()]);
      startRealtime();
      setAuthScreen("");
    } catch (err: any) {
      setToastError(err instanceof ApiError ? err.message : "Failed to save profile");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout"); } catch { /* ignore */ }
    setAccessToken(null);
    disconnectWs.current?.();
    disconnectWs.current = null;
    setUser(null);
    setProfile(null);
    setFeed([]);
    setGoals([]);
    setNotifications([]);
    setDirectMessages([]);
    setAuthScreen("intro");
    setTab("home");
  };

  const toggleLike = async (post: Post) => {
    const wasLiked = post.liked;
    setFeed(f => f.map(p => p.id === post.id ? { ...p, liked: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1, myReaction: wasLiked ? undefined : "👍" } : p));
    try {
      if (wasLiked) await api.delete(`/api/posts/${post.id}/reaction`);
      else await api.put(`/api/posts/${post.id}/reaction`, { emoji: "👍" });
    } catch {
      setFeed(f => f.map(p => p.id === post.id ? post : p));
    }
  };

  const toggleSave = async (id: string) => {
    const wasSaved = feed.find((p) => p.id === id)?.saved;
    setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    try {
      if (wasSaved) await api.delete(`/api/posts/${id}/save`);
      else await api.put(`/api/posts/${id}/save`);
    } catch {
      setFeed(f => f.map(p => p.id === id ? { ...p, saved: wasSaved } : p));
    }
  };

  const toggleFollow = async (authorId: string) => {
    const wasFollowing = followingAuthors.current.has(authorId);
    if (wasFollowing) followingAuthors.current.delete(authorId);
    else followingAuthors.current.add(authorId);
    setFeed(f => f.map(p => p.author_id === authorId ? { ...p, following: !wasFollowing } : p));
    try {
      if (wasFollowing) await api.delete(`/api/users/${authorId}/follow`);
      else await api.post(`/api/users/${authorId}/follow`);
    } catch {
      if (wasFollowing) followingAuthors.current.add(authorId);
      else followingAuthors.current.delete(authorId);
      setFeed(f => f.map(p => p.author_id === authorId ? { ...p, following: wasFollowing } : p));
    }
  };

  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
    try { await api.delete(`/api/posts/${id}`); } catch { fetchFeed(); }
  };

  const addReaction = async (id: string, emoji: string) => {
    setFeed(prev => prev.map(p => p.id === id ? { ...p, myReaction: emoji, liked: true, likes: p.myReaction || p.liked ? p.likes : p.likes + 1 } : p));
    try { await api.put(`/api/posts/${id}/reaction`, { emoji }); } catch { fetchFeed(); }
  };

  const startConversation = (userId: string, userName: string) => {
    conversationPartners.current[userName] = userId;
    setMessengerOpen(true);
    setActiveMessageThread(userName);
  };

  const handleShareToMessenger = (post: Post) => {
    const names = Object.keys(conversationPartners.current);
    if (names.length === 0) {
      setToastError("Start a conversation with someone first, then you can share posts to them.");
      setTimeout(() => setToastError(""), 4000);
      return;
    }
    const threadId = names[0];
    setDirectMessages(msgs => [...msgs, { id: "msg" + Date.now(), threadId, sender: "Me", text: `Check out this post!`, time: "Just now", isMe: true, sharedPost: post }]);
    setMessengerOpen(true);
    setActiveMessageThread(threadId);
  };

  // Load full history whenever a thread is opened.
  useEffect(() => {
    if (!activeMessageThread) return;
    const counterpartId = conversationPartners.current[activeMessageThread];
    if (!counterpartId) return;
    api.get<{ messages: any[] }>(`/api/messages/${counterpartId}`).then(({ messages }) => {
      const mapped = messages.map((m) => ({
        id: m.id,
        threadId: activeMessageThread,
        sender: m.senderId === user?.id ? "Me" : activeMessageThread,
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: m.senderId === user?.id,
      }));
      setDirectMessages((prev) => [...prev.filter((m) => m.threadId !== activeMessageThread), ...mapped]);
    });
  }, [activeMessageThread]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeMessageThread) return;
    const counterpartId = conversationPartners.current[activeMessageThread];
    if (!counterpartId) return;
    const text = messageText;
    setMessageText("");
    setDirectMessages(msgs => [...msgs, { id: "msg" + Date.now(), threadId: activeMessageThread, sender: "Me", text, time: "Just now", isMe: true }]);
    try {
      await api.post(`/api/messages/${counterpartId}`, { content: text });
    } catch {
      setToastError("Failed to send message.");
      setTimeout(() => setToastError(""), 3000);
    }
  };

  const handleBotMessage = async (text: string) => {
    if (!text.trim()) return;
    setBotMessages(prev => [...prev, { id: "bm-" + Date.now(), sender: "Me", text, time: "Just now", isMe: true }]);
    setBotLoading(true);
    try {
      const history = botMessages.slice(-10).map((m) => ({ role: m.isMe ? "user" as const : "model" as const, text: m.text }));
      const { reply } = await api.post<{ reply: string }>("/api/bot/chat", { message: text, history });
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Mr O", text: reply, time: "Now", isMe: false }]);
    } catch (e: any) {
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Mr O", text: e.message || "Sorry, I'm having trouble responding right now.", time: "Now", isMe: false }]);
    } finally {
      setBotLoading(false);
    }
  };

  const NAV = [["home", Home, "Home"], ["roadmap", Map, "Roadmap"], ["community", Users, "Community"], ["tools", Wrench, "Tools"], ["me", User, "Me"]];

  return (
    <div className={`min-h-screen ${T.bg} bodyf transition-colors duration-300 no-scrollbar`}>
      {FONT}
      {user === undefined ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        </div>
      ) : (user === null || !profile || !profile.origin || !profile.host || !profile.city) ? (
        <AuthFlow
          authScreen={authScreen} setAuthScreen={setAuthScreen} authEmail={authEmail} setAuthEmail={setAuthEmail}
          authPassword={authPassword} setAuthPassword={setAuthPassword} authName={authName} setAuthName={setAuthName}
          authOrigin={authOrigin} setAuthOrigin={setAuthOrigin} authHost={authHost} setAuthHost={setAuthHost}
          authCity={authCity} setAuthCity={setAuthCity}
          authCustomHost={authCustomHost} setAuthCustomHost={setAuthCustomHost}
          authCustomCity={authCustomCity} setAuthCustomCity={setAuthCustomCity}
          authSituation={authSituation} setAuthSituation={setAuthSituation}
          authFocus={authFocus} setAuthFocus={setAuthFocus}
          authLoading={authLoading}
          handleEmailLogin={handleEmailLogin} handleEmailRegister={handleEmailRegister} handleSetupSave={handleSetupSave}
          handleGoogleLogin={handleGoogleLogin}
          toastError={toastError} T={T}
        />
      ) : (
        <div className={`max-w-md mx-auto min-h-screen relative shadow-2xl ${T.bg} overflow-x-hidden`}>
          {tab === "home" && (
            <HomeTab
              profile={profile!} welcomeMessage={welcomeMessage} setTab={setTab} feed={feed} user={user} T={T}
              activeComments={activeComments} setActiveComments={setActiveComments} activeReactions={activeReactions} setActiveReactions={setActiveReactions}
              activeShare={activeShare} setActiveShare={setActiveShare} activeOptions={activeOptions} setActiveOptions={setActiveOptions}
              isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen}
              onPostCreated={(post) => setFeed((f) => [toFrontendPost(post, followingAuthors.current), ...f])}
              setMessengerOpen={setMessengerOpen}
              toggleLike={toggleLike} toggleFollow={toggleFollow} deletePost={deletePost} addReaction={addReaction}
              handleShareToMessenger={handleShareToMessenger} toggleSave={toggleSave}
              notifications={notifications} setNotifications={setNotifications} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
            />
          )}
          {tab === "roadmap" && (
            <RoadmapTab
              goals={goals} setGoals={setGoals} openGoal={openGoal} setOpenGoal={setOpenGoal}
              showTemplates={showTemplates} setShowTemplates={setShowTemplates} setTab={setTab}
              setOpenTool={setOpenTool} profile={profile!} T={T}
            />
          )}
          {tab === "community" && (
            <CommunityTab
              activeCommunityTab={activeCommunityTab}
              setActiveCommunityTab={setActiveCommunityTab}
              profile={profile!}
              user={user}
              T={T}
              onRefreshGroups={fetchGroups}
              onMessageUser={startConversation}
            />
          )}
          {tab === "tools" && <ToolsTab openTool={openTool} setOpenTool={setOpenTool} toolSectionsData={toolSectionsData} profile={profile!} emergencyData={emergencyData} T={T} setGoals={setGoals} setTab={setTab} />}
          {tab === "bot" && <BotTab setTab={setTab} profile={profile!} T={T} messages={botMessages} onSend={handleBotMessage} loading={botLoading} />}
          {tab === "me" && (
            <MeTab
              meScreen={meScreen} setMeScreen={setMeScreen} profile={profile!} setProfile={setProfile as any} feed={feed}
              newsData={newsData} newsIdx={newsIdx} setNewsIdx={setNewsIdx} newsMode={newsMode} setNewsMode={setNewsMode}
              dark={dark} setDark={setDark} lang={lang} setLang={setLang} notif={notif} setNotif={setNotif as any}
              settingsSubScreen={settingsSubScreen} setSettingsSubScreen={setSettingsSubScreen}
              handleLogout={handleLogout} fetchHostInfo={fetchHostInfo} isUpdatingHost={isUpdatingHost}
              setToastError={setToastError} communitiesData={communitiesData} T={T} toggleSave={toggleSave}
            />
          )}

          <MessengerModal
            isOpen={messengerOpen} onClose={() => setMessengerOpen(false)} activeMessageThread={activeMessageThread}
            setActiveMessageThread={setActiveMessageThread} messageText={messageText} setMessageText={setMessageText}
            handleSendMessage={handleSendMessage} directMessages={directMessages} T={T}
          />

          {toastError && (
            <div className="fixed bottom-24 left-0 right-0 flex justify-center z-[200] px-4 pointer-events-none">
              <div className="bg-slate-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg max-w-sm text-center">{toastError}</div>
            </div>
          )}

          <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-50 pointer-events-none px-4">
            <nav className={`pointer-events-auto w-full max-w-sm ${T.card} border ${T.line} flex justify-around py-2.5 px-2 rounded-full shadow-lg shadow-orange-500/10`}>
              {NAV.map(([key, Icon]) => (
                <button key={key as string} onClick={() => { setTab(key as string); if (key !== "me") setMeScreen("root"); if (key !== "roadmap") setOpenGoal(null); if (key !== "tools") setOpenTool(null); }}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-full transition-all ${tab === key ? "text-orange-600 bg-orange-100" : T.sub}`}>
                  <Icon size={20} />
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

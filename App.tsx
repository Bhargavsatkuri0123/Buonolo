import React, { useState, useMemo, useEffect } from "react";
import { Home, Map, Wrench, User, Users, Target, Bot } from "lucide-react";
import { api, ApiError, mapProfileFromApi, mapPostFromApi, mapGoalFromApi, mapStepToApi, ProfileDto } from "./src/api";
import { wsClient } from "./src/ws";

// Types & Constants
import { Profile, Post, Goal, Theme } from "./src/types";
import { LOCATIONS, SAF, DUMMY_FEED, TEMPLATE_HOST_INFO, GENERATE_DUMMY_FEED, DUMMY_PEOPLE } from "./src/constants";

// Components
import { AuthFlow } from "./src/components/AuthFlow";
import { MessengerModal } from "./src/components/MessengerModal";
import { HomeTab } from "./src/components/HomeTab";
import { RoadmapTab } from "./src/components/RoadmapTab";
import { BotTab } from "./src/components/BotTab";
import { PeanutLogo } from "./src/components/Header";
import { ToolsTab } from "./src/components/ToolsTab";
import { CommunityTab } from "./src/components/CommunityTab";
import { MeTab } from "./src/components/MeTab";

/* ─────────────────────────────  MEET PEANUT  ─────────────────────────────
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

const DEMO_EMAIL = "demo@meet-peanut.app";
const DEMO_PASSWORD = "MeetPeanutDemo!2026";

export default function MeetPeanutApp() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  const [feed, setFeed] = useState<Post[]>(DUMMY_FEED);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emergencyData, setEmergencyData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>(() => TEMPLATE_HOST_INFO("USA", "Berlin", "Germany").news);
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
  const [sharedPostData, setSharedPostData] = useState<any>(null);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [botMessages, setBotMessages] = useState<any[]>([
    { id: "b1", sender: "Peanut", text: "Hello! I am Peanut, your immigration assistant. Ask me anything!", time: "Now", isMe: false }
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
    bg: dark ? "bg-slate-950" : "bg-white",
    card: dark ? "bg-slate-900" : "bg-white",
    card2: dark ? "bg-slate-800" : "bg-slate-50",
    text: dark ? "text-slate-50" : "text-slate-900",
    sub: dark ? "text-slate-400" : "text-slate-500",
    line: dark ? "border-slate-800" : "border-slate-100",
    input: dark ? "bg-slate-800 text-slate-100 placeholder-slate-500" : "bg-white text-slate-900 placeholder-slate-400",
  }), [dark]);

  const [notifications, setNotifications] = useState<any[]>([]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { notifications: apiNotifs } = await api.notifications.list();
      setNotifications(apiNotifs.map((n: any) => ({
        id: n.id,
        title: n.title || (n.type === 'goal' ? 'Goal Update' : (n.type === 'system' ? 'System Notification' : 'Notification')),
        body: n.body,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: n.isRead,
        type: n.type
      })));
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return wsClient.subscribe('notification:new', () => { fetchNotifications(); });
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const { conversations } = await api.messages.conversations();
      const seeded = conversations.map((c: any) => ({
        id: c.lastMessage.id,
        threadId: c.counterpart.id,
        threadName: c.counterpart.fullName,
        sender: c.lastMessage.senderId === user.id ? "Me" : c.counterpart.fullName,
        text: c.lastMessage.content,
        time: new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: c.lastMessage.senderId === user.id,
        sharedPost: null,
        created_at: c.lastMessage.createdAt
      }));
      setDirectMessages(prev => {
        const withoutSeeded = prev.filter(m => m.isFake);
        return [...seeded, ...withoutSeeded];
      });
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  const fetchThread = async (otherUserId: string) => {
    if (!user) return;
    try {
      const { messages } = await api.messages.thread(otherUserId);
      const existingName = directMessages.find(m => m.threadId === otherUserId)?.threadName || otherUserId;
      const formatted = messages.map((m: any) => ({
        id: m.id,
        threadId: otherUserId,
        threadName: existingName,
        sender: m.senderId === user.id ? "Me" : existingName,
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === user.id,
        sharedPost: null,
        created_at: m.createdAt
      }));
      setDirectMessages(prev => [...prev.filter(m => m.threadId !== otherUserId), ...formatted]);
    } catch (e) {
      console.error("Failed to load thread", e);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (user && activeMessageThread) fetchThread(activeMessageThread);
  }, [activeMessageThread]);

  useEffect(() => {
    if (!user) return;
    return wsClient.subscribe('message:new', (payload: any) => {
      if (payload?.senderId === user.id || payload?.receiverId === user.id) {
        fetchConversations();
        const counterpartId = payload.senderId === user.id ? payload.receiverId : payload.senderId;
        if (activeMessageThread === counterpartId) fetchThread(counterpartId);
      }
    });
  }, [user, activeMessageThread]);

  const [showNotifs, setShowNotifs] = useState(false);

  const pushNotification = (title: string, body: string, type: string = "system") => {
    setNotifications(prev => [{ id: Date.now(), title, body, time: "Now", read: false, type }, ...prev]);
  };

  const fetchHostInfo = async (origin: string, newHost: string, newCity: string) => {
    setIsUpdatingHost(true);
    try {
      const fallbackData = TEMPLATE_HOST_INFO(origin, newCity, newHost);
      let data = fallbackData;
      
      try {
        const response = await fetch('/api/host-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, city: newCity, host: newHost })
        });
        if (response.ok) {
          const apiData = await response.json();
          // Merge API data with fallback data (to keep toolSections and goals)
          data = { ...fallbackData, ...apiData };
        }
      } catch (e) {
        console.error("Failed to fetch host info from API, using fallback", e);
      }
      
      if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
      if (data.emergency) setEmergencyData(data.emergency);
      if (data.news) setNewsData(data.news);
      if (data.communities) setCommunitiesData(data.communities);
      if (data.toolSections) setToolSectionsData(data.toolSections);
      if (data.goals) {
        const mappedGoals = data.goals.map((g: any, idx: number) => ({
          id: g.id || `g${Date.now()}_${idx}`,
          title: g.title,
          cat: g.cat,
          icon: Target,
          steps: g.steps
        }));
        setGoals(mappedGoals);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setIsUpdatingHost(false);
    }
  };

  const applySession = (apiProfile: ProfileDto) => {
    setUser({ id: apiProfile.id, email: apiProfile.email });
    if (!apiProfile.origin) {
      setProfile(null);
      setAuthScreen("setup");
      return;
    }
    const mapped = mapProfileFromApi(apiProfile);
    setProfile(mapped);
    fetchHostInfo(mapped.origin, mapped.host, mapped.city);
    fetchFeed(mapped.origin, mapped.city, mapped.host);
    fetchGoals();
    fetchGroups();
    fetchEvents();
    fetchNotifications();
    wsClient.connect(async () => api.getAccessToken());
  };

  const fetchFeed = async (origin?: string, city?: string, host?: string) => {
    if (!user) return;
    const o = origin || profile?.origin || "USA";
    const c = city || profile?.city || "Berlin";
    const h = host || profile?.host || "Germany";

    try {
      const [{ posts }, { users: followingUsers }] = await Promise.all([
        api.posts.list({}),
        api.users.following()
      ]);
      const followingIds = new Set(followingUsers.map((u: any) => u.id));
      const mappedPosts = posts.map((p: any) => ({ ...mapPostFromApi(p), following: followingIds.has(p.author?.id) }));

      if (mappedPosts.length > 0) {
        setFeed(mappedPosts);
      } else {
        setFeed(GENERATE_DUMMY_FEED(o, c, h));
      }
    } catch (e) {
      console.error("Failed to load feed", e);
      setFeed(GENERATE_DUMMY_FEED(o, c, h));
    }
  };

  const fetchGoals = async () => {
    try {
      const { goals: apiGoals } = await api.goals.list();
      if (apiGoals.length > 0) {
        setGoals(apiGoals.map((g: any) => ({ ...mapGoalFromApi(g), icon: Target })));
        return;
      }
      const { templates } = await api.content.goalTemplates();
      const tpl = templates[0];
      if (tpl) {
        const { goal } = await api.goals.fromTemplate(tpl.id);
        setGoals([{ ...mapGoalFromApi(goal), icon: Target }]);
      }
    } catch (e) {
      console.error("Failed to load goals", e);
    }
  };

  const fetchGroups = async () => {
    try {
      const { groups } = await api.groups.list();
      setCommunitiesData(groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        emoji: g.emoji || "🏘️",
        members: g.membersCount || 0,
        joined: !!g.joined
      })));
    } catch (e) {
      console.error("Failed to load groups", e);
    }
  };

  const fetchEvents = async () => {
    try {
      await api.events.list();
      // Live events are fetched and rendered directly inside CommunityTab.
    } catch (e) {
      console.error("Failed to load events", e);
    }
  };

  useEffect(() => {
    (async () => {
      const restored = await api.auth.refresh();
      if (!restored) {
        setUser(null);
        return;
      }
      try {
        const { profile: apiProfile } = await api.auth.me();
        applySession(apiProfile);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      wsClient.subscribe('post:new', () => fetchFeed()),
      wsClient.subscribe('post:deleted', () => fetchFeed()),
      wsClient.subscribe('comment:new', () => fetchFeed()),
      wsClient.subscribe('reaction:new', () => fetchFeed()),
      wsClient.subscribe('group:update', () => fetchGroups()),
      wsClient.subscribe('invite:new', () => fetchNotifications()),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  const handleToggleStep = async (goalId: string, stepIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const targetStep = goal.steps[stepIndex];
    if (!targetStep) return;

    const newDone = !targetStep.done;

    // Optimistic UI update
    setGoals(gs => gs.map(g => g.id !== goalId ? g : {
      ...g,
      steps: g.steps.map((s, idx) => idx === stepIndex ? { ...s, done: newDone } : s)
    }));

    if (user && (targetStep as any).id) {
      try {
        await api.goals.updateStep(goalId, (targetStep as any).id, { done: newDone });
      } catch (e) {
        console.error("Failed to update step", e);
      }
    }
  };

  const handleAddGoal = async (tpl: any) => {
    setShowTemplates(false);
    const initialSteps = [
      { t: "Understand the requirements", d: "Open the linked tool to see the full checklist for your situation and nationality.", done: false, tool: "Registration" },
      { t: "Gather what you need", d: "Collect documents, translations and fees before booking anything — it prevents repeat visits.", done: false, tool: "Visas & Permits" },
      { t: "Take the first official step", d: "Book the appointment / enrol / apply. Meet Peanut will remind you of deadlines.", done: false, tool: "Taxes & ID" },
      { t: "Complete & verify", d: "Confirm you received the certificate, card or confirmation — and save a copy in your documents.", done: false, tool: "Banking" },
    ];

    if (user) {
      try {
        await api.goals.create({
          title: tpl.title,
          category: tpl.cat || "General",
          steps: initialSteps.map(mapStepToApi)
        });
        await fetchGoals();
        return;
      } catch (e) {
        console.error("Failed to create goal", e);
      }
    }

    setGoals(gs => [...gs, {
      id: "g" + Date.now(),
      title: tpl.title,
      cat: tpl.cat,
      icon: tpl.icon || Target,
      steps: initialSteps
    }]);
  };

  const handleAddCustomGoal = async (customTitle: string) => {
    if (!customTitle.trim()) return;
    const initialSteps = [
      { t: "First step", d: "Break down your goal into smaller milestones.", done: false, tool: "Tasks" }
    ];

    if (user) {
      try {
        await api.goals.create({
          title: customTitle.trim(),
          category: "Custom",
          steps: initialSteps.map(mapStepToApi)
        });
        await fetchGoals();
        return;
      } catch (e) {
        console.error("Failed to create goal", e);
      }
    }

    setGoals(gs => [...gs, {
      id: "g" + Date.now(),
      title: customTitle.trim(),
      cat: "Custom",
      icon: Target,
      steps: initialSteps
    }]);
  };

  const handleAddTask = async (goalId: string, taskTitle: string) => {
    if (!taskTitle.trim()) return;
    const newStep = { t: taskTitle.trim(), d: "Custom task", done: false, tool: "Tasks" };

    // Optimistic UI update
    setGoals(gs => gs.map(g => g.id !== goalId ? g : {
      ...g,
      steps: [...g.steps, newStep]
    }));

    if (user) {
      try {
        await api.goals.addStep(goalId, mapStepToApi(newStep));
        await fetchGoals();
      } catch (e) {
        console.error("Failed to add task", e);
      }
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(gs => gs.filter(g => g.id !== goalId));
    setOpenGoal(null);

    if (user) {
      try {
        await api.goals.remove(goalId);
      } catch (e) {
        console.error("Failed to delete goal", e);
      }
    }
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    try {
      let session;
      try {
        session = await api.auth.register(DEMO_EMAIL, DEMO_PASSWORD, "Demo User");
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          session = await api.auth.login(DEMO_EMAIL, DEMO_PASSWORD);
        } else {
          throw err;
        }
      }
      api.setSession(session);
      applySession(session.profile);
    } catch (err: any) {
      setToastError(err.message || "Demo login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setAuthLoading(true);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const g = (window as any).google;
    if (!clientId || !g?.accounts?.id) {
      setToastError("Google sign-in isn't configured.");
      setAuthLoading(false);
      return;
    }
    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const session = await api.auth.google(response.credential);
          api.setSession(session);
          applySession(session.profile);
        } catch (err: any) {
          setToastError(err.message || "Google sign-in failed");
        } finally {
          setAuthLoading(false);
        }
      }
    });
    g.accounts.id.prompt();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const session = await api.auth.login(authEmail, authPassword);
      api.setSession(session);
      applySession(session.profile);
    } catch (err: any) {
      setToastError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const session = await api.auth.register(authEmail, authPassword, authName);
      api.setSession(session);
      applySession(session.profile);
    } catch (err: any) {
      setToastError(err.message || "Registration failed");
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

    const finalHost = host === "Other" ? customHost : host;
    const finalCity = city === "Other" ? customCity : city;
    const bio = `Moving for ${situation}. Currently focused on ${focus}.`;

    try {
      const { profile: updated } = await api.users.updateMe({
        fullName: name,
        origin,
        host: finalHost,
        city: finalCity,
        bio
      });
      setProfile(mapProfileFromApi(updated));
      fetchHostInfo(origin, finalHost, finalCity);
      fetchFeed(origin, finalCity, finalHost);
      fetchGroups();
      fetchEvents();

      // Auto-create initial goal based on focus
      try {
        await api.goals.create({
          title: focus && focus !== "General" ? `Start with ${focus}` : "Settle into your new city",
          category: focus === "Anmeldung" ? "Documentation" : focus === "Housing" ? "Housing" : "General",
          steps: [
            {
              text: `Research ${focus || 'city registration'} in ${finalCity}`,
              description: `Check official requirements, needed documents, and book an appointment in ${finalCity}.`,
              tool: "Registration"
            },
            {
              text: `Set up local bank and tax ID`,
              description: `Prepare passport and proof of residence.`,
              tool: "Banking"
            }
          ]
        });
        await fetchGoals();
      } catch (e) {
        console.error("Failed to create initial goal", e);
      }
      setAuthScreen("");
    } catch (err: any) {
      setToastError(err.message || "Could not save profile");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      /* ignore */
    }
    api.clearSession();
    wsClient.disconnect();
    setUser(null);
    setProfile(null);
    setAuthScreen("intro");
    setTab("home");
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const isLiked = post.liked;

    setFeed(f => f.map(p => {
      if (p.id === post.id) {
        return { ...p, liked: !isLiked, myReaction: undefined, likes: isLiked ? p.likes - 1 : (p.myReaction ? p.likes : p.likes + 1) };
      }
      return p;
    }));

    try {
      if (isLiked) await api.posts.unreact(post.id);
      else await api.posts.react(post.id, "👍");
    } catch (e) {
      console.error("Failed to update reaction", e);
    }
  };

  const toggleSave = async (id: string) => {
    if (!user) return;
    const post = feed.find(p => p.id === id);
    setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    try {
      if (post?.saved) await api.posts.unsave(id);
      else await api.posts.save(id);
    } catch (e) {
      console.error("Failed to update saved post", e);
    }
  };

  const toggleFollow = async (id: string) => {
    if (!user) return;
    const post = feed.find(p => p.id === id);
    if (!post || !(post as any).author_id) return;

    setFeed(f => f.map(p => ((p as any).author_id === (post as any).author_id || p.name === post.name) ? { ...p, following: !p.following } : p));

    try {
      if (post.following) await api.users.unfollow((post as any).author_id);
      else await api.users.follow((post as any).author_id);
    } catch (e) {
      console.error("Failed to update follow", e);
    }
  };

  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
    try {
      await api.posts.remove(id);
    } catch (e) {
      console.error("Failed to delete post", e);
    }
  };

  const addReaction = async (id: string, emoji: string) => {
    if (!user) return;
    setFeed(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          myReaction: emoji,
          liked: true,
          likes: p.myReaction || p.liked ? p.likes : p.likes + 1
        };
      }
      return p;
    }));

    try {
      await api.posts.react(id, emoji);
    } catch (e) {
      console.error("Failed to add reaction", e);
    }
  };

  const handleShareToMessenger = (post: Post) => {
    setSharedPostData({ name: post.name, text: post.text });
    setMessageText(`Check out this post: "${post.text.substring(0, 60)}..."`);
    setMessengerOpen(true);
    setActiveMessageThread(null);
  };

  const handleShareGroupToMessenger = (group: any, targetThreadId?: string, targetThreadName?: string) => {
    const inviteContent = {
      name: group.name,
      text: `Join the "${group.name}" community on Meet Peanut! ${group.desc || ''}`,
      emoji: group.emoji || "🏘️",
      isGroupInvite: true,
      groupId: group.id
    };

    if (targetThreadId) {
      const threadName = targetThreadName || directMessages.find(m => m.threadId === targetThreadId)?.threadName || targetThreadId;
      const newMsg = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        threadId: targetThreadId,
        threadName: threadName,
        sender: "Me",
        text: `Hey! I'd love for you to join our community "${group.name}". Check it out!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        sharedPost: inviteContent,
        created_at: new Date().toISOString()
      };

      setDirectMessages(prev => {
        const filtered = prev.filter(m => !(m.threadId === targetThreadId && m.isFake));
        const updated = [...filtered, newMsg];
        try {
          localStorage.setItem(`meet-peanut_dm_${user?.id || 'default'}`, JSON.stringify(updated.filter(m => !m.isFake)));
        } catch {}
        return updated;
      });

      setTimeout(() => {
        const replyMsg = {
          id: "reply-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          threadId: targetThreadId,
          threadName: threadName,
          sender: threadName,
          text: `Thanks for inviting me to ${group.name}! 🎉 I'm joining right now.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          sharedPost: null,
          created_at: new Date().toISOString()
        };
        setDirectMessages(prev => {
          const updated = [...prev, replyMsg];
          try {
            localStorage.setItem(`meet-peanut_dm_${user?.id || 'default'}`, JSON.stringify(updated.filter(m => !m.isFake)));
          } catch {}
          return updated;
        });
        pushNotification(`${threadName} replied to your invite`, `Thanks for inviting me to ${group.name}!`, "message");
      }, 1400);

      return true;
    } else {
      setSharedPostData(inviteContent);
      setMessageText(`Hey! Check out this community: "${group.name}". Join here!`);
      setMessengerOpen(true);
      setActiveMessageThread(null);
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeMessageThread || !user) return;
    const msgText = messageText.trim();
    setMessageText("");
    
    const otherUserId = activeMessageThread;
    
    // Resolve target thread name
    const existingThread = directMessages.find(m => m.threadId === otherUserId && m.threadName);
    const threadName = existingThread?.threadName || otherUserId;
    
    const newMsg = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      threadId: otherUserId,
      threadName: threadName,
      sender: "Me",
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      sharedPost: sharedPostData || null,
      created_at: new Date().toISOString()
    };
    
    setSharedPostData(null);
    
    // Optimistically update React state and LocalStorage
    setDirectMessages(prev => {
      const filtered = prev.filter(m => !(m.threadId === otherUserId && m.isFake));
      const updated = [...filtered, newMsg];
      try {
        localStorage.setItem(`meet-peanut_dm_${user.id}`, JSON.stringify(updated.filter(m => !m.isFake)));
      } catch {}
      return updated;
    });

    try {
      await api.messages.send(otherUserId, msgText);
    } catch (err) {
      setToastError("Message failed to send.");
    }

    // Interactive realistic simulated responses from community contacts
    const simulatedReplies: Record<string, string[]> = {
      "Sarah Miller": [
        "Hey! Thanks for reaching out! How has your move to the city been going?",
        "Hi there! Berlin has been wonderful. Let me know if you need any tips on registration appointments or good bakeries!",
        "Great to hear from you! Would love to meet up for a coffee at Central Cafe sometime."
      ],
      "Ahmed Khan": [
        "Hello! Welcome to the community! How are things going with your paperwork?",
        "Hey! If you need any tips with tax forms or finding a tech meetup, happy to help!",
        "Glad you reached out! Hope your first few weeks here have been smooth."
      ],
      "Elena Rossi": [
        "Ciao! Nice to connect with you! Which neighborhood are you staying in?",
        "Hello! Hope you're enjoying the city so far. Let me know if you need any local food recommendations!",
        "Hey! Always happy to connect with fellow expats. Let's catch up soon!"
      ],
      "Carlos Ramos": [
        "¡Hola! Great to connect. Welcome to the neighborhood! Let me know if you need any pointers around here.",
        "Hey neighbor! Feel free to ask if you need help finding anything locally around Mitte or Prenzlauer Berg!"
      ],
      "Ananya Sharma": [
        "Hi! Wonderful to meet you. Hope you're settling in nicely!",
        "Hello! Great to connect on Meet Peanut. Let me know if you'd like to join our upcoming weekend meetup!"
      ],
      "Liam Vance": [
        "Hey mate! Welcome to town. Always good to meet newcomers around here!",
        "Hi! How are you finding everything so far? The local expat community is really welcoming."
      ]
    };

    if (simulatedReplies[threadName]) {
      setTimeout(() => {
        const pool = simulatedReplies[threadName];
        const replyText = pool[Math.floor(Math.random() * pool.length)];
        const replyMsg = {
          id: "reply-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          threadId: otherUserId,
          threadName: threadName,
          sender: threadName,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          sharedPost: null,
          created_at: new Date().toISOString()
        };

        setDirectMessages(prev => {
          const updated = [...prev, replyMsg];
          try {
            localStorage.setItem(`meet-peanut_dm_${user.id}`, JSON.stringify(updated.filter(m => !m.isFake)));
          } catch {}
          return updated;
        });

        pushNotification(`${threadName} sent a message`, replyText, "message");
      }, 1200);
    }
  };

  const handleBotMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessage = { id: "bm-" + Date.now(), sender: "Me", text, time: "Just now", isMe: true };
    const currentMessages = [...botMessages, newMessage];
    
    setBotMessages(currentMessages);
    setBotLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.filter(m => m.id !== "b1"), // don't send the first hardcoded message as it doesn't fit standard pattern easily or just send it if we want
          userOrigin: profile?.origin,
          userHost: profile?.host,
          userCity: profile?.city,
          activeTab: tab,
          appContext: {
            goals: goals,
            notifications: notifications,
            activeCommunities: communitiesData.filter((c: any) => c.joined)
          }
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Peanut", text: data.text, time: "Now", isMe: false }]);
    } catch (error) {
      console.error("Chat error:", error);
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Peanut", text: "Sorry, I am having trouble connecting to the server.", time: "Now", isMe: false }]);
    } finally {
      setBotLoading(false);
    }
  };

  const NavPeanut = (props: any) => <PeanutLogo {...props} monochrome />;
  const NAV = [["home", Home, "Home"], ["community", Users, "Community"], ["bot", NavPeanut, "Ask Peanut"], ["tools", Wrench, "Tools"], ["me", User, "Me"]];

  return (
    <div className={`min-h-screen ${T.bg} bodyf transition-colors duration-300 no-scrollbar`}>
      {FONT}
      {user === undefined ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        </div>
      ) : (user === null || !profile) ? (
        <AuthFlow 
          authScreen={authScreen} setAuthScreen={setAuthScreen} authEmail={authEmail} setAuthEmail={setAuthEmail} 
          authPassword={authPassword} setAuthPassword={setAuthPassword} authName={authName} setAuthName={setAuthName} 
          authOrigin={authOrigin} setAuthOrigin={setAuthOrigin} authHost={authHost} setAuthHost={setAuthHost} 
          authCity={authCity} setAuthCity={setAuthCity} 
          authCustomHost={authCustomHost} setAuthCustomHost={setAuthCustomHost}
          authCustomCity={authCustomCity} setAuthCustomCity={setAuthCustomCity}
          authSituation={authSituation} setAuthSituation={setAuthSituation}
          authFocus={authFocus} setAuthFocus={setAuthFocus}
          authLoading={authLoading} handleGoogleLogin={handleGoogleLogin} 
          handleEmailLogin={handleEmailLogin} handleEmailRegister={handleEmailRegister} 
          handleDemoLogin={handleDemoLogin} handleSetupSave={handleSetupSave} 
          toastError={toastError} T={T} 
        />
      ) : (
        <div className={`max-w-md mx-auto min-h-screen relative shadow-2xl ${T.bg} overflow-x-hidden`}>
          {tab === "home" && (
            <HomeTab 
              profile={profile!} welcomeMessage={welcomeMessage} setTab={setTab} feed={feed} user={user} T={T} 
              activeComments={activeComments} setActiveComments={setActiveComments} activeReactions={activeReactions} setActiveReactions={setActiveReactions} 
              activeShare={activeShare} setActiveShare={setActiveShare} activeOptions={activeOptions} setActiveOptions={setActiveOptions} 
              isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} setMessengerOpen={setMessengerOpen} onPosted={fetchFeed}
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
              user={user}
              onToggleStep={handleToggleStep}
              onAddGoal={handleAddGoal}
              onAddCustomGoal={handleAddCustomGoal}
              onAddTask={handleAddTask}
              onDeleteGoal={handleDeleteGoal}
            />
          )}
          {tab === "community" && (
            <CommunityTab 
              communitiesData={communitiesData} 
              activeCommunityTab={activeCommunityTab} 
              setActiveCommunityTab={setActiveCommunityTab} 
              profile={profile!} 
              user={user}
              T={T} 
              onRefreshGroups={fetchGroups}
              onShareGroupToMessenger={handleShareGroupToMessenger}
              directMessages={directMessages}
              onStartChat={async (id, name) => {
                setActiveMessageThread(id);
                setMessengerOpen(true);
                let threadName = name;
                if (!threadName) {
                  try {
                    const { profile: other } = await api.users.get(id);
                    if (other?.name) threadName = other.name;
                  } catch {}
                }
                if (!threadName) {
                  const found = DUMMY_PEOPLE.find(p => p.id === id || p.name === id);
                  threadName = found?.name || id;
                }
                setDirectMessages(prev => {
                  if (prev.some(m => m.threadId === id)) return prev;
                  return [...prev, { id: 'temp-' + id, threadId: id, threadName: threadName || id, isFake: true, text: '' }];
                });
              }}
            />
          )}
          {tab === "tools" && <ToolsTab openTool={openTool} setOpenTool={setOpenTool} toolSectionsData={toolSectionsData} profile={profile!} emergencyData={emergencyData} T={T} setGoals={setGoals} setTab={setTab} user={user} />}
          {tab === "bot" && <BotTab setTab={setTab} profile={profile!} T={T} messages={botMessages} onSend={handleBotMessage} loading={botLoading} />}
          {tab === "me" && (
            <MeTab 
              meScreen={meScreen} setMeScreen={setMeScreen} profile={profile!} setProfile={setProfile as any} feed={feed} 
              newsData={newsData} newsIdx={newsIdx} setNewsIdx={setNewsIdx} newsMode={newsMode} setNewsMode={setNewsMode} 
              dark={dark} setDark={setDark} lang={lang} setLang={setLang} notif={notif} setNotif={setNotif as any} 
              settingsSubScreen={settingsSubScreen} setSettingsSubScreen={setSettingsSubScreen} 
              handleLogout={handleLogout} fetchHostInfo={fetchHostInfo} isUpdatingHost={isUpdatingHost} 
              setToastError={setToastError} communitiesData={communitiesData} T={T} toggleSave={toggleSave}
              user={user}
            />
          )}
          
          <MessengerModal 
            isOpen={messengerOpen} onClose={() => setMessengerOpen(false)} activeMessageThread={activeMessageThread} 
            setActiveMessageThread={setActiveMessageThread} messageText={messageText} setMessageText={setMessageText} 
            handleSendMessage={handleSendMessage} directMessages={directMessages} T={T} 
          />

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

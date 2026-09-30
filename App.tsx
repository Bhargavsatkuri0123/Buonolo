import React, { useState, useMemo, useEffect } from "react";
import { Home, Map, Wrench, User, Users, Target, Bot } from "lucide-react";
import { api, mapGoalFromApi, mapPostFromApi, mapProfileFromApi } from "./src/api";
import { wsClient } from "./src/ws";

// Types & Constants
import { Profile, Post, Goal, Theme, LocationProfile, LocationPreferences } from "./src/types";
import { 
  LOCATIONS, SAF, DUMMY_FEED, TEMPLATE_HOST_INFO, GENERATE_DUMMY_FEED, 
  DUMMY_PEOPLE, GENERATE_DUMMY_COMMUNITIES, GENERATE_GOAL_TEMPLATES 
} from "./src/constants";

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
import { LandingPage } from "./src/components/LandingPage";
import { DesktopNavbar } from "./src/components/DesktopNavbar";

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

const isUuid = (val: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

const DEFAULT_PROFILE: Profile = {
  id: "demo-profile",
  name: "Alex Rivera",
  full_name: "Alex Rivera",
  handle: "@alexrivera",
  origin: "USA",
  origin_country: "USA",
  host: "Germany",
  host_country: "Germany",
  city: "Berlin",
  host_city: "Berlin",
  followers: 128,
  following: 84,
  bio: "Software designer & expat exploring Berlin. Coffee enthusiast & weekend hiker.",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  languages: ["English", "German (A2)"],
  situation: "Working Abroad",
  focus: "Settling in & Community",
};

const SEED_DIRECT_MESSAGES = [{
  id: "seed-msg-1",
  threadId: "p1",
  threadName: "Sarah Miller",
  sender: "Sarah Miller",
  text: "Hey! Welcome to the city. Let me know if you need any pointers on getting registered or finding a place!",
  time: "Yesterday",
  isMe: false,
  sharedPost: null,
  created_at: new Date(Date.now() - 86400000).toISOString(),
}];

export default function MeetPeanutApp() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  const [feed, setFeed] = useState<Post[]>(DUMMY_FEED);
  const [goals, setGoals] = useState<Goal[]>(() => GENERATE_GOAL_TEMPLATES("USA", "Berlin", "Germany").map((goal: any) => ({
    id: goal.id,
    title: goal.title,
    cat: goal.cat,
    icon: Target,
    steps: goal.steps,
  })));
  const [profile, setProfile] = useState<Profile | null>(DEFAULT_PROFILE);
  const [emergencyData, setEmergencyData] = useState<any[]>(() => TEMPLATE_HOST_INFO("USA", "Berlin", "Germany").emergency);
  const [newsData, setNewsData] = useState<any[]>(() => TEMPLATE_HOST_INFO("USA", "Berlin", "Germany").news);
  const [communitiesData, setCommunitiesData] = useState<any[]>(() => GENERATE_DUMMY_COMMUNITIES("USA", "Berlin", "Germany"));
  const [toolSectionsData, setToolSectionsData] = useState<any[]>(() => TEMPLATE_HOST_INFO("USA", "Berlin", "Germany").toolSections);
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
  const [directMessages, setDirectMessages] = useState<any[]>(SEED_DIRECT_MESSAGES);
  const [botMessages, setBotMessages] = useState<any[]>([
    { id: "b1", sender: "Peanut", text: "Hello! I am Peanut, your immigration assistant. Ask me anything!", time: "Now", isMe: false }
  ]);
  const [botLoading, setBotLoading] = useState(false);

  const [user, setUser] = useState<any>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [showLanding, setShowLanding] = useState(false);

  const T: Theme = useMemo(() => {
    // Sync document background with theme
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = dark ? '#000000' : '#ffffff';
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return {
      bg: dark ? "bg-black" : "bg-white",
      card: dark ? "bg-neutral-900" : "bg-white",
      card2: dark ? "bg-neutral-800" : "bg-slate-50",
      text: dark ? "text-white" : "text-slate-900",
      sub: dark ? "text-neutral-400" : "text-slate-500",
      line: dark ? "border-neutral-800" : "border-slate-100",
      input: dark ? "bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500" : "bg-white text-slate-900 placeholder-slate-400",
    };
  }, [dark]);

  const [notifications, setNotifications] = useState<any[]>([]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { notifications: items } = await api.notifications.list();
      setNotifications(items.map((n: any) => ({
        id: n.id,
        title: n.title || (n.type === "goal" ? "Goal Update" : "Notification"),
        body: n.body,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: n.isRead,
        type: n.type,
      })));
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return wsClient.subscribe("notification:new", fetchNotifications);
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    // 1. Load locally stored messages first
    let localMsgs: any[] = [];
    try {
      const stored = localStorage.getItem(`meet-peanut_dm_${user.id}`);
      if (stored) {
        localMsgs = JSON.parse(stored);
      }
    } catch {
      localMsgs = [];
    }

    try {
      const { conversations } = await api.messages.conversations();
      const remoteFormatted = (await Promise.all(conversations.map(async (conversation: any) => {
        const counterpart = conversation.counterpart;
        const { messages } = await api.messages.thread(counterpart.id);
        return messages.map((message: any) => ({
          id: message.id,
          threadId: counterpart.id,
          threadName: counterpart.fullName,
          sender: message.senderId === user.id ? "Me" : counterpart.fullName,
          text: message.content,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: message.senderId === user.id,
          sharedPost: null,
          created_at: message.createdAt,
        }));
      }))).flat();

      // Merge remote messages and local messages
      const existingIds = new Set(remoteFormatted.map(m => m.id));
      const combined = [...remoteFormatted];
      localMsgs.forEach(lm => {
        if (!existingIds.has(lm.id)) {
          combined.push(lm);
        }
      });
      combined.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      setDirectMessages(combined);
    } catch {
      setDirectMessages(localMsgs);
    }
  };

  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return wsClient.subscribe("message:new", fetchMessages);
  }, [user]);

  const [showNotifs, setShowNotifs] = useState(false);

  const [locationProfiles, setLocationProfiles] = useState<LocationProfile[]>([
    {
      id: "loc_primary",
      origin: "USA",
      host: "Germany",
      city: "Berlin",
      label: "Berlin, Germany",
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);

  const [locationPrefs, setLocationPrefs] = useState<LocationPreferences>({
    blendCommunities: true,
    blendFeed: true,
    keepFriends: true,
    roadmapAction: "fresh",
    newsScope: "new_only",
    servicesCitySync: true
  });

  const pushNotification = async (title: string, body: string, type: string = "system") => {
    const newNotif = { id: Date.now(), title, body, time: "Now", read: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    if (user) {
      try {
        await api.notifications.create({ title, body, type });
      } catch (error) {
        console.error("Failed to save notification", error);
      }
    }
  };

  const fetchHostInfo = async (origin: string, newHost: string, newCity: string) => {
    setIsUpdatingHost(true);
    try {
      const fallbackData = TEMPLATE_HOST_INFO(origin, newCity, newHost);
      let data = fallbackData;
      
      try {
        const { hostInfo } = await api.content.hostInfo({ host: newHost, city: newCity, origin });
        if (hostInfo) data = { ...fallbackData, ...hostInfo };
      } catch (e) {
        console.error("Failed to fetch host info from API, using fallback", e);
      }
      
      if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
      if (data.emergency) setEmergencyData(data.emergency);
      if (data.news) setNewsData(data.news);
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

  const applyLocationChange = async (newOrigin: string, newHost: string, newCity: string) => {
    setIsUpdatingHost(true);
    try {
      // 1. Maintain Location Profiles (saved under Edit Profile)
      setLocationProfiles(prevProfiles => {
        const deactivated = prevProfiles.map(p => ({ ...p, isActive: false }));
        const existingIdx = deactivated.findIndex(
          p => p.city.toLowerCase() === newCity.toLowerCase() && p.host.toLowerCase() === newHost.toLowerCase()
        );

        if (existingIdx !== -1) {
          deactivated[existingIdx] = {
            ...deactivated[existingIdx],
            origin: newOrigin,
            isActive: true
          };
          return [...deactivated];
        } else {
          const newProf: LocationProfile = {
            id: `loc_${Date.now()}`,
            origin: newOrigin,
            host: newHost,
            city: newCity,
            label: `${newCity}, ${newHost}`,
            createdAt: new Date().toISOString(),
            isActive: true
          };
          return [...deactivated, newProf];
        }
      });

      // 2. Fetch full host info (which updates emergency numbers, news, tools, welcome message)
      await fetchHostInfo(newOrigin, newHost, newCity);
      setNewsIdx(0);
      // 3. Refresh persisted social data; it is not generated from location.
      await Promise.all([fetchFeed(), fetchGroups(), fetchEvents()]);

      // 4. Update the profile in Postgres
      if (profile) {
        const updated = {
          ...profile,
          origin: newOrigin,
          host: newHost,
          city: newCity
        };
        setProfile(updated);

        if (user) {
          await api.users.updateMe({ origin: newOrigin, host: newHost, city: newCity });
        }
      }

      const freshTemplates = GENERATE_GOAL_TEMPLATES(newOrigin, newCity, newHost);
      if (locationPrefs.roadmapAction === "fresh" || locationPrefs.roadmapAction === "merge") {
        if (locationPrefs.roadmapAction === "fresh") await api.goals.removeAll();
        await Promise.all(freshTemplates.map((goal: any) => api.goals.create({
          title: goal.title,
          category: goal.cat || "General",
          iconName: goal.iconName || "Target",
          steps: (goal.steps || []).map((step: any) => ({ text: step.t, description: step.d, tool: step.tool, links: step.links })),
        })));
        await fetchGoals();
      }

      pushNotification(
        `Welcome to ${newCity}, ${newHost}!`,
        `Local news, emergency numbers, tools, services directory, and transit guides have been updated for ${newCity}.`
      );

      return { success: true };
    } catch (e: any) {
      console.error("Failed to apply location change:", e);
      return { success: false, error: e.message };
    } finally {
      setIsUpdatingHost(false);
    }
  };

  const handleUserChange = async (currentProfile: any | null) => {
    if (!currentProfile) {
      api.clearSession();
      setUser(null);
      setProfile(null);
      setShowLanding(true);
      return;
    }

    const mapped = mapProfileFromApi(currentProfile);
    const nextProfile = {
      ...mapped,
      full_name: mapped.name,
      origin_country: mapped.origin,
      host_country: mapped.host,
      host_city: mapped.city,
      avatar_url: currentProfile.avatarUrl || "",
      languages: currentProfile.languages || [],
      situation: currentProfile.situation || "",
      focus: currentProfile.focus || "",
    };
    setUser({ id: mapped.id, email: mapped.email, user_metadata: { full_name: mapped.name } });
    setProfile(nextProfile);
    setShowLanding(false);
    setShowAuthModal(false);
    setLocationProfiles((previous) => {
      const exists = previous.some((item) => item.city.toLowerCase() === mapped.city.toLowerCase() && item.host.toLowerCase() === mapped.host.toLowerCase());
      if (exists) return previous.map((item) => ({ ...item, isActive: item.city === mapped.city && item.host === mapped.host }));
      return [...previous.map((item) => ({ ...item, isActive: false })), {
        id: `loc_${mapped.id}`,
        origin: mapped.origin,
        host: mapped.host,
        city: mapped.city,
        label: `${mapped.city}, ${mapped.host}`,
        createdAt: new Date().toISOString(),
        isActive: true,
      }];
    });
    await fetchHostInfo(mapped.origin, mapped.host, mapped.city);
    await fetchFeed();
    await fetchGoals();
    await fetchGroups();
  };

  const fetchFeed = async () => {
    try {
      const [{ posts }, { users: followingUsers }] = await Promise.all([
        api.posts.list(),
        api.users.following(),
      ]);
      const followingIds = new Set(followingUsers.map((following: any) => following.id));
      setFeed(posts.map((post: any) => ({ ...mapPostFromApi(post), following: followingIds.has(post.author?.id) })));
    } catch (error) {
      console.error("Failed to load feed", error);
      setFeed([]);
    }
  };

  const fetchGoals = async () => {
    try {
      const { goals: apiGoals } = await api.goals.list();
      if (!apiGoals.length) {
        await api.goals.create({
          title: "Settle into your new city",
          category: "Documentation",
          steps: [
            { text: "City Registration (Anmeldung)", description: "Book an appointment at the local Bürgeramt.", tool: "Registration" },
            { text: "Open a Local Bank Account", description: "Prepare passport and proof of residence.", tool: "Banking" },
            { text: "Health Insurance Setup", description: "Confirm your statutory or private coverage certificate.", tool: "Insurance" },
          ],
        });
        return fetchGoals();
      }
      setGoals(apiGoals.map((goal: any) => ({ ...mapGoalFromApi(goal), icon: Target })));
    } catch (error) {
      console.error("Failed to load goals", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { groups } = await api.groups.list();
      setCommunitiesData(groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        desc: group.description,
        emoji: group.emoji || "🏘️",
        members: group.membersCount || 0,
        joined: !!group.joined,
      })));
    } catch (error) {
      console.error("Failed to load groups", error);
    }
  };

  const fetchEvents = async () => {
    try {
      await api.events.list();
    } catch (error) {
      console.error("Failed to load events", error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      if (!(await api.auth.refresh())) {
        api.clearSession();
        if (!cancelled) setUser(null);
        return;
      }
      try {
        const { profile: currentProfile } = await api.auth.me();
        if (!cancelled) await handleUserChange(currentProfile);
      } catch {
        api.clearSession();
        if (!cancelled) setUser(null);
      }
    };
    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) {
      wsClient.disconnect();
      return;
    }
    wsClient.connect(async () => api.getAccessToken() || ((await api.auth.refresh()) ? api.getAccessToken() : null));
    const unsubscribers = [
      wsClient.subscribe("post:new", fetchFeed),
      wsClient.subscribe("post:deleted", fetchFeed),
      wsClient.subscribe("comment:new", fetchFeed),
      wsClient.subscribe("reaction:new", fetchFeed),
      wsClient.subscribe("group:update", fetchGroups),
    ];
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      wsClient.disconnect();
    };
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
      await api.goals.updateStep(goalId, (targetStep as any).id, { done: newDone });
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
      await api.goals.create({
        title: tpl.title,
        category: tpl.cat || "General",
        iconName: tpl.iconName || "Target",
        steps: initialSteps.map((step) => ({ text: step.t, description: step.d, tool: step.tool })),
      });
      await fetchGoals();
      return;
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
      await api.goals.create({
        title: customTitle.trim(),
        category: "Custom",
        steps: initialSteps.map((step) => ({ text: step.t, description: step.d, tool: step.tool })),
      });
      await fetchGoals();
      return;
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
      await api.goals.addStep(goalId, { text: newStep.t, description: newStep.d, tool: newStep.tool });
      await fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(gs => gs.filter(g => g.id !== goalId));
    setOpenGoal(null);

    if (user) {
      await api.goals.remove(goalId);
    }
  };

  const handleGoogleLogin = () => {
    setAuthLoading(true);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const google = (window as any).google;
    if (!clientId || !google?.accounts?.id) {
      setToastError("Google sign-in isn't configured.");
      setAuthLoading(false);
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const session = await api.auth.google(response.credential);
          api.setSession(session);
          await handleUserChange(session.profile);
          if (session.isNewUser) {
            setAuthName(session.profile.name);
            setAuthScreen("setup");
            setShowAuthModal(true);
          } else {
            setShowAuthModal(false);
          }
          setShowLanding(false);
        } catch (error: any) {
          setToastError(error.message || "Google sign-in failed");
        } finally {
          setAuthLoading(false);
        }
      },
    });
    google.accounts.id.prompt();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const session = await api.auth.login(authEmail, authPassword);
      api.setSession(session);
      await handleUserChange(session.profile);
      setShowAuthModal(false);
      setShowLanding(false);
    } catch (error: any) {
      setToastError(error.message || "Login failed");
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
      await handleUserChange(session.profile);
      setAuthScreen("setup");
      setShowAuthModal(true);
    } catch (error: any) {
      setToastError(error.message || "Registration failed");
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
    
    try {
      const { profile: savedProfile } = await api.users.updateMe({
        fullName: name,
        origin,
        host: finalHost,
        city: finalCity,
        bio: `Moving for ${situation}. Currently focused on ${focus}.`,
        situation,
        focus,
      });
      await handleUserChange(savedProfile);
      await api.goals.create({
        title: focus && focus !== "General" ? `Start with ${focus}` : "Settle into your new city",
        category: focus === "Anmeldung" ? "Documentation" : focus === "Housing" ? "Housing" : "General",
        steps: [
          { text: `Research ${focus || "city registration"} in ${finalCity}`, description: `Check official requirements, needed documents, and book an appointment in ${finalCity}.`, tool: "Registration" },
          { text: "Set up local bank and tax ID", description: "Prepare passport and proof of residence.", tool: "Banking" },
        ],
      });
      await fetchGoals();
      setAuthScreen("");
      setShowAuthModal(false);
      setShowLanding(false);
    } catch (error: any) {
      setToastError(error.message || "Could not save your profile");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    api.clearSession();
    setUser(null);
    setProfile(null);
    setAuthScreen("intro");
    setTab("home");
    setShowLanding(true);
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

    if (isLiked) await api.posts.unreact(post.id);
    else await api.posts.react(post.id);
  };
  
  const toggleSave = async (id: string) => {
    if (!user) return;
    setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    const post = feed.find((item) => item.id === id);
    if (post?.saved) await api.posts.unsave(id);
    else await api.posts.save(id);
  };

  const toggleFollow = async (id: string) => {
    if (!user) return;
    const post = feed.find(p => p.id === id);
    if (!post || !(post as any).author_id) return;
    
    setFeed(f => f.map(p => ((p as any).author_id === (post as any).author_id || p.name === post.name) ? { ...p, following: !p.following } : p));
    
    if (post.following) {
      await api.users.unfollow((post as any).author_id);
    } else {
      await api.users.follow((post as any).author_id);
    }
  };

  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
    await api.posts.remove(id);
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

    await api.posts.react(id, emoji);
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

    // Persist authenticated messages through the Postgres API; demo threads stay local.
    if (isUuid(user.id) && isUuid(otherUserId)) {
      try {
        await api.messages.send(otherUserId, msgText);
      } catch (err) {
        console.error("Message saved locally but not synced to Postgres:", err);
      }
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
      const { reply } = await api.bot.chat({
        message: text,
        history: currentMessages.slice(1, -1).map((message) => ({
          role: message.isMe ? "user" : "model",
          text: message.text,
        })),
      });
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Peanut", text: reply, time: "Now", isMe: false }]);
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
      {showLanding ? (
        <LandingPage 
          onEnterApp={() => setShowLanding(false)}
          onOpenAuth={(screen) => {
            setShowLanding(false);
            setAuthScreen(screen || "intro");
            setShowAuthModal(true);
          }}
          onTryDemo={() => {
            setShowLanding(false);
          }}
          isLoggedIn={Boolean(user && profile)}
          currentUser={user}
          currentProfile={profile}
          T={T}
          dark={dark}
          setDark={setDark}
        />
      ) : showAuthModal ? (
        <div className="relative">
          <button 
            onClick={() => { setShowAuthModal(false); setShowLanding(true); }}
            className="fixed top-4 right-4 z-[60] bg-black/70 hover:bg-black text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 backdrop-blur-xs"
          >
            ✕ Back to App
          </button>
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
            handleEmailLogin={handleEmailLogin}
            handleEmailRegister={handleEmailRegister}
            handleSetupSave={handleSetupSave}
            toastError={toastError} T={T} 
            onOpenLanding={() => { setShowAuthModal(false); setShowLanding(true); }}
          />
        </div>
      ) : (
        <div className="w-full">
          {/* Persistent Desktop Top Navigation Bar (Hidden on mobile) */}
          <div className="hidden md:block">
            <DesktopNavbar 
              tab={tab}
              setTab={(key: string) => {
                setTab(key);
                if (key !== "me") setMeScreen("root");
                if (key !== "roadmap") setOpenGoal(null);
                if (key !== "tools") setOpenTool(null);
              }}
              profile={profile!}
              unreadCount={notifications.filter(n => !n.read).length}
              onOpenNotifications={() => setShowNotifs(true)}
              onOpenMessenger={() => setMessengerOpen(true)}
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
              onOpenLanding={() => setShowLanding(true)}
              dark={dark}
              setDark={setDark}
              T={T}
              goals={goals}
              onLogout={handleLogout}
            />
          </div>

          <div className={`w-full max-w-md md:max-w-7xl mx-auto min-h-screen relative shadow-2xl md:shadow-none ${T.bg} overflow-x-hidden md:overflow-visible pb-24 md:pb-12 md:px-6 lg:px-8 md:pt-4`}>
            {tab === "home" && (
              <HomeTab 
                profile={profile!} welcomeMessage={welcomeMessage} setTab={setTab} feed={feed} user={user} T={T} 
                activeComments={activeComments} setActiveComments={setActiveComments} activeReactions={activeReactions} setActiveReactions={setActiveReactions} 
                activeShare={activeShare} setActiveShare={setActiveShare} activeOptions={activeOptions} setActiveOptions={setActiveOptions} 
                isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} setMessengerOpen={setMessengerOpen} 
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
                  if (!threadName && isUuid(id)) {
                    try {
                      const { profile: otherProfile } = await api.users.get(id);
                      if (otherProfile?.name) threadName = otherProfile.name;
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
                locationProfiles={locationProfiles}
                setLocationProfiles={setLocationProfiles}
                locationPrefs={locationPrefs}
                setLocationPrefs={setLocationPrefs}
                applyLocationChange={applyLocationChange}
                onOpenLanding={() => setShowLanding(true)}
              />
            )}
            
            <MessengerModal 
              isOpen={messengerOpen} onClose={() => setMessengerOpen(false)} activeMessageThread={activeMessageThread} 
              setActiveMessageThread={setActiveMessageThread} messageText={messageText} setMessageText={setMessageText} 
              handleSendMessage={handleSendMessage} directMessages={directMessages} T={T} 
            />

            {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
            <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-50 pointer-events-none px-4 md:hidden">
              <nav className={`pointer-events-auto w-full max-w-sm ${T.card} border ${T.line} flex justify-around py-2.5 px-2 rounded-full shadow-lg shadow-orange-500/10`}>
                {NAV.map(([key, Icon]) => (
                  <button key={key as string} onClick={() => { setTab(key as string); if (key !== "me") setMeScreen("root"); if (key !== "roadmap") setOpenGoal(null); if (key !== "tools") setOpenTool(null); }}
                    className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-full transition-all ${tab === key ? "text-orange-600 bg-orange-100 dark:bg-neutral-800" : T.sub}`}>
                    <Icon size={20} />
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

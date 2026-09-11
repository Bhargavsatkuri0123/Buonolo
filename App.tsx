import React, { useState, useMemo, useEffect } from "react";
import { Home, Map, Wrench, User, Users, Target, Bot } from "lucide-react";
import { supabase } from "./supabase";

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

const isUuid = (val: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

const SEED_DIRECT_MESSAGES = [
  {
    id: "seed-msg-1",
    threadId: "p1",
    threadName: "Sarah Miller",
    sender: "Sarah Miller",
    text: "Hey! Welcome to the city. Let me know if you need any pointers on getting registered or finding a place!",
    time: "Yesterday",
    isMe: false,
    sharedPost: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

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
  const [directMessages, setDirectMessages] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("meet-peanut_dm_default");
      return stored ? JSON.parse(stored) : SEED_DIRECT_MESSAGES;
    } catch {
      return SEED_DIRECT_MESSAGES;
    }
  });
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
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        title: n.type === 'goal' ? 'Goal Update' : (n.type === 'system' ? 'System Notification' : 'Notification'),
        body: n.content,
        time: new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        read: n.is_read,
        type: n.type
      })));
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    // 1. Load locally stored messages first
    let localMsgs: any[] = [];
    try {
      const stored = localStorage.getItem(`meet-peanut_dm_${user.id}`);
      if (stored) {
        localMsgs = JSON.parse(stored);
      } else {
        localMsgs = [...SEED_DIRECT_MESSAGES];
      }
    } catch {
      localMsgs = [...SEED_DIRECT_MESSAGES];
    }

    // If user is demo user or not a valid UUID, use local messages
    if (!isUuid(user.id)) {
      setDirectMessages(localMsgs);
      return;
    }

    try {
      const session = (await supabase.auth.getSession()).data?.session;
      if (!session || session.user?.id !== user.id) {
        setDirectMessages(localMsgs);
        return;
      }

      // 2. Fetch chat rooms for user from Supabase
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('id, participants')
        .contains('participants', [user.id]);
        
      if (roomsError || !rooms || rooms.length === 0) {
        setDirectMessages(localMsgs);
        return;
      }
      
      const roomIds = rooms.map(r => r.id);
      
      // 3. Fetch messages for these rooms
      const { data: messages, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .in('chat_room_id', roomIds)
        .order('created_at', { ascending: true });
        
      if (msgsError || !messages) {
        setDirectMessages(localMsgs);
        return;
      }
      
      // 4. Resolve other user profiles
      const otherUserIds = new Set<string>();
      rooms.forEach(r => {
        r.participants?.forEach((p: string) => {
          if (p !== user.id) otherUserIds.add(p);
        });
      });
      
      let profilesMap: Record<string, string> = {};
      if (otherUserIds.size > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', Array.from(otherUserIds));
        if (profiles) {
          profiles.forEach(p => profilesMap[p.id] = p.full_name || "Unknown");
        }
      }
      
      // 5. Format remote messages
      const remoteFormatted = messages.map(m => {
        const room = rooms.find(r => r.id === m.chat_room_id);
        const otherUserId = room?.participants?.find((p: string) => p !== user.id) || "unknown";
        const isMe = m.sender_id === user.id;
        const threadName = profilesMap[otherUserId] || "Unknown User";
        
        return {
          id: m.id,
          threadId: otherUserId,
          threadName: threadName,
          sender: isMe ? "Me" : threadName,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: isMe,
          sharedPost: null,
          created_at: m.created_at
        };
      });

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
    const channel = supabase.channel('realtime_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new as any;
        if (m && (m.sender_id === user.id || m.receiver_id === user.id)) {
          fetchMessages(); 
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

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

  const handleUserChange = async (currentUser: any) => {
    if (currentUser) {
      const { data: d, error } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
      if (d && !error) {
        setProfile({
          name: d.full_name || currentUser.user_metadata?.full_name || "User",
          handle: `@${(d.full_name || currentUser.user_metadata?.full_name || "User").replace(/\s+/g, '').toLowerCase()}`,
          origin: d.origin || "Unknown",
          host: d.host || "Unknown",
          city: d.city || "Unknown",
          followers: d.followers || 0,
          following: d.following || 0,
          bio: d.bio || ""
        });
        setUser(currentUser);
        fetchHostInfo(d.origin, d.host, d.city);
        fetchFeed(d.origin, d.city, d.host);
        fetchGoals(currentUser.id);
        fetchGroups();
        fetchEvents(d.origin, d.city, d.host);
      } else {
        setUser(currentUser);
        setAuthScreen("setup");
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  const fetchFeed = async (origin?: string, city?: string, host?: string) => {
    if (!user) return;
    const o = origin || profile?.origin || "USA";
    const c = city || profile?.city || "Berlin";
    const h = host || profile?.host || "Germany";
    
    const [postsRes, profileRes, followsRes] = await Promise.all([
      supabase.from("posts").select("*").or(`privacy.eq.Public,author_id.eq.${user.id}`).order("created_at", { ascending: false }),
      supabase.from("profiles").select("saved_items").eq("id", user.id).single(),
      supabase.from("follows").select("following_id").eq("follower_id", user.id)
    ]);
    
    if (!postsRes.error && postsRes.data) {
      const savedItems = Array.isArray(profileRes.data?.saved_items) ? profileRes.data.saved_items : [];
      const followingIds = followsRes.data ? followsRes.data.map(f => f.following_id) : [];
      
      const mappedPosts = postsRes.data.map((p: any) => {
        let myReaction = undefined;
        let isLiked = false;
        if (Array.isArray(p.likes)) {
          for (const l of p.likes) {
            if (typeof l === 'string' && l === user.id) isLiked = true;
            else if (l.userId === user.id) {
              isLiked = true;
              myReaction = l.emoji;
            }
          }
        }
        
        return {
          id: p.id,
          name: p.author_name || "Community Member",
          author_id: p.author_id,
          text: p.content,
          time: new Date(p.created_at).toLocaleDateString(),
          likes: Array.isArray(p.likes) ? p.likes.length : 0,
          liked: isLiked,
          myReaction,
          comments: p.comments_count || 0,
          privacy: p.privacy,
          tags: p.tags,
          bgTheme: p.bg_theme,
          attachment: p.attachment,
          saved: savedItems.includes(p.id),
          following: followingIds.includes(p.author_id)
        };
      });

      if (mappedPosts.length > 0) {
        setFeed(mappedPosts);
      } else {
        const dummyPosts = GENERATE_DUMMY_FEED(o, c, h);
        setFeed(dummyPosts);
      }
    }
  };

  const fetchGoals = async (userId: string) => {
    const { data, error } = await supabase
      .from("goals")
      .select("*, tasks(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      setGoals(data.map((g: any) => {
        const steps = (g.tasks || []).map((t: any) => {
          try {
            const parsed = JSON.parse(t.title);
            return {
              id: t.id,
              t: parsed.t || t.title,
              d: parsed.d || "",
              done: !!parsed.done,
              tool: parsed.tool || "Tasks"
            };
          } catch {
            return {
              id: t.id,
              t: t.title,
              d: "",
              done: false,
              tool: "Tasks"
            };
          }
        });
        return {
          id: g.id,
          title: g.title,
          cat: g.category || "General",
          icon: Target,
          steps: steps.length > 0 ? steps : [
            { t: "Get started", d: "First step on your journey.", done: false, tool: "Tasks" }
          ]
        };
      }));
    } else {
      // Create initial goal in database for user
      const { data: newGoal } = await supabase.from("goals").insert({
        user_id: userId,
        title: "Settle into your new city",
        category: "Documentation"
      }).select().single();

      if (newGoal) {
        await supabase.from("tasks").insert([
          { goal_id: newGoal.id, title: JSON.stringify({ t: "City Registration (Anmeldung)", d: "Book an appointment at the local Bürgeramt.", done: false, tool: "Registration" }) },
          { goal_id: newGoal.id, title: JSON.stringify({ t: "Open a Local Bank Account", d: "Prepare passport and proof of residence.", done: false, tool: "Banking" }) },
          { goal_id: newGoal.id, title: JSON.stringify({ t: "Health Insurance Setup", d: "Confirm your statutory or private coverage certificate.", done: false, tool: "Insurance" }) }
        ]);
        const { data: freshGoals } = await supabase.from("goals").select("*, tasks(*)").eq("user_id", userId);
        if (freshGoals) {
          setGoals(freshGoals.map((g: any) => ({
            id: g.id,
            title: g.title,
            cat: g.category,
            icon: Target,
            steps: (g.tasks || []).map((t: any) => {
              try {
                const parsed = JSON.parse(t.title);
                return { id: t.id, t: parsed.t, d: parsed.d, done: !!parsed.done, tool: parsed.tool || "Tasks" };
              } catch {
                return { id: t.id, t: t.title, d: "", done: false, tool: "Tasks" };
              }
            })
          })));
        }
      }
    }
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && data) {
      setCommunitiesData(data.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        emoji: g.image || (g.category === "Social" ? "🌍" : g.category === "Housing" ? "🏠" : g.category === "Professional" ? "💼" : "🏘️"),
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };

  const fetchEvents = async (origin?: string, city?: string, host?: string) => {
    const { data, error } = await supabase.from("events").select("*");
    if (!error && data) {
      // Live events handled in CommunityTab
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserChange(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`realtime_app_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchFeed();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
        fetchFeed();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
        fetchGroups();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
        fetchGroups();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, () => {
        fetchGoals(user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchGoals(user.id);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => {
        handleUserChange(user);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      await supabase.from("tasks").update({
        title: JSON.stringify({
          t: targetStep.t,
          d: targetStep.d,
          done: newDone,
          tool: targetStep.tool
        })
      }).eq("id", (targetStep as any).id);
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
      const { data: newGoal, error: goalErr } = await supabase.from("goals").insert({
        user_id: user.id,
        title: tpl.title,
        category: tpl.cat || "General"
      }).select().single();

      if (newGoal && !goalErr) {
        const tasksPayload = initialSteps.map(s => ({
          goal_id: newGoal.id,
          title: JSON.stringify(s)
        }));
        await supabase.from("tasks").insert(tasksPayload);
        await fetchGoals(user.id);
        return;
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
      const { data: newGoal, error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: customTitle.trim(),
        category: "Custom"
      }).select().single();

      if (newGoal && !error) {
        await supabase.from("tasks").insert({
          goal_id: newGoal.id,
          title: JSON.stringify(initialSteps[0])
        });
        await fetchGoals(user.id);
        return;
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
      await supabase.from("tasks").insert({
        goal_id: goalId,
        title: JSON.stringify(newStep)
      });
      await fetchGoals(user.id);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(gs => gs.filter(g => g.id !== goalId));
    setOpenGoal(null);

    if (user) {
      await supabase.from("tasks").delete().eq("goal_id", goalId);
      await supabase.from("goals").delete().eq("id", goalId);
    }
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    const demoId = "44c35de8-0195-4470-97d1-aad6445abf65";
    const demoUser = {
      id: demoId,
      email: "demo@meet-peanut.app",
      user_metadata: { full_name: "Demo User" }
    };
    await handleUserChange(demoUser);
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    setAuthLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) setToastError(error.message);
    setAuthLoading(false);
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName } } });
    if (error) setToastError(error.message);
    setAuthLoading(false);
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
    
    const profileData = { 
      id: user.id, 
      full_name: name, 
      origin: origin, 
      host: finalHost, 
      city: finalCity,
      bio: `Moving for ${situation}. Currently focused on ${focus}.`,
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString()
    };
    
    const { error } = await supabase.from("profiles").upsert(profileData);
    if (!error) {
      setProfile({ 
        name: name, 
        handle: `@${name.replace(/\s+/g, '').toLowerCase()}`, 
        origin: origin, 
        host: finalHost, 
        city: finalCity, 
        followers: 0, 
        following: 0, 
        bio: profileData.bio 
      });
      fetchHostInfo(origin, finalHost, finalCity);
      fetchFeed(origin, finalCity, finalHost);
      fetchGroups();
      fetchEvents(origin, finalCity, finalHost);
      
      // Auto-create initial goal based on focus
      const { data: createdGoal } = await supabase.from("goals").insert({
        user_id: user.id,
        title: focus && focus !== "General" ? `Start with ${focus}` : "Settle into your new city",
        category: focus === "Anmeldung" ? "Documentation" : focus === "Housing" ? "Housing" : "General"
      }).select().single();

      if (createdGoal) {
        await supabase.from("tasks").insert([
          {
            goal_id: createdGoal.id,
            title: JSON.stringify({
              t: `Research ${focus || 'city registration'} in ${finalCity}`,
              d: `Check official requirements, needed documents, and book an appointment in ${finalCity}.`,
              done: false,
              tool: "Registration"
            })
          },
          {
            goal_id: createdGoal.id,
            title: JSON.stringify({
              t: `Set up local bank and tax ID`,
              d: `Prepare passport and proof of residence.`,
              done: false,
              tool: "Banking"
            })
          }
        ]);
        await fetchGoals(user.id);
      }
      setAuthScreen("");
    } else setToastError(error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

    const { data: currentPost } = await supabase.from('posts').select('likes').eq('id', post.id).single();
    let currentLikes = currentPost?.likes || [];
    if (!Array.isArray(currentLikes)) currentLikes = [];
    
    let newLikes = [...currentLikes];
    newLikes = newLikes.filter((l: any) => typeof l === 'string' ? l !== user.id : l.userId !== user.id);
    
    if (!isLiked) {
      newLikes.push(user.id);
    }
    await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
  };
  
  const toggleSave = async (id: string) => {
    if (!user) return;
    setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    const { data: currentProfile } = await supabase.from('profiles').select('saved_items').eq('id', user.id).single();
    let savedItems = currentProfile?.saved_items || [];
    if (!Array.isArray(savedItems)) savedItems = [];
    
    let newSavedItems = [...savedItems];
    if (newSavedItems.includes(id)) {
      newSavedItems = newSavedItems.filter((i: any) => i !== id);
    } else {
      newSavedItems.push(id);
    }
    await supabase.from('profiles').update({ saved_items: newSavedItems }).eq('id', user.id);
  };

  const toggleFollow = async (id: string) => {
    if (!user) return;
    const post = feed.find(p => p.id === id);
    if (!post || !(post as any).author_id) return;
    
    setFeed(f => f.map(p => ((p as any).author_id === (post as any).author_id || p.name === post.name) ? { ...p, following: !p.following } : p));
    
    if (post.following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', (post as any).author_id);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: (post as any).author_id });
    }
  };

  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
    await supabase.from('posts').delete().eq('id', id);
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

    const { data: currentPost } = await supabase.from('posts').select('likes').eq('id', id).single();
    let currentLikes = currentPost?.likes || [];
    if (!Array.isArray(currentLikes)) currentLikes = [];
    
    let newLikes = [...currentLikes];
    newLikes = newLikes.filter((l: any) => typeof l === 'string' ? l !== user.id : l.userId !== user.id);
    newLikes.push({ userId: user.id, emoji });
    
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id);
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

    // Safely sync with Supabase if both are valid UUIDs and authenticated session matches user
    if (isUuid(user.id) && isUuid(otherUserId)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (session && session.user?.id === user.id) {
          let { data: rooms, error: roomFindErr } = await supabase
            .from('chat_rooms')
            .select('id, participants')
            .contains('participants', [session.user.id]);
            
          let roomId = rooms?.find(r => r.participants?.includes(otherUserId))?.id;
          
          if (!roomId && !roomFindErr) {
            const { data: newRoom, error: createError } = await supabase
              .from('chat_rooms')
              .insert({ participants: [session.user.id, otherUserId] })
              .select()
              .single();
              
            if (!createError && newRoom) {
              roomId = newRoom.id;
            } else if (createError) {
              console.info("Using local chat session (room sync skipped):", createError.message);
            }
          }
          
          if (roomId) {
            const { error: msgErr } = await supabase.from('messages').insert({
              sender_id: session.user.id,
              chat_room_id: roomId,
              text: msgText
            });
            if (msgErr) {
              console.info("Message saved locally (remote sync skipped):", msgErr.message);
            }
          }
        }
      } catch (err) {
        console.info("Local message persisted. Supabase sync bypassed:", err);
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
                    const { data } = await supabase.from('profiles').select('full_name').eq('id', id).single();
                    if (data?.full_name) threadName = data.full_name;
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

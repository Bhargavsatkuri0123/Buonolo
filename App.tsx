import React, { useState, useMemo, useEffect } from "react";
import { Home, Map, Wrench, User, Users, Target, Bot } from "lucide-react";
import { supabase } from "./supabase";

// Types & Constants
import { Profile, Post, Goal, Theme } from "./src/types";
import { LOCATIONS, SAF, DUMMY_FEED, TEMPLATE_HOST_INFO } from "./src/constants";

// Components
import { AuthFlow } from "./src/components/AuthFlow";
import { MessengerModal } from "./src/components/MessengerModal";
import { HomeTab } from "./src/components/HomeTab";
import { RoadmapTab } from "./src/components/RoadmapTab";
import { BotTab } from "./src/components/BotTab";
import { ToolsTab } from "./src/components/ToolsTab";
import { CommunityTab } from "./src/components/CommunityTab";
import { MeTab } from "./src/components/MeTab";

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

export default function BuonoloApp() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  const [feed, setFeed] = useState<Post[]>(DUMMY_FEED);
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
  const [directMessages, setDirectMessages] = useState<any[]>([
    { id: "msg1", threadId: "Alex", sender: "Alex", text: "Hey! How are you settling in?", time: "10:00 AM", isMe: false },
    { id: "msg2", threadId: "Alex", sender: "Me", text: "Getting there! Found a nice apartment.", time: "10:05 AM", isMe: true }
  ]);
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

  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Welcome to Buonolo!", body: "We're here to help you settle in. Explore the roadmap to get started.", time: "Now", read: false, type: "system" },
    { id: 2, title: "Goal Update", body: "You've completed 2 steps in 'Register your address'. Keep going!", time: "2h ago", read: true, type: "goal" }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  const pushNotification = (title: string, body: string, type: string = "system") => {
    setNotifications(prev => [{ id: Date.now(), title, body, time: "Now", read: false, type }, ...prev]);
  };

  const fetchHostInfo = async (origin: string, newHost: string, newCity: string) => {
    setIsUpdatingHost(true);
    try {
      const data = TEMPLATE_HOST_INFO(origin, newCity, newHost);
      
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
        fetchFeed();
        fetchGoals(currentUser.id);
        fetchGroups();
        fetchEvents();
      } else {
        setUser(currentUser);
        setAuthScreen("setup");
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  const fetchFeed = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("posts")
      .select("*")
      .or(`privacy.eq.Public,author_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setFeed(data.map((p: any) => ({
        id: p.id,
        name: p.author_name,
        text: p.content,
        time: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes?.length || 0,
        liked: p.likes?.includes(user?.id),
        comments: p.comments_count || 0,
        privacy: p.privacy,
        tags: p.tags,
        bgTheme: p.bg_theme,
        attachment: p.attachment
      })));
    }
  };

  const fetchGoals = async (userId: string) => {
    const { data, error } = await supabase.from("user_goals").select("*").eq("user_id", userId);
    if (!error && data) {
      setGoals(data.map((g: any) => ({
        id: g.id,
        title: g.title,
        cat: g.category,
        icon: Target,
        steps: g.steps
      })));
    }
  };

  const fetchGroups = async () => {
    const { data, error } = await supabase.from("groups").select("*, group_members(user_id)");
    if (!error && data) {
      setCommunitiesData(data.map((g: any) => ({
        id: g.id,
        name: g.name,
        desc: g.description,
        emoji: "🏘️", // Or from DB if stored
        members: g.group_members?.length || 0,
        joined: g.group_members?.some((m: any) => m.user_id === user?.id)
      })));
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (!error && data) {
      // Update global events state if we had one, or just pass to CommunityTab
      // For now we'll just handle it in CommunityTab if we want live events
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
      
      // Auto-create initial goal based on focus
      if (focus && focus !== "General") {
        await supabase.from("user_goals").insert({
          user_id: user.id,
          title: `Start with ${focus}`,
          category: focus === "Anmeldung" ? "Documentation" : focus === "Housing" ? "Housing" : "General",
          steps: [{ t: `Research ${focus} in ${finalCity}`, d: `Initial research step for ${focus}.`, done: false }]
        });
        fetchGoals(user.id);
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
    setFeed(f => f.map(p => {
      if (p.id === post.id) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };
  
  const toggleSave = (id: string) => setFeed(f => f.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  const toggleFollow = (id: string) => setFeed(f => f.map(p => p.id === id ? { ...p, following: !p.following } : p));
  const deletePost = async (id: string) => {
    setFeed(f => f.filter(p => p.id !== id));
  };

  const addReaction = (id: string, emoji: string) => {
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
  };

  const handleShareToMessenger = (post: Post) => {
    setDirectMessages(msgs => [...msgs, { id: "msg" + Date.now(), threadId: "Alex", sender: "Me", text: `Check out this post!`, time: "Just now", isMe: true, sharedPost: post }]);
    setMessengerOpen(true);
    setActiveMessageThread("Alex");
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeMessageThread) return;
    setDirectMessages(msgs => [...msgs, { id: "msg" + Date.now(), threadId: activeMessageThread, sender: "Me", text: messageText, time: "Just now", isMe: true }]);
    setMessageText("");
  };

  const handleBotMessage = async (text: string) => {
    if (!text.trim()) return;
    setBotMessages(prev => [...prev, { id: "bm-" + Date.now(), sender: "Me", text, time: "Just now", isMe: true }]);
    setBotLoading(true);
    setTimeout(() => {
      setBotMessages(prev => [...prev, { id: "br-" + Date.now(), sender: "Mr O", text: "I am a templated assistant. For specific help, please check the community or tools tabs.", time: "Now", isMe: false }]);
      setBotLoading(false);
    }, 1000);
  };

  const NAV = [["home", Home, "Home"], ["roadmap", Map, "Roadmap"], ["community", Users, "Community"], ["tools", Wrench, "Tools"], ["me", User, "Me"]];

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
          handleEmailLogin={handleEmailLogin} handleEmailRegister={handleEmailRegister} handleSetupSave={handleSetupSave} 
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

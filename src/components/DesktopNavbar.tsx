import React from "react";
import { 
  Home, Map, Wrench, User, Users, Target, Bot, 
  Bell, MessageCircle, Plus, Moon, Sun, Sparkles, 
  MapPin, HelpCircle, ArrowUpRight, LogOut, Search
} from "lucide-react";
import { Logo, PeanutLogo } from "./Header";
import { Theme, Profile, Goal } from "../types";

interface DesktopNavbarProps {
  tab: string;
  setTab: (tab: string) => void;
  profile: Profile;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenMessenger: () => void;
  onOpenCreatePost: () => void;
  onOpenLanding: () => void;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  T: Theme;
  goals: Goal[];
  onLogout?: () => void;
}

export const DesktopNavbar = ({
  tab,
  setTab,
  profile,
  unreadCount,
  onOpenNotifications,
  onOpenMessenger,
  onOpenCreatePost,
  onOpenLanding,
  dark,
  setDark,
  T,
  goals,
  onLogout
}: DesktopNavbarProps) => {
  // Calculate total pending roadmap steps
  const pendingStepsCount = React.useMemo(() => {
    let count = 0;
    goals.forEach(g => {
      if (g.steps) {
        count += g.steps.filter(s => !s.done).length;
      }
    });
    return count;
  }, [goals]);

  const navItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "roadmap", label: "Roadmap", icon: Target, badge: pendingStepsCount > 0 ? pendingStepsCount : undefined },
    { key: "community", label: "Community", icon: Users },
    { key: "tools", label: "Local Hub", icon: Wrench },
    { key: "bot", label: "Ask Peanut", icon: (props: any) => <PeanutLogo {...props} monochrome size={18} />, isAi: true },
    { key: "me", label: "Profile", icon: User },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md ${dark ? 'bg-black/85 border-neutral-800' : 'bg-white/90 border-slate-200'} border-b transition-colors shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Current Location Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <Logo size={28} onClick={() => setTab("home")} />
          
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-neutral-900 border border-orange-200/70 dark:border-neutral-700 text-slate-700 dark:text-neutral-300">
              <MapPin size={13} className="text-orange-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">
                {profile.host_city || "Berlin"}, {profile.host_country || "Germany"}
              </span>
              {profile.origin_country && (
                <span className="text-slate-400 text-[11px] font-normal">
                  (from {profile.origin_country})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Main App Tabs Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`relative px-3.5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : `${T.sub} hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800/80`
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : undefined} />
                <span>{item.label}</span>
                {item.isAi && !isActive && (
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 leading-none">
                    AI
                  </span>
                )}
                {item.badge && !isActive && (
                  <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-neutral-800 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center border border-orange-300 dark:border-neutral-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Notifications, Dark Mode, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* New Post Button */}
          <button
            onClick={onOpenCreatePost}
            className="hidden xl:inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-md shadow-orange-500/15 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={15} />
            <span>New Post</span>
          </button>

          {/* Messages */}
          <button
            onClick={onOpenMessenger}
            title="Direct Messages"
            className={`p-2.5 rounded-full ${T.card2} border ${T.line} ${T.text} hover:text-orange-500 transition-colors relative`}
          >
            <MessageCircle size={18} />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            title="Notifications"
            className={`p-2.5 rounded-full ${T.card2} border ${T.line} ${T.text} hover:text-orange-500 transition-colors relative`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            title="Toggle Theme"
            className={`p-2.5 rounded-full ${T.card2} border ${T.line} ${T.text} hover:text-orange-500 transition-colors`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Landing / Overview Link */}
          <button
            onClick={onOpenLanding}
            title="View Landing Page & Guide"
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${T.line} ${T.card2} ${T.sub} hover:text-orange-500 hover:border-orange-300 transition-colors`}
          >
            <span>About</span>
            <ArrowUpRight size={13} />
          </button>

          {/* User Avatar & Name */}
          <div 
            onClick={() => setTab("me")}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-orange-400 transition-all">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0)?.toUpperCase() || "P"
              )}
            </div>
            <div className="hidden 2xl:block text-left">
              <p className="text-xs font-bold leading-tight group-hover:text-orange-500 transition-colors">
                {profile.full_name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {profile.situation || "Expat"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

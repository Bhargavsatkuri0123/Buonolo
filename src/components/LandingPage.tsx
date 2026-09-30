import React, { useState } from "react";
import { 
  CheckCircle2, ArrowRight, Sparkles, MapPin, ShieldCheck, 
  MessageSquare, Compass, PhoneCall, Globe, Users, 
  BookOpen, Heart, ArrowUpRight, HelpCircle, ChevronDown, 
  ChevronUp, Check, Bot, Building2, FileText, Send, Moon, Sun, 
  Laptop, Smartphone, Zap, Star
} from "lucide-react";
import { PeanutLogo, Logo, AppIcon } from "./Header";
import { Theme } from "../types";
import { LOCATIONS } from "../constants";

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (screen?: string) => void;
  onTryDemo: () => void;
  isLoggedIn?: boolean;
  currentUser?: any;
  currentProfile?: any;
  T: Theme;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LandingPage = ({
  onEnterApp,
  onOpenAuth,
  onTryDemo,
  isLoggedIn = false,
  currentUser,
  currentProfile,
  T,
  dark,
  setDark
}: LandingPageProps) => {
  const [activePreviewTab, setActivePreviewTab] = useState<"roadmap" | "community" | "tools" | "ai">("roadmap");
  const [selectedCity, setSelectedCity] = useState("Berlin");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Interactive checklist demo state
  const [demoChecklist, setDemoChecklist] = useState([
    { id: 1, text: "Book Bürgeramt appointment for City Registration (Anmeldung)", done: true, tag: "Legal" },
    { id: 2, text: "Obtain Landlord Confirmation (Wohnungsgeberbestätigung)", done: true, tag: "Housing" },
    { id: 3, text: "Open local IBAN bank account (N26 / Deutsche Bank)", done: false, tag: "Banking" },
    { id: 4, text: "Register for Public Health Insurance (TK / Barmer)", done: false, tag: "Health" },
    { id: 5, text: "Request German Tax ID (Steueridentifikationsnummer)", done: false, tag: "Tax" },
  ]);

  // Interactive AI sample prompt state
  const [aiQuestion, setAiQuestion] = useState("What documents do I need for my Anmeldung appointment?");
  const [aiAnswer, setAiAnswer] = useState<string | null>(
    "For your German city registration (Anmeldung), bring: 1) Valid Passport/National ID, 2) Signed Wohnungsgeberbestätigung (landlord confirmation slip), 3) Completed registration form (Anmeldeformular), and 4) Marriage/birth certificates if registering with family. Appointments must strictly be completed within 14 days of moving in."
  );
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const samplePrompts = [
    "What documents do I need for my Anmeldung appointment?",
    "Explain this German letter from the Finanzamt in simple English",
    "How does the SCHUFA credit score work for finding a flat?",
    "What is the difference between Public and Private health insurance?"
  ];

  const handleRunAiSample = async (q: string) => {
    setAiQuestion(q);
    setIsAiAnswering(true);
    setAiAnswer(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "Me", text: q }],
          userOrigin: currentProfile?.origin,
          userHost: currentProfile?.host,
          userCity: currentProfile?.city || selectedCity,
          activeTab: "landing page preview",
          appContext: {},
        }),
      });

      if (!response.ok) throw new Error("Ask Peanut request failed");
      const data = await response.json();
      setAiAnswer(typeof data.text === "string" ? data.text : "Ask Peanut could not generate a response. Please try again.");
    } catch {
      setAiAnswer("Ask Peanut is temporarily unavailable. Please try again shortly.");
    } finally {
      setIsAiAnswering(false);
    }
  };

  const cityHighlights: Record<string, { country: string; flag: string; expatCount: string; emergency: string; highlight: string; nextStep: string }> = {
    Berlin: { country: "Germany", flag: "🇩🇪", expatCount: "250,000+", emergency: "112 / 110", highlight: "Tech hubs, Bürgeramt registration & flatshare culture", nextStep: "City Registration (Anmeldung)" },
    London: { country: "United Kingdom", flag: "🇬🇧", expatCount: "1.2M+", emergency: "999 / 111", highlight: "National Insurance, NHS GP registration, contactless transit", nextStep: "Register with an NHS GP" },
    Tokyo: { country: "Japan", flag: "🇯🇵", expatCount: "400,000+", emergency: "119 / 110", highlight: "Ward office registration, My Number card, trash sorting rules", nextStep: "Ward Office Resident Record (Juminhyo)" },
    Amsterdam: { country: "Netherlands", flag: "🇳🇱", expatCount: "180,000+", emergency: "112", highlight: "BSN number, DigiD setup, 30% ruling tax facility", nextStep: "Municipal BSN Registration" },
    Paris: { country: "France", flag: "🇫🇷", expatCount: "320,000+", emergency: "15 / 17 / 18", highlight: "CPAM social security, Carte Vitale, CAF housing support", nextStep: "Validate VLS-TS Long-Stay Visa" },
    "New York": { country: "United States", flag: "🇺🇸", expatCount: "3.1M+", emergency: "911", highlight: "Social Security Number, credit history building, broker fees", nextStep: "Apply for Social Security Number (SSN)" },
  };

  const activeCityInfo = cityHighlights[selectedCity] || cityHighlights["Berlin"];

  const faqs = [
    {
      q: "What makes Meet Peanut different from generic relocation articles?",
      a: "Most relocation guides are outdated blog posts or fragmented forum threads. Meet Peanut combines relocation checklists tailored to your destination, an active peer community, city-aware emergency guidance, reviewed local providers, and an AI assistant that can translate government paperwork."
    },
    {
      q: "How does 'Ask Peanut' AI help with government bureaucracy?",
      a: "Ask Peanut uses Gemini with your selected destination context to answer relocation questions and translate uploaded documents. Check important legal or deadline guidance against the issuing authority."
    },
    {
      q: "Can I use Meet Peanut if I am planning to move in the future?",
      a: "Yes! Thousands of users start using Meet Peanut months before boarding their flight. You can pre-plan your visa roadmap, read what newcomers are experiencing in your target city, and calculate cost of living expenses in advance."
    },
    {
      q: "What if I move to a new city later on?",
      a: "Meet Peanut has built-in Multi-Location Profiles. When your journey takes you to a new city or country, you can switch locations with one tap. Your past accomplishments and friends are safely archived, and your feed, emergency numbers, and roadmap immediately update for your new home."
    },
    {
      q: "Is Meet Peanut free to use?",
      a: "Yes. Meet Peanut is free for newcomers, immigrants, and expats worldwide. You can explore as a guest immediately with our 1-click Live Demo without creating an account or providing a credit card."
    }
  ];

  return (
    <div className={`min-h-screen ${T.bg} text-slate-900 dark:text-white transition-colors duration-300 font-sans selection:bg-orange-500 selection:text-white`}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP ANNOUNCEMENT & BRAND NAVIGATION BAR                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md ${dark ? 'bg-black/80 border-neutral-800' : 'bg-white/85 border-slate-100'} border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={32} onClick={onEnterApp} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              v1.0 Global Expat Companion
            </span>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#highlights" className="text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              Highlights
            </a>
            <a href="#interactive-preview" className="text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              Live Preview
            </a>
            <a href="#destinations" className="text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              Supported Cities
            </a>
            <a href="#faq" className="text-slate-600 dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle Dark Mode"
              className={`p-2 rounded-full ${T.card2} border ${T.line} text-slate-700 dark:text-neutral-300 hover:text-orange-500 transition-colors`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={onEnterApp}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <span>Launch App</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={onTryDemo}
                  className="hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                >
                  <Zap size={15} />
                  <span>Try Demo</span>
                </button>
                <button
                  onClick={() => onOpenAuth("login")}
                  className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-full ${T.text} hover:text-orange-500 transition-colors`}
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth("intro")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md shadow-orange-500/20 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION                                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Soft background ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-400/20 to-amber-200/20 dark:from-orange-600/10 dark:to-amber-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Friendly Mascot Intro Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100/80 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800 mb-6">
            <PeanutLogo size={20} />
            <span>Meet Peanut · The Friendly Expat & Immigrant Relocation Guide</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.08] disp">
            Moving abroad made <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              seamless, human & clear.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one companion for municipal registrations, residence permits, local peer communities, verified services, and instant AI answers in 45+ cities worldwide.
          </p>

          {/* Primary Action Group */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onTryDemo}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base px-6 sm:px-8 py-3.5 rounded-full shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <PeanutLogo size={22} className="brightness-110" />
              <span>Launch Live Demo (Instant)</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onOpenAuth("intro")}
              className={`font-bold text-base px-6 sm:px-8 py-3.5 rounded-full ${T.card} border ${T.line} shadow-sm hover:border-orange-400 transition-all flex items-center gap-2`}
            >
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Clean Unboxed Metadata Badges (Zero-Pill Compliance) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Tailored Bureaucracy Checklists</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Verified English-Speaking Doctors</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Gemini AI Document Translator</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Active Neighborhood Expats</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. INTERACTIVE LIVE APPLICATION PREVIEW (DESKTOP & MOBILE)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="interactive-preview" className="py-16 sm:py-24 border-t border-slate-100 dark:border-neutral-900 bg-slate-50/50 dark:bg-neutral-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Interactive Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 disp">
              Experience Meet Peanut before you board.
            </h2>
            <p className="mt-3 text-slate-600 dark:text-neutral-300 text-sm sm:text-base">
              Try out real components from the app below. Switch tabs to preview the Roadmap, Community, Tools & Directory, and the Ask Peanut AI assistant.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex items-center justify-center mb-8">
            <div className={`p-1.5 rounded-full ${T.card} border ${T.line} shadow-sm inline-flex flex-wrap gap-1`}>
              <button
                onClick={() => setActivePreviewTab("roadmap")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activePreviewTab === "roadmap"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Compass size={16} />
                <span>Arrival Roadmap</span>
              </button>
              <button
                onClick={() => setActivePreviewTab("community")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activePreviewTab === "community"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users size={16} />
                <span>Expat Feed</span>
              </button>
              <button
                onClick={() => setActivePreviewTab("tools")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activePreviewTab === "tools"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <PhoneCall size={16} />
                <span>Services & Emergency</span>
              </button>
              <button
                onClick={() => setActivePreviewTab("ai")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activePreviewTab === "ai"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bot size={16} />
                <span>Ask Peanut AI</span>
              </button>
            </div>
          </div>

          {/* Interactive Window Preview */}
          <div className={`${T.card} border ${T.line} rounded-3xl shadow-2xl overflow-hidden transition-all duration-300`}>
            {/* Window Header */}
            <div className={`px-5 py-3.5 border-b ${T.line} flex items-center justify-between bg-slate-100/50 dark:bg-neutral-900/50`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                  meet-peanut://app/{activePreviewTab}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                <MapPin size={14} />
                <span>Berlin, Germany (Active Host)</span>
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: ROADMAP */}
              {activePreviewTab === "roadmap" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/10">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-orange-100">
                        Arrival Phase · First 30 Days
                      </span>
                      <h3 className="text-xl font-bold disp mt-0.5">
                        German Registration & Essential Checkpoints
                      </h3>
                      <p className="text-xs sm:text-sm text-orange-50 mt-1">
                        Tailored for Alex Rivera · Moving USA ➔ Berlin
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-extrabold disp">
                          {Math.round((demoChecklist.filter(c => c.done).length / demoChecklist.length) * 100)}%
                        </span>
                        <p className="text-[10px] text-orange-100 uppercase tracking-wider font-semibold">
                          Completed
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white flex items-center justify-center font-bold text-xs">
                        {demoChecklist.filter(c => c.done).length}/{demoChecklist.length}
                      </div>
                    </div>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                      Interactive Steps (Click any row to test completion)
                    </p>
                    {demoChecklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setDemoChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c));
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          item.done
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                            : `${T.card2} border-slate-200 dark:border-neutral-800 hover:border-orange-400`
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            item.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 dark:border-neutral-600"
                          }`}>
                            {item.done && <Check size={14} className="stroke-[3]" />}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${item.done ? 'line-through text-slate-400 dark:text-neutral-500' : T.text}`}>
                              {item.text}
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                              {item.tag} category
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 hover:text-orange-500 shrink-0">
                          {item.done ? "Completed" : "Mark Done"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs text-slate-500 dark:text-neutral-400">
                    <span>💡 Full app includes official PDF forms, appointment links & document checklist.</span>
                    <button onClick={onTryDemo} className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1">
                      <span>Open Full Roadmap</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMUNITY */}
              {activePreviewTab === "community" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PeanutLogo size={28} />
                      <div>
                        <h4 className="text-sm font-bold disp">Berlin Expat Feed · Live Neighborhood Pulse</h4>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                          5,240 active members in Friedrichshain, Mitte, Neukölln & Prenzlauer Berg
                        </p>
                      </div>
                    </div>
                    <button onClick={onTryDemo} className="bg-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-full hover:bg-orange-600 transition-colors">
                      Join Discussion
                    </button>
                  </div>

                  {/* Sample Posts */}
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl ${T.card2} border ${T.line}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center font-bold text-xs text-orange-800 dark:text-orange-200">
                          MK
                        </div>
                        <div>
                          <p className="text-xs font-bold">Mateo Kowalski</p>
                          <p className="text-[10px] text-slate-400">Moved from Warsaw · 2 hours ago in #Bureaucracy</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-neutral-200">
                        "Just completed my Anmeldung at Bürgeramt Mitte! Arrive 15 minutes before opening even with appointment. They were super friendly with English paperwork!"
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400">
                        <span>❤️ 24 helpful</span>
                        <span>💬 9 replies</span>
                        <span>📍 Mitte, Berlin</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl ${T.card2} border ${T.line}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center font-bold text-xs text-blue-800 dark:text-blue-200">
                          SL
                        </div>
                        <div>
                          <p className="text-xs font-bold">Sophie Lin</p>
                          <p className="text-[10px] text-slate-400">Moved from Toronto · Yesterday in #Housing</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-neutral-200">
                        "Looking for flatmates in Prenzlauer Berg or Friedrichshain! 2-bedroom sunny Altbau apartment, Anmeldung possible. PM me for photos!"
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400">
                        <span>❤️ 15 interested</span>
                        <span>💬 12 replies</span>
                        <span>🔑 Housing tip</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TOOLS & EMERGENCY */}
              {activePreviewTab === "tools" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                      🚨 1-Tap Emergency & Crisis Hotlines (Berlin)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-red-700 dark:text-red-300">Ambulance & Fire</p>
                          <p className="text-xl font-black text-red-600">112</p>
                        </div>
                        <a href="tel:112" className="px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700">
                          Call 112
                        </a>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300">German Police</p>
                          <p className="text-xl font-black text-blue-600">110</p>
                        </div>
                        <a href="tel:110" className="px-3 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
                          Call 110
                        </a>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Non-Emergency Doc</p>
                          <p className="text-xl font-black text-amber-600">116 117</p>
                        </div>
                        <a href="tel:116117" className="px-3 py-1.5 rounded-full bg-amber-600 text-white font-bold text-xs hover:bg-amber-700">
                          Call 116 117
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-3">
                      Essential Relocation Tools
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-4 rounded-2xl ${T.card2} border ${T.line}`}>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          Medical
                        </span>
                        <h5 className="font-bold text-sm mt-0.5">Praxis Mitte English GP</h5>
                        <p className="text-xs text-slate-500 mt-1">Accepts TK/Barmer public insurance · English, Spanish & German spoken.</p>
                      </div>
                      <div className={`p-4 rounded-2xl ${T.card2} border ${T.line}`}>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          Legal & Visa
                        </span>
                        <h5 className="font-bold text-sm mt-0.5">Berlin Immigration Legal Clinic</h5>
                        <p className="text-xs text-slate-500 mt-1">Freelance artist visas, Blue Card applications & permanent residence.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ASK PEANUT AI */}
              {activePreviewTab === "ai" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <PeanutLogo size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold disp">Ask Peanut AI Relocation Intelligence</h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Powered by Google Gemini · Understands municipal forms, visa classes & local jargon
                      </p>
                    </div>
                  </div>

                  {/* Sample Question Chips */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Test a live query:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRunAiSample(p)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left ${
                            aiQuestion === p
                              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                              : `${T.card2} border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-orange-400`
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q & A Box */}
                  <div className={`p-4 rounded-2xl ${T.card2} border ${T.line} space-y-3`}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        You
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{aiQuestion}</p>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200 dark:border-neutral-800">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <PeanutLogo size={16} />
                      </div>
                      <div className="flex-1">
                        {isAiAnswering ? (
                          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold animate-pulse">
                            <Sparkles size={14} />
                            <span>Peanut is reviewing municipal guidelines...</span>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-neutral-200">
                            {aiAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar inside Preview */}
            <div className={`px-6 py-4 border-t ${T.line} bg-slate-50 dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3`}>
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                Ready to experience the real application with your own destination?
              </span>
              <button
                onClick={onTryDemo}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Launch Interactive App Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. APPLICATION HIGHLIGHTS & CORE PILLARS                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="highlights" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Why Expats Love Meet Peanut
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 disp">
              Engineered for the realities of moving abroad.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-neutral-300">
              No generic blog spam. Meet Peanut gives you actionable blueprints, real contacts, and community accountability for your new city.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Highlight 1 */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                  <Compass size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Relocation Roadmap & Bureaucracy</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Tailored sequence of municipal steps. From town hall registration and tax ID to residency renewals and bank accounts, check off requirements in order without missing critical deadlines.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <span>Interactive checklist & document vault</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Highlight 2 */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Local Community & Direct Messaging</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Connect with fellow expats in your neighborhood. Share housing leads, join language exchange meetups, and message people with local experience.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>Neighborhood chat & groups</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Highlight 3 */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                  <PhoneCall size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Emergency Hotlines & Directory</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  City-aware emergency guidance and local medical, translation, legal, and tax providers appear here after listings are reviewed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>1-tap emergency dialer</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Highlight 4 */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                  <Bot size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Ask Peanut AI Assistant</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Powered by Gemini, Ask Peanut cuts through confusing government bureaucracy. Translate tricky letters from German or Japanese, prepare for visa appointments, and understand your rental rights.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <span>Gemini document analysis & chat</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Highlight 5 */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                  <Globe size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Multi-Location City Switching</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Moving between countries or splitting time across two hubs? Switch your host city anytime with full data preservation. Keep past achievements intact while your feed and tools reorient to your new home.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Full historical profile archiving</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Highlight 6: Cross-Platform */}
            <div className={`p-8 rounded-3xl ${T.card} border ${T.line} shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                  <Laptop size={28} />
                </div>
                <h3 className="text-xl font-bold disp mb-2">Desktop & Mobile Seamless Sync</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Whether managing forms on your laptop at your desk or checking off emergency numbers on your phone on the subway, Meet Peanut provides a first-class responsive experience with instant cloud sync.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>Full responsive desktop & mobile</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE DESTINATION EXPLORER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="destinations" className="py-20 sm:py-28 bg-slate-50/60 dark:bg-neutral-950/40 border-y border-slate-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Worldwide Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 disp">
              Select your relocation destination.
            </h2>
            <p className="mt-3 text-slate-600 dark:text-neutral-300 text-sm sm:text-base">
              Choose a supported city to see relocation guidance, emergency information, local providers, and community features. Coverage and listings vary by location.
            </p>
          </div>

          {/* City Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-10">
            {Object.keys(cityHighlights).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedCity === city
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105"
                    : `${T.card} border ${T.line} text-slate-700 dark:text-neutral-300 hover:border-orange-400`
                }`}
              >
                <span>{cityHighlights[city].flag}</span>
                <span>{city}</span>
              </button>
            ))}
          </div>

          {/* Selected City Highlight Card */}
          <div className={`max-w-3xl mx-auto ${T.card} border ${T.line} rounded-3xl p-6 sm:p-8 shadow-xl`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl">{activeCityInfo.flag}</span>
                <div>
                  <h3 className="text-2xl font-bold disp">
                    {selectedCity}, {activeCityInfo.country}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
                    {activeCityInfo.highlight}
                  </p>
                </div>
              </div>
              <button
                onClick={onTryDemo}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md shadow-orange-500/20 shrink-0 self-start sm:self-auto"
              >
                Explore {selectedCity} Guide
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center sm:text-left">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Expat Community</p>
                <p className="text-xl font-extrabold disp text-orange-600 dark:text-orange-400 mt-1">
                  {activeCityInfo.expatCount}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Active newcomers & expats</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Emergency Number</p>
                <p className="text-xl font-extrabold disp text-red-600 mt-1">
                  {activeCityInfo.emergency}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Direct 1-tap call supported</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Key First Step</p>
                <p className="text-base font-bold text-slate-800 dark:text-white mt-1 line-clamp-1">
                  {activeCityInfo.nextStep}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Top arrival priority</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. COMMUNITY VOICES / SOCIAL PROOF                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Community Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 disp">
              From anxious arrivals to settled locals.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-3xl ${T.card} border ${T.line} shadow-sm space-y-4`}>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed italic">
                "Finding an apartment and doing the Anmeldung in Berlin almost broke me until someone in Meet Peanut walked me through the exact appointment timing. Meet Peanut made it so simple!"
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 font-bold text-xs flex items-center justify-center text-orange-600">
                  AR
                </div>
                <div>
                  <p className="text-xs font-bold">Alex Rivera</p>
                  <p className="text-[10px] text-slate-400">Software Engineer · USA ➔ Berlin</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl ${T.card} border ${T.line} shadow-sm space-y-4`}>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed italic">
                "The Ask Peanut AI translated our Japanese municipal pension letter in 5 seconds and saved us a trip to the Shibuya ward office. Essential tool for any expat."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 font-bold text-xs flex items-center justify-center text-blue-600">
                  KT
                </div>
                <div>
                  <p className="text-xs font-bold">Kenji & Tara</p>
                  <p className="text-[10px] text-slate-400">Digital Nomads · Canada ➔ Tokyo</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl ${T.card} border ${T.line} shadow-sm space-y-4`}>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed italic">
                "I was terrified about GP registration and National Insurance in London. The roadmap had direct links to my local surgery and clear document requirements."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold text-xs flex items-center justify-center text-emerald-600">
                  MS
                </div>
                <div>
                  <p className="text-xs font-bold">Maria Santos</p>
                  <p className="text-[10px] text-slate-400">Product Designer · Brazil ➔ London</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. FREQUENTLY ASKED QUESTIONS                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-28 bg-slate-50/50 dark:bg-neutral-950/40 border-t border-slate-100 dark:border-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 disp">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`${T.card} border ${T.line} rounded-2xl overflow-hidden transition-all`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-base sm:text-lg flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="text-orange-500 shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-neutral-300 leading-relaxed border-t border-slate-100 dark:border-neutral-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. BOTTOM CALL TO ACTION                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto mb-6 flex items-center justify-center shadow-md">
                <PeanutLogo size={42} />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black disp leading-tight">
                Start your journey with confidence today.
              </h2>
              <p className="mt-4 text-orange-100 text-sm sm:text-base leading-relaxed">
                Join thousands of expats who turned overwhelming paperwork into simple, step-by-step milestones with Meet Peanut.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onTryDemo}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-base px-8 py-3.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  🚀 Launch Live Demo (No Sign-up)
                </button>
                <button
                  onClick={() => onOpenAuth("intro")}
                  className="bg-orange-950/40 hover:bg-orange-950/60 text-white font-bold text-base px-8 py-3.5 rounded-full border border-white/30 backdrop-blur-sm transition-all"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 9. FOOTER                                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className={`border-t ${T.line} ${T.card2} py-12 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={28} onClick={onEnterApp} />
              <span className="text-xs text-slate-400 dark:text-neutral-500">
                · The friendly relocation assistant for cities worldwide
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-neutral-400">
              <a href="#highlights" className="hover:text-orange-500 transition-colors">Highlights</a>
              <a href="#interactive-preview" className="hover:text-orange-500 transition-colors">Live Demo</a>
              <a href="#destinations" className="hover:text-orange-500 transition-colors">Supported Cities</a>
              <a href="#faq" className="hover:text-orange-500 transition-colors">FAQ</a>
              <button onClick={onEnterApp} className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
                Enter App
              </button>
            </div>

            <div className="text-xs text-slate-400 dark:text-neutral-500">
              © {new Date().getFullYear()} Meet Peanut · Powered by AI Studio
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

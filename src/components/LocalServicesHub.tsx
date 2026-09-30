import React, { useState, useEffect } from "react";
import { 
  Wrench, Phone, ShieldCheck, Star, MapPin, Clock, DollarSign, 
  CheckCircle2, MessageSquare, Send, Search, Wifi, Bus, CreditCard, 
  Home, HeartPulse, FileText, Sparkles, AlertCircle, X, ChevronRight, 
  Award, ThumbsUp, Bookmark, ExternalLink, HelpCircle, UserCheck
} from "lucide-react";
import { Header } from "./Header";
import { Theme, Profile } from "../types";

interface LocalServicesHubProps {
  profile: Profile;
  T: Theme;
  onBack: () => void;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (tab: string) => void;
  user?: any;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: "plumber" | "electrician" | "locksmith" | "handyman" | "movers" | "cleaning" | "appliance";
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  languages: string[];
  hourlyRate: string;
  responseTime: string;
  isVerified: boolean;
  isExpatSpecialist: boolean;
  description: string;
  features: string[];
  reviews: { id: string; author: string; rating: number; date: string; text: string; location: string }[];
}

export const LocalServicesHub = ({
  profile,
  T,
  onBack,
  setGoals,
  setTab,
  user
}: LocalServicesHubProps) => {
  const city = profile.city || "Berlin";
  const host = profile.host || "Germany";
  const origin = profile.origin || "USA";

  const [activeTab, setActiveTab] = useState<"trades" | "essentials" | "transit_mobile">("trades");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [englishOnly, setEnglishOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Modals
  const [quoteModalProvider, setQuoteModalProvider] = useState<ServiceProvider | null>(null);
  const [reviewModalProvider, setReviewModalProvider] = useState<ServiceProvider | null>(null);
  const [callModalProvider, setCallModalProvider] = useState<ServiceProvider | null>(null);

  // Quote form state
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteUrgency, setQuoteUrgency] = useState("flexible");
  const [quoteContactMethod, setQuoteContactMethod] = useState("whatsapp");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewName, setNewReviewName] = useState(profile.name || "Expat Neighbor");
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("peanut_saved_providers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Service Providers tailored to current city
  const [providers, setProviders] = useState<ServiceProvider[]>(() => {
    // Initial dynamic mock directory tailored for city
    return [
      {
        id: "p-plumb-1",
        name: `${city} AquaSafe Express & Heating`,
        category: "plumber",
        categoryLabel: "Plumber & Heating",
        rating: 4.9,
        reviewCount: 38,
        phone: "+49 (0)30 8920 141",
        email: `service@aquasafe-${city.toLowerCase()}.com`,
        languages: ["English", "German", "Spanish"],
        hourlyRate: "€55 - €75 / hr",
        responseTime: "25–40 min emergency response",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Certified Master Plumber serving ${city} and outer suburbs. Emergency burst pipe fixes, water heater descaling, radiator bleeding, dishwasher installations, and drain unblocking.`,
        features: ["24/7 Emergency Callout", "Transparent Flat Estimates", "Digital Invoicing for Landlords", "Speaks Fluent English"],
        reviews: [
          { id: "r1", author: "Marcus Vance", rating: 5, date: "2 days ago", text: "Saved our apartment on a Sunday when a radiator valve burst. Arrived within 30 minutes and spoke great English!", location: city },
          { id: "r2", author: "Aya Tanaka", rating: 5, date: "1 week ago", text: "Helped install our washing machine and checked all drainage pipes. Very fair pricing without surprise extras.", location: city }
        ]
      },
      {
        id: "p-elec-1",
        name: `VoltCraft Certified Electricians ${city}`,
        category: "electrician",
        categoryLabel: "Electrician",
        rating: 4.8,
        reviewCount: 42,
        phone: "+49 (0)30 4421 990",
        email: `help@voltcraft-${city.toLowerCase()}.de`,
        languages: ["English", "German"],
        hourlyRate: "€60 - €80 / hr",
        responseTime: "Same-day or scheduled",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Registered electrical engineers for residential safety checks, stove/oven connections, fuse box upgrades, short-circuit diagnostics, and light fixture installations across ${city}.`,
        features: ["VDE Certified", "Safety Protocol Compliance", "Stove/Oven Hookup Cert", "Fast Booking"],
        reviews: [
          { id: "r3", author: "Priya Sharma", rating: 5, date: "3 days ago", text: "German kitchen stoves require certified hookup for insurance; VoltCraft was quick and provided the certificate immediately.", location: city }
        ]
      },
      {
        id: "p-lock-1",
        name: `${city} FairLock 24/7 Schlüsseldienst`,
        category: "locksmith",
        categoryLabel: "Locksmith / Schlüsseldienst",
        rating: 4.9,
        reviewCount: 89,
        phone: "+49 (0)176 8940 221",
        email: `sos@fairlock-${city.toLowerCase()}.eu`,
        languages: ["English", "German", "French", "Arabic"],
        hourlyRate: "Fixed €69 daytime / €99 night",
        responseTime: "15–30 min arrival guaranteed",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Guaranteed scam-free, transparent flat-rate locksmith service in ${city}. No door destruction techniques, replacement cylinder installation, duplicate key coding, and emergency apartment access.`,
        features: ["Flat-Rate Price Guarantee", "No Hidden Surcharges", "Non-Destructive Entry", "Card & Cash Accepted"],
        reviews: [
          { id: "r4", author: "Julian Becker", rating: 5, date: "Yesterday", text: "Locked my keys inside at 11 PM. They arrived in 20 minutes, opened the door in 30 seconds without damaging the lock, and charged exactly the promised flat rate!", location: city }
        ]
      },
      {
        id: "p-handy-1",
        name: `UrbanPro Handyman & Furniture Assembly`,
        category: "handyman",
        categoryLabel: "Handyman & Mounting",
        rating: 4.7,
        reviewCount: 56,
        phone: "+49 (0)152 7781 334",
        email: `projects@urbanpro-${city.toLowerCase()}.com`,
        languages: ["English", "German", "Russian"],
        hourlyRate: "€38 - €50 / hr",
        responseTime: "Next-day appointments",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Expert assembly of IKEA PAX wardrobes, kitchen cabinetry, heavy wall-mount mirrors, curtain rod installation, door adjustments, and minor drywall repairs in ${city}.`,
        features: ["Brings Own Professional Tools", "Wall-Mounting Stud Finder", "Furniture Assembly Pros", "Clean Work Area"],
        reviews: [
          { id: "r5", author: "Chloe Martin", rating: 5, date: "4 days ago", text: "Built our huge 3-meter wardrobe and mounted our 65-inch TV securely onto concrete walls. Professional and clean.", location: city }
        ]
      },
      {
        id: "p-clean-1",
        name: `PureHome Handover & Deep Cleaning ${city}`,
        category: "cleaning",
        categoryLabel: "Move-in / Move-out Cleaning",
        rating: 4.8,
        reviewCount: 64,
        phone: "+49 (0)30 6712 509",
        email: `booking@purehome-${city.toLowerCase()}.de`,
        languages: ["English", "German", "Ukrainian", "Polish"],
        hourlyRate: "€30 - €42 / hr",
        responseTime: "Flexible scheduling",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Specialized deposit-guarantee apartment move-out cleaning. Full kitchen degreasing, oven renewal, lime-scale bathroom descaling, window washing, and landlord handover standards.`,
        features: ["Deposit-Back Guarantee", "Eco-Friendly Chemicals", "Complete Inspection Checklist", "Invoice for Tax Write-off"],
        reviews: [
          { id: "r6", author: "Daniel Kim", rating: 5, date: "2 weeks ago", text: "Got our full rental deposit back! The landlord inspection was painless thanks to their deep clean.", location: city }
        ]
      },
      {
        id: "p-mov-1",
        name: `${city} Expat Movers & Van Transport`,
        category: "movers",
        categoryLabel: "Moving & Van Services",
        rating: 4.9,
        reviewCount: 71,
        phone: "+49 (0)172 4410 882",
        email: `move@expatmovers-${city.toLowerCase()}.org`,
        languages: ["English", "German", "Spanish", "Hindi"],
        hourlyRate: "€65 - €90 / hr (Van + 2 Helpers)",
        responseTime: "Book 2-3 days in advance",
        isVerified: true,
        isExpatSpecialist: true,
        description: `Stress-free apartment moves across ${city} and regional relocations in ${host}. Van plus experienced carrying crew, packing boxes, furniture blankets, and no-parking zone permits handled.`,
        features: ["Halteverbot (No-Parking) Booking", "Heavy Lifting Included", "Cargo Transit Insurance", "Friendly Expat Crew"],
        reviews: [
          { id: "r7", author: "Liam O'Connor", rating: 5, date: "5 days ago", text: "Moved our entire 2-bedroom apartment across the city in 4 hours. Super careful with our fragile monitors and plants.", location: city }
        ]
      },
      {
        id: "p-app-1",
        name: `ApplianceCare & Washer Diagnostics`,
        category: "appliance",
        categoryLabel: "Appliance Repair",
        rating: 4.7,
        reviewCount: 29,
        phone: "+49 (0)30 5590 120",
        email: `repairs@appliancecare-${city.toLowerCase()}.com`,
        languages: ["English", "German"],
        hourlyRate: "€49 inspection + parts",
        responseTime: "1–2 business days",
        isVerified: true,
        isExpatSpecialist: false,
        description: `On-site repair for washing machines, dishwashers, ovens, and refrigerators (Bosch, Siemens, Miele, Samsung, Whirlpool). Transparent repair vs replacement consultation.`,
        features: ["Original Replacement Parts", "Written 12-Month Warranty", "Upfront Diagnostic Fee", "English Invoices"],
        reviews: [
          { id: "r8", author: "Serena Wu", rating: 4, date: "1 week ago", text: "Fixed our leaking Siemens dishwasher on the spot with a replacement pump. Saved us buying a new one!", location: city }
        ]
      }
    ];
  });

  // Filter providers
  const filteredProviders = providers.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEnglish = !englishOnly || p.languages.includes("English");
    const matchesVerified = !verifiedOnly || p.isVerified;
    return matchesCategory && matchesSearch && matchesEnglish && matchesVerified;
  });

  // Toggle bookmarking a provider
  const toggleSaveProvider = (id: string) => {
    setSavedProviderIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem("peanut_saved_providers", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Submit new review
  const handleAddReview = () => {
    if (!reviewModalProvider || !newReviewText.trim()) return;
    const newRev = {
      id: "rev_" + Date.now(),
      author: newReviewName.trim() || "Expat Neighbor",
      rating: newRating,
      date: "Just now",
      text: newReviewText.trim(),
      location: city
    };

    setProviders(prev => prev.map(p => {
      if (p.id === reviewModalProvider.id) {
        const updatedReviews = [newRev, ...p.reviews];
        const avg = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
        return {
          ...p,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: Number(avg.toFixed(1))
        };
      }
      return p;
    }));

    setReviewModalProvider(null);
    setNewReviewText("");
  };

  // Submit quote inquiry
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteModalProvider(null);
      setQuoteDesc("");
    }, 2000);
  };

  // Add essentials to user's roadmap goals
  const addEssentialGoalToRoadmap = (title: string, category: string, steps: { t: string; d: string }[]) => {
    const newGoal = {
      id: "g" + Date.now(),
      title,
      cat: category,
      icon: Wrench,
      steps: steps.map(s => ({ ...s, done: false, tool: "Local Services & Immigrant Essentials" }))
    };
    setGoals((prev: any[]) => [...prev, newGoal]);
    setTab("roadmap");
  };

  return (
    <div className="pb-24">
      <Header 
        T={T} 
        title="Local Services & Essentials" 
        back={onBack} 
      />

      {/* Hero Dossier Banner for Current Location */}
      <div className="mx-4 mb-4 p-4 rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-600/15 border border-orange-200/60 dark:border-zinc-800 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Wrench size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-sm">
                Local Directory & Guide
              </span>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <MapPin size={12} /> {city}, {host}
              </span>
            </div>
            <h2 className={`text-base font-extrabold mt-1 ${T.text}`}>
              Immigrant Essentials & Trusted Local Trades
            </h2>
            <p className={`text-xs ${T.sub} mt-0.5 leading-relaxed`}>
              Everything you need upon arrival in {city}: vetted English-speaking plumbers, electricians, locksmiths, verified SIM card networks, and public transit bus passes.
            </p>
          </div>
        </div>

        {/* Quick Tabs Switcher */}
        <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 rounded-2xl bg-orange-500/10 dark:bg-zinc-800/60 border border-orange-200/30 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab("trades")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "trades"
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <Wrench size={13} />
            <span>Trades & Repairs</span>
          </button>
          <button
            onClick={() => setActiveTab("transit_mobile")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "transit_mobile"
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <Wifi size={13} />
            <span>SIM & Transit</span>
          </button>
          <button
            onClick={() => setActiveTab("essentials")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "essentials"
                ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : `${T.sub} hover:text-orange-500`
            }`}
          >
            <Sparkles size={13} />
            <span>Arrival Essentials</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: LOCAL TRADES & REPAIRS (PLUMBER, ELECTRICIAN, ETC.)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "trades" && (
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="mx-4 space-y-2.5">
            <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 ${T.card} border ${T.line} shadow-sm`}>
              <Search size={16} className={T.sub} />
              <input 
                placeholder={`Search plumber, electrician, locksmith in ${city}…`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-xs sm:text-sm outline-none ${T.text}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={`p-1 rounded-full ${T.card2} text-xs`}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Trade Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: "all", label: "All Services" },
                { id: "plumber", label: "🔧 Plumber & Pipe" },
                { id: "electrician", label: "⚡ Electrician" },
                { id: "locksmith", label: "🔑 Locksmith" },
                { id: "handyman", label: "🔨 Handyman & IKEA" },
                { id: "cleaning", label: "✨ Deposit Cleaning" },
                { id: "movers", label: "📦 Moving Van" },
                { id: "appliance", label: "🧺 Appliances" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : `${T.card} ${T.sub} border ${T.line} hover:border-orange-300`
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={englishOnly} 
                    onChange={e => setEnglishOnly(e.target.checked)} 
                    className="accent-orange-500 rounded" 
                  />
                  <span className={`text-xs font-semibold ${T.text}`}>English-speaking only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={verifiedOnly} 
                    onChange={e => setVerifiedOnly(e.target.checked)} 
                    className="accent-orange-500 rounded" 
                  />
                  <span className={`text-xs font-semibold ${T.text}`}>Expat Verified</span>
                </label>
              </div>
              <span className={`text-[11px] ${T.sub}`}>
                {filteredProviders.length} verified in {city}
              </span>
            </div>
          </div>

          {/* Warning Box on Trade Scams */}
          <div className="mx-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Immigrant Safety Tip: Always Confirm Upfront Pricing
              </p>
              <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5 leading-relaxed">
                In Europe and abroad, emergency locksmiths and plumbers without flat rates may overcharge. All providers listed here are verified and commit to transparent quotes before starting work.
              </p>
            </div>
          </div>

          {/* Providers List */}
          <div className="mx-4 space-y-3.5">
            {filteredProviders.map(provider => {
              const isSaved = savedProviderIds.includes(provider.id);
              return (
                <div 
                  key={provider.id} 
                  className={`${T.card} rounded-3xl p-4 border ${T.line} shadow-sm transition-all hover:shadow-md space-y-3`}
                >
                  {/* Top Bar: Name, Category, Verified badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300">
                          {provider.categoryLabel}
                        </span>
                        {provider.isVerified && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                            <ShieldCheck size={12} /> Expat Verified
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-extrabold mt-1.5 leading-tight ${T.text}`}>
                        {provider.name}
                      </h3>
                      <div className="flex items-center gap-2.5 mt-1 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={13} fill="currentColor" />
                          <span>{provider.rating}</span>
                          <span className={`${T.sub} font-normal`}>({provider.reviewCount} reviews)</span>
                        </div>
                        <span className={T.sub}>•</span>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <Clock size={12} /> {provider.responseTime}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleSaveProvider(provider.id)}
                      className={`p-2 rounded-full border ${isSaved ? "bg-orange-500 text-white border-orange-500" : `${T.card2} ${T.sub} ${T.line}`} transition-all active:scale-90`}
                      title={isSaved ? "Remove from saved" : "Save provider"}
                    >
                      <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className={`text-xs ${T.sub} leading-relaxed`}>
                    {provider.description}
                  </p>

                  {/* Highlights / Features */}
                  <div className="flex flex-wrap gap-1.5">
                    {provider.features.map((feat, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50/70 dark:bg-zinc-800/80 text-orange-800 dark:text-orange-200 flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-orange-500" />
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Details Bar: Rates and Languages */}
                  <div className={`p-2.5 rounded-2xl ${T.card2} flex items-center justify-between text-xs`}>
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${T.sub} block`}>Standard Rates</span>
                      <span className={`font-bold ${T.text}`}>{provider.hourlyRate}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${T.sub} block`}>Languages</span>
                      <span className={`font-bold text-orange-600 dark:text-orange-400`}>
                        {provider.languages.join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => setCallModalProvider(provider)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <Phone size={13} />
                      <span>Call Now</span>
                    </button>

                    <button
                      onClick={() => setQuoteModalProvider(provider)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <MessageSquare size={13} />
                      <span>Get Quote</span>
                    </button>

                    <button
                      onClick={() => setReviewModalProvider(provider)}
                      className={`${T.card2} hover:border-orange-400 border ${T.line} ${T.text} font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95`}
                    >
                      <Star size={13} className="text-amber-500" />
                      <span>Reviews ({provider.reviews.length})</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle size={36} className="mx-auto text-orange-400 opacity-60 mb-2" />
                <p className={`font-bold ${T.text}`}>No services found in {city}</p>
                <p className={`text-xs ${T.sub} mt-1`}>Try clearing your filters or search keywords.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: MOBILE NETWORK / SIM CARDS & PUBLIC TRANSIT FACILITIES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "transit_mobile" && (
        <div className="mx-4 space-y-5">
          {/* SECTION A: MOBILE NETWORKS & LOCAL SIM CARDS */}
          <div className={`${T.card} rounded-3xl p-5 border ${T.line} shadow-sm space-y-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                <Wifi size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Mobile Connectivity Guide
                </span>
                <h3 className={`text-base font-extrabold ${T.text}`}>
                  Buying a Local SIM Card & Mobile Network in {host}
                </h3>
              </div>
            </div>

            <p className={`text-xs ${T.sub} leading-relaxed`}>
              Staying connected upon arrival in {city} is essential for verification SMS codes, delivery tracking, and map navigation. Here is how local plans work in {host}:
            </p>

            {/* Provider Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-2xl ${T.card2} border ${T.line} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-extrabold ${T.text}`}>Prepaid SIM (No Contract)</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Recommended First
                  </span>
                </div>
                <p className={`text-xs ${T.sub} leading-relaxed`}>
                  Can be bought at supermarkets, tech stores, or online. Zero cancellation hassle; cancel anytime without a 24-month contract lock-in.
                </p>
                <div className="pt-2 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                  Avg: €10–€15/month for 15GB–30GB 5G
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${T.card2} border ${T.line} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-extrabold ${T.text}`}>eSIM (Instant Activation)</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Before Landing
                  </span>
                </div>
                <p className={`text-xs ${T.sub} leading-relaxed`}>
                  If your phone supports eSIM, activate via Airalo, Maya Mobile, or local providers (e.g. Fraenk, Congstar) right before taking off.
                </p>
                <div className="pt-2 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                  Instant QR code activation; no physical swap
                </div>
              </div>
            </div>

            {/* Crucial SIM Registration Checklist */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} /> Mandatory Law: Video Passport Verification
              </p>
              <ul className="text-[11px] text-blue-800 dark:text-blue-300 space-y-1.5 leading-relaxed">
                <li>• In {host}, anti-terrorism legislation requires identity verification (VideoIdent or PostIdent at a post office) before any SIM card activates.</li>
                <li>• <strong>Tip:</strong> Keep your physical passport ready with adequate lighting when doing the 5-minute video call.</li>
                <li>• EU Roaming is included free of charge across all 27 EU member countries.</li>
              </ul>
            </div>

            <button
              onClick={() => addEssentialGoalToRoadmap(
                `Get Local Mobile SIM in ${city}`, 
                "Communication", 
                [
                  { t: "Select provider (Prepaid or eSIM)", d: "Compare coverage in " + city + " and avoid 24-month contract lock-ins." },
                  { t: "Complete Video Passport Verification", d: "Have passport and quiet room ready for the VideoIdent agent." },
                  { t: "Test SMS receiving and local phone number", d: "Save your new local number in emergency contacts." }
                ]
              )}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Award size={15} />
              <span>Add "Get Local SIM" to My Roadmap</span>
            </button>
          </div>

          {/* SECTION B: PUBLIC TRANSIT & BUS FACILITIES */}
          <div className={`${T.card} rounded-3xl p-5 border ${T.line} shadow-sm space-y-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                <Bus size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Public Transit & Bus Network
                </span>
                <h3 className={`text-base font-extrabold ${T.text}`}>
                  Bus, Metro & Tram Navigation in {city}
                </h3>
              </div>
            </div>

            <p className={`text-xs ${T.sub} leading-relaxed`}>
              Public transit in {city} is extensive, efficient, and clean. However, tariff zones and validation rules catch newcomers off guard. Here is what you need to know:
            </p>

            {/* Essential Transit Tips */}
            <div className="space-y-2.5">
              <div className={`p-3.5 rounded-2xl ${T.card2} flex items-start gap-3`}>
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 text-orange-600 flex items-center justify-center shrink-0 font-extrabold text-sm">
                  1
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${T.text}`}>Monthly Commuter Passes</h4>
                  <p className={`text-[11px] ${T.sub} mt-0.5 leading-relaxed`}>
                    Look into nationwide or city-wide passes (like the Deutschlandticket in Germany for €49/mo, or local monthly student/work tickets). It allows unlimited travel on all local buses, trams, U-Bahn, and regional S-Bahn.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${T.card2} flex items-start gap-3`}>
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-zinc-800 text-red-600 flex items-center justify-center shrink-0 font-extrabold text-sm">
                  2
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${T.text}`}>Crucial: Always Stamp / Validate Paper Tickets!</h4>
                  <p className={`text-[11px] ${T.sub} mt-0.5 leading-relaxed`}>
                    Buying a ticket at a station does NOT make it valid. You MUST stamp it in the red/yellow punch box on the platform or inside the bus before departure. Traveling with an unstamped ticket carries a €60+ fine!
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${T.card2} flex items-start gap-3`}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-zinc-800 text-emerald-600 flex items-center justify-center shrink-0 font-extrabold text-sm">
                  3
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${T.text}`}>Bus Boarding & Stop Request Protocols</h4>
                  <p className={`text-[11px] ${T.sub} mt-0.5 leading-relaxed`}>
                    In many cities, you must press the "STOP" button 150m before your station, otherwise the driver will skip it if nobody is waiting. In the evening, enter through the front door and show your pass to the driver.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${T.card2} flex items-start gap-3`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-zinc-800 text-blue-600 flex items-center justify-center shrink-0 font-extrabold text-sm">
                  4
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${T.text}`}>Download the Official City Transit App</h4>
                  <p className={`text-[11px] ${T.sub} mt-0.5 leading-relaxed`}>
                    Use Google Maps or the city transit app (e.g., BVG Fahrinfo, Citymapper, DB Navigator). Digital tickets bought in the app are automatically validated with a QR code and timestamp.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => addEssentialGoalToRoadmap(
                `Master Public Transit in ${city}`, 
                "Transport", 
                [
                  { t: "Download official local transit app", d: "Set up account and credit card for frictionless digital tickets." },
                  { t: "Buy monthly transit subscription", d: "Verify if employer or university provides transit subsidy discounts." },
                  { t: "Learn your daily commute lines", d: "Test your route during off-peak hours to understand transfers." }
                ]
              )}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Award size={15} />
              <span>Add "Transit Pass" to My Roadmap</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: IMMIGRANT IMMEDIATE & LONG-STAY ARRIVAL ESSENTIALS     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "essentials" && (
        <div className="mx-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>
              Immigration Dossier for {city}, {host}
            </h3>
            <span className="text-[10px] font-semibold text-orange-500">Timeline Ranked</span>
          </div>

          {/* Immediate vs Long-Stay Cards */}
          {[
            {
              title: "1. City Address Registration (Anmeldung / Padrón)",
              timeframe: "Days 1–14 upon arrival",
              urgency: "Mandatory Priority",
              badgeColor: "bg-red-500 text-white",
              desc: `You cannot open most traditional bank accounts or get your official Tax ID without registering your address at the local municipal office (Bürgeramt/Town Hall) in ${city}.`,
              checklist: [
                "Signed landlord confirmation (Wohnungsgeberbestätigung)",
                "Rental lease agreement (Mietvertrag)",
                "Passport / National ID card",
                "Appointment confirmation printout"
              ]
            },
            {
              title: "2. Expat Borderless Banking & Remittance",
              timeframe: "Immediate (Day 1)",
              urgency: "Essential",
              badgeColor: "bg-blue-500 text-white",
              desc: "Traditional banks require an address registration certificate. While waiting, use expat-friendly digital banks (Wise, Revolut, N26) to receive money, pay local rent via SEPA/ACH, and avoid high conversion fees.",
              checklist: [
                "Open multi-currency account with local IBAN/sort-code",
                "Set up standing order (Dauerauftrag) for initial apartment deposit",
                "Keep international debit card active until local card arrives"
              ]
            },
            {
              title: "3. Health Insurance Certificate & Finding a Doctor",
              timeframe: "Week 1",
              urgency: "Required for Visa & Work",
              badgeColor: "bg-emerald-500 text-white",
              desc: `Healthcare is strictly mandatory in ${host}. Register with a public or private health insurance provider, then use online platforms (like Doctolib) to register with an English-speaking General Practitioner (Hausarzt) near your ${city} neighborhood.`,
              checklist: [
                "Obtain electronic health insurance card (eGK)",
                "Book initial consultation with English-speaking GP",
                "Save the 24/7 non-emergency doctor on-call number (116 117 in Europe)"
              ]
            },
            {
              title: "4. Utilities, Home Internet & Waste Separation",
              timeframe: "Weeks 1–3",
              urgency: "Comfort & Legal Compliance",
              badgeColor: "bg-amber-500 text-white",
              desc: `When moving into an unfurnished apartment in ${city}, electricity is not automatically tied to your lease. Switch providers to avoid the expensive default tariff (Grundversorgung). Also, learn color-coded recycling bins to prevent landlord disputes!`,
              checklist: [
                "Read your electricity and water meters on handover day",
                "Order home DSL/Fiber broadband (requires 2–4 weeks installation buffer)",
                "Understand local recycling: Yellow (Packaging), Blue (Paper), Brown (Bio)"
              ]
            },
            {
              title: "5. Converting Your Foreign Driving License",
              timeframe: "Months 1–6 (Long Stay)",
              urgency: "Long Stay Requirement",
              badgeColor: "bg-purple-500 text-white",
              desc: `Non-EU driving licenses are typically valid for only 6 months from the date of your city registration. Book your license transfer appointment early with the local transport authority (Führerscheinstelle) in ${city}.`,
              checklist: [
                "Original driver's license + certified official translation",
                "Biometric passport photo and eye test certificate",
                "Certificate of first-aid course completion (if required)"
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className={`${T.card} rounded-3xl p-4 border ${T.line} shadow-sm space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                    {item.urgency}
                  </span>
                  <h4 className={`text-sm font-extrabold mt-1.5 ${T.text}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                    ⏱ Recommended: {item.timeframe}
                  </p>
                </div>
              </div>

              <p className={`text-xs ${T.sub} leading-relaxed`}>
                {item.desc}
              </p>

              {/* Checklist */}
              <div className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Key Requirements Checklist
                </p>
                {item.checklist.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className={T.text}>{c}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addEssentialGoalToRoadmap(
                  item.title, 
                  "Immigration Milestone", 
                  item.checklist.map(c => ({ t: c, d: `Complete for settling in ${city}` }))
                )}
                className="w-full py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Award size={13} />
                <span>Track this in My Relocation Roadmap</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: GET QUOTE / INQUIRY                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {quoteModalProvider && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${T.card} w-full max-w-md rounded-3xl p-5 border ${T.line} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  Direct Service Request
                </span>
                <h3 className={`text-base font-extrabold ${T.text}`}>
                  Request Quote from {quoteModalProvider.name}
                </h3>
              </div>
              <button 
                onClick={() => setQuoteModalProvider(null)}
                className={`p-1.5 rounded-full ${T.card2} text-xs`}
              >
                <X size={16} />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 size={42} className="text-emerald-500 mx-auto" />
                <h4 className={`text-base font-bold ${T.text}`}>Inquiry Sent!</h4>
                <p className={`text-xs ${T.sub}`}>
                  {quoteModalProvider.name} received your request and will respond via {quoteContactMethod} in approximately {quoteModalProvider.responseTime}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-3 text-xs">
                <div>
                  <label className={`block font-bold mb-1 ${T.sub}`}>Describe the Problem / Job</label>
                  <textarea 
                    required
                    placeholder="E.g., Leaking pipe under kitchen sink, or need 2 IKEA PAX wardrobes assembled..."
                    value={quoteDesc}
                    onChange={e => setQuoteDesc(e.target.value)}
                    className={`w-full p-3 rounded-xl ${T.input} border ${T.line} outline-none min-h-[90px] text-xs resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block font-bold mb-1 ${T.sub}`}>Urgency</label>
                    <select 
                      value={quoteUrgency}
                      onChange={e => setQuoteUrgency(e.target.value)}
                      className={`w-full p-2.5 rounded-xl ${T.input} border ${T.line} outline-none text-xs`}
                    >
                      <option value="emergency">🚨 Emergency (Immediate)</option>
                      <option value="today">Today (Within 24h)</option>
                      <option value="flexible">Flexible (This week)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${T.sub}`}>Preferred Contact</label>
                    <select 
                      value={quoteContactMethod}
                      onChange={e => setQuoteContactMethod(e.target.value)}
                      className={`w-full p-2.5 rounded-xl ${T.input} border ${T.line} outline-none text-xs`}
                    >
                      <option value="whatsapp">WhatsApp Message</option>
                      <option value="phone">Phone Call</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className={`p-3 rounded-xl ${T.card2} flex items-center justify-between text-[11px]`}>
                  <span className={T.sub}>Estimated Standard Rate:</span>
                  <span className="font-bold text-orange-500">{quoteModalProvider.hourlyRate}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={14} />
                  <span>Send Free Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: REVIEWS & WRITE A REVIEW                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {reviewModalProvider && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${T.card} w-full max-w-lg rounded-3xl p-5 border ${T.line} shadow-2xl max-h-[90vh] flex flex-col space-y-4 overflow-hidden`}>
            <div className="flex items-center justify-between border-b pb-3 border-orange-100/20">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <Star size={14} fill="currentColor" />
                  <span>{reviewModalProvider.rating}</span>
                  <span className={T.sub}>• {reviewModalProvider.reviewCount} Verified Community Reviews</span>
                </div>
                <h3 className={`text-base font-extrabold ${T.text}`}>
                  {reviewModalProvider.name}
                </h3>
              </div>
              <button 
                onClick={() => setReviewModalProvider(null)}
                className={`p-1.5 rounded-full ${T.card2} text-xs`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Existing Reviews Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reviewModalProvider.reviews.map(rev => (
                <div key={rev.id} className={`p-3.5 rounded-2xl ${T.card2} space-y-1.5`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center">
                        {rev.author.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-bold ${T.text}`}>{rev.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                      {"★".repeat(rev.rating)}
                      <span className={`${T.sub} font-normal ml-1`}>{rev.date}</span>
                    </div>
                  </div>
                  <p className={`text-xs ${T.sub} leading-relaxed pl-8`}>
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Write a Review Section */}
            <div className={`p-3.5 rounded-2xl ${T.card2} border ${T.line} space-y-2.5`}>
              <p className={`text-xs font-bold ${T.text}`}>Add Your Expat Experience</p>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs ${T.sub}`}>Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`text-base transition-transform active:scale-125 ${
                        star <= newRating ? "text-amber-500" : "text-zinc-300 dark:text-zinc-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                placeholder="Share how quickly they arrived, pricing fairness, and language communication..."
                value={newReviewText}
                onChange={e => setNewReviewText(e.target.value)}
                className={`w-full p-2.5 rounded-xl ${T.input} border ${T.line} outline-none text-xs resize-none min-h-[60px]`}
              />

              <button
                disabled={!newReviewText.trim()}
                onClick={handleAddReview}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-sm"
              >
                Post Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: CALL PROVIDER                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {callModalProvider && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${T.card} w-full max-w-sm rounded-3xl p-5 border ${T.line} shadow-2xl text-center space-y-4`}>
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Phone size={26} />
            </div>

            <div>
              <h3 className={`text-base font-extrabold ${T.text}`}>
                {callModalProvider.name}
              </h3>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {callModalProvider.phone}
              </p>
              <p className={`text-xs ${T.sub} mt-1`}>
                Languages: {callModalProvider.languages.join(", ")}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 text-xs">
              Direct emergency line. Operators will speak English or the local language upon connection.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCallModalProvider(null)}
                className={`flex-1 py-2.5 rounded-xl ${T.card2} font-bold text-xs ${T.text}`}
              >
                Cancel
              </button>
              <a
                href={`tel:${callModalProvider.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone size={14} />
                <span>Dial Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

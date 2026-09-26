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

  const [quoteModalProvider, setQuoteModalProvider] = useState<ServiceProvider | null>(null);
  const [reviewModalProvider, setReviewModalProvider] = useState<ServiceProvider | null>(null);
  const [callModalProvider, setCallModalProvider] = useState<ServiceProvider | null>(null);

  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteUrgency, setQuoteUrgency] = useState("flexible");
  const [quoteContactMethod, setQuoteContactMethod] = useState("whatsapp");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

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

  const [providers, setProviders] = useState<ServiceProvider[]>(() => {
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

  const toggleSaveProvider = (id: string) => {
    setSavedProviderIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem("peanut_saved_providers", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

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

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteModalProvider(null);
      setQuoteDesc("");
    }, 2000);
  };

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
      <Header T={T} title="Local Services & Essentials" back={onBack} />

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

      {activeTab === "trades" && (
        <div className="space-y-4">
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
              <span className={`text-[11px] ${T.sub}`}>{filteredProviders.length} verified in {city}</span>
            </div>
          </div>

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

          <div className="mx-4 space-y-3.5">
            {filteredProviders.map(provider => {
              const isSaved = savedProviderIds.includes(provider.id);
              return (
                <div key={provider.id} className={`${T.card} rounded-3xl p-4 border ${T.line} shadow-sm transition-all hover:shadow-md space-y-3`}>
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
                      <h3 className={`text-base font-extrabold mt-1.5 leading-tight ${T.text}`}>{provider.name}</h3>
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

                  <p className={`text-xs ${T.sub} leading-relaxed`}>{provider.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {provider.features.map((feat, i) => (
                      <span key={i} className={`px-2 py-1 rounded-full text-[10px] font-bold ${T.card2} ${T.sub}`}>{feat}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-orange-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Phone size={13} className="text-orange-500" />
                      <a href={`tel:${provider.phone.replace(/[^+\d]/g, '')}`} className={`${T.text} font-bold hover:underline`}>{provider.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuoteModalProvider(provider)} className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline">Quote</button>
                      <button onClick={() => setCallModalProvider(provider)} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Call</button>
                      <button onClick={() => setReviewModalProvider(provider)} className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline">Review</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "transit_mobile" && (
        <div className="mx-4 space-y-4">
          <div className="rounded-3xl border border-orange-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Wifi className="text-orange-500" size={18} />
              <p className={`text-sm font-extrabold ${T.text}`}>SIM & Connectivity</p>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: "Telekom", detail: "Best urban coverage", icon: "📶" },
                { label: "Vodafone", detail: "Strong 5G bundle", icon: "📱" },
                { label: "O2", detail: "Budget-friendly data", icon: "💼" }
              ].map(item => (
                <button key={item.label} className={`w-full ${T.card2} rounded-2xl p-3 border ${T.line} flex items-center justify-between`}>
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className={`text-xs font-bold ${T.text}`}>{item.label}</span>
                    <span className={`text-[11px] ${T.sub}`}>{item.detail}</span>
                  </span>
                  <ChevronRight size={14} className={T.sub} />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Bus className="text-orange-500" size={18} />
              <p className={`text-sm font-extrabold ${T.text}`}>Transit & Local Travel</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => addEssentialGoalToRoadmap("Transit pass setup", "Daily Life", [{ t: "Find transit office", d: "Look up monthly pass and student concessions" }, { t: "Plan route", d: "Use local app and zone map" }])} className={`${T.card2} rounded-2xl p-3 text-left border ${T.line}`}>
                <span className="text-[11px] font-bold text-orange-600">Monthly Pass</span>
              </button>
              <button onClick={() => addEssentialGoalToRoadmap("Get local SIM", "Connectivity", [{ t: "Compare providers", d: "Choose a data and voice bundle" }, { t: "Activate SIM", d: "Register ID and top up" }])} className={`${T.card2} rounded-2xl p-3 text-left border ${T.line}`}>
                <span className="text-[11px] font-bold text-orange-600">SIM Setup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "essentials" && (
        <div className="mx-4 space-y-3">
          {[
            { title: "Set up bank account", cat: "Daily Life", steps: [{ t: "Choose a bank", d: "Check fees and account opening" }, { t: "Prepare documents", d: "Bring passport and address certificate" }] },
            { title: "Find a local doctor", cat: "Health", steps: [{ t: "Choose doctor", d: "Look for English-speaking GP" }, { t: "Book appointment", d: "Use Doctolib or local clinic" }] },
            { title: "Get registered", cat: "Legal", steps: [{ t: "Book Bürgeramt", d: "Bring landlord confirmation" }, { t: "Register address", d: "Receive tax ID" }] }
          ].map(item => (
            <button key={item.title} onClick={() => addEssentialGoalToRoadmap(item.title, item.cat, item.steps)} className={`${T.card} rounded-2xl p-4 border ${T.line} text-left`}> 
              <div className="flex items-center justify-between">
                <span className={`font-extrabold ${T.text}`}>{item.title}</span>
                <ChevronRight size={14} className={T.sub} />
              </div>
            </button>
          ))}
        </div>
      )}

      {quoteModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`${T.card} rounded-3xl border ${T.line} p-5 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-orange-500">Request a quote</p>
                <p className={`text-sm font-extrabold ${T.text}`}>{quoteModalProvider.name}</p>
              </div>
              <button onClick={() => setQuoteModalProvider(null)}><X size={16} className={T.sub} /></button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={handleSendQuote}>
              <textarea value={quoteDesc} onChange={e => setQuoteDesc(e.target.value)} className={`w-full ${T.input} rounded-2xl p-3 border ${T.line} outline-none`} placeholder="What do you need help with?" required />
              <div className="grid grid-cols-2 gap-2">
                <select value={quoteUrgency} onChange={e => setQuoteUrgency(e.target.value)} className={`w-full ${T.input} rounded-2xl p-3 border ${T.line}`}> 
                  <option value="flexible">Flexible</option>
                  <option value="urgent">Urgent</option>
                  <option value="today">Today</option>
                </select>
                <select value={quoteContactMethod} onChange={e => setQuoteContactMethod(e.target.value)} className={`w-full ${T.input} rounded-2xl p-3 border ${T.line}`}> 
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl py-3">
                {quoteSubmitted ? "Sent" : "Send Quote Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {callModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`${T.card} rounded-3xl border ${T.line} p-5 w-full max-w-sm shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-orange-500">Call service</p>
                <p className={`text-sm font-extrabold ${T.text}`}>{callModalProvider.name}</p>
              </div>
              <button onClick={() => setCallModalProvider(null)}><X size={16} className={T.sub} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div className={`rounded-2xl ${T.card2} p-3`}>
                <p className={`text-xs ${T.sub}`}>Phone</p>
                <a href={`tel:${callModalProvider.phone.replace(/[^+\d]/g, '')}`} className={`text-base font-extrabold ${T.text}`}>{callModalProvider.phone}</a>
              </div>
              <div className={`rounded-2xl ${T.card2} p-3`}>
                <p className={`text-xs ${T.sub}`}>Response time</p>
                <p className={`text-sm font-bold ${T.text}`}>{callModalProvider.responseTime}</p>
              </div>
              <button onClick={() => setCallModalProvider(null)} className="w-full bg-orange-500 text-white rounded-2xl py-3 font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {reviewModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`${T.card} rounded-3xl border ${T.line} p-5 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-orange-500">Add review</p>
                <p className={`text-sm font-extrabold ${T.text}`}>{reviewModalProvider.name}</p>
              </div>
              <button onClick={() => setReviewModalProvider(null)}><X size={16} className={T.sub} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setNewRating(n)} className={`${n <= newRating ? "text-amber-500" : T.sub}`}> <Star size={18} fill={n <= newRating ? "currentColor" : "none"} /> </button>
                ))}
              </div>
              <input value={newReviewName} onChange={e => setNewReviewName(e.target.value)} className={`w-full ${T.input} rounded-2xl p-3 border ${T.line} outline-none`} placeholder="Your name" />
              <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} className={`w-full ${T.input} rounded-2xl p-3 border ${T.line} outline-none`} placeholder="Share your experience" required />
              <button onClick={handleAddReview} className="w-full bg-orange-500 text-white rounded-2xl py-3 font-bold">Submit review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

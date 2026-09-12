import React, { useState } from "react";
import { 
  Search, ChevronRight, Wrench, CheckCircle2, ChevronDown, MessageCircle, 
  ExternalLink, PlayCircle, FileText, AlertTriangle, Clock, ShieldAlert, 
  Check, X, ShieldCheck, HelpCircle, ArrowRight, DollarSign, Award, 
  Info, Heart, List, MapPin, Building, CheckSquare, Square, Sparkles 
} from "lucide-react";
import { Header } from "./Header";
import { Theme, Profile } from "../types";
import { api, mapStepToApi } from "../api";

interface ToolDetailProps {
  tool: any;
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setOpenTool: (val: string | null) => void;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
  user?: any;
}

// 1. Tool Metadata Mapper to provide detailed stats, checklists, and tips for every tool
const getToolMetadata = (name: string, origin: string, city: string, host: string) => {
  const defaults = {
    difficulty: "Easy",
    cost: "Free",
    timeline: "Instant",
    effort: 20,
    effortText: "Low",
    documents: ["Valid Passport / National ID"],
    proTips: ["Research requirements online before starting.", "Keep digital copies of all your certificates."],
    mistakes: ["Arriving without an appointment.", "Not checking English support beforehand."]
  };

  const metadata: Record<string, typeof defaults> = {
    "Emergency Numbers": {
      difficulty: "Very Easy",
      cost: "Free",
      timeline: "Instant",
      effort: 5,
      effortText: "Minimal",
      documents: [],
      proTips: [
        "Call 112 for any fire, medical, or police crisis in Europe.",
        "No SIM card is required to dial emergency numbers.",
        "Operators can direct you to English speakers."
      ],
      mistakes: [
        "Assuming you need money or a SIM to call.",
        "Calling 112 for administrative queries."
      ]
    },
    "Registration": {
      difficulty: "Hard",
      cost: "Free",
      timeline: "1–3 weeks",
      effort: 75,
      effortText: "High",
      documents: [
        "Wohnungsgeberbestätigung (Signed Landlord Confirmation Form)",
        "Valid Passport or National ID Card",
        "Rental Agreement (Mietvertrag)",
        "Completed Registration Application Form"
      ],
      proTips: [
        `Book your slot at midnight or early morning (7:30 - 8:00 AM) when cancellations are dynamically released.`,
        `You can register at ANY citizen office (Bürgeramt) in ${city}, not just the one in your neighborhood.`,
        "Bring a German-speaking friend or hire a local translator if you are nervous; officials are legally required to conduct appointments in German."
      ],
      mistakes: [
        "Bringing just your lease agreement instead of the specific landlord confirmation certificate.",
        "Attempting to register using temporary hotel or short-term Airbnb addresses that refuse to provide confirmation."
      ]
    },
    "Visas & Permits": {
      difficulty: "Very Hard",
      cost: "€100 - €150",
      timeline: "4–12 weeks",
      effort: 90,
      effortText: "Intense",
      documents: [
        "Biometric Passport Photo (meeting national standards)",
        "Completed Application Form",
        "Signed Employment Contract & Job Description",
        "Proof of Local Health Insurance Coverage"
      ],
      proTips: [
        "Apply for an appointment the moment you arrive; queue times can stretch for several months.",
        "Verify if your salary meets the specific threshold to fast-track your application under professional talent routes.",
        "Keep high-resolution PDF scans of every single form you submit."
      ],
      mistakes: [
        "Starting your job before receiving physical work authorization or explicit approval cards.",
        "Allowing your tourist or entry visa to expire before submitting your official extension application."
      ]
    },
    "Banking": {
      difficulty: "Easy",
      cost: "Free - €5/mo",
      timeline: "1–3 days",
      effort: 30,
      effortText: "Light",
      documents: [
        "Valid Passport or ID card",
        "Meldebestätigung (Local Address Registration Certificate)",
        "Tax Identification Number (provided post-registration)"
      ],
      proTips: [
        `Mobile-first neo-banks like N26 or Revolut support opening accounts in English within 10 minutes.`,
        "For video verification, sit in a quiet, brightly lit room with your physical passport ready.",
        "Check if your account has free cash withdrawals at local ATMs."
      ],
      mistakes: [
        "Assuming international credit cards will work everywhere; small shops and administrative offices often only accept Girocard/EC cards.",
        "Forgetting to submit your Tax ID within 90 days, which can trigger automatic tax withholding."
      ]
    },
    "Housing & Utilities": {
      difficulty: "Very Hard",
      cost: "1-3 Mo. Deposit",
      timeline: "4–12 weeks",
      effort: 85,
      effortText: "High",
      documents: [
        "Last 3 Months' Payslips (or official employment offer letter)",
        "Credit Score Report (e.g., SCHUFA report)",
        "Valid Passport and Visa copy",
        "No-Debt Certificate from your previous landlord (Mietschuldenfreiheitsbescheinigung)"
      ],
      proTips: [
        "Assemble an 'Application Portfolio' PDF to send immediately during or right after flat viewings.",
        "Consider sharing a flat (WG/shared house) first to get registered while searching for your own place.",
        "Always verify the landlord's identity before transferring any holding deposit."
      ],
      mistakes: [
        "Transferring a deposit or first month's rent before seeing the property in person or signing a formal contract.",
        "Forgetting that 'Cold Rent' (Kaltmiete) does not include heating, hot water, electricity, or waste collection."
      ]
    },
    "Health Insurance": {
      difficulty: "Medium",
      cost: "~14.6% of wage",
      timeline: "1–2 weeks",
      effort: 50,
      effortText: "Moderate",
      documents: [
        "Recent Passport-Style Photo",
        "Employment Contract or Student Enrollment Paper",
        "Cancellation letter from prior insurer (if applicable)"
      ],
      proTips: [
        "Public health insurance is standard and covers family members for free. Private is risk-based.",
        "Ensure your HR department receives your insurance certificate before your first payroll run.",
        "Check if your insurance offers bonus programs for active lifestyles or routine checkups."
      ],
      mistakes: [
        "Assuming dental cleanings or glasses are fully covered by default (they usually require add-ons).",
        "Opting for private insurance without realizing how difficult and costly it is to switch back to public later."
      ]
    },
    "Finding a Doctor": {
      difficulty: "Easy",
      cost: "Covered by Ins.",
      timeline: "1–5 days",
      effort: 25,
      effortText: "Light",
      documents: [
        "Physical Health Insurance Card",
        "List of past surgeries or medications"
      ],
      proTips: [
        "Use Doctolib or local matching portals to easily filter doctors by languages spoken.",
        "For urgent but non-life-threatening issues, ask for 'Akutsprechstunde' (same-day morning walk-ins)."
      ],
      mistakes: [
        "Heading directly to a hospital Emergency Room for basic colds, prescriptions, or non-emergencies."
      ]
    }
  };

  const key = Object.keys(metadata).find(k => name.toLowerCase().includes(k.toLowerCase())) || "default";
  const result = metadata[key] || defaults;

  return {
    ...result,
    proTips: result.proTips.map(p => p.replace(/\${city}/g, city).replace(/\${host}/g, host).replace(/\${origin}/g, origin)),
    mistakes: result.mistakes.map(p => p.replace(/\${city}/g, city).replace(/\${host}/g, host).replace(/\${origin}/g, origin)),
    documents: result.documents.map(p => p.replace(/\${city}/g, city).replace(/\${host}/g, host).replace(/\${origin}/g, origin))
  };
};

// 2. Interactive Document Hotspot View
const DocumentMockup = ({ toolName, T }: { toolName: string; T: Theme }) => {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const mockups: Record<string, {
    title: string;
    sub: string;
    fields: { label: string; desc: string; x: string; y: string }[];
  }> = {
    "Registration": {
      title: "Address Registration Form (Anmeldung)",
      sub: "Interactive Sample Form",
      fields: [
        { label: "Landlord Signature", desc: "The landlord's physical or authorized digital signature is mandatory here. Photocopied or typed text is rejected.", x: "78%", y: "84%" },
        { label: "Move-in Date", desc: "Must match your rental contract date exactly. Try to register within 14 days of this date.", x: "25%", y: "45%" },
        { label: "Previous Residence", desc: "If moving from abroad, write 'Ausland' (Abroad) here. You don't need to specify your old address.", x: "55%", y: "30%" },
        { label: "Official Stamp", desc: "The clerk stamps and signs this at your appointment. Keep the original paper extremely safe!", x: "82%", y: "22%" }
      ]
    },
    "Banking": {
      title: "Current Account Agreement",
      sub: "Interactive Account Specifications",
      fields: [
        { label: "Tax Identification Number", desc: "You have 90 days from opening to supply your local Tax ID, or your interest yields are taxed.", x: "30%", y: "70%" },
        { label: "VideoIdent verification", desc: "Completed via mobile app. Hold your passport steady. Digital copies are strictly forbidden.", x: "70%", y: "42%" },
        { label: "Overdraft Limit (Dispo)", desc: "Starts at €0 for newcomers until you show 3 consecutive monthly salary deposits.", x: "48%", y: "88%" }
      ]
    },
    "Visas & Permits": {
      title: "Residence Permit Form (Aufenthaltstitel)",
      sub: "Sample Application Sections",
      fields: [
        { label: "Employer Declaration", desc: "For work visas, your employer must complete the official employment verification attachment.", x: "65%", y: "78%" },
        { label: "Biometric Picture", desc: "Must be taken in the last 6 months with standard front face angle. Selfies are rejected.", x: "85%", y: "25%" },
        { label: "Sufficient Subsistence", desc: "Proof of financial stability, like salary slips or a regulated blocked bank account.", x: "32%", y: "55%" }
      ]
    },
    "Housing & Utilities": {
      title: "Rental Contract (Mietvertrag)",
      sub: "Critical Clauses Blueprint",
      fields: [
        { label: "Warm vs Cold Rent", desc: "Cold Rent covers the space. Warm Rent includes water/heating. Internet and power are usually extra.", x: "30%", y: "45%" },
        { label: "Security Deposit", desc: "Legally capped at 3 months cold rent. Must be deposited in an interest-bearing escrow account.", x: "70%", y: "70%" },
        { label: "Notice Period", desc: "The legal standard is 3 months notice. Verify if there's an initial minimum lease duration.", x: "50%", y: "85%" }
      ]
    },
    "Health Insurance": {
      title: "Insurance Card Registration",
      sub: "Key Benefits Overview",
      fields: [
        { label: "Social Security Number", desc: "Auto-generated during your initial signup. Vital for your employer's tax department.", x: "40%", y: "35%" },
        { label: "Primary Care Physician", desc: "Under public insurance, you are free to consult any registered GP (Hausarzt) of your choice.", x: "72%", y: "62%" },
        { label: "Statutory Co-pays", desc: "Small standard fees of €5 to €10 for prescription medicines, capped based on income.", x: "50%", y: "80%" }
      ]
    }
  };

  const mockup = mockups[toolName];
  if (!mockup) return null;

  return (
    <div className={`${T.card} rounded-2xl p-5 border border-orange-100 dark:border-zinc-800 shadow-sm relative overflow-hidden cardin`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-orange-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Form Blueprint</p>
          </div>
          <p className={`text-sm font-extrabold ${T.text}`}>{mockup.title}</p>
          <p className={`text-[11px] ${T.sub}`}>{mockup.sub}</p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md text-[10px] font-bold">
          Click Hotspots 🗺️
        </div>
      </div>

      <div className="relative border border-orange-100/50 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/20 p-6 min-h-[220px] flex flex-col justify-between overflow-hidden">
        {/* Mockup decorative lines */}
        <div className="space-y-3">
          <div className="h-4 bg-orange-100/60 dark:bg-zinc-800/60 rounded w-1/3"></div>
          <div className="h-2.5 bg-orange-100/30 dark:bg-zinc-800/30 rounded w-2/3"></div>
          <div className="h-2 bg-orange-100/20 dark:bg-zinc-800/20 rounded w-full"></div>
          <div className="h-2 bg-orange-100/20 dark:bg-zinc-800/20 rounded w-5/6"></div>
          <div className="h-2 bg-orange-100/20 dark:bg-zinc-800/20 rounded w-4/5"></div>
        </div>

        <div className="space-y-3 pt-6 border-t border-orange-100/20 dark:border-zinc-800/20">
          <div className="h-3 bg-orange-100/40 dark:bg-zinc-800/40 rounded w-1/4"></div>
          <div className="h-2 bg-orange-100/20 dark:bg-zinc-800/20 rounded w-3/4"></div>
          <div className="h-2 bg-orange-100/20 dark:bg-zinc-800/20 rounded w-full"></div>
        </div>

        {/* Floating hotspot buttons */}
        {mockup.fields.map((f, i) => (
          <button
            key={i}
            onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
            style={{ left: f.x, top: f.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md animate-pulse ${
              activeHotspot === i 
                ? 'bg-orange-600 text-white scale-110 ring-4 ring-orange-200 dark:ring-orange-800/40' 
                : 'bg-orange-500 text-white hover:scale-110'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {activeHotspot !== null && (
        <div className="mt-4 p-3.5 bg-white dark:bg-orange-950/10 border border-orange-100 dark:border-orange-950/30 rounded-xl cardin">
          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold">
              {activeHotspot + 1}
            </span>
            <span>{mockup.fields[activeHotspot].label}</span>
          </p>
          <p className={`text-xs mt-1.5 leading-relaxed ${T.text}`}>
            {mockup.fields[activeHotspot].desc}
          </p>
        </div>
      )}
    </div>
  );
};

export const ToolDetail = ({ tool, profile, emergencyData, T, setOpenTool, setGoals, setTab, user }: ToolDetailProps) => {
  const [openStep, setOpenStep] = useState<number | null>(null);
  
  // Create dynamic stats and details for selected tool
  const meta = getToolMetadata(tool.name, profile.origin, profile.city, profile.host);
  
  // Local state to track document checklist checks
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const progress = meta.documents.length > 0
    ? Math.round((Object.values(checkedDocs).filter(Boolean).length / meta.documents.length) * 100)
    : 0;

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <Header T={T} title={tool.name} back={() => setOpenTool(null)} />
      
      {tool.name === "Emergency Numbers" ? (
        <div className="mx-4 space-y-4">
          <div className="rounded-2xl p-5 text-white mb-1 shadow-lg shadow-red-500/10" style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}>
            <p className="disp font-extrabold text-lg flex items-center gap-2">
              <AlertTriangle size={20} className="animate-pulse" />
              In immediate danger, call 112
            </p>
            <p className="text-xs text-rose-100 mt-1.5 leading-relaxed">
              Free dial from any mobile or landline device, even without a SIM card. Operates 24/7. Central emergency dispatchers are fully trained to communicate in English.
            </p>
          </div>
          <div className="space-y-2.5">
            {emergencyData.map(e => (
              <div key={e.label} className={`${T.card} rounded-2xl p-4 flex items-center justify-between border border-orange-50 dark:border-zinc-800`}>
                <div>
                  <p className={`text-sm font-bold ${T.text}`}>{e.label}</p>
                  <p className={`text-[11px] ${T.sub}`}>Free general hotline</p>
                </div>
                <a href={`tel:${e.num}`} className="disp font-extrabold text-rose-600 dark:text-rose-400 text-lg hover:underline">
                  {e.num}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-4 space-y-6">
          {/* Custom Elegant Hero Header with Gradient & Meta Scorecard */}
          <div className={`relative overflow-hidden ${T.card} rounded-2xl p-5 border ${T.line} shadow-sm`}>
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${tool.gradient || 'from-orange-400 to-orange-600'} opacity-10 rounded-bl-full pointer-events-none`} />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient || 'from-orange-400 to-orange-600'} flex items-center justify-center shrink-0 shadow-md`}>
                {tool.icon && typeof tool.icon !== 'string' ? <tool.icon size={22} className="text-white" /> : <Wrench size={22} className="text-white" />}
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest text-orange-500`}>
                  {tool.category || "Guidance and Paperwork"}
                </p>
                <p className={`disp font-extrabold ${T.text} text-lg`}>{tool.name}</p>
                <p className={`text-xs ${T.sub} mt-1 leading-relaxed`}>
                  Detailed onboarding path for {profile.city} formulated specifically for {profile.origin} citizens.
                </p>
              </div>
            </div>

            {/* Premium Meta Information Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-orange-100/30 dark:border-zinc-800/30 text-center">
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${T.sub}`}>Difficulty</p>
                <p className={`text-xs font-extrabold mt-0.5 ${
                  meta.difficulty.includes("Hard") ? "text-red-500" : meta.difficulty.includes("Medium") ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {meta.difficulty}
                </p>
              </div>
              <div className="border-x border-orange-100/30 dark:border-zinc-800/30">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${T.sub}`}>Avg. Cost</p>
                <p className={`text-xs font-extrabold mt-0.5 ${T.text}`}>
                  {meta.cost}
                </p>
              </div>
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${T.sub}`}>Timeline</p>
                <p className={`text-xs font-extrabold mt-0.5 ${T.text}`}>
                  {meta.timeline}
                </p>
              </div>
            </div>

            {/* Effort slider graphic */}
            <div className="mt-4 pt-3 border-t border-orange-100/20 dark:border-zinc-800/20">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className={T.sub}>Required Effort Scale</span>
                <span className="font-bold text-orange-500">{meta.effortText} ({meta.effort}%)</span>
              </div>
              <div className="w-full h-1.5 bg-orange-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${tool.gradient || 'from-orange-400 to-orange-600'} transition-all`} 
                  style={{ width: `${meta.effort}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Document Blueprint Mockup */}
          <DocumentMockup toolName={tool.name} T={T} />

          {/* Interactive Document Checklist Progress Tracker */}
          {meta.documents.length > 0 && (
            <div className={`${T.card} rounded-2xl p-5 border border-orange-100 dark:border-zinc-800 shadow-sm cardin`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Required Documents</p>
                  <p className={`text-[10px] ${T.sub}`}>Verify and gather these before your appointment</p>
                </div>
                <span className="text-xs font-extrabold text-orange-500">{progress}% Done</span>
              </div>

              {/* Progress Bar Graphic */}
              <div className="w-full h-2 bg-orange-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-2.5">
                {meta.documents.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDoc(doc)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? 'bg-white dark:bg-orange-950/5 border-orange-300 dark:border-orange-900/40' 
                          : `${T.card2} border-orange-100/40 dark:border-zinc-800`
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-orange-500" />
                        ) : (
                          <Square size={16} className={`${T.sub} opacity-70`} />
                        )}
                      </div>
                      <span className={`text-xs leading-relaxed ${isChecked ? `line-through opacity-60 ${T.text}` : T.text}`}>
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Step-by-Step Accordion Process */}
          {tool.details?.steps && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className={`text-xs font-bold uppercase tracking-wider ${T.sub}`}>Sequential Process Guide</p>
                <p className={`text-[10px] ${T.sub}`}>{tool.details.steps.length} Milestones</p>
              </div>
              <div className="space-y-3">
                {tool.details.steps.map((step: any, idx: number) => {
                  const isExpanded = openStep === idx;
                  return (
                    <div key={idx} className={`${T.card} rounded-2xl overflow-hidden border border-orange-100/60 dark:border-zinc-800 shadow-sm transition-all`}>
                      <button 
                        onClick={() => setOpenStep(isExpanded ? null : idx)}
                        className="w-full p-4 flex items-center gap-3.5 text-left"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isExpanded 
                            ? 'bg-orange-500 text-white shadow-sm' 
                            : 'bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <p className={`flex-1 text-sm font-extrabold ${T.text}`}>{step.title}</p>
                        <ChevronDown size={16} className={`${T.sub} transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`} />
                      </button>
                      
                      {isExpanded && (
                        <div className={`px-4 pb-5 pt-1 text-xs ${T.sub} leading-relaxed border-t border-orange-100/20 dark:border-zinc-800/20 bg-white dark:bg-zinc-950/10 cardin`}>
                          <p className="mt-2 text-xs leading-relaxed">{step.desc}</p>
                          {step.links && step.links.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-orange-100/10 dark:border-zinc-800/10">
                              <p className="text-[10px] font-bold mb-2 uppercase tracking-wide text-orange-500">Resource Links</p>
                              <div className="flex flex-wrap gap-2">
                                {step.links.map((link: any, i: number) => (
                                  <a 
                                    key={i} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-lg w-fit transition-transform active:scale-95 ${
                                      link.type === 'video' 
                                        ? 'text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100/50' 
                                        : link.type === 'doc' 
                                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100/50' 
                                          : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/50'
                                    }`}
                                  >
                                    {link.type === 'video' ? <PlayCircle size={12} /> : link.type === 'doc' ? <FileText size={12} /> : <ExternalLink size={12} />}
                                    {link.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expat Pro-Tips Cheat Sheet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Tips Box */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Expert Pro-Tips</p>
              </div>
              <ul className="space-y-2 text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                {meta.proTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pitfalls Box */}
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2.5 text-red-600 dark:text-red-400">
                <ShieldAlert size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Common Mistakes</p>
              </div>
              <ul className="space-y-2 text-[11px] leading-relaxed text-red-800 dark:text-red-300">
                {meta.mistakes.map((pitfall, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-red-600 dark:text-red-400 shrink-0 font-bold">✗</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related Communities Grid */}
          {tool.details?.groups && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3 px-1`}>Ask the Expat Community</p>
              <div className="space-y-2.5">
                {tool.details.groups.map((groupName: string, idx: number) => (
                  <div key={idx} className={`${T.card2} rounded-xl p-3.5 flex items-center gap-3 border border-orange-100/50 dark:border-zinc-800`}>
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-lg">👥</div>
                    <div className="flex-1">
                      <p className={`text-xs font-extrabold ${T.text}`}>{groupName}</p>
                      <p className={`text-[10px] ${T.sub}`}>Join this room to post and ask other peers</p>
                    </div>
                    <button className="bg-orange-500 text-white p-2 rounded-full hover:scale-105 transition-transform">
                      <MessageCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Roadmap Action */}
          {tool.name !== "Emergency Numbers" && (
            <button
              onClick={async () => {
                const steps = tool.details?.steps?.map((s: any) => ({
                    t: s.title,
                    d: s.desc,
                    done: false,
                    tool: tool.name,
                    links: s.links
                  })) || [{ t: "General Task", d: "Explore " + tool.name, done: false, tool: tool.name }];
                
                const newGoal = {
                  id: "g" + Date.now(),
                  title: tool.name,
                  cat: tool.category || "Tool Goal",
                  icon: tool.icon || Wrench,
                  steps
                };
                
                setGoals((gs: any) => [...gs, newGoal]);
                setTab("roadmap");
                setOpenTool(null);
                
                if (user) {
                  try {
                    await api.goals.create({
                      title: tool.name,
                      category: tool.category || "Tool Goal",
                      iconName: "Wrench",
                      steps: steps.map(mapStepToApi)
                    });
                  } catch (e) {
                    console.error("Failed to save goal", e);
                  }
                }
              }}
              className="w-full bg-orange-500 text-white rounded-xl p-4 font-bold disp text-base shadow-md hover:shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Award size={18} />
              Add Guidance as Goal Checklist to Roadmap
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface ToolsTabProps {
  openTool: string | null;
  setOpenTool: (val: string | null) => void;
  toolSectionsData: any[];
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setGoals: React.Dispatch<React.SetStateAction<any[]>>;
  setTab: (val: string) => void;
  user?: any;
}

export const ToolsTab = ({ openTool, setOpenTool, toolSectionsData, profile, emergencyData, T, setGoals, setTab, user }: ToolsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedToolObj = toolSectionsData.flatMap(s => s.items).find(i => i.name === openTool) || { name: openTool };

  if (openTool) {
    return (
      <ToolDetail 
        tool={selectedToolObj} 
        profile={profile} 
        emergencyData={emergencyData} 
        T={T} 
        setOpenTool={setOpenTool} 
        setGoals={setGoals} 
        setTab={setTab} 
        user={user} 
      />
    );
  }

  // Filter tools based on query
  const filteredSections = toolSectionsData.map(sec => {
    const items = sec.items.filter((it: any) => 
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      it.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...sec, items };
  }).filter(sec => sec.items.length > 0);

  return (
    <div className="pb-24">
      <Header T={T} title="Tools" />
      
      {/* Personalized Relocation Overview Header Banner */}
      <div className="mx-4 mb-5 p-4 rounded-2xl bg-gradient-to-br from-orange-400/10 to-orange-600/10 border border-orange-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-base shrink-0 font-extrabold shadow-sm">
          {profile.name ? profile.name.substring(0, 2).toUpperCase() : "HI"}
        </div>
        <div>
          <p className={`text-xs font-bold text-orange-600 dark:text-orange-400`}>Tailored Moving Dossier</p>
          <p className={`text-sm font-extrabold ${T.text}`}>
            {profile.origin} → {profile.city}, {profile.host}
          </p>
          <p className={`text-[10px] ${T.sub} mt-0.5`}>
            Showing customized checklists, official forms, and local requirements.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className={`mx-4 mb-5 flex items-center gap-2.5 rounded-full px-4 py-2.5 ${T.card} border ${T.line} shadow-sm`}>
        <Search size={16} className={T.sub} />
        <input 
          placeholder="Search tools — e.g., register, tax, bank, housing…" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 bg-transparent text-sm outline-none ${T.text}`} 
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className={`text-xs p-1 rounded-full ${T.card2} ${T.text}`}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Grid List of Tools */}
      {filteredSections.map(sec => (
        <div key={sec.label} className="mb-5">
          <p className={`mx-4 mb-2.5 text-xs font-bold uppercase tracking-wider ${T.sub}`}>{sec.label}</p>
          <div className="mx-4 grid grid-cols-2 gap-2.5">
            {sec.items.map((it: any) => {
              if (it.name === "Roadmaps") {
                return (
                  <button 
                    key={it.name} 
                    onClick={() => setTab("roadmap")} 
                    className={`col-span-2 relative overflow-hidden bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-4 text-left cardin border border-orange-200 dark:border-orange-500/20 transition-all hover:shadow-md active:scale-95 group flex flex-row items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.gradient || 'from-orange-400 to-orange-600'} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                        {it.icon && typeof it.icon !== 'string' ? <it.icon size={24} className="text-white" /> : <Wrench size={24} className="text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-extrabold leading-tight text-orange-900 dark:text-orange-100`}>{it.name}</p>
                        <p className={`text-[10px] mt-1 leading-normal text-orange-700 dark:text-orange-300 opacity-80`}>{it.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1">
                       <span className="text-[10px] font-bold px-2 py-1 rounded-full text-orange-700 bg-orange-200 dark:bg-orange-500/30 dark:text-orange-200 whitespace-nowrap">View Plan</span>
                       <ChevronRight size={14} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              }
              
              return (
              <button 
                key={it.name} 
                onClick={() => setOpenTool(it.name)} 
                className={`relative overflow-hidden ${T.card} rounded-2xl p-4 text-left cardin border ${T.line} transition-all hover:shadow-md active:scale-95 group flex flex-col justify-between`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient || 'from-orange-400 to-orange-600'} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${it.gradient || 'from-orange-400 to-orange-600'} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                    {it.icon && typeof it.icon !== 'string' ? <it.icon size={20} className="text-white" /> : <Wrench size={20} className="text-white" />}
                  </div>
                  <p className={`text-xs font-extrabold leading-tight ${T.text}`}>{it.name}</p>
                  <p className={`text-[9px] mt-1 leading-normal ${T.sub} opacity-80 line-clamp-2`}>{it.desc}</p>
                </div>
                
                {/* Visual difficulty badge on tiles */}
                <div className="mt-3 pt-2.5 border-t border-orange-100/20 dark:border-zinc-800/20 flex items-center justify-between">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    getToolMetadata(it.name, profile.origin, profile.city, profile.host).difficulty.includes("Hard")
                      ? "text-red-600 bg-red-50 dark:bg-red-500/10"
                      : getToolMetadata(it.name, profile.origin, profile.city, profile.host).difficulty.includes("Medium")
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                  }`}>
                    {getToolMetadata(it.name, profile.origin, profile.city, profile.host).difficulty}
                  </span>
                  <ChevronRight size={12} className={`${T.sub} group-hover:translate-x-0.5 transition-transform`} />
                </div>
              </button>
            )})}
          </div>
        </div>
      ))}

      {filteredSections.length === 0 && (
        <div className="mx-4 text-center py-10">
          <HelpCircle size={32} className="mx-auto text-orange-400 opacity-60 mb-2" />
          <p className={`text-sm font-bold ${T.text}`}>No tools match your search</p>
          <p className={`text-xs ${T.sub} mt-1`}>Try searching for broader terms like "paperwork", "legal", or "life".</p>
        </div>
      )}
    </div>
  );
};

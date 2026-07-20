import React, { useMemo, useState } from "react";
import { Search, ChevronRight, Wrench, ChevronDown, MessageCircle, ExternalLink, PlayCircle, FileText } from "lucide-react";
import { Header } from "./Header";
import { Theme, Profile, Goal } from "../types";
import { api } from "../api";
import { resolveIcon } from "../lib/icons";

interface ToolDetailProps {
  tool: any;
  profile: Profile;
  emergencyData: any[];
  T: Theme;
  setOpenTool: (val: string | null) => void;
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setTab: (val: string) => void;
}

export const ToolDetail = ({ tool, profile, emergencyData, T, setOpenTool, setGoals, setTab }: ToolDetailProps) => {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const addToRoadmap = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const steps = tool.details?.steps?.length
        ? tool.details.steps.map((s: any) => ({ text: s.title, description: s.desc ?? "", tool: tool.name, links: s.links ?? [] }))
        : [{ text: "General Task", description: "Explore " + tool.name, tool: tool.name, links: [] }];
      const { goal } = await api.post<{ goal: any }>("/api/goals", {
        title: tool.name,
        category: "Tool Goal",
        iconName: tool.icon ?? "Wrench",
        steps,
      });
      setGoals((gs) => [...gs, {
        id: goal.id, title: goal.title, cat: goal.category, icon: resolveIcon(goal.iconName),
        steps: goal.steps.map((s: any) => ({ id: s.id, t: s.text, d: s.description, done: s.done, tool: s.tool, links: s.links })),
      }]);
      setTab("roadmap");
      setOpenTool(null);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <Header T={T} title={tool.name} back={() => setOpenTool(null)} />

      {tool.name === "Emergency Numbers" ? (
        <div className="mx-4 space-y-2">
          <div className="rounded-2xl p-4 text-white mb-3" style={{ background: "linear-gradient(120deg,#dc2626,#ea580c)" }}>
            <p className="disp font-bold">In immediate danger, call 112</p>
            <p className="text-xs text-orange-100 mt-1">Free from any phone, no SIM needed. Operators speak English.</p>
          </div>
          {emergencyData.map(e => (
            <div key={e.label} className={`${T.card} rounded-xl p-4 flex items-center justify-between`}>
              <p className={`text-sm font-medium ${T.text}`}>{e.label}</p>
              <span className="disp font-bold text-orange-500">{e.num}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-4 space-y-6">
          <div className={`${T.card} rounded-2xl p-4 border border-orange-100 dark:border-zinc-800`}>
            <p className={`disp font-bold ${T.text} mb-1`}>Guide for {profile.city}</p>
            <p className={`text-sm ${T.sub} leading-relaxed`}>Localised, step-by-step guidance for {tool.name.toLowerCase()} tailored to your nationality ({profile.origin}) and city.</p>
          </div>

          {tool.details?.steps && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Process Steps</p>
              <div className="space-y-3">
                {tool.details.steps.map((step: any, idx: number) => (
                  <div key={idx} className={`${T.card} rounded-2xl overflow-hidden border border-orange-100 dark:border-zinc-800`}>
                    <button
                      onClick={() => setOpenStep(openStep === idx ? null : idx)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${openStep === idx ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-400'}`}>
                        {idx + 1}
                      </div>
                      <p className={`flex-1 text-sm font-bold ${T.text}`}>{step.title}</p>
                      <ChevronDown size={16} className={`${T.sub} transition-transform ${openStep === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openStep === idx && (
                      <div className={`px-4 pb-4 pt-1 text-sm ${T.sub} leading-relaxed`}>
                        <p>{step.desc}</p>
                        {step.links && step.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {step.links.map((link: any, i: number) => (
                              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${link.type === 'video' ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : link.type === 'doc' ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'}`}>
                                {link.type === 'video' ? <PlayCircle size={12} /> : link.type === 'doc' ? <FileText size={12} /> : <ExternalLink size={12} />}
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tool.details?.groups && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Relevant Communities</p>
              <div className="space-y-2">
                {tool.details.groups.map((group: string, idx: number) => (
                  <div key={idx} className={`${T.card2} rounded-xl p-3 flex items-center gap-3 border border-orange-100 dark:border-zinc-800`}>
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl">👥</div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${T.text}`}>{group}</p>
                      <p className={`text-[11px] ${T.sub}`}>Find or start this group in Community</p>
                    </div>
                    <button onClick={() => setTab("community")} className="bg-orange-500 text-white p-2 rounded-full">
                      <MessageCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!tool.details && (
            <div className="space-y-3">
              {["Checklist & required documents", "Nearby places & offices (map)", "Costs, fees & timelines", "Ask the community"].map(x => (
                <button key={x} onClick={() => setTab("community")} className={`${T.card} rounded-xl p-4 w-full flex items-center justify-between text-left border border-orange-50 dark:border-zinc-800`}>
                  <p className={`text-sm font-medium ${T.text}`}>{x}</p>
                  <ChevronRight size={16} className={T.sub} />
                </button>
              ))}
            </div>
          )}

          {tool.name !== "Emergency Numbers" && (
            <button
              onClick={addToRoadmap}
              disabled={adding}
              className="w-full bg-orange-500 text-white rounded-xl p-4 font-bold disp text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-transform disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add to Roadmap"}
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
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setTab: (val: string) => void;
}

export const ToolsTab = ({ openTool, setOpenTool, toolSectionsData, profile, emergencyData, T, setGoals, setTab }: ToolsTabProps) => {
  const [query, setQuery] = useState("");
  const selectedToolObj = toolSectionsData.flatMap(s => s.items).find(i => i.name === openTool) || { name: openTool };

  if (openTool) {
    return <ToolDetail tool={selectedToolObj} profile={profile} emergencyData={emergencyData} T={T} setOpenTool={setOpenTool} setGoals={setGoals} setTab={setTab} />;
  }

  const q = query.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!q) return toolSectionsData;
    return toolSectionsData
      .map((sec) => ({ ...sec, items: sec.items.filter((it: any) => it.name.toLowerCase().includes(q) || it.desc?.toLowerCase().includes(q)) }))
      .filter((sec) => sec.items.length > 0);
  }, [toolSectionsData, q]);

  return (
    <div className="pb-24">
      <Header T={T} title="Tools" />
      <div className={`mx-4 mb-4 flex items-center gap-2 rounded-full px-4 py-2.5 ${T.card}`}>
        <Search size={16} className={T.sub} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools — e.g. tax, housing, visa…"
          className={`flex-1 bg-transparent text-sm outline-none ${T.text}`}
        />
      </div>
      {filteredSections.map(sec => (
        <div key={sec.label} className="mb-5">
          <p className={`mx-4 mb-2 text-xs font-bold uppercase tracking-wider ${T.sub}`}>{sec.label}</p>
          <div className="mx-4 grid grid-cols-2 gap-2.5">
            {sec.items.map((it: any) => {
              const Icon = resolveIcon(it.icon);
              return (
                <button
                  key={it.name}
                  onClick={() => setOpenTool(it.name)}
                  className={`relative overflow-hidden ${T.card} rounded-2xl p-4 text-left cardin border ${T.line} transition-all hover:shadow-xl active:scale-95 group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient || 'from-orange-400 to-orange-600'} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${it.gradient || 'from-orange-400 to-orange-600'} flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <p className={`text-sm font-bold leading-tight ${T.text}`}>{it.name}</p>
                  <p className={`text-[10px] mt-1 leading-tight ${T.sub} opacity-80 line-clamp-1`}>{it.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Plus, X, CircleCheck, Circle, Wrench, ChevronRight, Flag, Target } from "lucide-react";
import { Header } from "./Header";
import { Goal, Theme, Profile, Step } from "../types";
import { api } from "../api";
import { resolveIcon } from "../lib/icons";

interface RoadmapTabProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  openGoal: string | null;
  setOpenGoal: (val: string | null) => void;
  showTemplates: boolean;
  setShowTemplates: (val: boolean) => void;
  setTab: (val: string) => void;
  setOpenTool: (val: string | null) => void;
  profile: Profile;
  T: Theme;
}

function mapBackendStep(s: any): Step {
  return { id: s.id, t: s.text, d: s.description, done: s.done, tool: s.tool, links: s.links };
}

function mapBackendGoal(g: any): Goal {
  return { id: g.id, title: g.title, cat: g.category, icon: resolveIcon(g.iconName), steps: (g.steps ?? []).map(mapBackendStep) };
}

export const RoadmapTab = ({
  goals, setGoals, openGoal, setOpenGoal, showTemplates, setShowTemplates,
  setTab, setOpenTool, profile, T
}: RoadmapTabProps) => {
  const [localCustomGoalTitle, setLocalCustomGoalTitle] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (showTemplates) {
      api.get<{ templates: any[] }>("/api/content/goal-templates").then((d) => setTemplates(d.templates)).catch(() => setTemplates([]));
    }
  }, [showTemplates]);

  const toggleStep = async (gid: string, stepId: string, currentlyDone: boolean) => {
    setGoals((gs) => gs.map((g) => g.id !== gid ? g : { ...g, steps: g.steps.map((s) => s.id === stepId ? { ...s, done: !currentlyDone } : s) }));
    try {
      await api.patch(`/api/goals/${gid}/steps/${stepId}`, { done: !currentlyDone });
    } catch {
      // revert on failure
      setGoals((gs) => gs.map((g) => g.id !== gid ? g : { ...g, steps: g.steps.map((s) => s.id === stepId ? { ...s, done: currentlyDone } : s) }));
    }
  };

  const addGoal = async (tpl: any) => {
    const { goal } = await api.post<{ goal: any }>(`/api/goals/from-template/${tpl.id}`);
    setGoals((gs) => [...gs, mapBackendGoal(goal)]);
    setShowTemplates(false);
  };

  const addCustomGoal = async () => {
    if (!localCustomGoalTitle.trim()) return;
    const { goal } = await api.post<{ goal: any }>("/api/goals", {
      title: localCustomGoalTitle,
      category: "Custom",
      iconName: "Target",
      steps: [{ text: "First step", description: "Break down your goal into smaller tasks.", tool: "" }],
    });
    setGoals((gs) => [...gs, mapBackendGoal(goal)]);
    setLocalCustomGoalTitle("");
    setShowTemplates(false);
  };

  const addTask = async (gid: string, text: string) => {
    const { step } = await api.post<{ step: any }>(`/api/goals/${gid}/steps`, { text, description: "Custom task", tool: "" });
    setGoals((gs) => gs.map((g) => g.id !== gid ? g : { ...g, steps: [...g.steps, mapBackendStep(step)] }));
    setLocalCustomGoalTitle("");
  };

  const g = goals.find(x => x.id === openGoal);
  if (g) {
    const done = g.steps.filter(s => s.done).length;
    return (
      <div className="pb-24">
        <Header T={T} title="Goal" back={() => setOpenGoal(null)} />
        <div className={`${T.card} mx-4 rounded-2xl p-4 cardin`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center"><g.icon size={20} /></div>
            <div>
              <p className={`disp font-bold ${T.text}`}>{g.title}</p>
              <p className={`text-xs ${T.sub}`}>{g.cat} · {done}/{g.steps.length} steps done</p>
            </div>
          </div>
          <div className={`h-2 rounded-full mt-3 ${T.card2}`}>
            <div className="h-2 rounded-full bg-orange-500 transition-all" style={{ width: `${(done / g.steps.length) * 100}%` }} />
          </div>
        </div>
        <div className="mx-4 mt-5 relative">
          <div className="absolute left-[13px] top-2 bottom-6 flightpath" />
          {g.steps.map((s, i) => (
            <div key={s.id} className="flex gap-3 mb-4 relative">
              <button onClick={() => toggleStep(g.id, s.id, s.done)} className="mt-1 shrink-0 z-10">
                {s.done
                  ? <CircleCheck size={28} className="text-orange-600 bg-white rounded-full" fill="#d1fae5" />
                  : <Circle size={28} className={`text-orange-400 ${T.bg} rounded-full`} />}
              </button>
              <div className={`${T.card} rounded-2xl p-4 flex-1 ${s.done ? "opacity-70" : ""}`}>
                <p className={`font-semibold text-sm ${T.text} ${s.done ? "line-through" : ""}`}>{i + 1}. {s.t}</p>
                <p className={`text-xs mt-1 leading-relaxed ${T.sub}`}>{s.d}</p>
                {s.tool && (
                  <button onClick={() => { setTab("tools"); setOpenTool(s.tool); }}
                    className="mt-2 text-xs font-semibold text-orange-700 flex items-center gap-1">
                    <Wrench size={12} /> Open tool: {s.tool} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex gap-3 items-center relative mb-4">
            <Flag size={26} className="text-orange-500 z-10" />
            <p className={`text-sm font-semibold ${T.text}`}>Goal complete — celebrate & share your tips 🎉</p>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="text"
              placeholder="Add a new task..."
              className={`flex-1 ${T.card2} rounded-xl px-4 py-3 text-sm outline-none ${T.text} border border-orange-50 dark:border-zinc-800`}
              value={localCustomGoalTitle}
              onChange={(e) => setLocalCustomGoalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && localCustomGoalTitle.trim()) addTask(g.id, localCustomGoalTitle);
              }}
            />
            <button
              onClick={() => { if (localCustomGoalTitle.trim()) addTask(g.id, localCustomGoalTitle); }}
              className="bg-orange-500 text-white rounded-xl p-3 shrink-0 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header T={T} title="Roadmap" right={
        <button onClick={() => setShowTemplates(true)} className="bg-orange-500 text-white p-2 rounded-full"><Plus size={18} /></button>} />
      <p className={`mx-4 text-sm ${T.sub} mb-4`}>Micro-goals for settling into {profile.host}. Set a goal — Buonolo breaks it into guided steps.</p>
      {goals.map(g => {
        const done = g.steps.filter(s => s.done).length, pct = g.steps.length ? Math.round((done / g.steps.length) * 100) : 0;
        return (
          <button key={g.id} onClick={() => setOpenGoal(g.id)} className={`${T.card} mx-4 mb-3 rounded-2xl p-4 w-[calc(100%-2rem)] text-left cardin`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0"><g.icon size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${T.text}`}>{g.title}</p>
                <p className={`text-xs ${T.sub}`}>{g.cat} · {done}/{g.steps.length} steps</p>
              </div>
              <div className="text-right">
                <p className="disp font-bold text-orange-600">{pct}%</p>
                <ChevronRight size={16} className={`${T.sub} ml-auto`} />
              </div>
            </div>
            <div className={`h-1.5 rounded-full mt-3 ${T.card2}`}>
              <div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
            </div>
          </button>
        );
      })}
      {showTemplates && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end justify-center" onClick={() => setShowTemplates(false)}>
          <div className={`${T.card} w-full max-w-md rounded-t-3xl p-5 max-h-[85vh] flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1 shrink-0">
              <h2 className={`disp font-bold text-lg ${T.text}`}>Choose a goal</h2>
              <button onClick={() => setShowTemplates(false)}><X size={20} className={T.sub} /></button>
            </div>
            <p className={`text-xs ${T.sub} mb-4 shrink-0`}>Curated for newcomers. Each comes with a step-by-step guided plan.</p>

            <div className="flex gap-2 mb-4 shrink-0">
              <input value={localCustomGoalTitle} onChange={e => setLocalCustomGoalTitle(e.target.value)} placeholder="Or create a custom goal..." className={`flex-1 ${T.input} rounded-xl px-3 py-2 text-sm outline-none`} />
              <button onClick={addCustomGoal} className="bg-orange-500 text-white px-3 py-2 rounded-xl text-sm font-bold">Add</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {templates.map(t => {
                const Icon = resolveIcon(t.iconName);
                return (
                  <button key={t.id} onClick={() => addGoal(t)} className={`flex items-center gap-3 w-full text-left p-3 rounded-xl mb-2 ${T.card2}`}>
                    <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0"><Icon size={17} /></div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${T.text}`}>{t.title}</p>
                      <p className={`text-xs ${T.sub}`}>{t.category} · typically {t.weeks}</p>
                    </div>
                    <Plus size={16} className="text-orange-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

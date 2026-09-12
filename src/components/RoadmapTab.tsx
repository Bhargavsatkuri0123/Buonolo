import React, { useState } from "react";
import { Plus, X, Check, Wrench, ChevronRight, Flag, Trophy, Target, Trash2 } from "lucide-react";
import { Header } from "./Header";
import { Goal, Theme, Profile } from "../types";

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
  user?: any;
  goalTemplates?: any[];
  onToggleStep?: (gid: string, i: number) => void;
  onAddGoal?: (tpl: any) => void;
  onAddCustomGoal?: (title: string) => void;
  onAddTask?: (goalId: string, title: string) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const RoadmapTab = ({
  goals, setGoals, openGoal, setOpenGoal, showTemplates, setShowTemplates,
  setTab, setOpenTool, profile, T, user, goalTemplates = [],
  onToggleStep, onAddGoal, onAddCustomGoal, onAddTask, onDeleteGoal
}: RoadmapTabProps) => {
  const [localCustomGoalTitle, setLocalCustomGoalTitle] = useState("");

  const toggleStep = (gid: string, i: number) => {
    if (onToggleStep) {
      onToggleStep(gid, i);
      return;
    }
    setGoals(gs => gs.map(g => g.id !== gid ? g : { 
      ...g, 
      steps: g.steps.map((s, j) => j === i ? { ...s, done: !s.done } : s) 
    }));
  };

  const addGoal = (tpl: any) => {
    if (onAddGoal) {
      onAddGoal(tpl);
      return;
    }
    setGoals(gs => [...gs, {
      id: "g" + Date.now(), title: tpl.title, cat: tpl.cat, icon: tpl.icon || Target,
      steps: [{ t: "Get started", d: "Break this goal down into your first milestone.", done: false, tool: "" }],
    }]);
    setShowTemplates(false);
  };

  const addCustomGoal = () => {
    if (!localCustomGoalTitle.trim()) return;
    if (onAddCustomGoal) {
      onAddCustomGoal(localCustomGoalTitle);
      setLocalCustomGoalTitle("");
      setShowTemplates(false);
      return;
    }
    setGoals(gs => [...gs, {
      id: "g" + Date.now(), title: localCustomGoalTitle, cat: "Custom", icon: Target,
      steps: [
        { t: "First step", d: "Break down your goal into smaller tasks.", done: false, tool: "Tasks" },
      ],
    }]);
    setLocalCustomGoalTitle("");
    setShowTemplates(false);
  };

  const g = goals.find(x => x.id === openGoal);
  if (g) {
    const done = g.steps.filter(s => s.done).length;
    const allDone = done === g.steps.length && g.steps.length > 0;
    const pct = Math.round((done / Math.max(1, g.steps.length)) * 100);

    return (
      <div className="pb-24">
        <Header T={T} title="Goal Roadmap" back={() => setOpenGoal(null)} right={
          onDeleteGoal ? (
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to remove this goal?")) {
                  onDeleteGoal(g.id);
                }
              }} 
              title="Delete Goal"
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          ) : undefined
        } />

        {/* Goal Summary Card with Segmented Milestone Track */}
        <div className={`${T.card} mx-4 rounded-2xl p-4.5 cardin shadow-sm border border-slate-100 dark:border-zinc-800`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <g.icon size={22} />
              </div>
              <div className="min-w-0">
                <p className={`disp font-bold text-lg leading-tight ${T.text} truncate`}>{g.title}</p>
                <p className={`text-xs ${T.sub} mt-0.5`}>{g.cat} · {done} of {g.steps.length} milestones complete</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`disp font-bold text-lg ${allDone ? "text-emerald-500" : "text-orange-600 dark:text-orange-400"}`}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Segmented Milestone Indicator Bar */}
          <div className="flex items-center gap-1.5 mt-3.5">
            {g.steps.map((step, sIdx) => (
              <div
                key={sIdx}
                className={`h-2 rounded-full flex-1 transition-all ${
                  step.done ? "bg-orange-500" : `${T.card2}`
                }`}
                title={`Milestone ${sIdx + 1}: ${step.done ? "Done" : "Pending"}`}
              />
            ))}
          </div>
        </div>

        {/* Milestone Timeline / Steps */}
        <div className="mx-4 mt-6">
          {g.steps.map((s, i) => {
            const isCurrent = !s.done && (i === 0 || g.steps[i - 1].done);
            return (
              <div key={i} className="flex items-stretch gap-3.5 relative group">
                {/* Dedicated Centered Milestone Column (Guarantees 100% Vertical Alignment) */}
                <div className="flex flex-col items-center shrink-0 w-9">
                  {/* Milestone Node Button */}
                  <button
                    onClick={() => toggleStep(g.id, i)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all cursor-pointer active:scale-95 ${
                      s.done
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100 dark:ring-orange-950/50"
                        : isCurrent
                        ? "bg-white dark:bg-zinc-900 text-orange-600 border-2 border-orange-500 ring-4 ring-orange-500/20 font-bold text-xs shadow-sm"
                        : "bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-2 border-slate-200 dark:border-zinc-700 font-semibold text-xs"
                    }`}
                    title={s.done ? "Mark step incomplete" : "Mark step complete"}
                    aria-label={`Milestone ${i + 1}: ${s.t} - ${s.done ? "Completed" : "Incomplete"}`}
                  >
                    {s.done ? (
                      <Check size={18} className="stroke-[2.5]" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </button>

                  {/* Vertical connecting flightpath line */}
                  <div className="flex-1 w-[3px] my-1 relative flex justify-center">
                    <div 
                      className={`w-[3px] h-full ${
                        s.done 
                          ? "bg-orange-400/80" 
                          : "border-l-2 border-dashed border-orange-400/60 dark:border-orange-500/40"
                      }`} 
                    />
                  </div>
                </div>

                {/* Milestone Content Card */}
                <div className={`flex-1 ${T.card} rounded-2xl p-4 mb-3.5 border transition-all shadow-sm ${
                  s.done 
                    ? "border-emerald-500/20 opacity-80" 
                    : isCurrent
                    ? "border-orange-300 dark:border-orange-900/60 shadow-orange-500/5"
                    : "border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${T.text} ${s.done ? "line-through text-slate-400 dark:text-zinc-500" : ""}`}>
                      {s.t}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      s.done 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : isCurrent 
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                        : `${T.card2} ${T.sub}`
                    }`}>
                      {s.done ? "Done" : isCurrent ? "Current" : `Step ${i + 1}`}
                    </span>
                  </div>

                  <p className={`text-xs mt-1.5 leading-relaxed ${T.sub}`}>
                    {s.d}
                  </p>

                  {/* Links attached to step if any */}
                  {s.links && s.links.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {s.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${T.card2} ${T.sub} hover:${T.text} flex items-center gap-1`}
                        >
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Open Tool Action Button */}
                  {s.tool && (
                    <button 
                      onClick={() => { setTab("tools"); setOpenTool(s.tool); }}
                      className="mt-3 text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 hover:underline bg-orange-500/10 dark:bg-orange-950/30 px-2.5 py-1.5 rounded-xl w-fit transition-colors"
                    >
                      <Wrench size={12} />
                      <span>Open tool: {s.tool}</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Destination Milestone (Final Completion Node) */}
          <div className="flex items-stretch gap-3.5 relative">
            <div className="flex flex-col items-center shrink-0 w-9">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                allDone
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-200 dark:ring-orange-950/60"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-2 border-dashed border-slate-300 dark:border-zinc-700"
              }`}>
                {allDone ? <Trophy size={18} /> : <Flag size={17} />}
              </div>
            </div>

            <div className={`flex-1 rounded-2xl p-4 mb-4 border transition-all ${
              allDone
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-transparent"
                : `${T.card} border-dashed border-slate-200 dark:border-zinc-800`
            }`}>
              <div className="flex items-center justify-between">
                <p className={`font-bold text-sm ${allDone ? "text-white" : T.text}`}>
                  {allDone ? "Goal Completed! 🎉" : "Destination: Goal Complete"}
                </p>
                {allDone && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                    100% Achieved
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${allDone ? "text-orange-50" : T.sub}`}>
                {allDone 
                  ? "Congratulations! You've accomplished all milestone steps for this roadmap. Keep shining in your journey!"
                  : "Complete all milestone steps above to finish this roadmap goal."
                }
              </p>
            </div>
          </div>

          {/* Add a new milestone task */}
          <div className="mt-4 mb-6">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Add a new milestone task..." 
                className={`flex-1 ${T.card2} rounded-xl px-4 py-3 text-sm outline-none ${T.text} border border-orange-100 dark:border-zinc-800 focus:border-orange-500 transition-colors`}
                value={localCustomGoalTitle}
                onChange={(e) => setLocalCustomGoalTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && localCustomGoalTitle.trim()) {
                    if (onAddTask) {
                      onAddTask(g.id, localCustomGoalTitle.trim());
                    } else {
                      setGoals(gs => gs.map(goal => goal.id !== g.id ? goal : {
                        ...goal,
                        steps: [...goal.steps, { t: localCustomGoalTitle.trim(), d: "Custom milestone task", done: false, tool: null }]
                      }));
                    }
                    setLocalCustomGoalTitle("");
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (localCustomGoalTitle.trim()) {
                    if (onAddTask) {
                      onAddTask(g.id, localCustomGoalTitle.trim());
                    } else {
                      setGoals(gs => gs.map(goal => goal.id !== g.id ? goal : {
                        ...goal,
                        steps: [...goal.steps, { t: localCustomGoalTitle.trim(), d: "Custom milestone task", done: false, tool: null }]
                      }));
                    }
                    setLocalCustomGoalTitle("");
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-3 shrink-0 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="Add task"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header T={T} title="Roadmap" right={
        <button onClick={() => setShowTemplates(true)} className="bg-orange-500 text-white p-2 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all"><Plus size={18} /></button>} />
      <p className={`mx-4 text-sm ${T.sub} mb-4`}>Micro-goals for settling into {profile.host}. Set a goal — Meet Peanut breaks it into guided steps.</p>
      {goals.map(g => {
        const done = g.steps.filter(s => s.done).length, pct = Math.round((done / Math.max(1, g.steps.length)) * 100);
        return (
          <button key={g.id} onClick={() => setOpenGoal(g.id)} className={`${T.card} mx-4 mb-3 rounded-2xl p-4 w-[calc(100%-2rem)] text-left cardin border border-slate-100 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-zinc-700 transition-all shadow-sm group`}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform"><g.icon size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${T.text} group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors`}>{g.title}</p>
                <p className={`text-xs ${T.sub}`}>{g.cat} · {done}/{g.steps.length} milestones done</p>
              </div>
              <div className="text-right shrink-0">
                <p className="disp font-bold text-orange-600">{pct}%</p>
                <ChevronRight size={16} className={`${T.sub} ml-auto group-hover:translate-x-0.5 transition-transform`} />
              </div>
            </div>
            {/* Segmented Milestone Progress Track */}
            <div className="flex items-center gap-1 mt-3">
              {g.steps.map((step, sIdx) => (
                <div 
                  key={sIdx}
                  className={`h-1.5 rounded-full flex-1 transition-all ${
                    step.done ? "bg-orange-500" : `${T.card2}`
                  }`}
                />
              ))}
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
              {goalTemplates.length === 0 ? (
                <p className={`text-xs ${T.sub} text-center py-6`}>No goal templates available right now.</p>
              ) : goalTemplates.map(t => (
                <button key={t.id} onClick={() => addGoal(t)} className={`flex items-center gap-3 w-full text-left p-3 rounded-xl mb-2 ${T.card2}`}>
                  <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0"><t.icon size={17} /></div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${T.text}`}>{t.title}</p>
                    <p className={`text-xs ${T.sub}`}>{t.cat} · typically {t.weeks}</p>
                  </div>
                  <Plus size={16} className="text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const fs = require('fs');

// 1. RoadmapTab.tsx
let roadmapCode = fs.readFileSync('src/components/RoadmapTab.tsx', 'utf8');

if (!roadmapCode.includes('import { Plus, X, CircleCheck, Circle, Wrench, ChevronRight, Flag, Target, ExternalLink, Youtube, FileText } from "lucide-react";')) {
  roadmapCode = roadmapCode.replace(
    'import { Plus, X, CircleCheck, Circle, Wrench, ChevronRight, Flag, Target } from "lucide-react";',
    'import { Plus, X, CircleCheck, Circle, Wrench, ChevronRight, Flag, Target, ExternalLink, Youtube, FileText } from "lucide-react";'
  );
}

const renderStepStr = `                  <p className={\`text-[11px] \${T.sub} mt-1 leading-snug\`} onClick={(e) => e.stopPropagation()}>{s.d}</p>
                  {s.tool && (
                    <button onClick={(e) => { e.stopPropagation(); setOpenTool(s.tool); }} className={\`mt-2 flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md w-fit\`}>
                      <Wrench size={10} /> Tool: {s.tool}
                    </button>
                  )}`;

const renderStepLinks = `                  <p className={\`text-[11px] \${T.sub} mt-1 leading-snug\`} onClick={(e) => e.stopPropagation()}>{s.d}</p>
                  {s.links && s.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {s.links.map((link: any, i: number) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={\`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md w-fit \${link.type === 'video' ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : link.type === 'doc' ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'}\`}>
                          {link.type === 'video' ? <Youtube size={10} /> : link.type === 'doc' ? <FileText size={10} /> : <ExternalLink size={10} />}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {s.tool && (
                    <button onClick={(e) => { e.stopPropagation(); setOpenTool(s.tool); }} className={\`mt-2 flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md w-fit\`}>
                      <Wrench size={10} /> Tool: {s.tool}
                    </button>
                  )}`;

roadmapCode = roadmapCode.replace(renderStepStr, renderStepLinks);
fs.writeFileSync('src/components/RoadmapTab.tsx', roadmapCode);

// 2. ToolsTab.tsx
let toolsCode = fs.readFileSync('src/components/ToolsTab.tsx', 'utf8');

if (!toolsCode.includes('ExternalLink')) {
  toolsCode = toolsCode.replace(
    'import { Search, ChevronRight, Wrench, CheckCircle2, ChevronDown, MessageCircle } from "lucide-react";',
    'import { Search, ChevronRight, Wrench, CheckCircle2, ChevronDown, MessageCircle, ExternalLink, Youtube, FileText } from "lucide-react";'
  );
}

const renderToolStepStr = `                    {openStep === idx && (
                      <div className={\`px-4 pb-4 pt-1 text-sm \${T.sub} leading-relaxed\`}>
                        {step.desc}
                      </div>
                    )}`;

const renderToolStepLinks = `                    {openStep === idx && (
                      <div className={\`px-4 pb-4 pt-1 text-sm \${T.sub} leading-relaxed\`}>
                        <p>{step.desc}</p>
                        {step.links && step.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {step.links.map((link: any, i: number) => (
                              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={\`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit \${link.type === 'video' ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : link.type === 'doc' ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'}\`}>
                                {link.type === 'video' ? <Youtube size={12} /> : link.type === 'doc' ? <FileText size={12} /> : <ExternalLink size={12} />}
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}`;

toolsCode = toolsCode.replace(renderToolStepStr, renderToolStepLinks);
fs.writeFileSync('src/components/ToolsTab.tsx', toolsCode);


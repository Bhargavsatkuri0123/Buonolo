import React, { useState } from 'react';
import { getVisaAdvice } from '../services/geminiService';
import { VisaDetails, VisaReport } from '../types';

interface VisaPageProps {
  onSave?: (item: any) => void;
  onShare?: (title: string, text: string) => void;
}

const VisaPage: React.FC<VisaPageProps> = ({ onSave, onShare }) => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<VisaDetails>({ nationality: '', destination: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VisaReport | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await getVisaAdvice(details);
      setReport(result);
      setStep(4);
    } catch (err) {
      alert("Error generating advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAdvisor = () => {
    setStep(1);
    setDetails({ nationality: '', destination: '', reason: '' });
    setReport(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 px-4 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl">
          <i className="fa-solid fa-passport"></i>
        </div>
        <div>
          <h2 className="text-3xl font-black">Visa & Immigration</h2>
          <p className="text-slate-500 font-medium">Smart migration paths and official requirements.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {step < 4 && (
          <div className="p-8 border-b border-slate-50 flex justify-center gap-3">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= s ? 'bg-blue-600 w-10' : 'bg-slate-100'}`}></div>
            ))}
          </div>
        )}

        <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-12">
          {step === 1 && (
            <div className="w-full max-w-md space-y-8 text-center animate-in slide-in-from-bottom-4">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-orange-100 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-earth-americas"></i>
                </div>
                <h3 className="text-2xl font-black">Your Nationality?</h3>
                <p className="text-slate-500">We need to know which passport you hold to calculate your eligibility.</p>
              </div>
              <input 
                autoFocus
                value={details.nationality}
                onChange={(e) => setDetails({...details, nationality: e.target.value})}
                placeholder="Enter your country of origin..."
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all"
              />
              <button 
                onClick={() => setStep(2)}
                disabled={!details.nationality}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-md space-y-8 text-center animate-in slide-in-from-right-4">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-location-arrow"></i>
                </div>
                <h3 className="text-2xl font-black">Destination?</h3>
                <p className="text-slate-500">Which country are you planning to relocate to?</p>
              </div>
              <input 
                autoFocus
                value={details.destination}
                onChange={(e) => setDetails({...details, destination: e.target.value})}
                placeholder="e.g. Germany, Canada, Spain..."
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all"
              />
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-900">Back</button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!details.destination}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="w-full max-w-md space-y-8 text-center animate-in slide-in-from-right-4">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <h3 className="text-2xl font-black">Purpose of Move?</h3>
                <p className="text-slate-500">Work, study, digital nomad, or joining a partner?</p>
              </div>
              <textarea 
                autoFocus
                rows={4}
                value={details.reason}
                onChange={(e) => setDetails({...details, reason: e.target.value})}
                placeholder="Briefly describe your situation..."
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all resize-none"
              />
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-bold hover:text-slate-900">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={!details.reason || loading}
                  className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl disabled:opacity-50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  {loading ? 'Analyzing Data...' : 'Generate Roadmap'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && report && (
            <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-6 rounded-3xl border">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Analysis Complete</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{details.nationality} to {details.destination}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onSave?.({id: `visa-${Date.now()}`, type: 'visa', title: `Route to ${details.destination}`, data: report, timestamp: new Date().toISOString()})} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-colors"><i className="fa-solid fa-bookmark"></i></button>
                  <button onClick={() => onShare?.(`Visa Roadmap to ${details.destination}`, report.overview)} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-colors"><i className="fa-solid fa-share-nodes"></i></button>
                  <button onClick={resetAdvisor} className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-xs hover:bg-slate-800 transition-colors">Start Over</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                  <div className="prose prose-slate max-w-none">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Executive Overview</h4>
                    <p className="text-lg font-medium text-slate-700 leading-relaxed">{report.overview}</p>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Verified Pathways</h4>
                    <div className="space-y-4">
                      {report.options.map((opt, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                            <i className={`fa-solid ${opt.icon || 'fa-passport'}`}></i>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-black text-slate-900">{opt.title}</h5>
                              <span className="text-[10px] font-black text-blue-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-tighter">Est. {opt.estimatedTime}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase text-slate-400">Requirements</p>
                                <ul className="text-xs font-bold text-slate-500 space-y-1">
                                  {opt.requirements.map((r, j) => <li key={j} className="flex gap-2"><i className="fa-solid fa-check text-green-500 mt-0.5"></i> {r}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase text-slate-400">Pros & Cons</p>
                                <div className="space-y-1">
                                  {opt.pros.slice(0, 1).map((p, j) => <p key={j} className="text-[11px] text-green-600 font-bold"><i className="fa-solid fa-plus mr-1"></i> {p}</p>)}
                                  {opt.cons.slice(0, 1).map((c, j) => <p key={j} className="text-[11px] text-red-400 font-bold"><i className="fa-solid fa-minus mr-1"></i> {c}</p>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <i className="fa-solid fa-map-location-dot absolute -bottom-10 -right-10 text-[10rem] opacity-5 -rotate-12"></i>
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                      <i className="fa-solid fa-shoe-prints text-orange-400"></i>
                      Step-by-Step Roadmap
                    </h4>
                    <div className="space-y-6 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/10"></div>
                      {report.recommendedSteps.map((step, i) => (
                        <div key={i} className="flex gap-6 relative group">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black z-10 border border-white/10 group-hover:bg-blue-600 transition-colors">{i+1}</div>
                          <p className="text-sm font-medium text-slate-300 pt-1.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Official Portals</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.officialResourceLinks.map((link, i) => (
                        <a key={i} href={link.uri} target="_blank" className="px-4 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-blue-600 transition-all flex items-center gap-2">
                          {link.title} <i className="fa-solid fa-arrow-up-right-from-square text-[8px] opacity-40"></i>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                     <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">
                       <i className="fa-solid fa-circle-info mr-2"></i>
                       {report.disclaimer}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaPage;
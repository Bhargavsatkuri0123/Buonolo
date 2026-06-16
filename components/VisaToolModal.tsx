
import React, { useState } from 'react';
import { getVisaAdvice } from '../services/geminiService';
import { VisaDetails, VisaReport } from '../types';

interface VisaToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisaToolModal: React.FC<VisaToolModalProps> = ({ isOpen, onClose }) => {
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

  const handleClose = () => {
    setStep(1);
    setDetails({ nationality: '', destination: '', reason: '' });
    setReport(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-slate-50 w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-passport"></i>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Migration Advisor</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personalized Visa Report</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-10 h-10 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-orange-100 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl shadow-sm">
                  <i className="fa-solid fa-globe"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Where are you from?</h3>
                <p className="text-slate-500 max-sm mx-auto">Your passport nationality is the most important factor for visa eligibility.</p>
              </div>
              <div className="max-w-md mx-auto space-y-6">
                <input 
                  autoFocus
                  value={details.nationality}
                  onChange={(e) => setDetails({...details, nationality: e.target.value})}
                  placeholder="Enter your nationality..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-medium text-slate-900 shadow-sm focus:ring-4 ring-blue-500/10 border-orange-100 outline-none transition-all"
                />
                <button 
                  onClick={() => setStep(2)}
                  disabled={!details.nationality}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl shadow-sm">
                  <i className="fa-solid fa-location-arrow"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Destination?</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Tell us which country you are planning to move to.</p>
              </div>
              <div className="max-w-md mx-auto space-y-6">
                <input 
                  autoFocus
                  value={details.destination}
                  onChange={(e) => setDetails({...details, destination: e.target.value})}
                  placeholder="e.g. Germany, USA, Australia..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-medium text-slate-900 shadow-sm focus:ring-4 ring-blue-500/10 border-orange-100 outline-none transition-all"
                />
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white text-slate-500 font-bold rounded-2xl border border-slate-200">Back</button>
                  <button 
                    onClick={() => setStep(3)}
                    disabled={!details.destination}
                    className="flex-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-[2rem] flex items-center justify-center mx-auto text-3xl shadow-sm">
                  <i className="fa-solid fa-bullseye"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900">What's the goal?</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Work, study, digital nomad, or joining family?</p>
              </div>
              <div className="max-w-md mx-auto space-y-6">
                <textarea 
                  autoFocus
                  rows={4}
                  value={details.reason}
                  onChange={(e) => setDetails({...details, reason: e.target.value})}
                  placeholder="I want to work as a software engineer..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-medium text-slate-900 shadow-sm focus:ring-4 ring-blue-500/10 border-orange-100 outline-none transition-all resize-none"
                />
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white text-slate-500 font-bold rounded-2xl border border-slate-200">Back</button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!details.reason || loading}
                    className="flex-2 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl disabled:opacity-50 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        Analyzing Data...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && report && (
            <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
              
              {/* Report Summary */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 border-l-8 border-l-blue-600">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <i className="fa-solid fa-file-lines text-blue-600"></i>
                  Executive Summary
                </div>
                <p className="text-slate-700 text-lg leading-relaxed font-medium">{report.overview}</p>
              </div>

              {/* Visa Options Grid */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 px-2 flex items-center gap-3">
                  <i className="fa-solid fa-id-card-clip text-blue-600"></i>
                  Qualified Visa Pathways
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {report.options.map((option, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center text-xl">
                          <i className={`fa-solid ${option.icon || 'fa-passport'}`}></i>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 leading-tight">{option.title}</h4>
                          <span className="text-[10px] font-bold text-blue-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                            <i className="fa-solid fa-clock mr-1 text-[8px]"></i>
                            {option.estimatedTime}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-grow">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirements</span>
                          <ul className="space-y-1.5">
                            {option.requirements.map((req, j) => (
                              <li key={j} className="flex gap-2 items-start text-sm text-slate-600">
                                <i className="fa-solid fa-circle-check text-orange-500 mt-1 text-[10px]"></i>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Pros</span>
                            <ul className="space-y-1">
                              {option.pros.slice(0, 2).map((pro, j) => (
                                <li key={j} className="text-[11px] font-medium text-slate-500 flex gap-1.5 items-start">
                                  <i className="fa-solid fa-plus text-green-400 mt-1 text-[8px]"></i>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Cons</span>
                            <ul className="space-y-1">
                              {option.cons.slice(0, 2).map((con, j) => (
                                <li key={j} className="text-[11px] font-medium text-slate-500 flex gap-1.5 items-start">
                                  <i className="fa-solid fa-minus text-red-300 mt-1 text-[8px]"></i>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfalls & Next Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                  <h4 className="text-lg font-bold flex items-center gap-3">
                    <i className="fa-solid fa-triangle-exclamation text-yellow-400"></i>
                    Common Pitfalls
                  </h4>
                  <ul className="space-y-4">
                    {report.commonPitfalls.map((pit, i) => (
                      <li key={i} className="flex gap-4 items-start group">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors">{i+1}</span>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{pit}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                  <h4 className="text-lg font-bold flex items-center gap-3">
                    <i className="fa-solid fa-list-check"></i>
                    Your Roadmap
                  </h4>
                  <ul className="space-y-4">
                    {report.recommendedSteps.map((step, i) => (
                      <li key={i} className="flex gap-4 items-start group">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold group-hover:bg-white group-hover:text-blue-600 transition-colors">{i+1}</span>
                        <p className="text-sm text-blue-50 leading-relaxed font-medium">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resources */}
              {report.officialResourceLinks.length > 0 && (
                <div className="space-y-4 pb-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-link text-blue-600"></i>
                    Verified Official Resources
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {report.officialResourceLinks.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
                      >
                        {link.title}
                        <i className="fa-solid fa-arrow-up-right-from-square text-[8px] opacity-40"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-6 bg-slate-100/50 rounded-2xl text-[10px] font-medium text-slate-400 leading-relaxed italic border border-slate-100">
                <i className="fa-solid fa-circle-info mr-1"></i>
                {report.disclaimer}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => { setStep(1); setDetails({nationality: '', destination: '', reason: ''}); setReport(null); }}
                  className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-[0.98] transition-all"
                >
                  Start New Advisor Query
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-print"></i>
                  Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaToolModal;

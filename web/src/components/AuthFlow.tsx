import React from "react";
import { ArrowLeft } from "lucide-react";
import { LOCATIONS } from "../constants";
import { Theme } from "../types";

interface AuthFlowProps {
  authScreen: string;
  setAuthScreen: (val: string) => void;
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authName: string;
  setAuthName: (val: string) => void;
  authOrigin: string;
  setAuthOrigin: (val: string) => void;
  authHost: string;
  setAuthHost: (val: string) => void;
  authCity: string;
  setAuthCity: (val: string) => void;
  authCustomHost: string;
  setAuthCustomHost: (val: string) => void;
  authCustomCity: string;
  setAuthCustomCity: (val: string) => void;
  authSituation: string;
  setAuthSituation: (val: string) => void;
  authFocus: string;
  setAuthFocus: (val: string) => void;
  authLoading: boolean;
  handleEmailLogin: (e: React.FormEvent) => void;
  handleEmailRegister: (e: React.FormEvent) => void;
  handleSetupSave: (
    name: string, 
    origin: string, 
    host: string, 
    customHost: string, 
    city: string, 
    customCity: string,
    situation: string,
    focus: string
  ) => void;
  toastError: string;
  T: Theme;
}

export const AuthFlow = ({
  authScreen, setAuthScreen, authEmail, setAuthEmail, authPassword, setAuthPassword,
  authName, setAuthName, authOrigin, setAuthOrigin, authHost, setAuthHost, authCity, setAuthCity,
  authCustomHost, setAuthCustomHost, authCustomCity, setAuthCustomCity,
  authSituation, setAuthSituation, authFocus, setAuthFocus,
  authLoading, handleEmailLogin, handleEmailRegister, handleSetupSave,
  toastError, T
}: AuthFlowProps) => {
  if (authScreen === "intro") return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${T.bg} text-center`}>
      <div className="rounded-2xl flex items-center justify-center shadow-md bg-orange-500 w-20 h-20 mb-6">
        <svg height={32} viewBox="0 0 170 140" fill="none" style={{ display: "block" }}>
          <path d="M16 27 Q40 7 64 27" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
          <path d="M106 27 Q130 7 154 27" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
          <circle cx="40" cy="64" r="23" stroke="#fff" strokeWidth="15" />
          <circle cx="130" cy="64" r="23" stroke="#fff" strokeWidth="15" />
          <line x1="85" y1="36" x2="85" y2="90" stroke="#fff" strokeWidth="15" strokeLinecap="round" />
          <path d="M32 106 Q85 141 138 106" stroke="#fff" strokeWidth="13" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className={`disp font-bold text-3xl ${T.text}`}>Welcome to buonôlô</h1>
      <p className={`mt-2 ${T.sub}`}>Your companion for settling in Germany with confidence.</p>
      <div className="w-full mt-12 space-y-3 max-w-sm">
        <button onClick={() => setAuthScreen("login")} className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20">
          Continue with Email
        </button>
      </div>
      <p className="mt-8 text-xs text-gray-400">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  );

  if (authScreen === "login" || authScreen === "register") return (
    <div className={`fixed inset-0 z-50 flex flex-col ${T.bg}`}>
       <div className={`sticky top-0 z-20 ${T.bg} px-4 pt-4 pb-3 flex items-center gap-3`}>
        <button onClick={() => setAuthScreen("intro")} className={`p-1 rounded-full ${T.card2}`}><ArrowLeft size={18} className={T.text} /></button>
        <h1 className={`disp font-bold text-2xl ${T.text}`}>{authScreen === "login" ? "Log in" : "Sign up"}</h1>
      </div>
      <form onSubmit={authScreen === "login" ? handleEmailLogin : handleEmailRegister} className="p-6 space-y-4 max-w-md mx-auto w-full">
        {authScreen === "register" && (
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Full Name</label>
            <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="e.g. Maria Silva" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} />
          </div>
        )}
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Email Address</label>
          <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="name@example.com" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Password</label>
          <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} />
        </div>
        {toastError && <p className="text-red-500 text-sm font-medium">{toastError}</p>}
        <button disabled={authLoading} type="submit" className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl mt-4">
          {authLoading ? "Please wait..." : authScreen === "login" ? "Log In" : "Create Account"}
        </button>
        <button type="button" onClick={() => setAuthScreen(authScreen === "login" ? "register" : "login")} className={`w-full text-sm font-semibold ${T.sub} py-2`}>
          {authScreen === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );

  if (authScreen === "setup") return (
    <div className={`fixed inset-0 z-50 flex flex-col ${T.bg}`}>
      <div className="p-6 text-center">
        <h1 className={`disp font-bold text-2xl ${T.text}`}>Welcome, {authName.split(' ')[0]}!</h1>
        <p className={`mt-1 text-sm ${T.sub}`}>Let's tailor buonôlô to your journey.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setAuthScreen("assessment"); }} className="px-6 space-y-4 max-w-md mx-auto w-full overflow-y-auto pb-12 no-scrollbar">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Your Nationality</label>
          <input value={authOrigin} onChange={e => setAuthOrigin(e.target.value)} placeholder="e.g. Brazil" className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Host Country</label>
          <select value={authHost} onChange={e => { setAuthHost(e.target.value); if (e.target.value !== "Other") setAuthCustomHost(""); }} className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`}>
            <option value="">Select...</option>
            {Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {authHost === "Other" && (
            <input 
              value={authCustomHost} 
              onChange={e => setAuthCustomHost(e.target.value)} 
              placeholder="Enter host country..." 
              className={`w-full mt-2 ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} 
            />
          )}
        </div>
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-1.5`}>Current City</label>
          <select value={authCity} onChange={e => { setAuthCity(e.target.value); if (e.target.value !== "Other") setAuthCustomCity(""); }} className={`w-full ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`}>
            <option value="">Select...</option>
            {authHost && LOCATIONS[authHost]?.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          {(authCity === "Other" || authHost === "Other") && (
            <input 
              value={authCustomCity} 
              onChange={e => setAuthCustomCity(e.target.value)} 
              placeholder="Enter current city..." 
              className={`w-full mt-2 ${T.input} rounded-xl px-4 py-3 outline-none border ${T.line}`} 
            />
          )}
        </div>
        <button 
          disabled={!authOrigin || !authHost || !authCity || (authHost === "Other" && !authCustomHost) || (authCity === "Other" && !authCustomCity)} 
          type="submit" 
          className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl mt-4 flex items-center justify-center gap-2"
        >
          Next: Personalise <ArrowLeft size={18} className="rotate-180" />
        </button>
      </form>
    </div>
  );

  if (authScreen === "assessment") return (
    <div className={`fixed inset-0 z-50 flex flex-col ${T.bg}`}>
      <div className="p-6 text-center">
        <h1 className={`disp font-bold text-2xl ${T.text}`}>Quick Assessment</h1>
        <p className={`mt-1 text-sm ${T.sub}`}>Tell us more to get the best guides.</p>
      </div>
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        handleSetupSave(authName, authOrigin, authHost, authCustomHost, authCity, authCustomCity, authSituation, authFocus); 
      }} className="px-6 space-y-6 max-w-md mx-auto w-full overflow-y-auto pb-12 no-scrollbar">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>What brings you to {authCity === "Other" ? authCustomCity : authCity}?</label>
          <div className="grid grid-cols-1 gap-2">
            {["Work / Employment", "Study / Education", "Family Reunion", "Freelancing / Business", "Seeking Asylum / Protection", "Just Exploring"].map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => setAuthSituation(opt)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${authSituation === opt ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : `${T.card} ${T.line} ${T.text}`}`}
              >
                <p className="font-semibold text-sm">{opt}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${T.sub} mb-3`}>Your primary focus right now:</label>
          <div className="grid grid-cols-2 gap-2">
            {["Anmeldung", "Visa / Permits", "Housing", "Banking", "Health Insurance", "Social Circle"].map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => setAuthFocus(opt)}
                className={`text-left p-3 rounded-xl border transition-all ${authFocus === opt ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : `${T.card} ${T.line} ${T.text}`}`}
              >
                <p className="font-semibold text-xs">{opt}</p>
              </button>
            ))}
          </div>
        </div>

        {toastError && <p className="text-red-500 text-sm font-medium">{toastError}</p>}
        
        <div className="flex gap-3">
          <button type="button" onClick={() => setAuthScreen("setup")} className={`flex-1 ${T.card2} ${T.text} font-bold py-3.5 rounded-2xl`}>Back</button>
          <button 
            disabled={authLoading} 
            type="submit" 
            className="flex-[2] bg-orange-500 text-white font-bold py-3.5 rounded-2xl"
          >
            {authLoading ? "Saving..." : "Start my journey"}
          </button>
        </div>
      </form>
    </div>
  );

  return null;
};

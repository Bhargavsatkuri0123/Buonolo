import React from "react";
import { Send } from "lucide-react";
import { Header, PeanutLogo } from "./Header";
import { Theme, Profile } from "../types";

interface BotTabProps {
  setTab: (val: string) => void;
  profile: Profile;
  T: Theme;
  messages: any[];
  onSend: (text: string) => void;
  loading: boolean;
}

export const BotTab = ({ setTab, profile, T, messages, onSend, loading }: BotTabProps) => {
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="pb-32 flex flex-col min-h-screen">
      <Header T={T} title={<><PeanutLogo size={24} /> Ask Peanut</>} back={() => setTab("home")} />
      <div className="flex-1 px-4 space-y-4 mt-4 overflow-y-auto no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
            {!m.isMe && <div className="mr-2 mt-1 shrink-0"><PeanutLogo size={28} /></div>}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.isMe ? "bg-orange-500 text-white rounded-tr-sm" : `${T.card} ${T.text} rounded-tl-sm border border-orange-100 dark:border-zinc-800 shadow-sm`}`}>
              {m.text}
              <p className={`text-[9px] mt-1 opacity-60 ${m.isMe ? "text-white" : T.sub}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 shrink-0"><PeanutLogo size={28} /></div>
            <div className={`px-4 py-3 rounded-2xl text-sm ${T.card} ${T.text} rounded-tl-sm border border-orange-100 dark:border-zinc-800 shadow-sm`}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 py-3 ${T.bg} border-t ${T.line}`}>
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${T.card} border ${T.line} shadow-inner`}>
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Peanut..." 
            className={`flex-1 bg-transparent text-sm outline-none py-1.5 ${T.text}`} 
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-1.5 rounded-full ${(!input.trim() || loading) ? "text-gray-300" : "text-orange-500 hover:bg-orange-50"}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

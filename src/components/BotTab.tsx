import React from "react";
import { FileText, Paperclip, Send, X } from "lucide-react";
import { Header, PeanutLogo } from "./Header";
import { Theme, Profile } from "../types";

interface BotTabProps {
  setTab: (val: string) => void;
  profile: Profile;
  T: Theme;
  messages: any[];
  onSend: (text: string, attachment?: { name: string; mimeType: string; data: string }) => void;
  loading: boolean;
}

export const BotTab = ({ setTab, profile, T, messages, onSend, loading }: BotTabProps) => {
  const [input, setInput] = React.useState("");
  const [attachment, setAttachment] = React.useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [attachmentError, setAttachmentError] = React.useState("");

  const handleSend = () => {
    if ((!input.trim() && !attachment) || loading) return;
    onSend(input.trim() || "Translate this document and explain any required actions or deadlines.", attachment || undefined);
    setInput("");
    setAttachment(null);
    setAttachmentError("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAttachmentError("");
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAttachmentError("Choose a PDF, JPEG, PNG, or WebP document.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError("Documents must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const data = dataUrl.split(",", 2)[1];
      if (!data) {
        setAttachmentError("This document could not be read.");
        return;
      }
      setAttachment({ name: file.name, mimeType: file.type, data });
    };
    reader.onerror = () => setAttachmentError("This document could not be read.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-32 flex flex-col min-h-[calc(100vh-140px)] max-w-3xl mx-auto w-full">
      <Header T={T} hideOnDesktop={true} title={<><PeanutLogo size={24} /> Ask Peanut</>} back={() => setTab("home")} />
      <div className="flex-1 px-4 lg:px-0 space-y-4 mt-4 overflow-y-auto no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
            {!m.isMe && <div className="mr-2 mt-1 shrink-0"><PeanutLogo size={28} /></div>}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.isMe ? "bg-orange-500 text-white rounded-tr-sm" : `${T.card} ${T.text} rounded-tl-sm border border-orange-100 dark:border-zinc-800 shadow-sm`}`}>
              {m.text}
              {m.attachment && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/5 px-2 py-1 text-xs dark:bg-white/10">
                  <FileText size={14} />
                  <span className="break-all">{m.attachment.name}</span>
                </div>
              )}
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
      <div className={`fixed md:sticky bottom-16 md:bottom-4 left-0 right-0 max-w-md md:max-w-3xl mx-auto px-4 md:px-0 py-3 ${T.bg} border-t md:border-t-0 ${T.line} z-30`}>
        {attachment && (
          <div className={`mb-2 flex items-center gap-2 rounded-lg border ${T.line} ${T.card} px-3 py-2`}>
            <FileText size={16} className="text-orange-500" />
            <span className={`min-w-0 flex-1 truncate text-sm ${T.text}`}>{attachment.name}</span>
            <button onClick={() => setAttachment(null)} aria-label="Remove attachment" className={`p-1 ${T.sub}`}>
              <X size={16} />
            </button>
          </div>
        )}
        {attachmentError && <p role="alert" className="mb-2 text-xs text-red-600">{attachmentError}</p>}
        <p className={`mb-2 px-3 text-[11px] ${T.sub}`}>
          Documents are sent to Gemini for analysis. Redact personal ID and account numbers first.
        </p>
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${T.card} border ${T.line} shadow-sm`}>
          <label title="Attach a PDF or image" className="cursor-pointer p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-neutral-800 rounded-full">
            <Paperclip size={17} />
            <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
          </label>
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Peanut about visas, registering, bank accounts, healthcare..." 
            className={`flex-1 bg-transparent text-sm outline-none py-1.5 ${T.text}`} 
          />
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || loading}
            className={`p-1.5 rounded-full ${(!input.trim() && !attachment || loading) ? "text-gray-300" : "text-orange-500 hover:bg-orange-50 dark:hover:bg-neutral-800"}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

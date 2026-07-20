import React from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar } from "./Avatar";
import { Theme } from "../types";

interface MessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMessageThread: string | null;
  setActiveMessageThread: (val: string | null) => void;
  messageText: string;
  setMessageText: (val: string) => void;
  handleSendMessage: () => void;
  directMessages: any[];
  T: Theme;
}

export const MessengerModal = ({
  isOpen, onClose, activeMessageThread, setActiveMessageThread,
  messageText, setMessageText, handleSendMessage, directMessages, T
}: MessengerModalProps) => {
  if (!isOpen) return null;
  const threads = Array.from(new Set(directMessages.map((m: any) => m.threadId)));

  return (
    <div className={`fixed inset-0 z-[110] flex flex-col ${T.bg}`}>
       <div className={`sticky top-0 z-20 ${T.bg} px-4 pt-4 pb-3 flex items-center gap-3`}>
        <button onClick={activeMessageThread ? () => setActiveMessageThread(null) : onClose} className={`p-1 rounded-full ${T.card2}`}><ArrowLeft size={18} className={T.text} /></button>
        <h1 className={`disp font-bold text-2xl ${T.text}`}>{activeMessageThread ? activeMessageThread : "Messenger"}</h1>
      </div>
      {activeMessageThread ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {directMessages.filter((m: any) => m.threadId === activeMessageThread).map((m: any) => (
              <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${m.isMe ? "bg-orange-500 text-white rounded-br-none" : `${T.card2} ${T.text} rounded-bl-none`} px-4 py-2 rounded-2xl text-sm`}>
                  {m.sharedPost && (
                    <div className={`mb-2 p-3 rounded-xl ${m.isMe ? "bg-white/20" : T.card} border border-white/10`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar name={m.sharedPost.name} size={6} />
                        <p className="text-[10px] font-bold">{m.sharedPost.name}</p>
                      </div>
                      <p className="text-xs line-clamp-2">{m.sharedPost.text}</p>
                    </div>
                  )}
                  {m.text}
                  <p className={`text-[10px] mt-1 ${m.isMe ? "text-orange-100" : "text-gray-400"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={`p-4 border-t ${T.line}`}>
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${T.card2}`}>
              <input value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Aa" className={`bg-transparent outline-none flex-1 ${T.text}`} />
              <button onClick={handleSendMessage} className={messageText.trim() ? "text-orange-500" : T.sub}><Send size={20} /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {threads.map((t: any) => (
            <button key={t} onClick={() => setActiveMessageThread(t)} className={`w-full flex items-center gap-3 p-4 hover:${T.card2}`}>
              <Avatar name={t} />
              <div className="flex-1 text-left">
                <p className={`font-bold ${T.text}`}>{t}</p>
                <p className={`text-xs ${T.sub} truncate`}>{directMessages.filter((m: any) => m.threadId === t).slice(-1)[0]?.text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

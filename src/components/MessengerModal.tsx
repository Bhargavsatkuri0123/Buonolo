import React from "react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
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
  const threads = Array.from(new Set(directMessages.map((m: any) => m.threadId))).filter(Boolean);
  const getThreadName = (tid: string) => directMessages.find((m: any) => m.threadId === tid)?.threadName || tid;

  return (
    <div className={`fixed inset-0 z-[110] flex flex-col ${T.bg}`}>
       <div className={`sticky top-0 z-20 ${T.bg} px-4 pt-4 pb-3 flex items-center gap-3 border-b ${T.line}`}>
        <button onClick={activeMessageThread ? () => setActiveMessageThread(null) : onClose} className={`p-2 rounded-full ${T.card2} hover:opacity-80 transition-opacity`}>
          <ArrowLeft size={18} className={T.text} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className={`disp font-bold text-xl ${T.text} truncate`}>{activeMessageThread ? getThreadName(activeMessageThread) : "Messenger"}</h1>
          {activeMessageThread && <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active now</p>}
        </div>
      </div>
      {activeMessageThread ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
            {directMessages.filter((m: any) => m.threadId === activeMessageThread && !m.isFake).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Avatar name={getThreadName(activeMessageThread)} size={14} />
                <p className={`text-base font-bold ${T.text}`}>{getThreadName(activeMessageThread)}</p>
                <p className={`text-xs ${T.sub} max-w-xs`}>
                  Say hello to connect with fellow expats and locals in your new city!
                </p>
              </div>
            ) : (
              directMessages.filter((m: any) => m.threadId === activeMessageThread && !m.isFake).map((m: any) => (
                <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${m.isMe ? "bg-orange-500 text-white rounded-br-none" : `${T.card2} ${T.text} rounded-bl-none`} px-4 py-2.5 rounded-2xl text-sm shadow-xs`}>
                    {m.sharedPost && (
                      <div className={`mb-2.5 p-3 rounded-xl ${m.isMe ? "bg-white/20 text-white" : T.card} border ${m.isMe ? "border-white/20" : T.line}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {m.sharedPost.emoji ? (
                            <span className="text-xl shrink-0 p-1 bg-white/10 rounded-lg">{m.sharedPost.emoji}</span>
                          ) : (
                            <Avatar name={m.sharedPost.name} size={6} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{m.sharedPost.name}</p>
                            {m.sharedPost.isGroupInvite ? (
                              <span className="text-[10px] font-semibold text-orange-400 dark:text-orange-300 flex items-center gap-1">
                                🏘️ Community Invitation
                              </span>
                            ) : (
                              <p className="text-[10px] opacity-70">Shared post</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs line-clamp-2 leading-relaxed opacity-95">{m.sharedPost.text}</p>
                      </div>
                    )}
                    <p className="leading-relaxed break-words">{m.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${m.isMe ? "text-orange-100" : "text-gray-400"}`}>{m.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={`p-4 border-t ${T.line}`}>
            <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${T.card2} border border-orange-200/50 dark:border-zinc-800 focus-within:border-orange-500 transition-colors`}>
              <input 
                value={messageText} 
                onChange={e => setMessageText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                placeholder={`Message ${getThreadName(activeMessageThread)}...`} 
                className={`bg-transparent outline-none flex-1 text-sm ${T.text}`} 
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!messageText.trim()}
                className={`p-1.5 rounded-full transition-all ${messageText.trim() ? "text-white bg-orange-500 hover:bg-orange-600 scale-100" : `${T.sub} opacity-40 cursor-not-allowed`}`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-orange-500 shadow-sm">
                <MessageCircle size={28} />
              </div>
              <h3 className={`text-base font-bold ${T.text}`}>No Conversations Yet</h3>
              <p className={`text-xs ${T.sub} max-w-xs leading-relaxed`}>
                Connect with community members, ask questions, or say hello to expats in your area!
              </p>
            </div>
          ) : (
            threads.map((t: any) => {
              const threadMsgs = directMessages.filter((m: any) => m.threadId === t && !m.isFake);
              const lastMsg = threadMsgs.slice(-1)[0]?.text || "Say hello to start chatting...";
              const lastTime = threadMsgs.slice(-1)[0]?.time || "";
              return (
                <button 
                  key={t} 
                  onClick={() => setActiveMessageThread(t)} 
                  className={`w-full flex items-center gap-3 p-4 hover:${T.card2} border-b border-orange-50/50 dark:border-zinc-800/50 transition-colors text-left`}
                >
                  <Avatar name={getThreadName(t)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`font-bold text-sm ${T.text} truncate`}>{getThreadName(t)}</p>
                      {lastTime && <span className={`text-[10px] ${T.sub}`}>{lastTime}</span>}
                    </div>
                    <p className={`text-xs ${T.sub} truncate`}>{lastMsg}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

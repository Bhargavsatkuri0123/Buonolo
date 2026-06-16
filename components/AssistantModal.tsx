
import React, { useState, useEffect, useRef } from 'react';
import { createExpatChat } from '../services/geminiService';
import { ChatMessage, Country } from '../types';

interface AssistantModalProps {
  country?: Country | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ country, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatRef.current = createExpatChat(country?.name);
      const greeting = country 
        ? `Ciao! I'm Bona, your guide to settling in ${country.name}. How can I assist with your onboarding today?`
        : `Benvenuti! I'm Bona. I'm here to help you navigate the Buonolo journey: Onboarding, Localization, and Opportunity. What's on your mind?`;
      
      setMessages([{ role: 'model', text: greeting }]);
    } else {
      chatRef.current = null;
      setMessages([]);
    }
  }, [isOpen, country?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an issue. Let's try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full md:h-[600px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-xl">
              B
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">Bona</h3>
              <p className="text-[9px] opacity-70 uppercase tracking-widest font-bold">
                {country ? `${country.name} Local Specialist` : 'Settlement Guide'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none shadow-md font-medium' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Bona about your journey...`}
            className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 ring-primary outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-[#004a7a] transition-colors disabled:opacity-50 shadow-lg active:scale-95"
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantModal;

import React, { useState } from 'react';
import { User } from '../types';

interface InboxPageProps {
  user: User;
  onNavigate: (page: string) => void;
}

const DUMMY_CONVERSATIONS = [
  { id: '1', name: 'Samira Ali', avatar: 'fa-user-nurse', lastMessage: 'Thanks for the advice on registering for NHS!', time: '10:30 AM', unread: 2 },
  { id: '2', name: 'Alex Johnson', avatar: 'fa-user-tie', lastMessage: 'Are you going to the Warwick networking event tomorrow?', time: 'Yesterday', unread: 0 },
  { id: '3', name: 'Maria Garcia', avatar: 'fa-user-graduate', lastMessage: 'I found a great flat near Leamington Spa.', time: 'Monday', unread: 0 },
];

const DUMMY_MESSAGES = [
  { id: '1', senderId: 'user', content: 'Hey Samira! Did you manage to find the GP clinic?', timestamp: '10:00 AM' },
  { id: '2', senderId: 'them', content: 'Yes! It was right where you said.', timestamp: '10:15 AM' },
  { id: '3', senderId: 'them', content: 'Thanks for the advice on registering for NHS!', timestamp: '10:30 AM' },
];

const InboxPage: React.FC<InboxPageProps> = ({ user, onNavigate }) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), senderId: 'user', content: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMessage('');
    
    // Mock partner reply
    setTimeout(() => {
       const reply = "I'm not sure, let me check and get back to you!";
       setMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'them', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
       if (Notification.permission === 'granted') {
          new Notification('New Message', { body: `Samira: ${reply}` });
       }
    }, 2000);
  };

  const handlePushTest = () => {
    if (Notification.permission === 'granted') {
      new Notification('New Message', { body: 'You have a new message from Samira', icon: '/vite.svg' });
    } else {
      alert('Push notifications not enabled. Please enable in Settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-primary rounded-[1.5rem] flex items-center justify-center text-xl shadow-sm border border-orange-100">
            <i className="fa-solid fa-envelope"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800">Messages</h2>
        </div>
        <button onClick={handlePushTest} className="text-xs font-bold text-primary bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors hidden sm:block">
          Test Push Notification
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-sm flex-grow overflow-hidden flex flex-col md:flex-row">
        {/* Contacts List */}
        <div className={`w-full md:w-1/3 border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-slate-50">
            <input type="text" placeholder="Search messages..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div className="overflow-y-auto flex-grow custom-scrollbar">
            {DUMMY_CONVERSATIONS.map(conv => (
              <button 
                key={conv.id} 
                onClick={() => setActiveChat(conv.id)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b last:border-0 ${activeChat === conv.id ? 'bg-orange-50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <i className={`fa-solid ${conv.avatar}`}></i>
                </div>
                <div className="text-left flex-grow hidden sm:block md:block overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{conv.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex-col bg-slate-50 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b bg-white px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-400 hover:text-primary transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <i className={`fa-solid ${DUMMY_CONVERSATIONS.find(c => c.id === activeChat)?.avatar || 'fa-user'} text-slate-400`}></i>
                    {DUMMY_CONVERSATIONS.find(c => c.id === activeChat)?.name}
                  </div>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 ${msg.senderId === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border shadow-sm text-slate-700 rounded-tl-sm'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-2 block font-medium ${msg.senderId === 'user' ? 'text-primary-100' : 'text-slate-400'}`}>{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..." 
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                  <button onClick={handleSend} className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0">
                    <i className="fa-solid fa-paper-plane mr-1"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
                <i className="fa-regular fa-comments"></i>
              </div>
              <p className="font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;

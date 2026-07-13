const fs = require('fs');

let code = `
import React, { useState, useMemo } from "react";
import { Search, Plus, Users, MapPin, User, ChevronRight, MessageCircle, ChevronLeft, Globe, Calendar, Clock, Share2, CheckCircle2, MoreHorizontal, UserPlus, Image as ImageIcon, ThumbsUp, MessageSquare } from "lucide-react";
import { Header } from "./Header";
import { Avatar } from "./Avatar";
import { Theme, Profile } from "../types";
import { DUMMY_COMMUNITIES, DUMMY_EVENTS, DUMMY_PEOPLE, SAF } from "../constants";

interface CommunityTabProps {
  communitiesData: any[];
  activeCommunityTab: string;
  setActiveCommunityTab: (val: string) => void;
  profile: Profile;
  T: Theme;
}

export const UserView = ({ user, onClose, T, onGroupClick }: any) => {
  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={\`sticky top-0 z-10 flex items-center justify-between p-4 border-b border-orange-100 dark:border-zinc-800 bg-white dark:bg-black\`}>
        <button onClick={onClose} className={\`p-2 -ml-2 rounded-full \${T.card}\`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button className={\`p-2 -mr-2 rounded-full \${T.card}\`}>
          <Share2 size={20} className={T.text} />
        </button>
      </div>
      <div className="px-4 py-8 flex flex-col items-center border-b border-orange-100 dark:border-zinc-800">
        <div className="w-24 h-24 mb-4">
          <Avatar name={user.name} />
        </div>
        <h1 className={\`text-2xl font-bold \${T.text}\`}>{user.name}</h1>
        <p className={\`text-sm \${T.sub} mt-1 flex items-center gap-1\`}><Globe size={14} /> from {user.origin}</p>
        
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button className="flex-1 py-2.5 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20">
            <MessageCircle size={18} /> Message
          </button>
          <button className={\`flex-1 py-2.5 rounded-full \${T.card} \${T.text} font-bold text-sm border border-orange-200 dark:border-zinc-800\`}>
            Follow
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 cardin">
        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-2\`}>About</p>
          <p className={\`text-sm \${T.text} leading-relaxed\`}>
            {user.bio || "I love exploring new places and meeting people from different cultures. Always up for a coffee or a language exchange!"}
          </p>
        </div>

        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>Interests</p>
          <div className="flex flex-wrap gap-2">
            {['Photography', 'Coffee', 'Hiking', 'Language Exchange'].map(tag => (
              <span key={tag} className={\`px-3 py-1.5 rounded-lg text-xs font-medium \${T.card2} \${T.text} border border-orange-100 dark:border-zinc-800\`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>Shared Groups</p>
          {DUMMY_COMMUNITIES.slice(0, 2).map(c => (
            <div key={c.name} onClick={() => onGroupClick(c)} className={\`\${T.card} rounded-2xl p-3 flex items-center gap-3 shadow-sm mb-2 cursor-pointer\`}>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={\`text-sm font-bold \${T.text}\`}>{c.name}</p>
                <p className={\`text-xs \${T.sub}\`}>{c.members} members</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventView = ({ event: selectedEvent, onClose, T, onUserClick }: any) => {
  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={\`sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md\`}>
        <button onClick={onClose} className={\`p-2 -ml-2 rounded-full \${T.card}\`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <button className={\`p-2 -mr-2 rounded-full \${T.card}\`}>
          <Share2 size={20} className={T.text} />
        </button>
      </div>
      
      <div className="w-full h-56 bg-orange-100 dark:bg-zinc-900 flex flex-col items-center justify-center">
        <div className="text-6xl drop-shadow-md mb-2">{selectedEvent.image}</div>
      </div>
      
      <div className="p-4 space-y-6 cardin -mt-4 relative z-10 bg-white dark:bg-black rounded-t-2xl">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className={\`text-sm font-bold text-orange-600 mb-1 flex items-center gap-1.5\`}><Calendar size={14} /> {selectedEvent.date}</p>
              <h2 className={\`text-2xl font-bold \${T.text} leading-tight mb-3\`}>{selectedEvent.title}</h2>
            </div>
          </div>
          <div className={\`flex flex-col gap-3 p-4 rounded-xl \${T.card} border border-orange-100 dark:border-zinc-800\`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-orange-600" />
              </div>
              <div>
                <p className={\`text-sm font-bold \${T.text}\`}>{selectedEvent.location}</p>
                <p className={\`text-xs \${T.sub}\`}>Show on map</p>
              </div>
            </div>
            <div className="w-full h-[1px] bg-orange-100 dark:bg-zinc-800" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Users size={16} className="text-orange-600" />
              </div>
              <div>
                <p className={\`text-sm font-bold \${T.text}\`}>{selectedEvent.attendees} attendees</p>
                <p className={\`text-xs \${T.sub}\`}>+15 spots left</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className={\`flex-1 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30\`}>
            <CheckCircle2 size={18} /> RSVP Going
          </button>
          <button className={\`px-6 py-3.5 rounded-xl \${T.card} \${T.text} font-bold text-center border border-orange-200 dark:border-zinc-800\`}>
            Maybe
          </button>
        </div>

        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>About this event</p>
          <p className={\`text-sm \${T.text} leading-relaxed\`}>
            Join us for a wonderful time! This is a great opportunity to meet new people and share experiences. Don't forget to bring your enthusiasm and good vibes. Look out for the group with the orange balloon.
          </p>
        </div>

        <div>
           <div className="flex items-center justify-between mb-3">
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Attendees</p>
            <button className="text-xs font-semibold text-orange-600">See all {selectedEvent.attendees}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {DUMMY_PEOPLE.map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick(p)}>
                  <Avatar name={p.name} />
                </div>
              ))}
            </div>
            <div className={\`w-10 h-10 rounded-full border-2 border-white dark:border-black \${T.card2} flex items-center justify-center text-[10px] font-bold \${T.text} -ml-3 relative\`} style={{ zIndex: 0 }}>
              +{selectedEvent.attendees - 3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GroupView = ({ group, onClose, T, onUserClick, onEventClick }: any) => {
  const [activeTab, setActiveTab] = useState("discussion");

  const groupPosts = useMemo(() => {
    return [
      { id: 'gp1', user: DUMMY_PEOPLE[0], text: \`Does anyone know the best place to find second-hand furniture around here? Need a desk for my home office!\`, time: "2h ago", likes: 14, comments: 5 },
      { id: 'gp2', user: DUMMY_PEOPLE[1], text: \`Just moved and want to say hi to the \${group.name} community! Let's organize a meetup soon 🍻\`, time: "5h ago", likes: 45, comments: 12 },
      { id: 'gp3', user: DUMMY_PEOPLE[2], text: \`Reminder: our weekly gathering is this Sunday. Check the events tab for details.\`, time: "1d ago", likes: 32, comments: 2 },
    ]
  }, [group.name]);

  return (
    <div className="pb-24 bg-white dark:bg-black min-h-screen">
      <div className={\`sticky top-0 z-20 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md\`}>
        <button onClick={onClose} className={\`p-2 -ml-2 rounded-full \${T.card}\`}>
          <ChevronLeft size={20} className={T.text} />
        </button>
        <div className="flex gap-2">
          <button className={\`p-2 rounded-full \${T.card}\`}><Search size={20} className={T.text} /></button>
          <button className={\`p-2 -mr-2 rounded-full \${T.card}\`}><Share2 size={20} className={T.text} /></button>
        </div>
      </div>
      
      {/* Cover */}
      <div className="w-full h-40 bg-orange-200 dark:bg-zinc-800 flex flex-col items-center justify-center -mt-16 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="text-7xl drop-shadow-lg z-10 mt-8">{group.emoji}</div>
      </div>
      
      <div className="px-4 pt-4 pb-0">
        <h1 className={\`text-2xl font-bold leading-tight \${T.text}\`}>{group.name}</h1>
        <p className={\`text-sm mt-1 \${T.sub} flex items-center gap-1.5\`}>
          <Globe size={14} /> Public Group · <span className="font-bold">{group.members}</span> members
        </p>
        
        <div className="flex gap-2 mt-4 mb-4">
          <button className={\`flex-1 py-2.5 rounded-xl \${group.joined ? \`\${T.card2} \${T.text}\` : 'bg-orange-500 text-white'} font-bold text-sm flex items-center justify-center gap-2\`}>
            {group.joined ? <><CheckCircle2 size={16} /> Joined</> : 'Join Group'}
          </button>
          <button className={\`flex-1 py-2.5 rounded-xl \${T.card} \${T.text} font-bold text-sm flex items-center justify-center gap-2 border border-orange-200 dark:border-zinc-800\`}>
            <UserPlus size={16} /> Invite
          </button>
          <button className={\`p-2.5 rounded-xl \${T.card} \${T.text} border border-orange-200 dark:border-zinc-800 flex items-center justify-center\`}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={\`flex px-4 gap-4 border-b border-orange-100 dark:border-zinc-800 sticky top-[68px] bg-white dark:bg-black z-20\`}>
        {[
          { id: "discussion", label: "Discussion" },
          { id: "about", label: "About" },
          { id: "events", label: "Events" },
          { id: "members", label: "Members" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={\`py-3 text-sm font-semibold transition-all relative whitespace-nowrap \${activeTab === t.id ? "text-orange-600" : T.sub}\`}
          >
            {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="p-4 bg-orange-50/50 dark:bg-zinc-900/20 min-h-[50vh] cardin">
        {activeTab === "discussion" && (
          <div className="space-y-3">
            <div className={\`p-4 rounded-2xl \${T.card} border border-orange-100 dark:border-zinc-800 flex gap-3 items-center shadow-sm\`}>
              <Avatar name="Sarah Miller" />
              <button className={\`flex-1 text-left px-4 py-2.5 rounded-full text-sm \${T.input} border \${T.line}\`}>
                Write something...
              </button>
              <button className="text-green-500"><ImageIcon size={20} /></button>
            </div>
            
            {groupPosts.map((p) => (
              <div key={p.id} className={\`\${T.card} rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-zinc-800\`}>
                <div className="flex items-center gap-3 mb-3">
                  <div onClick={() => onUserClick(p.user)} className="cursor-pointer">
                    <Avatar name={p.user.name} />
                  </div>
                  <div>
                    <p className={\`font-semibold text-sm \${T.text} cursor-pointer\`} onClick={() => onUserClick(p.user)}>{p.user.name}</p>
                    <p className={\`text-xs \${T.sub}\`}>{p.time}</p>
                  </div>
                  <button className={\`ml-auto p-2 rounded-full hover:\${T.card2} \${T.sub}\`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <p className={\`text-sm leading-relaxed \${T.text}\`}>{p.text}</p>
                <div className={\`flex gap-6 mt-4 pt-3 border-t border-orange-50 dark:border-zinc-800/50 text-xs font-semibold \${T.sub}\`}>
                  <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <ThumbsUp size={16} /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <MessageSquare size={16} /> {p.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-3">
            <div className={\`\${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm\`}>
              <p className={\`text-sm \${T.text} leading-relaxed\`}>
                Welcome to <strong>{group.name}</strong>! This is a community space for sharing advice, organizing local meetups, and helping each other navigate life here. 
                <br/><br/>
                Please keep discussions respectful and relevant. No spam or commercial promotions.
              </p>
              <div className="flex gap-4 mt-5">
                <div>
                  <p className={\`text-lg font-bold \${T.text}\`}>{group.members}</p>
                  <p className={\`text-xs \${T.sub}\`}>Total Members</p>
                </div>
                <div>
                  <p className={\`text-lg font-bold \${T.text}\`}>Public</p>
                  <p className={\`text-xs \${T.sub}\`}>Anyone can see who's in the group and what they post.</p>
                </div>
              </div>
            </div>
            
            <div className={\`\${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm\`}>
              <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>Group Rules</p>
              <div className="space-y-3">
                {[
                  "1. Be kind and courteous",
                  "2. No hate speech or bullying",
                  "3. No promotions or spam",
                  "4. Respect everyone's privacy"
                ].map(r => (
                  <p key={r} className={\`text-sm \${T.text}\`}>{r}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Upcoming Events</p>
              <button className="text-xs font-semibold text-orange-600">Create</button>
            </div>
            {DUMMY_EVENTS.map(e => (
              <div key={e.id} onClick={() => onEventClick(e)} className={\`\${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer border border-orange-100 dark:border-zinc-800\`}>
                <div className="w-24 bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">{e.image}</div>
                <div className="p-4 flex-1">
                  <p className={\`text-xs font-bold text-orange-600 mb-0.5\`}>{e.date}</p>
                  <p className={\`text-sm font-bold \${T.text}\`}>{e.title}</p>
                  <p className={\`text-[11px] \${T.sub} flex items-center gap-1 mt-1\`}>\u003cMapPin size={10} \u002f\u003e {e.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "members" && (
          <div className={\`\${T.card} p-4 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-sm space-y-4\`}>
            <div className={\`p-2 rounded-xl border \${T.line} flex items-center gap-2 mb-2\`}>
              <Search size={16} className={T.sub} />
              <input type="text" placeholder="Find a member..." className={\`bg-transparent outline-none text-sm w-full \${T.text}\`} />
            </div>
            {DUMMY_PEOPLE.map(p => (
              <div key={p.id} onClick={() => onUserClick(p)} className="flex items-center gap-3 cursor-pointer">
                <Avatar name={p.name} />
                <div className="flex-1">
                  <p className={\`text-sm font-bold \${T.text}\`}>{p.name}</p>
                  <p className={\`text-xs \${T.sub}\`}>Joined recently</p>
                </div>
                <button className={\`p-2 rounded-full \${T.card2}\`}><UserPlus size={16} className={T.sub} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export const CommunityTab = ({ communitiesData, activeCommunityTab, setActiveCommunityTab, profile, T }: CommunityTabProps) => {
  const data = communitiesData.length > 0 ? communitiesData : DUMMY_COMMUNITIES;
  
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  if (selectedUser) {
    return <UserView user={selectedUser} onClose={() => setSelectedUser(null)} T={T} onGroupClick={setSelectedGroup} />;
  }

  if (selectedGroup) {
    return <GroupView group={selectedGroup} onClose={() => setSelectedGroup(null)} T={T} onUserClick={setSelectedUser} onEventClick={setSelectedEvent} />;
  }

  if (selectedEvent) {
    return <EventView event={selectedEvent} onClose={() => setSelectedEvent(null)} T={T} onUserClick={setSelectedUser} />;
  }

  return (
    <div className="pb-24">
      <Header T={T} title="Community" right={
        <div className="flex gap-2">
          <button className={\`p-2 rounded-full \${T.card}\`}><Search size={18} className={T.text} /></button>
          <button className={\`p-2 rounded-full \${T.card}\`}><Plus size={18} className={T.text} /></button>
        </div>
      } />
      <div className="flex px-4 gap-4 mb-4 border-b border-orange-100 dark:border-zinc-800">
        {[
          { id: "groups", label: "Groups", icon: Users },
          { id: "events", label: "Events", icon: MapPin },
          { id: "people", label: "People", icon: User },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCommunityTab(t.id)}
            className={\`pb-2 text-sm font-semibold transition-all relative \${activeCommunityTab === t.id ? "text-orange-600" : T.sub}\`}
          >
            {t.label}
            {activeCommunityTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>
      {activeCommunityTab === "groups" && (
        <div className="mx-4 space-y-3 cardin">
          <div className="flex items-center justify-between mb-1">
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Your Groups</p>
            <button className="text-xs font-semibold text-orange-600">See all</button>
          </div>
          {data.filter(c => c.joined).map(c => (
            <div key={c.name} onClick={() => setSelectedGroup(c)} className={\`\${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer\`}>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={\`text-sm font-bold \${T.text}\`}>{c.name}</p>
                <p className={\`text-xs \${T.sub}\`}>{c.members} members</p>
              </div>
              <ChevronRight size={16} className={T.sub} />
            </div>
          ))}
          <div className="pt-4 mb-1">
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Recommended for you</p>
          </div>
          {data.filter(c => !c.joined).map(c => (
            <div key={c.name} onClick={() => setSelectedGroup(c)} className={\`\${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer\`}>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">{c.emoji}</div>
              <div className="flex-1">
                <p className={\`text-sm font-bold \${T.text}\`}>{c.name}</p>
                <p className={\`text-xs \${T.sub}\`}>{c.members} members</p>
              </div>
              <button className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedGroup(c); }}>Join</button>
            </div>
          ))}
        </div>
      )}
      {activeCommunityTab === "events" && (
        <div className="mx-4 space-y-4 cardin">
          <div className={\`p-4 rounded-2xl text-white mb-2 cursor-pointer\`} style={{ background: SAF }} onClick={() => setSelectedEvent(DUMMY_EVENTS[0])}>
            <p className="disp font-bold text-lg">Next Meetup: Language Exchange</p>
            <p className="text-xs text-orange-100 mt-1">This Sunday at 14:00 · Mauerpark</p>
            <button className="mt-3 bg-white text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedEvent(DUMMY_EVENTS[0]); }}>Going</button>
          </div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Upcoming Events</p>
          {DUMMY_EVENTS.map(e => (
            <div key={e.id} onClick={() => setSelectedEvent(e)} className={\`\${T.card} rounded-2xl overflow-hidden shadow-sm flex cursor-pointer\`}>
              <div className="w-24 bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">{e.image}</div>
              <div className="p-4 flex-1">
                <p className={\`text-xs font-bold text-orange-600 mb-0.5\`}>{e.date}</p>
                <p className={\`text-sm font-bold \${T.text}\`}>{e.title}</p>
                <p className={\`text-xs \${T.sub} flex items-center gap-1 mt-1\`}>\u003cMapPin size={10} \u002f\u003e {e.location}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-orange-400" />)}
                  </div>
                  <p className={\`text-[10px] \${T.sub}\`}>+{e.attendees} joining</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeCommunityTab === "people" && (
        <div className="mx-4 space-y-3 cardin">
          <div className={\`p-4 rounded-2xl \${T.card2} border border-orange-200 dark:border-zinc-800 flex items-center gap-3\`}>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white"><MapPin size={20} /></div>
            <div>
              <p className={\`text-sm font-bold \${T.text}\`}>Expats nearby</p>
              <p className={\`text-xs \${T.sub}\`}>See who's in your neighborhood</p>
            </div>
            <button className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Enable Map</button>
          </div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} pt-2\`}>New members in {profile.city}</p>
          {DUMMY_PEOPLE.map(p => (
            <div key={p.id} onClick={() => setSelectedUser(p)} className={\`\${T.card} rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer\`}>
              <Avatar name={p.name} />
              <div className="flex-1">
                <p className={\`text-sm font-bold \${T.text}\`}>{p.name} <span className="text-xs font-normal text-orange-600">from {p.origin}</span></p>
                <p className={\`text-xs \${T.sub} line-clamp-1\`}>{p.bio}</p>
              </div>
              <button className={\`p-2 rounded-full \${T.card2}\`} onClick={(e) => { e.stopPropagation(); setSelectedUser(p); }}><MessageCircle size={16} className="text-orange-600" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
`
fs.writeFileSync('src/components/CommunityTab.tsx', code);

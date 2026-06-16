
import React, { useState } from 'react';
import { User, Country, SavedItem, UserLocation } from '../types';
import { COUNTRIES } from '../constants';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onSelectCountry: (country: Country) => void;
  onRequestNotifications: () => Promise<boolean>;
  notifPermission: NotificationPermission;
  onSaveCurrentLocation: () => void;
  userLocation: UserLocation | null;
  onNavigate: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, onUpdateUser, onLogout, onSelectCountry, onRequestNotifications, notifPermission, onSaveCurrentLocation, userLocation, onNavigate
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const savedCountry = COUNTRIES.find(c => c.id === user.savedCountryId);

  const radius = user.preferredRadius || 10;
  const unit = (user.savedCountryId === 'usa' || user.savedCountryId === 'uk') ? 'miles' : 'km';

  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const handleRemoveSaved = (id: string) => {
    const updated = user.savedItems?.filter(i => i.id !== id);
    onUpdateUser({ ...user, savedItems: updated });
  };

  const handleRemoveLocation = (id: string) => {
    const updated = user.savedLocations?.filter(l => l.id !== id);
    onUpdateUser({ ...user, savedLocations: updated });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    onUpdateUser({ ...user, preferredRadius: newRadius });
  };

  const NAV_ITEMS = [
    { id: 'news', label: 'NEWS', icon: 'fa-newspaper' },
    { id: 'visa', label: 'VISA', icon: 'fa-passport' },
    { id: 'safety', label: 'SAFETY', icon: 'fa-shield-halved' },
    { id: 'network', label: 'NETWORK', icon: 'fa-users' },
    { id: 'local', label: 'LOCAL', icon: 'fa-building-columns' },
    { id: 'resources', label: 'RESOURCES', icon: 'fa-list-check' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] border shadow-xl overflow-hidden">
        <div className="h-32 bg-primary-gradient relative">
          <button onClick={() => onNavigate('settings')} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white flex items-center justify-center transition-colors">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative -mt-12 flex flex-col md:flex-row gap-6 md:items-end">
            <div className="w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-4xl text-primary flex-shrink-0"><i className="fa-solid fa-user-circle"></i></div>
            <div className="mt-4 md:mt-0 flex-grow">
              <h2 className="text-2xl font-black">{user.name}</h2>
              <p className="text-slate-500 font-medium">{user.email}</p>
            </div>
            
            <div className="flex gap-6 mt-4 md:mt-0 bg-slate-50 px-6 py-3 rounded-2xl border">
              <div className="text-center">
                <p className="text-xl font-black text-slate-800">124</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Followers</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-800">89</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {NAV_ITEMS.map(p => (
          <button key={p.id} onClick={() => onNavigate(p.id)} className="p-6 bg-white rounded-3xl shadow-sm border text-slate-700 hover:text-primary hover:border-primary transition-all flex flex-col items-center justify-center gap-3 active:scale-95">
            <i className={`fa-solid ${p.icon} text-3xl`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 flex flex-col min-h-[400px]">
          <h3 className="font-black text-xl text-slate-800">The Briefcase</h3>
          <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            {(user.savedItems || []).map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-primary transition-all flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-primary bg-orange-100/50 px-2 py-0.5 rounded tracking-widest">{item.type}</span>
                  <p className="text-sm font-black text-slate-900 leading-tight">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                   {item.data.url && <a href={item.data.url} target="_blank" className="text-slate-300 hover:text-primary"><i className="fa-solid fa-arrow-up-right-from-square text-xs"></i></a>}
                   <button onClick={() => handleRemoveSaved(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-xmark text-sm"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

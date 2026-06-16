import React, { useState } from 'react';
import { User, Country, UserLocation } from '../types';
import { COUNTRIES } from '../constants';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onSelectCountry: (country: Country) => void;
  onRequestNotifications: () => Promise<boolean>;
  notifPermission: NotificationPermission;
  onNavigate: (page: string) => void;
  userLocation: UserLocation | null;
  onSaveCurrentLocation: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  user, onUpdateUser, onLogout, onSelectCountry, onRequestNotifications, notifPermission, onNavigate, userLocation, onSaveCurrentLocation
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const savedCountry = COUNTRIES.find(c => c.id === user.savedCountryId);
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const radius = user.preferredRadius || 10;
  const unit = (user.savedCountryId === 'usa' || user.savedCountryId === 'uk') ? 'miles' : 'km';

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    onUpdateUser({ ...user, preferredRadius: newRadius });
  };

  const handleRemoveLocation = (id: string) => {
    const updated = user.savedLocations?.filter(l => l.id !== id);
    onUpdateUser({ ...user, savedLocations: updated });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('me')} className="w-10 h-10 bg-white rounded-xl shadow-sm border flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-3xl font-black text-slate-800">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6">
            <h3 className="font-black flex justify-between items-center text-slate-800">
              Settlement Destination {savedCountry && <span className="text-2xl">{savedCountry.flag}</span>}
            </h3>
            {isSearching ? (
              <div className="space-y-2">
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-primary" />
                {filtered.map(c => 
                  <button key={c.id} onClick={() => {onSelectCountry(c); setIsSearching(false); setSearchQuery('');}} className="w-full p-3 text-left hover:bg-slate-50 font-bold rounded-lg transition-colors">
                    {c.flag} {c.name}
                  </button>
                )}
              </div>
            ) : savedCountry ? (
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
                <p className="font-bold text-slate-700">{savedCountry.name}</p>
                <button onClick={() => setIsSearching(true)} className="text-[10px] font-black text-primary uppercase tracking-widest">Update</button>
              </div>
            ) : (
              <button onClick={() => setIsSearching(true)} className="w-full py-4 bg-orange-50 text-primary font-black rounded-2xl border border-dashed border-orange-200">
                Set Settlement Base
              </button>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-4">
            <div className="flex flex-col gap-4">
              <h3 className="font-black flex items-center gap-2 text-slate-800">
                <i className="fa-solid fa-circle-nodes text-primary"></i>
                Localization Reach
              </h3>
              <div className="space-y-4 px-2">
                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span>1 {unit}</span>
                  <span className="text-primary bg-orange-50 px-3 py-1 rounded-full capitalize">{radius} {unit}</span>
                  <span>1000 {unit}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="1000" 
                  step="1" 
                  value={radius} 
                  onChange={handleRadiusChange}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800">My Settlement Bases</h3>
              {userLocation && (
                <button onClick={onSaveCurrentLocation} className="text-[10px] font-black text-primary uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
                  <i className="fa-solid fa-plus mr-1"></i> Add Current
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(user.savedLocations || []).length === 0 && <p className="text-sm font-medium text-slate-400">No extra locations saved yet.</p>}
              {(user.savedLocations || []).map((loc) => (
                <div key={loc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border group hover:border-primary transition-all">
                  <span className="text-xs font-bold text-slate-700 truncate mr-2"><i className="fa-solid fa-location-dot mr-2 text-primary"></i>{loc.displayAddress}</span>
                  <button onClick={() => loc.id && handleRemoveLocation(loc.id)} className="text-slate-300 hover:text-red-600 transition-colors"><i className="fa-solid fa-trash text-xs"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6 flex flex-col">
            <h3 className="font-black text-slate-800">Account Control</h3>
            <button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 hover:bg-red-100 transition-colors text-center">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

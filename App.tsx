import React, { useState, useEffect } from 'react';
import { Country, PageType, UserLocation, User, Notification as AppNotification, SavedItem } from './types';
import CountrySelector from './components/CountrySelector';
import InfoHub from './components/InfoHub';
import VisaPage from './components/VisaPage';
import SafetyPage from './components/SafetyPage';
import CommunityPage from './components/CommunityPage';
import LocalPage from './components/LocalPage';
import ResourcesPage from './components/ResourcesPage';
import AssistantModal from './components/AssistantModal';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import FeedPage from './components/FeedPage';
import RoadmapsPage from './components/RoadmapsPage';
import TasksPage from './components/TasksPage';
import CreatePostPage from './components/CreatePostPage';
import SettingsPage from './components/SettingsPage';
import InboxPage from './components/InboxPage';
import NotificationCenter from './components/NotificationCenter';
import LegalPage from './components/LegalPage';
import { COUNTRIES } from './constants';
import { supabase, initAnalytics } from './services/supabase';
import { identifyLocationFromCoords } from './services/geminiService';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userLocation, setSelectedUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      title: 'Buonolo Journey News',
      message: 'New Mediterranean localization hubs are now open for residents.',
      date: '1 hour ago',
      isRead: false,
      type: 'system'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    initAnalytics();
    const cachedLoc = localStorage.getItem('last_user_location');
    const cachedCountryId = localStorage.getItem('last_user_country_id');
    if (cachedLoc) try { setSelectedUserLocation(JSON.parse(cachedLoc)); } catch (e) {}
    if (cachedCountryId) {
      const country = COUNTRIES.find(c => c.id === cachedCountryId);
      if (country) setSelectedCountry(country);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return false;
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        new Notification("Buonolo News", { body: "Latest localization news is now active." });
        if (user) onUpdateUser({ ...user, notificationsEnabled: true });
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const registerLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await identifyLocationFromCoords(latitude, longitude);
        if (result) {
          const loc: UserLocation = { latitude, longitude, city: result.city, displayAddress: `${result.city}, ${result.country}`, isManual: false };
          setSelectedUserLocation(loc);
          localStorage.setItem('last_user_location', JSON.stringify(loc));
          const matchedCountry = COUNTRIES.find(c => c.name.toLowerCase() === result.country.toLowerCase() || result.country.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(result.country.toLowerCase()));
          if (matchedCountry) {
            setSelectedCountry(matchedCountry);
            localStorage.setItem('last_user_country_id', matchedCountry.id);
            setCurrentPage('news'); 
          }
        }
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => { 
    if (!localStorage.getItem('last_user_location') && !localStorage.getItem('last_user_country_id')) {
      registerLocation(); 
    }
  }, []);

  const onUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.id) {
      await supabase.from('profiles').upsert({
        id: updatedUser.id,
        notifications_enabled: updatedUser.notificationsEnabled,
        saved_country_id: updatedUser.savedCountryId || null,
        full_name: updatedUser.name,
        saved_items: updatedUser.savedItems || [],
        saved_locations: updatedUser.savedLocations || [],
        preferred_radius: updatedUser.preferredRadius || 10,
        updated_at: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user: supabaseUser } = session;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
          
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || profile?.full_name || 'Member',
          notificationsEnabled: profile?.notifications_enabled ?? true,
          savedCountryId: profile?.saved_country_id,
          savedItems: profile?.saved_items || [],
          savedLocations: profile?.saved_locations || [],
          preferredRadius: profile?.preferred_radius || 10
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const generateShareImage = (title: string, text: string): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      canvas.width = 1080;
      canvas.height = 1350;

      // 1. Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Header Branding
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(0, 0, canvas.width, 180);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 60px Inter, sans-serif';
      ctx.fillText('Buonolo News Hub', 80, 110);

      // 3. Draw "OLO" Logo (Symmetrical)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 14;
      // Eye Left
      ctx.beginPath(); ctx.arc(880, 90, 25, 0, Math.PI * 2); ctx.stroke();
      // Eye Right
      ctx.beginPath(); ctx.arc(960, 90, 25, 0, Math.PI * 2); ctx.stroke();
      // Nose L
      ctx.beginPath();
      ctx.moveTo(920, 100);
      ctx.lineTo(920, 140);
      ctx.lineTo(940, 140);
      ctx.stroke();

      // 4. Title
      ctx.fillStyle = '#1e293b';
      ctx.font = '900 64px Inter, sans-serif';
      const words = title.split(' ');
      let line = '';
      let y = 300;
      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > 920) {
          ctx.fillText(line, 80, y);
          line = word + ' ';
          y += 80;
        } else { line = testLine; }
      }
      ctx.fillText(line, 80, y);

      // 5. Body Text
      y += 100;
      ctx.fillStyle = '#64748b';
      ctx.font = '500 36px Inter, sans-serif';
      const bodyWords = text.split(' ');
      let bLine = '';
      for (const word of bodyWords) {
        const test = bLine + word + ' ';
        if (ctx.measureText(test).width > 920) {
          ctx.fillText(bLine, 80, y);
          bLine = word + ' ';
          y += 50;
        } else { bLine = test; }
        if (y > 1150) break; 
      }
      ctx.fillText(bLine, 80, y);

      // 6. Footer Description
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(0, 1200, canvas.width, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Abroad stay made easy', canvas.width / 2, 1290);

      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const file = new File([blob], 'buonolo-share.png', { type: 'image/png' });
        resolve(file);
      });
    });
  };

  const handleShareItem = async (title: string, text: string) => {
    const file = await generateShareImage(title, text);
    if (navigator.share && file) {
      try {
        await navigator.share({
          title,
          text: `${title}\n\nShared via Buonolo - Abroad stay made easy.`,
          files: [file]
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') fallbackShare(title, text);
      }
    } else {
      fallbackShare(title, text);
    }
  };

  const fallbackShare = async (title: string, text: string) => {
    try {
      const shareText = `${title}\n\n${text}\n\nAbroad stay made easy.\nShared via Buonolo Hub.`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Information copied to clipboard!');
      }
    } catch (err) {}
  };

  const handleSaveItem = (item: SavedItem) => {
    if (!user) { setCurrentPage('auth'); return; }
    if (user.savedItems?.some(si => si.id === item.id)) return;
    onUpdateUser({ ...user, savedItems: [...(user.savedItems || []), item] });
  };

  const handleSaveLocation = () => {
    if (!user || !userLocation) return;
    onUpdateUser({ ...user, savedLocations: [...(user.savedLocations || []), { ...userLocation, id: `loc-${Date.now()}` }] });
  };

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('last_user_country_id', country.id);
    if (user) onUpdateUser({ ...user, savedCountryId: country.id });
    if (currentPage === 'onboard') navigateTo('home');
  };

  const renderContent = () => {
    if (currentPage === 'auth') return <AuthPage onAuthSuccess={() => navigateTo('home')} />;
    if (currentPage === 'legal') return <LegalPage />;
    if (currentPage === 'me' || currentPage === 'profile') {
      if (!user) return <AuthPage onAuthSuccess={() => navigateTo('me')} />;
      return <ProfilePage user={user} onUpdateUser={onUpdateUser} onLogout={async () => { await supabase.auth.signOut(); localStorage.clear(); navigateTo('onboard'); }} onSelectCountry={handleCountrySelect} onRequestNotifications={requestNotificationPermission} notifPermission={notifPermission} onSaveCurrentLocation={handleSaveLocation} userLocation={userLocation} onNavigate={navigateTo} />;
    }
    if (currentPage === 'settings') {
      if (!user) return <AuthPage onAuthSuccess={() => navigateTo('settings')} />;
      return <SettingsPage user={user} onUpdateUser={onUpdateUser} onLogout={async () => { await supabase.auth.signOut(); localStorage.clear(); navigateTo('onboard'); }} onSelectCountry={handleCountrySelect} onRequestNotifications={requestNotificationPermission} notifPermission={notifPermission} onSaveCurrentLocation={handleSaveLocation} userLocation={userLocation} onNavigate={navigateTo} />;
    }
    if (currentPage === 'inbox') {
      if (!user) return <AuthPage onAuthSuccess={() => navigateTo('inbox')} />;
      return <InboxPage user={user} onNavigate={navigateTo} />;
    }
    if (currentPage === 'home') return <FeedPage location={userLocation || { displayAddress: 'Global' }} />;
    if (currentPage === 'roadmaps') return <RoadmapsPage />;
    if (currentPage === 'tasks') return <TasksPage />;
    if (currentPage === 'create') {
      if (!user) return <AuthPage onAuthSuccess={() => navigateTo('create')} />;
      return <CreatePostPage onSuccess={() => navigateTo('home')} onCancel={() => navigateTo('home')} />;
    }
    if (currentPage === 'news') return selectedCountry ? <InfoHub country={selectedCountry} onBack={() => navigateTo('me')} userLocation={userLocation} onRegisterLocation={registerLocation} onSave={handleSaveItem} onShare={handleShareItem} user={user} /> : null;
    if (currentPage === 'visa') return <VisaPage onSave={handleSaveItem} onShare={handleShareItem} />;
    if (currentPage === 'safety') return selectedCountry ? <SafetyPage country={selectedCountry} userLocation={userLocation} onRegisterLocation={registerLocation} onSave={handleSaveItem} onShare={handleShareItem} user={user} /> : null;
    if (currentPage === 'network') return selectedCountry ? <CommunityPage country={selectedCountry} user={user} onAuthRedirect={() => navigateTo('auth')} /> : null;
    if (currentPage === 'local') return selectedCountry ? <LocalPage country={selectedCountry} userLocation={userLocation} onRegisterLocation={registerLocation} onSave={handleSaveItem} onShare={handleShareItem} user={user} /> : null;
    if (currentPage === 'resources') return selectedCountry ? <ResourcesPage country={selectedCountry} userLocation={userLocation} onRegisterLocation={registerLocation} onSave={handleSaveItem} onShare={handleShareItem} user={user} /> : null;
    if (currentPage === 'onboard') {
      return (
        <div className="max-w-6xl mx-auto space-y-12 px-4 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-primary flex items-center justify-center gap-1">
              Buonolo
            </h1>
            <p className="text-slate-500 text-lg font-semibold">Onboarding. Localization. Opportunity.</p>
          </div>
          <div className="max-w-2xl mx-auto relative group">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Where is your next destination?" className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] pl-12 py-6 text-lg font-bold shadow-xl focus:border-primary outline-none transition-all" />
            <button onClick={registerLocation} className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center hover:bg-[#0084cc] shadow-lg transition-all">{locationLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}</button>
          </div>
          <CountrySelector selectedCountry={selectedCountry} onSelect={handleCountrySelect} searchQuery={searchQuery} />
        </div>
      );
    }
    return null;
  };

  const BOTTOM_TABS = [
    { id: 'home', icon: 'fa-house', label: 'Home' },
    { id: 'roadmaps', icon: 'fa-map', label: 'Roadmap' },
    { id: 'create', icon: 'fa-plus', label: 'Create', isFab: true },
    { id: 'tasks', icon: 'fa-check-double', label: 'Tasks' },
    { id: 'me', icon: 'fa-user', label: 'Me' },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-[60] py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 cursor-pointer group" onClick={() => navigateTo('onboard')}>
            <span className="text-2xl font-black tracking-tighter text-primary flex items-center gap-1">Buonolo</span>
          </div>
          
          <div className="flex flex-1 mx-4 max-w-sm ml-auto items-center">
            <div className="relative w-full">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" placeholder="Search..." className="w-full bg-slate-100 rounded-full py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo('inbox')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${currentPage === 'inbox' ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-500 hover:text-primary'}`}>
              <i className="fa-solid fa-envelope"></i>
            </button>
            <button onClick={() => user ? setIsNotifOpen(!isNotifOpen) : navigateTo('auth')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center relative hover:text-primary transition-colors">
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full border-2 border-white">{unreadCount}</span>}
              <i className="fa-solid fa-bell"></i>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8">{renderContent()}</main>
      
      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-6 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {BOTTOM_TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => navigateTo(tab.id as PageType)}
              className={`flex flex-col items-center justify-center transition-all ${tab.isFab ? '-mt-8 relative' : 'gap-1'}`}
            >
              {tab.isFab ? (
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform border-4 border-white">
                  <i className={`fa-solid ${tab.icon}`}></i>
                </div>
              ) : (
                <>
                  <i className={`fa-solid ${tab.icon} text-lg ${currentPage === tab.id ? 'text-primary' : 'text-slate-400'}`}></i>
                  <span className={`text-[10px] font-bold ${currentPage === tab.id ? 'text-primary' : 'text-slate-400'}`}>{tab.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <AssistantModal country={selectedCountry} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export default App;

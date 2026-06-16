import React, { useState, useEffect } from 'react';
import { Country, SafetyData, UserLocation, NearbyService, User } from '../types';
import { fetchSafetyData, fetchNearbyServices } from '../services/geminiService';

interface SafetyPageProps {
  country: Country;
  userLocation: UserLocation | null;
  onRegisterLocation?: () => void;
  onSave: (item: any) => void;
  onShare: (title: string, text: string) => void;
  user: User | null;
}

const SafetyPage: React.FC<SafetyPageProps> = ({ country, userLocation, onRegisterLocation, onSave, onShare, user }) => {
  const [data, setData] = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState<string | null>(null);

  useEffect(() => {
    if (!country) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchSafetyData(country.name);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [country]);

  const findNearby = async (type: string) => {
    if (!userLocation) {
      onRegisterLocation?.();
      return;
    }
    setActiveSearchType(type);
    setSearching(true);
    try {
      const radius = user?.preferredRadius || 10;
      const unit = (country?.id === 'usa' || country?.id === 'uk') ? 'miles' : 'km';
      setNearbyServices(await fetchNearbyServices(type, userLocation, radius, unit, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!activeSearchType || !userLocation || !country) return;
    setLoadMoreLoading(true);
    try {
      const radius = user?.preferredRadius || 10;
      const unit = (country.id === 'usa' || country.id === 'uk') ? 'miles' : 'km';
      const moreData = await fetchNearbyServices(activeSearchType, userLocation, radius, unit, 20);
      const newItems = moreData.filter(md => !nearbyServices.some(ns => ns.name === md.name));
      setNearbyServices(prev => [...(prev || []), ...(newItems || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  if (!country) return (
    <div className="py-20 text-center text-slate-500 font-bold">
      Please select a country to view safety information.
    </div>
  );

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Assembling Safety Profile...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="py-20 text-center text-slate-500">
      Safety information could not be retrieved. Please try again later.
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-red-500/20"><i className="fa-solid fa-shield-halved"></i></div>
          <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Safety & Support Hub</h2><p className="text-slate-500 font-medium">Critical resources for {country.name}</p></div>
        </div>
        <button onClick={() => onShare(`Safety Profile: ${country.name}`, data.generalAdvice || '')} className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all"><i className="fa-solid fa-share-nodes"></i> Share Hub</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black text-slate-900">Emergency Dispatch</h3><i className="fa-solid fa-phone-volume text-red-500 animate-pulse"></i></div>
            <div className="space-y-4">{(data.emergencyNumbers || []).map((en, i) => (<div key={i} className="group relative overflow-hidden p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-all"><div className="flex justify-between items-center relative z-10"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${en.color || 'bg-slate-900'}`}><i className={`fa-solid ${en.icon}`}></i></div><div><p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{en.service}</p><p className="text-xl font-black text-slate-900">{en.number}</p></div></div><a href={`tel:${en.number}`} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all"><i className="fa-solid fa-phone"></i></a></div></div>))}</div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[3rem] border shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-900">Vital Services Finder</h3>
              <div className="flex flex-wrap gap-2">{['Hospital', 'Police', 'Fire Station', 'Pharmacy', 'Shelter'].map(cat => (<button key={cat} onClick={() => findNearby(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSearchType === cat ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white'}`}>{cat}</button>))}</div>
            </div>

            {!userLocation ? (<div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"><button onClick={onRegisterLocation} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">Detect Location for Map</button></div>) : searching ? (<div className="py-20 flex flex-col items-center gap-4"><i className="fa-solid fa-compass animate-spin text-4xl text-blue-600"></i><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning ({user?.preferredRadius || 10}{(country.id === 'usa' || country.id === 'uk') ? 'miles' : 'km'})...</p></div>) : nearbyServices && nearbyServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                  {nearbyServices.map((svc, i) => (
                    <div key={`${svc.name}-${i}`} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                      <div className="max-w-[70%]"><p className="font-black text-slate-900 group-hover:text-blue-600 truncate">{svc.name}</p><p className="text-[10px] text-slate-400 truncate font-medium">{svc.address}</p></div>
                      <div className="flex gap-3"><button onClick={() => onSave({id: `svc-${Date.now()}-${i}`, type: 'resource', title: svc.name, data: svc, timestamp: new Date().toISOString()})} className="text-slate-300 hover:text-blue-600 transition-colors"><i className="fa-solid fa-bookmark"></i></button><a href={svc.uri} target="_blank" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><i className="fa-solid fa-map-location-dot"></i></a></div>
                    </div>
                  ))}
                </div>
                {nearbyServices.length >= 10 && (
                  <div className="flex justify-center pt-8">
                    <button onClick={handleLoadMore} disabled={loadMoreLoading} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                      {loadMoreLoading && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                      {loadMoreLoading ? 'Expanding Map...' : 'Load 10 More Results'}
                    </button>
                  </div>
                )}
              </>
            ) : (<div className="py-12 text-center text-slate-400 italic font-medium">Use the category buttons above to find services within {user?.preferredRadius || 10}{(country.id === 'usa' || country.id === 'uk') ? 'miles' : 'km'}.</div>)}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
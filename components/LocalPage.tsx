import React, { useState, useEffect } from 'react';
import { Country, UserLocation, NearbyService, User } from '../types';
import { fetchGovernmentResources, fetchNearbyServices } from '../services/geminiService';

interface LocalPageProps {
  country: Country;
  userLocation: UserLocation | null;
  onRegisterLocation: () => void;
  onSave: (item: any) => void;
  onShare: (title: string, text: string) => void;
  user: User | null;
}

const LocalPage: React.FC<LocalPageProps> = ({ country, userLocation, onRegisterLocation, onSave, onShare, user }) => {
  const [loading, setLoading] = useState(true);
  const [portals, setPortals] = useState<any[]>([]);
  const [offices, setOffices] = useState<NearbyService[]>([]);
  const [activeOfficeType, setActiveOfficeType] = useState('Immigration Office');
  const [isSearchingOffices, setIsSearchingOffices] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasSearchedOffices, setHasSearchedOffices] = useState(false);

  const radius = user ? (user.preferredRadius || 10) : 5;
  const unit = (country.id === 'usa' || country.id === 'uk') ? 'miles' : 'km';

  useEffect(() => {
    const loadPortals = async () => {
      setLoading(true);
      try {
        const data = await fetchGovernmentResources(country.name, userLocation || undefined);
        setPortals(data?.portals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPortals();
  }, [country]);

  const findOffices = async (type: string, limit: number = 10) => {
    if (!userLocation) { onRegisterLocation(); return; }
    setActiveOfficeType(type);
    setIsSearchingOffices(true);
    setHasSearchedOffices(true);
    try {
      const data = await fetchNearbyServices(type, userLocation, radius, unit, limit);
      setOffices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingOffices(false);
    }
  };

  const handleLoadMore = async () => {
    if (!userLocation) return;
    setLoadMoreLoading(true);
    try {
      const moreData = await fetchNearbyServices(activeOfficeType, userLocation, radius, unit, offices.length + 10);
      const newItems = (moreData || []).filter(md => !offices.some(o => o.name === md.name));
      setOffices(prev => [...(prev || []), ...(newItems || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => { if (userLocation) findOffices(activeOfficeType); }, [userLocation]);

  if (loading) return <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 pb-24">
      <div className="flex items-center gap-6"><div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl"><i className="fa-solid fa-building-columns"></i></div><div><h2 className="text-3xl font-black">Official Resources: {country.name}</h2><p className="text-slate-500 font-medium">Verified government portals and administrative offices.</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Official Portals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(portals || []).map((portal, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase">{portal.category}</span>
                  <div className="flex gap-3">
                    <button onClick={() => onSave({id: `portal-${i}`, type: 'portal', title: portal.name, data: portal, timestamp: new Date().toISOString()})} className="text-slate-200 hover:text-blue-600"><i className="fa-solid fa-bookmark text-xs"></i></button>
                    <button onClick={() => onShare(portal.name, portal.description)} className="text-slate-200 hover:text-blue-600"><i className="fa-solid fa-share-nodes text-xs"></i></button>
                    <a href={portal.url} target="_blank"><i className="fa-solid fa-arrow-up-right-from-square text-slate-200 group-hover:text-slate-900 transition-colors text-xs"></i></a>
                  </div>
                </div>
                <h4 className="font-black text-slate-900 mb-2">{portal.name}</h4>
                <p className="text-xs text-slate-500">{portal.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Local Bureau Locator ({radius}{unit})</h3>
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4">
            <div className="flex flex-wrap gap-2">{['Immigration Office', 'Tax Bureau', 'Social Security'].map(t => <button key={t} onClick={() => findOffices(t)} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase ${activeOfficeType === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{t}</button>)}</div>
            
            <div className="space-y-3">
              {isSearchingOffices ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <i className="fa-solid fa-circle-notch animate-spin text-slate-300"></i>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scanning...</span>
                </div>
              ) : offices && offices.length > 0 ? (
                offices.map((off, i) => (
                  <div key={`${off.name}-${i}`} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center group hover:bg-white hover:border-orange-100 transition-all">
                    <div className="space-y-1"><p className="text-xs font-black group-hover:text-blue-600">{off.name}</p>{off.distance && <span className="text-[10px] text-slate-400">{off.distance}</span>}</div>
                    <div className="flex gap-3"><button onClick={() => onSave({id: `office-${i}`, type: 'resource', title: off.name, data: off, timestamp: new Date().toISOString()})} className="text-slate-300 hover:text-blue-600"><i className="fa-solid fa-bookmark text-xs"></i></button><a href={off.uri} target="_blank"><i className="fa-solid fa-map-location-dot text-slate-300 group-hover:text-slate-900 text-xs"></i></a></div>
                  </div>
                ))
              ) : hasSearchedOffices ? (
                <div className="py-10 text-center space-y-4 px-4">
                  <i className="fa-solid fa-building-circle-exclamation text-slate-200 text-3xl"></i>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    No results found in a {radius} {unit} radius.
                    {!user && <span className="block mt-2 text-blue-600">Sign up to increase your search range up to 1000 {unit}!</span>}
                  </p>
                  {!user && (
                    <a href="#auth" className="block w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-all">Join Buonolo</a>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-300 italic text-[10px]">Select a bureau type above</div>
              )}
            </div>

            {offices && offices.length >= 10 && (
              <button 
                onClick={handleLoadMore} 
                disabled={loadMoreLoading}
                className="w-full py-3 mt-4 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {loadMoreLoading && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                {loadMoreLoading ? 'Expanding Search...' : 'Load 10 More Results'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalPage;
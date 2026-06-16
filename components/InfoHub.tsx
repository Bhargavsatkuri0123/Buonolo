import React, { useState, useEffect } from 'react';
import { Country, InfoCategory, GroundingSource, NewsItem, UserLocation, InfoItem, User } from '../types';
import { CATEGORIES } from '../constants';
import { fetchExpatData, fetchNewsItems, fetchLocalImmigrantInfo } from '../services/geminiService';
import NewsCard from './NewsCard';
import InfoDetailModal from './InfoDetailModal';

interface InfoHubProps {
  country: Country;
  onBack: () => void;
  userLocation: UserLocation | null;
  onRegisterLocation: () => void;
  onSave: (item: any) => void;
  onShare: (title: string, text: string) => void;
  user: User | null;
}

const InfoHub: React.FC<InfoHubProps> = ({ country, onBack, userLocation, onRegisterLocation, onSave, onShare, user }) => {
  const [selectedCategory, setSelectedCategory] = useState<InfoCategory>(InfoCategory.NEWS);
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localCity, setLocalCity] = useState<string>('');
  const [selectedInfoItem, setSelectedInfoItem] = useState<InfoItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (selectedCategory === InfoCategory.NEWS) {
          const data = await fetchNewsItems(`${country.name} localization news`, 10);
          if (isMounted) setNewsItems(data || []);
        } else if (selectedCategory === InfoCategory.LOCAL_NEWS || selectedCategory === InfoCategory.DAILY_LOCAL_NEWS) {
          if (userLocation) {
            const res = await fetchLocalImmigrantInfo(userLocation);
            if (isMounted) setLocalCity(res.city);
            const data = await fetchNewsItems(`${res.city} ${country.name} news`, 10);
            if (isMounted) setNewsItems(data || []);
          } else {
            if (isMounted) setLoading(false);
            return;
          }
        } else {
          const res = await fetchExpatData(country.name, selectedCategory, 10);
          if (isMounted) setInfoItems(res?.items || []);
        }
      } catch (err) { 
        if (isMounted) setError('News fetch failed. Please retry.'); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [country, selectedCategory, userLocation]);

  const handleLoadMore = async () => {
    setLoadMoreLoading(true);
    try {
      if (selectedCategory === InfoCategory.NEWS || selectedCategory === InfoCategory.LOCAL_NEWS || selectedCategory === InfoCategory.DAILY_LOCAL_NEWS) {
        const query = (selectedCategory === InfoCategory.NEWS) ? `${country.name} localization news updates` : `${localCity} ${country.name} news updates`;
        const exclude = newsItems.map(i => i.headline);
        const data = await fetchNewsItems(query, 10, exclude);
        setNewsItems(prev => [...(prev || []), ...(data || [])]);
      } else {
        const exclude = infoItems.map(i => i.title);
        const res = await fetchExpatData(country.name, selectedCategory, 10, exclude);
        setInfoItems(prev => [...(prev || []), ...(res?.items || [])]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const needsLocation = selectedCategory === InfoCategory.LOCAL_NEWS || selectedCategory === InfoCategory.DAILY_LOCAL_NEWS;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-primary transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
          <div className="flex items-center gap-4"><span className="text-5xl">{country.flag}</span><div><h1 className="text-3xl font-black text-slate-800">{country.name}</h1><p className="text-primary font-bold uppercase tracking-widest text-[10px]">Settlement News</p></div></div>
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as InfoCategory)} className="w-full md:w-64 bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 font-black outline-none focus:border-primary shadow-sm text-slate-700">
          {CATEGORIES.map(cat => <option key={cat.type} value={cat.type}>{cat.type}</option>)}
        </select>
      </div>

      {needsLocation && !userLocation ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 space-y-6">
          <div className="w-20 h-20 bg-orange-50 text-primary rounded-3xl flex items-center justify-center mx-auto text-3xl"><i className="fa-solid fa-location-crosshairs"></i></div>
          <h2 className="text-2xl font-black text-slate-800">Local Neighborhood News</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Enable location to receive localized news for your specific neighborhood journey.</p>
          <button onClick={onRegisterLocation} className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-[#004a7a] transition-all active:scale-95">Enable Location</button>
        </div>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-bold text-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
            </div>
          )}
          
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gathering latest news...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems && newsItems.length > 0 ? newsItems.map((item, idx) => (
                  <NewsCard 
                    key={`${item.id}-${idx}`} 
                    item={item} 
                    onSave={() => onSave({id: item.id, type: 'update', title: item.headline, data: item, timestamp: new Date().toISOString()})} 
                    onShare={() => onShare(item.headline, item.summary)} 
                    user={user} 
                  />
                )) : infoItems && infoItems.length > 0 ? infoItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-primary bg-orange-50 px-2 py-0.5 rounded uppercase tracking-widest">{item.source || 'Buonolo News'}</span>
                      <div className="flex gap-2">
                        <button onClick={() => onSave({id: item.id, type: 'update', title: item.title, data: item, timestamp: new Date().toISOString()})} className="text-slate-200 hover:text-primary transition-colors"><i className="fa-solid fa-bookmark text-xs"></i></button>
                        <button onClick={() => onShare(item.title, item.summary)} className="text-slate-200 hover:text-primary transition-colors"><i className="fa-solid fa-share-nodes text-xs"></i></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black leading-tight cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedInfoItem(item)}>{item.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-3 font-medium flex-grow leading-relaxed">{item.summary}</p>
                    <button onClick={() => setSelectedInfoItem(item)} className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Read News</button>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 text-3xl"><i className="fa-solid fa-wind"></i></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Latest news is arriving shortly.</p>
                  </div>
                )}
              </div>

              {((newsItems?.length || 0) >= 10 || (infoItems?.length || 0) >= 10) && (
                <div className="flex justify-center pt-8">
                  <button onClick={handleLoadMore} disabled={loadMoreLoading} className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                    {loadMoreLoading && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                    {loadMoreLoading ? 'Fetching more news...' : 'Get more results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {selectedInfoItem && <InfoDetailModal item={selectedInfoItem} onClose={() => setSelectedInfoItem(null)} />}
    </div>
  );
};

export default InfoHub;
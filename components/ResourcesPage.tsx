import React, { useState } from 'react';
import { Country, UserLocation, NearbyService, User } from '../types';
import { fetchLocalResources } from '../services/geminiService';

const RESOURCE_CATEGORIES = [
  { 
    id: 'dining', 
    label: 'Restaurants & Social', 
    icon: '🍴', 
    subFilters: [
      'Italian Cuisine', 'Chinese Cuisine', 'Indian Cuisine', 'Japanese / Sushi', 'French Fine Dining', 'Mediterranean', 'Thai Cuisine', 'Mexican', 'Steakhouse', 'Seafood', 'Vegan / Vegetarian', 
      'Pubs & Taverns', 'Cocktail Bars', 'Rooftop Bars', 'Wine Bars', 'Craft Beer Breweries', 
      'Beach Resorts', 'Mountain Resorts', 'Luxury Hotels', 'Boutique Stays', 
      'Party Areas', 'Nightclubs', 'Karaoke Bars', 'Event Spaces', 'Live Music Hubs', 'Social Clubs', 'Party Zones'
    ] 
  },
  { 
    id: 'grocery', 
    label: 'Groceries & Markets', 
    icon: '🛒', 
    subFilters: [
      'Supermarket', 'Organic Food Store', 'Asian Grocery', 'Indian Market', 'Middle Eastern Market', 'Halal Butcher', 'Bakery', 'Farmers Market', 'Wine & Spirits', 'Gourmet Deli', 'Kosher Store', 'Seafood Market', 'Local Market'
    ] 
  },
  { 
    id: 'education', 
    label: 'Education', 
    icon: '🏫', 
    subFilters: [
      'Nursery', 'International School', 'Language School', 'University', 'Kindergarten', 'Primary School', 'Secondary School', 'Vocational Training', 'Tutoring Center', 'Music School', 'Dance Academy', 'Driving School', 'STEM Lab', 'Art School'
    ] 
  },
  { 
    id: 'healthcare', 
    label: 'Healthcare', 
    icon: '🏥', 
    subFilters: [
      'GP / General Practitioner', 'Hospital', 'Dentist', 'Pharmacy', 'Mental Health Clinic', 'Optician / Eye Care', 'Physiotherapy', 'Pediatrician', 'Chiropractor', 'Medical Imaging Center', 'Specialist Doctor', 'Alternative Medicine', 'Urgent Care'
    ] 
  },
  { 
    id: 'legal', 
    label: 'Official & Legal', 
    icon: '⚖️', 
    subFilters: [
      'Immigration Lawyer', 'Notary Public', 'Tax Advisor', 'Certified Translator', 'Embassy', 'Consulate', 'Police Station', 'Town Hall / Civil Registry', 'Labor Office', 'Property Lawyer', 'Divorce Lawyer', 'Business Consultant', 'Post Office'
    ] 
  },
  { 
    id: 'religion', 
    label: 'Faith & Spiritual', 
    icon: '⛪', 
    subFilters: [
      'Church', 'Mosque', 'Temple', 'Synagogue', 'Gurdwara', 'Spiritual Center', 'Religious Festival', 'Meditation Hall', 'Monastery', 'Cathedral', 'Islamic Center', 'Buddhist Temple', 'Hindu Temple'
    ] 
  },
  { 
    id: 'leisure', 
    label: 'Leisure & Sports', 
    icon: '🎡', 
    subFilters: [
      'Gym / Fitness Center', 'Yoga Studio', 'Public Pool', 'Tennis Court', 'Golf Course', 'Football Pitch', 'Theme Park', 'Water Park', 'Zoo', 'Aquarium', 'Botanical Garden', 'National Park', 'Public Beach', 'Hiking Trail', 'Ski Resort', 'Public Park'
    ] 
  }
];

interface ResourcesPageProps {
  country: Country;
  userLocation: UserLocation | null;
  onRegisterLocation: () => void;
  onSave: (item: any) => void;
  onShare: (title: string, text: string) => void;
  user: User | null;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ country, userLocation, onRegisterLocation, onSave, onShare, user }) => {
  const [activeCategory, setActiveCategory] = useState(RESOURCE_CATEGORIES[0]);
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [customSearch, setCustomSearch] = useState('');
  const [resources, setResources] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const radius = user?.preferredRadius || 10;
  const unit = (country.id === 'usa' || country.id === 'uk') ? 'miles' : 'km';

  const handleCategoryChange = (cat: typeof RESOURCE_CATEGORIES[0]) => {
    setActiveCategory(cat);
    setActiveSubFilter(null);
  };

  const executeSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    let finalQuery = '';
    if (customSearch.trim()) {
      finalQuery = customSearch.trim();
    } else if (activeSubFilter) {
      finalQuery = `${activeCategory.label}: ${activeSubFilter}`;
    } else {
      finalQuery = activeCategory.label;
    }

    try {
      const data = await fetchLocalResources(
        country.name,
        finalQuery,
        userLocation || undefined,
        radius,
        unit,
        15
      );
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadMoreLoading(true);
    try {
      let finalQuery = customSearch.trim() || (activeSubFilter ? `${activeCategory.label}: ${activeSubFilter}` : activeCategory.label);
      const excludeList = resources.map(r => r.name);
      const moreData = await fetchLocalResources(
        country.name,
        finalQuery,
        userLocation || undefined,
        radius,
        unit,
        15,
        excludeList
      );
      setResources(prev => [...prev, ...moreData]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 px-4 pb-32 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Essentials Hub</h2>
            <p className="text-slate-500 font-medium">Map out confirmed services and verified amenities in {country.name}.</p>
          </div>
        </div>
        {!userLocation && (
          <button 
            onClick={onRegisterLocation}
            className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl flex items-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            <i className="fa-solid fa-location-crosshairs"></i>
            Detect Exact Location
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories Selection */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">1. Select Category</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {RESOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat)}
                className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                  activeCategory.id === cat.id 
                    ? 'bg-primary text-white border-primary shadow-lg' 
                    : 'bg-white text-slate-600 hover:border-primary border-slate-100 shadow-sm'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-black text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Search & Results Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-8">
            
            {/* Search Controls */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">2. Refine Search</h3>
                
                {/* Custom Search Input */}
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder={`Custom precise search in ${activeCategory.label}...`}
                    className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-900 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Sub-filter Chips */}
                {!customSearch.trim() && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Or choose a specific specialization:</p>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 py-1">
                      {activeCategory.subFilters.map(filter => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveSubFilter(activeSubFilter === filter ? null : filter)}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            activeSubFilter === filter 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                              : 'bg-white text-slate-500 border-slate-100 hover:border-primary'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit Search Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-500/20 hover:bg-[#0000CC] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-location-dot"></i>
                )}
                {loading ? 'Powering Engine...' : `Deep Search: ${activeSubFilter || activeCategory.label}`}
              </button>
            </form>

            {/* Results Grid */}
            <div className="pt-8 border-t border-slate-100 min-h-[400px]">
              {loading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verifying results for precision...</p>
                </div>
              ) : resources.length > 0 ? (
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Verified Resident Assets ({resources.length})</h4>
                    <span className="text-[10px] font-bold text-slate-400">Scan Radius: {radius} {unit}</span>
                   </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    {resources.map((res, i) => (
                      <div 
                        key={`${res.name}-${i}`} 
                        className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-primary hover:bg-white transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-center">
                               <span className="text-[9px] font-black text-primary bg-orange-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Verified Asset</span>
                               {res.rating && (
                                 <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                   <i className="fa-solid fa-star mr-1"></i> {res.rating}
                                 </span>
                               )}
                            </div>
                            {res.isVerified && <i className="fa-solid fa-circle-check text-orange-500 text-sm"></i>}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg leading-tight">{res.name}</p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                              <i className="fa-solid fa-location-dot text-primary text-[10px]"></i>
                              {res.address}
                            </p>
                          </div>
                          {res.phone && (
                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                              <i className="fa-solid fa-phone text-slate-300"></i>
                              {res.phone}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => onSave({id: `res-${i}-${Date.now()}`, type: 'resource', title: res.name, data: res, timestamp: new Date().toISOString()})}
                            className="flex-1 py-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-primary transition-colors flex items-center justify-center shadow-sm"
                            title="Save to Briefcase"
                          >
                            <i className="fa-solid fa-bookmark text-sm"></i>
                          </button>
                          
                          <button 
                            onClick={() => onShare(res.name, `I found this verified resource: ${res.name} located at ${res.address}. Check it out on Buonolo!`)}
                            className="flex-1 py-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-primary transition-colors flex items-center justify-center shadow-sm"
                            title="Share Resource"
                          >
                            <i className="fa-solid fa-share-nodes text-sm"></i>
                          </button>

                          {(res.website || res.uri) && (
                            <a 
                              href={res.website || res.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-primary transition-colors flex items-center justify-center shadow-sm"
                              title="Visit Website"
                            >
                              <i className="fa-solid fa-globe text-sm"></i>
                            </a>
                          )}

                          <a 
                            href={res.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.name + ' ' + res.address)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-primary transition-colors"
                            title="Open in Maps"
                          >
                            <i className="fa-solid fa-map-location-dot text-sm"></i>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : hasSearched ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 text-4xl">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-lg">No precise matches found</p>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Our engine couldn't verify specific results for this query. Try a more general term.</p>
                  </div>
                  <button onClick={executeSearch} className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline mt-4">Refresh Precise Search</button>
                </div>
              ) : (
                <div className="py-32 text-center space-y-6">
                  <div className="w-24 h-24 bg-orange-50 text-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl">
                    <i className="fa-solid fa-microchip"></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-800">Precision Engine Ready</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Our search engine cross-references multiple sources to find real, verified locations for you.</p>
                  </div>
                </div>
              )}

              {resources.length >= 10 && !loading && (
                <div className="flex justify-center pt-10">
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loadMoreLoading}
                    className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                  >
                    {loadMoreLoading && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                    {loadMoreLoading ? 'Expanding Deep Search...' : 'Verify more options'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;

import React from 'react';
import { Country } from '../types';
import { COUNTRIES } from '../constants';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelect: (country: Country) => void;
  searchQuery: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountry, onSelect, searchQuery }) => {
  const filtered = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.continent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const continents: Country['continent'][] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-inner">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <p className="text-slate-500 font-black text-xl tracking-tight">No destinations match "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {continents.map(continent => {
        const continentCountries = filtered.filter(c => c.continent === continent);
        if (continentCountries.length === 0) return null;

        return (
          <div key={continent} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
              {continent}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {continentCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => onSelect(country)}
                  className={`relative p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 hover:shadow-2xl hover:-translate-y-2 active:scale-95 group overflow-hidden ${
                    selectedCountry?.id === country.id
                      ? 'border-blue-600 bg-orange-50 ring-4 ring-blue-500/10'
                      : 'border-white bg-white shadow-sm'
                  }`}
                >
                  {/* Subtle Background Pattern */}
                  <div className="absolute top-0 right-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                     <span className="text-9xl -mr-10 -mt-10">{country.flag}</span>
                  </div>

                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-5xl shadow-sm transform group-hover:scale-110 transition-transform duration-300 z-10">
                    {country.flag}
                  </div>
                  
                  <div className="text-center z-10">
                    <span className="block text-sm font-black text-slate-900 leading-tight">
                      {country.name}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                      {country.isEnglishSpeaking && (
                        <span className="text-[8px] font-black text-blue-600 bg-orange-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider">English</span>
                      )}
                      <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{country.id.toUpperCase().slice(0, 2)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CountrySelector;

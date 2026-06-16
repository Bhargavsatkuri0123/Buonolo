import React, { useState } from 'react';
import { NewsItem, User } from '../types';

interface NewsCardProps {
  item: NewsItem;
  onSave?: () => void;
  onShare?: () => void;
  user: User | null;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onSave, onShare, user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${isExpanded ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      <div className="p-5 flex-grow space-y-3">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">{item.sourceName}</span>
          <div className="flex gap-2 items-center">
             <button onClick={onSave} className="text-slate-200 hover:text-blue-600 transition-colors"><i className="fa-solid fa-bookmark text-xs"></i></button>
             <button onClick={onShare} className="text-slate-200 hover:text-blue-600 transition-colors"><i className="fa-solid fa-share-nodes text-xs"></i></button>
             <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>{item.headline}</h3>
        <div className="flex items-center gap-2"><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1.5"><i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i><span>Read full article</span></a></div>
        {isExpanded && (
          <div className="pt-4 mt-4 border-t border-slate-50 animate-in fade-in duration-300">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.summary}</p>
            <button onClick={() => setIsExpanded(false)} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1"><i className="fa-solid fa-chevron-up text-[10px]"></i>Close</button>
          </div>
        )}
      </div>
      {!isExpanded && <button onClick={() => setIsExpanded(true)} className="w-full py-2.5 bg-slate-50 text-slate-500 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">Read News</button>}
    </div>
  );
};

export default NewsCard;
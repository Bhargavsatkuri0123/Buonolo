
import React from 'react';
import { InfoItem } from '../types';

interface InfoDetailModalProps {
  item: InfoItem;
  onClose: () => void;
}

const InfoDetailModal: React.FC<InfoDetailModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in slide-in-from-bottom-4">
        
        <div className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-file-circle-info"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">{item.category}</p>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Full Update Briefing</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{item.title}</h1>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              {item.date && <span><i className="fa-solid fa-calendar mr-1.5"></i> {item.date}</span>}
              {item.source && <span><i className="fa-solid fa-building mr-1.5"></i> {item.source}</span>}
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <div className="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line space-y-4 font-medium">
              {item.fullContent}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-[0.98] transition-all"
          >
            Close Insight
          </button>
          {item.url && (
            <a 
              href={item.url}
              target="_blank"
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-center active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              Original Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoDetailModal;

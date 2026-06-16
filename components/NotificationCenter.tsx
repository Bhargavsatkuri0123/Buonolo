
import React from 'react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  notifPermission: NotificationPermission;
  onRequestNotifications: () => Promise<boolean>;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  notifPermission, 
  onRequestNotifications,
  onMarkAsRead, 
  onClose 
}) => {
  const showEnableBanner = notifPermission !== 'granted';

  return (
    <div className="absolute top-16 right-0 w-80 md:w-96 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
        <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {showEnableBanner && (
        <div className="p-4 bg-blue-600 text-white border-b border-blue-700 animate-pulse-slow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce-slow">
              <i className="fa-solid fa-bell-concierge"></i>
            </div>
            <div className="space-y-2 flex-grow">
              <p className="text-[10px] font-black uppercase tracking-widest">Real-time Updates</p>
              <p className="text-xs font-medium leading-tight opacity-90">Get instant alerts for visa changes and immigration news.</p>
              <button 
                onClick={() => onRequestNotifications()}
                className="w-full py-2 bg-white text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
              >
                Activate Push Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors relative ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'news' ? 'bg-orange-100 text-orange-600' :
                    notif.type === 'visa' ? 'bg-orange-100 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <i className={`fa-solid ${
                      notif.type === 'news' ? 'fa-newspaper' :
                      notif.type === 'visa' ? 'fa-passport' :
                      'fa-bell'
                    } text-xs`}></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 leading-tight">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{notif.message}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{notif.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
              <i className="fa-solid fa-bell-slash"></i>
            </div>
            <p className="text-xs font-bold text-slate-400">All caught up!</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">View All History</button>
      </div>
    </div>
  );
};

export default NotificationCenter;

import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  History, 
  MessageSquare, 
  UserCheck,
  QrCode,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Spares', icon: Boxes },
    { id: 'qr_scanner', label: 'QR & Card', icon: QrCode, isAccent: true },
    { id: 'new_repair', label: 'New Job', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ];

  return (
    <nav 
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAccent) {
            return (
              <button
                key={item.id}
                data-testid={`btn-nav-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                  ${isActive 
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20' 
                    : 'bg-sky-600 text-white shadow-sky-600/30'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              data-testid={`btn-nav-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`
                flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors
                ${isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

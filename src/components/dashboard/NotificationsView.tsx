import React, { useState } from 'react';
import { 
  Bell, 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, ActiveTab } from '../../types';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, setActiveTab } = useApp();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const filtered = notifications.filter(n => {
    if (filterUnreadOnly) return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'repair':
        return <Wrench className="w-4 h-4 text-sky-600" />;
      case 'warranty':
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      case 'part_inquiry':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'admin_review':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.actionRoute) {
      if (notif.actionRoute.includes('warranty')) {
        setActiveTab('warranty');
      } else if (notif.actionRoute.includes('repairs') || notif.actionRoute.includes('repair')) {
        setActiveTab('repair_history');
      } else if (notif.actionRoute.includes('profile')) {
        setActiveTab('profile');
      } else if (notif.actionRoute.includes('parts')) {
        setActiveTab('parts_sharing');
      } else if (notif.actionRoute.includes('customer')) {
        setActiveTab('customers');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Workshop Notifications & Action Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time notifications for customer pickups, warranty alerts, and B2B parts deals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterUnreadOnly 
                ? 'bg-sky-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div
            key={item.id}
            data-testid={`notif-${item.id}`}
            onClick={() => handleActionClick(item)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              item.isRead 
                ? 'bg-white border-slate-200 hover:border-slate-300' 
                : 'bg-sky-50/50 border-sky-200 hover:border-sky-300 ring-1 ring-sky-300/30'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    {item.title}
                  </h3>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {item.message}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {item.timestamp}
                </span>
              </div>
            </div>

            <div className="shrink-0 pt-1">
              <ArrowRight className="w-4 h-4 text-slate-400 hover:text-sky-600" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No notifications to display.
          </div>
        )}
      </div>
    </div>
  );
};

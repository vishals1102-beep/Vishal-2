import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  UserPlus, 
  Wrench, 
  History, 
  ShieldCheck, 
  IndianRupee, 
  Cpu, 
  Hammer, 
  HelpCircle, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  ShieldAlert,
  ChevronRight,
  Camera,
  LogOut,
  QrCode,
  Boxes,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { AndroidNativeViewerModal } from '../dashboard/AndroidNativeViewerModal';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
  count?: number;
  adminOnly?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const DesktopSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    currentTech,
    activeTab, 
    setActiveTab, 
    userRole, 
    notifications, 
    inventory, 
    employees, 
    logout,
    inventorySubTab,
    setInventorySubTab
  } = useApp();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const lowStockCount = inventory ? inventory.filter(i => i.stockQuantity <= i.lowStockThreshold).length : 0;
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  const navGroups: NavGroup[] = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'qr_scanner', label: 'QR & Visiting Card', icon: QrCode, highlight: true, badge: 'Scanner' },
        { id: 'inventory', label: 'Spares Inventory', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined },
        { id: 'employees', label: 'Staff & Employees', icon: Users, badge: `${employees?.length || 2} Staff` },
        { id: 'new_repair', label: 'New Repair Job', icon: Wrench },
        { id: 'repair_history', label: 'Repair History', icon: History },
        { id: 'customers', label: 'My Customers', icon: Users },
        { id: 'add_customer', label: 'Add Customer', icon: UserPlus }
      ]
    },
    {
      group: 'Warranty & Accounts',
      items: [
        { id: 'warranty', label: 'Warranty Claims', icon: ShieldCheck },
        { id: 'warranty_upload', label: 'Parts Photos & Remarks', icon: Camera, badge: 'Upload' },
        { id: 'payments', label: 'Payments & Invoicing', icon: IndianRupee },
        { id: 'reports', label: 'Business Reports', icon: BarChart3 }
      ]
    },
    {
      group: 'Peer Network (B2B)',
      items: [
        { id: 'parts_sharing', label: 'Parts Marketplace', icon: Cpu, badge: 'P2P' },
        { id: 'tools_sharing', label: 'Tools Rental', icon: Hammer },
        { id: 'tech_help', label: 'Tech Help Board', icon: HelpCircle },
        { id: 'whatsapp_group', label: 'Tech WhatsApp Hub', icon: MessageSquare, badge: 'Live' }
      ]
    },
    {
      group: 'Account & Compliance',
      items: [
        { id: 'profile', label: 'My Profile & Shop', icon: UserCheck },
        { 
          id: 'notifications', 
          label: 'Alerts & Notices', 
          icon: Bell, 
          count: unreadCount 
        },
        { 
          id: 'admin_verify', 
          label: 'Admin Verification', 
          icon: ShieldAlert, 
          adminOnly: true,
          badge: 'Staff' 
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        id="desktop-sidebar"
        className={`
          fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
          flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Active Workshop Shop Name & Make in India */}
          {userRole !== 'admin' && currentTech && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/20 border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registered Workshop
              </div>
              <div className="font-heading font-bold text-xs text-slate-900 truncate mt-0.5">
                {currentTech.shopName}
              </div>
              {/* Make in India and Indian flag down to shop name */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs">🇮🇳</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  Make in India
                </span>
              </div>
            </div>
          )}

          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                // Highlight admin console with subtle indigo styling
                const isAdminItem = item.id === 'admin_verify';

                return (
                  <React.Fragment key={item.id}>
                    <button
                      data-testid={`tab-${item.id}`}
                    onClick={() => handleNav(item.id as ActiveTab)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-150 group
                      ${isActive 
                        ? (isAdminItem ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-sky-600 text-white shadow-sm shadow-sky-600/20') 
                        : (item.highlight 
                            ? 'text-sky-700 bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/60' 
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : (item.highlight ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600')}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`
                          text-[10px] px-1.5 py-0.2 rounded font-bold uppercase
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-amber-100 text-amber-800'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}

                      {typeof item.count === 'number' && item.count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {item.count}
                        </span>
                      )}

                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </div>
                  </button>

                  {/* Nested Sub-Tabs for Inventory Intelligence */}
                  {item.id === 'inventory' && activeTab === 'inventory' && (
                    <div className="ml-3 pl-2.5 border-l-2 border-sky-300/80 my-1 space-y-0.5 animate-in fade-in duration-150">
                      <button
                        onClick={() => { setInventorySubTab('all'); if (onClose) onClose(); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          inventorySubTab === 'all' 
                            ? 'text-sky-800 bg-sky-50 font-bold border border-sky-200' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>📦 All Spares Catalog</span>
                      </button>
                      <button
                        onClick={() => { setInventorySubTab('top_sales'); if (onClose) onClose(); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          inventorySubTab === 'top_sales' 
                            ? 'text-amber-900 bg-amber-50 font-bold border border-amber-200' 
                            : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                        }`}
                      >
                        <span>🔥 Most Sale Parts</span>
                      </button>
                      <button
                        onClick={() => { setInventorySubTab('dead_stock'); if (onClose) onClose(); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          inventorySubTab === 'dead_stock' 
                            ? 'text-sky-950 bg-sky-50 font-bold border border-sky-200' 
                            : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50/50'
                        }`}
                      >
                        <span>❄️ Dead Stock List</span>
                      </button>
                      <button
                        onClick={() => { setInventorySubTab('auto_order'); if (onClose) onClose(); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          inventorySubTab === 'auto_order' 
                            ? 'text-indigo-900 bg-indigo-50 font-bold border border-indigo-200' 
                            : 'text-slate-600 hover:text-indigo-800 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span>🤖 Auto Spare Order</span>
                      </button>
                      <button
                        onClick={() => { setInventorySubTab('suggestions'); if (onClose) onClose(); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          inventorySubTab === 'suggestions' 
                            ? 'text-purple-900 bg-purple-50 font-bold border border-purple-200' 
                            : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50/50'
                        }`}
                      >
                        <span>💡 Suggestions Tab</span>
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            </div>
          ))}
        </div>

        {/* Workshop status bottom strip */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
          {/* Native Android App Prompt */}
          <button
            type="button"
            onClick={() => setShowAndroidModal(true)}
            className="w-full py-2 px-3 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 text-xs font-semibold flex items-center justify-between transition-colors group shadow-2xs cursor-pointer"
            title="Native Android App (Kotlin & Jetpack Compose)"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android App (Kotlin)</span>
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded">Native</span>
          </button>

          <button
            data-testid="sidebar-btn-logout"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-between transition-colors group shadow-xs"
            title="Sign Out & Lock Session"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span>Log Out & Lock</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Sign Out</span>
          </button>

          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-[10px] text-slate-500 font-medium">
              Workshop Cloud Engine: <span className="text-emerald-700 font-bold">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Android Native Kotlin & Compose Modal */}
      <AndroidNativeViewerModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </>
  );
};

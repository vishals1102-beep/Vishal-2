import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Bell, 
  Search, 
  LogOut, 
  User, 
  ExternalLink,
  Smartphone,
  Menu,
  X,
  CheckCircle2,
  ArrowLeft,
  Home,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Package,
  Receipt,
  Sparkles,
  Hash,
  Boxes,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { ChangePasswordModal } from './ChangePasswordModal';
import { AndroidNativeViewerModal } from '../dashboard/AndroidNativeViewerModal';

export type GlobalSearchScope = 'all' | 'tickets' | 'imei' | 'customers' | 'inventory';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { 
    currentTech, 
    userRole, 
    activeTab, 
    setActiveTab, 
    notifications, 
    loginAsDemo, 
    logout,
    tickets,
    customers,
    inventory,
    employees,
    activeStaff,
    switchStaffPersona,
    formatINR
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<GlobalSearchScope>('all');
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [resultTab, setResultTab] = useState<'all' | 'tickets' | 'customers' | 'inventory'>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowScopeMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Results by Scope & Query
  const qClean = searchQuery.trim().toLowerCase();
  const hasQuery = qClean.length > 0;

  // Tickets matches
  const matchedTickets = hasQuery ? tickets.filter(t => {
    if (searchScope === 'customers') return false;
    if (searchScope === 'inventory') return false;
    if (searchScope === 'imei') return t.imeiSerialNumber.toLowerCase().includes(qClean);
    if (searchScope === 'tickets') {
      return t.id.toLowerCase().includes(qClean) ||
             t.problemDescription.toLowerCase().includes(qClean) ||
             t.deviceModel.toLowerCase().includes(qClean);
    }
    // 'all'
    return t.id.toLowerCase().includes(qClean) ||
           t.customerName.toLowerCase().includes(qClean) ||
           t.customerMobile.includes(qClean) ||
           t.imeiSerialNumber.toLowerCase().includes(qClean) ||
           t.deviceBrand.toLowerCase().includes(qClean) ||
           t.deviceModel.toLowerCase().includes(qClean) ||
           t.problemDescription.toLowerCase().includes(qClean);
  }) : [];

  // Customers matches
  const matchedCustomers = hasQuery ? customers.filter(c => {
    if (searchScope === 'tickets' || searchScope === 'imei' || searchScope === 'inventory') return false;
    return c.fullName.toLowerCase().includes(qClean) ||
           c.mobileNumber.includes(qClean) ||
           c.whatsappNumber.includes(qClean) ||
           c.address.toLowerCase().includes(qClean) ||
           c.id.toLowerCase().includes(qClean);
  }) : [];

  // Inventory matches
  const matchedInventory = hasQuery ? inventory.filter(item => {
    if (searchScope === 'tickets' || searchScope === 'imei' || searchScope === 'customers') return false;
    return item.name.toLowerCase().includes(qClean) ||
           item.sku.toLowerCase().includes(qClean) ||
           item.barcode.includes(qClean) ||
           item.category.toLowerCase().includes(qClean) ||
           item.locationBin.toLowerCase().includes(qClean) ||
           (item.compatibleModels || []).some(m => m.toLowerCase().includes(qClean)) ||
           (item.compatibleBrands || []).some(b => b.toLowerCase().includes(qClean));
  }) : [];

  const totalResults = matchedTickets.length + matchedCustomers.length + matchedInventory.length;

  const handleSelectTicket = (ticketId: string) => {
    setIsFocused(false);
    setSearchQuery('');
    setActiveTab('repair_history');
  };

  const handleSelectCustomer = (customerId: string) => {
    setIsFocused(false);
    setSearchQuery('');
    setActiveTab('customers');
  };

  const handleSelectInventory = (itemId: string) => {
    setIsFocused(false);
    setSearchQuery('');
    setActiveTab('inventory');
  };

  const scopeLabels: Record<GlobalSearchScope, { label: string; icon: string }> = {
    all: { label: 'All Options', icon: '🔍' },
    tickets: { label: 'Tickets', icon: '🎫' },
    imei: { label: 'IMEI / Serial', icon: '📱' },
    customers: { label: 'Customers', icon: '👤' },
    inventory: { label: 'Spares / Stock', icon: '📦' }
  };

  return (
    <header 
      id="top-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          {activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' && (
            <button
              data-testid="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div 
            onClick={() => setActiveTab(activeTab === 'landing' ? 'landing' : 'dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center shadow-xs group-hover:from-sky-500 group-hover:to-indigo-600 transition-all shrink-0">
              <Wrench className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xs sm:text-sm tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                  Quick Fix Electronics
                </span>
                <span className="inline-flex items-center text-[9px] font-heading font-bold uppercase bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded border border-sky-200">
                  Workshop Hub
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Electronics Workshop Hub
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Fast Search with Search Options */}
        {activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' && (
          <div ref={searchContainerRef} className="hidden sm:block flex-1 max-w-lg mx-2 relative">
            <div className="flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white rounded-xl border border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all overflow-hidden shadow-2xs">
              
              {/* Search Scope Option Selector */}
              <div className="relative shrink-0 border-r border-slate-200 bg-slate-50/80">
                <button
                  type="button"
                  data-testid="btn-header-search-scope"
                  onClick={() => setShowScopeMenu(!showScopeMenu)}
                  className="flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:text-sky-700 hover:bg-slate-200/60 transition-colors"
                  title="Choose Search Scope Option"
                >
                  <span>{scopeLabels[searchScope].icon}</span>
                  <span className="hidden md:inline font-medium">{scopeLabels[searchScope].label}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Scope Options Dropdown */}
                {showScopeMenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Search Target Option
                    </div>
                    {(['all', 'tickets', 'imei', 'customers', 'inventory'] as GlobalSearchScope[]).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        data-testid={`option-scope-${scope}`}
                        onClick={() => {
                          setSearchScope(scope);
                          setShowScopeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                          searchScope === scope ? 'bg-sky-50 text-sky-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{scopeLabels[scope].icon}</span>
                          <span>{scopeLabels[scope].label}</span>
                        </div>
                        {searchScope === scope && <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  data-testid="input-global-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder={
                    searchScope === 'tickets' ? 'Search ticket #, fault, model...' :
                    searchScope === 'imei' ? 'Enter 15-digit IMEI or serial...' :
                    searchScope === 'customers' ? 'Search customer name, phone, area...' :
                    searchScope === 'inventory' ? 'Search spare part, SKU, barcode, bin...' :
                    'Search tickets, IMEI, customer, spares...'
                  }
                  className="w-full bg-transparent text-xs text-slate-900 pl-8 pr-7 py-2 outline-none font-medium placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Search Dropdown & Search Options Presets */}
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 max-h-96 overflow-y-auto">
                {/* When Query is empty: Show Suggested Search Options & Shortcuts */}
                {!hasQuery ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Quick Search Options & Tags</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Click to search</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { text: 'AMOLED Combo', scope: 'inventory' as GlobalSearchScope },
                          { text: 'iPhone 13', scope: 'tickets' as GlobalSearchScope },
                          { text: 'Battery Pack', scope: 'inventory' as GlobalSearchScope },
                          { text: 'Pending Settlement', scope: 'tickets' as GlobalSearchScope },
                          { text: 'Samsung Galaxy', scope: 'all' as GlobalSearchScope },
                          { text: 'Type-C Port', scope: 'inventory' as GlobalSearchScope }
                        ].map(preset => (
                          <button
                            key={preset.text}
                            type="button"
                            onClick={() => {
                              setSearchScope(preset.scope);
                              setSearchQuery(preset.text);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium transition-colors border border-slate-200/80"
                          >
                            {preset.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>💡 <strong>Tip:</strong> Switch search scope on the left to filter specifically by IMEI, Spares, or Customers.</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Category Filter Tabs inside Search Popup */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setResultTab('all')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            resultTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          All ({totalResults})
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultTab('tickets')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            resultTab === 'tickets' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Tickets ({matchedTickets.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultTab('customers')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            resultTab === 'customers' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Customers ({matchedCustomers.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultTab('inventory')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            resultTab === 'inventory' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Spares ({matchedInventory.length})
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Scope: {scopeLabels[searchScope].label}
                      </span>
                    </div>

                    {totalResults === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">No records found matching "{searchQuery}"</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Try changing the search scope option or checking the spelling
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Section 1: Matching Tickets */}
                        {(resultTab === 'all' || resultTab === 'tickets') && matchedTickets.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block px-1 mb-1">
                              Workshop Tickets ({matchedTickets.length})
                            </span>
                            <div className="space-y-1">
                              {matchedTickets.slice(0, 4).map(ticket => (
                                <button
                                  key={ticket.id}
                                  type="button"
                                  onClick={() => handleSelectTicket(ticket.id)}
                                  className="w-full text-left p-2 rounded-xl hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-colors flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-sky-700 text-xs">{ticket.id}</span>
                                      <span className="text-xs text-slate-800 font-medium">
                                        {ticket.customerName}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {ticket.deviceBrand} {ticket.deviceModel} • Fault: {ticket.problemDescription}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">
                                      IMEI: {ticket.imeiSerialNumber}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 block mb-1">
                                      {ticket.repairStatus.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-900">
                                      {formatINR(ticket.totalCharges)}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 2: Matching Customers */}
                        {(resultTab === 'all' || resultTab === 'customers') && matchedCustomers.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block px-1 mb-1">
                              Customers ({matchedCustomers.length})
                            </span>
                            <div className="space-y-1">
                              {matchedCustomers.slice(0, 3).map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectCustomer(c.id)}
                                  className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                      <span>{c.fullName}</span>
                                      <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      📞 {c.mobileNumber} • 📍 {c.address}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      {c.coinsBalance || 0} Coins
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 3: Matching Spares / Inventory */}
                        {(resultTab === 'all' || resultTab === 'inventory') && matchedInventory.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block px-1 mb-1">
                              Spare Parts Stock ({matchedInventory.length})
                            </span>
                            <div className="space-y-1">
                              {matchedInventory.slice(0, 4).map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectInventory(item.id)}
                                  className="w-full text-left p-2 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                      <span>{item.name}</span>
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                        {item.sku}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      Category: {item.category} • Bin: {item.locationBin}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-mono font-bold text-slate-900 block">
                                      {formatINR(item.sellingPrice)}
                                    </span>
                                    <span className={`text-[10px] font-semibold ${
                                      item.stockQuantity <= item.lowStockThreshold ? 'text-rose-600' : 'text-slate-500'
                                    }`}>
                                      Qty: {item.stockQuantity} in stock
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: Only Logged-in Person Info & Quick Alerts */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' && (
            <>
              <button
                type="button"
                onClick={() => setShowAndroidModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                title="Native Android App (Kotlin & Jetpack Compose)"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android App</span>
              </button>

              <button
                data-testid="btn-quick-bell-header"
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 transition-colors cursor-pointer"
                title="Workshop Notifications & Alerts"
              >
              <Bell className="w-4 h-4 text-slate-600 hover:text-sky-600" />
              {unreadCount > 0 && (
                <span 
                  data-testid="badge-header-bell-unread"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            </>
          )}

          {activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' ? (
            <div className="relative" ref={userMenuRef}>
              <button
                data-testid="btn-login-person-info"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 text-left transition-all shadow-2xs group cursor-pointer"
                aria-label="Logged-in User Account"
                title="Logged-in User Profile & Details"
              >
                {/* User Avatar with active online indicator */}
                <div className="relative shrink-0">
                  {activeStaff?.type === 'employee' ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {activeStaff.employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  ) : userRole === 'admin' ? (
                    <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      VS
                    </div>
                  ) : (
                    <img 
                      src={currentTech.technicianPhoto} 
                      alt={currentTech.fullName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Login Person Info */}
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-xs text-slate-900 group-hover:text-sky-700 transition-colors">
                      {activeStaff?.type === 'employee' 
                        ? activeStaff.employee.fullName 
                        : (userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName)}
                    </span>
                    {activeStaff?.type === 'employee' ? (
                      <span 
                        data-testid="badge-status-staff"
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded"
                      >
                        <User className="w-2.5 h-2.5 text-amber-700" />
                        <span>Staff</span>
                      </span>
                    ) : userRole === 'admin' ? (
                      <span 
                        data-testid="badge-status-admin"
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                        <span>Admin</span>
                      </span>
                    ) : currentTech.verificationStatus === 'verified' ? (
                      <span 
                        data-testid="badge-status-verified"
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span 
                        data-testid="badge-status-pending"
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded animate-pulse"
                      >
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                        <span>Review</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px] sm:max-w-[180px]">
                    {activeStaff?.type === 'employee'
                      ? `${activeStaff.employee.roleTitle}`
                      : userRole === 'admin' 
                        ? 'Chief Verifier • +91 95413 71468' 
                        : `${currentTech.shopName} (${currentTech.id})`}
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Account & Actions Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {/* Detailed Logged-in Profile Header */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                    <div className="flex items-center gap-2.5 mb-2">
                      {activeStaff?.type === 'employee' ? (
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {activeStaff.employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      ) : userRole === 'admin' ? (
                        <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          VS
                        </div>
                      ) : (
                        <img 
                          src={currentTech.technicianPhoto} 
                          alt={currentTech.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate">
                          {activeStaff?.type === 'employee' 
                            ? activeStaff.employee.fullName 
                            : (userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName)}
                        </div>
                        {userRole !== 'admin' && activeStaff?.type !== 'employee' && (
                          <div className="mt-0.5">
                            <span className="text-xs font-semibold text-sky-800 truncate block">
                              {currentTech.shopName}
                            </span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {activeStaff?.type === 'employee'
                            ? activeStaff.employee.roleTitle
                            : (userRole === 'admin' ? 'vishals1102@gmail.com' : currentTech.email)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {activeStaff?.type === 'employee'
                            ? activeStaff.employee.mobileNumber
                            : (userRole === 'admin' ? '+91 95413 71468' : currentTech.mobileNumber)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Session Role</span>
                      {activeStaff?.type === 'employee' ? (
                        <span className="font-bold text-amber-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-600" /> Staff (Sales & Debit Only)
                        </span>
                      ) : userRole === 'admin' ? (
                        <span className="font-bold text-indigo-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" /> Super Admin
                        </span>
                      ) : currentTech.verificationStatus === 'verified' ? (
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Workshop Owner
                        </span>
                      ) : (
                        <span className="font-bold text-amber-700 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600" /> Pending Admin Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Switch Operator Persona Section */}
                  <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/70 mb-2 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Operator Persona</span>
                      <button
                        onClick={() => { setActiveTab('employees'); setShowUserMenu(false); }}
                        className="text-sky-600 hover:underline capitalize"
                      >
                        Manage Staff
                      </button>
                    </div>

                    {activeStaff?.type === 'employee' ? (
                      <button
                        onClick={() => { switchStaffPersona('owner'); setShowUserMenu(false); }}
                        className="w-full text-left p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 flex items-center justify-between transition-colors font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Switch to Workshop Owner</span>
                        </span>
                        <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-bold">Owner</span>
                      </button>
                    ) : (
                      <div className="space-y-1">
                        {employees.map(emp => (
                          <button
                            key={emp.id}
                            onClick={() => { switchStaffPersona('employee', emp.id, emp.pin); setShowUserMenu(false); }}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-amber-50 text-slate-800 flex items-center justify-between transition-colors text-[11px]"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="font-medium">{emp.fullName} ({emp.roleTitle.split(' ')[0]})</span>
                            </span>
                            <span className="text-[9px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.2 rounded">Staff</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Navigation */}
                  <div className="space-y-0.5">
                    <button
                      data-testid="btn-profile-header"
                      onClick={() => {
                        setActiveTab(userRole === 'admin' ? 'admin_verify' : 'profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left font-medium"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{userRole === 'admin' ? 'Admin Verification Console' : 'View Shop Profile & Visiting Card'}</span>
                    </button>

                    <button
                      data-testid="btn-change-password-header-menu"
                      onClick={() => {
                        setShowChangePasswordModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      <span>Security & Change Password</span>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-android-app-header-menu"
                      onClick={() => {
                        setShowAndroidModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors text-left font-medium"
                    >
                      <span className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Native Android (Kotlin & Compose)</span>
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">App</span>
                    </button>

                    <button
                      data-testid="btn-notifications-header"
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left font-medium"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Notifications & Alerts</span>
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Switch Demo Login Section */}
                  <div className="my-2 pt-2 border-t border-slate-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo Profile
                    </div>
                    <button
                      data-testid="btn-quick-login-verified"
                      onClick={() => { loginAsDemo('verified_tech'); setShowUserMenu(false); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          Rajesh Sharma <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                        </div>
                        <div className="text-[10px] text-slate-500">QF-TECH-4821 • Verified Tech</div>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Active</span>
                    </button>
                    <button
                      data-testid="btn-quick-login-pending"
                      onClick={() => { loginAsDemo('pending_tech'); setShowUserMenu(false); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-amber-50 text-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          Amit Patel <ShieldAlert className="w-3 h-3 text-amber-600 inline" />
                        </div>
                        <div className="text-[10px] text-slate-500">QF-TECH-7890 • Pending Review</div>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Review</span>
                    </button>
                    <button
                      data-testid="btn-quick-login-admin"
                      onClick={() => { loginAsDemo('admin'); setShowUserMenu(false); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 text-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold text-indigo-700 flex items-center gap-1 text-[11px]">
                          Admin Vishal <ShieldCheck className="w-3 h-3 text-indigo-600 inline" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">+91 95413 71468</div>
                      </div>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">Super Admin</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      data-testid="btn-logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                data-testid="btn-nav-login"
                onClick={() => setActiveTab('login')}
                className="text-xs font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
              <button
                data-testid="btn-nav-register"
                onClick={() => setActiveTab('register')}
                className="text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 px-3.5 py-2 rounded-lg shadow-sm shadow-sky-600/20 transition-colors"
              >
                Register Workshop
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Android Native Kotlin & Jetpack Compose Modal */}
      <AndroidNativeViewerModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </header>
  );
};

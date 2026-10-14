import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Smartphone, 
  Wrench, 
  ExternalLink,
  History,
  Coins,
  CheckCircle2,
  Gift,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  CalendarClock,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  BellRing
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { calculateCustomerSummary, CustomerDeviceSummary } from '../../utils/maintenanceCalculator';
import { DeviceMaintenanceModal } from './DeviceMaintenanceModal';

export const CustomersView: React.FC = () => {
  const { 
    customers, 
    currentTech, 
    tickets, 
    setActiveTab, 
    maskPhone, 
    awardCustomerCoins, 
    customerCoinTransactions,
    addNotification,
    deviceMaintenanceSchedules
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showLedgerCustomer, setShowLedgerCustomer] = useState<Customer | null>(null);
  const [maintenanceModalCustomer, setMaintenanceModalCustomer] = useState<Customer | null>(null);
  const [initialModalTicketId, setInitialModalTicketId] = useState<string | undefined>(undefined);
  const [bulkTriggerMsg, setBulkTriggerMsg] = useState<string | null>(null);

  // Search Options States
  const [searchField, setSearchField] = useState<'all' | 'name' | 'mobile' | 'address'>('all');
  const [showSearchOptions, setShowSearchOptions] = useState<boolean>(false);
  const [coinsFilter, setCoinsFilter] = useState<'all' | 'has_coins' | 'high_coins' | 'zero_coins'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'repeat' | 'single' | 'none'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'warranty_soon' | 'maintenance_due' | 'with_devices'>('all');
  const [sortBy, setSortBy] = useState<'name_az' | 'coins_high' | 'repairs_most'>('name_az');

  // Award Coins State
  const [awardingCustomer, setAwardingCustomer] = useState<Customer | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(50);
  const [coinReason, setCoinReason] = useState<string>('Loyalty reward points given by technician');
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  const myCustomers = customers.filter(c => c.technicianId === currentTech.id);

  // Active search options count
  const activeSearchOptionsCount = 
    (searchField !== 'all' ? 1 : 0) +
    (coinsFilter !== 'all' ? 1 : 0) +
    (activityFilter !== 'all' ? 1 : 0) +
    (deviceFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'name_az' ? 1 : 0);

  const handleResetSearchOptions = () => {
    setSearchQuery('');
    setSearchField('all');
    setCoinsFilter('all');
    setActivityFilter('all');
    setDeviceFilter('all');
    setSortBy('name_az');
  };

  // Precompute customer device maintenance summaries
  const customerSummariesMap = useMemo(() => {
    const map = new Map<string, CustomerDeviceSummary>();
    myCustomers.forEach(c => {
      map.set(c.id, calculateCustomerSummary(c, tickets, deviceMaintenanceSchedules));
    });
    return map;
  }, [myCustomers, tickets, deviceMaintenanceSchedules]);

  const warrantyExpiringCount = useMemo(() => {
    return Array.from(customerSummariesMap.values()).filter(s => s.hasExpiringWarranty).length;
  }, [customerSummariesMap]);

  const maintenanceDueCount = useMemo(() => {
    return Array.from(customerSummariesMap.values()).filter(s => s.hasMaintenanceDue).length;
  }, [customerSummariesMap]);

  const totalTrackedDevices = useMemo(() => {
    return Array.from(customerSummariesMap.values()).reduce((acc, s) => acc + s.devices.length, 0);
  }, [customerSummariesMap]);

  const handleTriggerAllDueNotifications = () => {
    let triggeredCount = 0;
    
    myCustomers.forEach(cust => {
      const summary = customerSummariesMap.get(cust.id) || calculateCustomerSummary(cust, tickets, deviceMaintenanceSchedules);
      summary.devices.forEach(dev => {
        // If warranty expiring in <= 7 days
        if (dev.warrantyStatus === 'expiring_soon' || dev.warrantyStatus === 'expiring_today') {
          addNotification({
            title: `🛡️ Warranty Alert: ${cust.fullName} (${dev.deviceBrand} ${dev.deviceModel})`,
            message: `${dev.deviceBrand} ${dev.deviceModel} repair warranty expires on ${dev.warrantyExpiryDate} (${dev.warrantyDaysRemaining} days left). Reach out to customer.`,
            type: 'warranty',
            actionRoute: '/dashboard/customers'
          });
          triggeredCount++;
        }
        
        // If maintenance due or overdue
        if (dev.maintenanceStatus === 'overdue' || dev.maintenanceStatus === 'due_today' || dev.maintenanceStatus === 'due_soon') {
          addNotification({
            title: `🔧 Maintenance Due: ${cust.fullName} (${dev.deviceBrand} ${dev.deviceModel})`,
            message: `Follow-up ${dev.serviceCategoryLabel} for ${dev.deviceBrand} ${dev.deviceModel} is ${dev.maintenanceStatusText} (Due: ${dev.maintenanceDueDate}).`,
            type: 'repair',
            actionRoute: '/dashboard/customers'
          });
          triggeredCount++;
        }
      });
    });

    if (triggeredCount > 0) {
      setBulkTriggerMsg(`Evaluated ${totalTrackedDevices} devices: Successfully dispatched ${triggeredCount} action alert notifications to your Workshop Notification Bell!`);
    } else {
      setBulkTriggerMsg(`Diagnostic scan complete: Evaluated ${totalTrackedDevices} devices. All devices have active warranties & up-to-date maintenance!`);
    }
    setTimeout(() => setBulkTriggerMsg(null), 4500);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return myCustomers.filter(c => {
      // 1. Search Query with Field Option
      if (q) {
        if (searchField === 'name') {
          if (!c.fullName.toLowerCase().includes(q)) return false;
        } else if (searchField === 'mobile') {
          if (!c.mobileNumber.includes(q)) return false;
        } else if (searchField === 'address') {
          if (!c.address.toLowerCase().includes(q)) return false;
        } else {
          // 'all'
          const matches = 
            c.fullName.toLowerCase().includes(q) ||
            c.mobileNumber.includes(q) ||
            c.address.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q);
          if (!matches) return false;
        }
      }

      const coins = c.coinsBalance ?? 0;
      const count = tickets.filter(t => t.customerId === c.id).length;

      // 2. Coins Filter Option
      if (coinsFilter === 'has_coins' && coins <= 0) return false;
      if (coinsFilter === 'high_coins' && coins < 100) return false;
      if (coinsFilter === 'zero_coins' && coins > 0) return false;

      // 3. Activity Filter Option
      if (activityFilter === 'repeat' && count < 2) return false;
      if (activityFilter === 'single' && count !== 1) return false;
      if (activityFilter === 'none' && count !== 0) return false;

      // 4. Device & Warranty Maintenance Filter Option
      if (deviceFilter !== 'all') {
        const summary = customerSummariesMap.get(c.id);
        if (!summary) return false;
        if (deviceFilter === 'warranty_soon' && !summary.hasExpiringWarranty && !summary.hasWarrantyDueSoon) return false;
        if (deviceFilter === 'maintenance_due' && !summary.hasMaintenanceDue) return false;
        if (deviceFilter === 'with_devices' && summary.devices.length === 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'coins_high') {
        return (b.coinsBalance ?? 0) - (a.coinsBalance ?? 0);
      }
      if (sortBy === 'repairs_most') {
        const countA = tickets.filter(t => t.customerId === a.id).length;
        const countB = tickets.filter(t => t.customerId === b.id).length;
        return countB - countA;
      }
      // 'name_az'
      return a.fullName.localeCompare(b.fullName);
    });
  }, [myCustomers, tickets, searchQuery, searchField, coinsFilter, activityFilter, deviceFilter, sortBy, customerSummariesMap]);

  const customerTickets = selectedCustomer 
    ? tickets.filter(t => t.customerId === selectedCustomer.id) 
    : [];

  const handleAwardCoinsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardingCustomer) return;

    const res = awardCustomerCoins(awardingCustomer.id, coinAmount, coinReason);
    if (res.success) {
      setAwardSuccessMsg(res.message);
      setTimeout(() => {
        setAwardingCustomer(null);
        setAwardSuccessMsg(null);
      }, 1600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Workshop Customer Registry & Loyalty Coins
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {myCustomers.length} registered customers • Technician-awarded loyalty coins (1 Coin = ₹1 repair discount)
          </p>
        </div>

        <button
          data-testid="btn-add-customer-nav"
          onClick={() => setActiveTab('add_customer')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Device Follow-Up Maintenance & Warranty Intelligence Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <CalendarClock className="w-4 h-4" />
              </span>
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <span>Device Health & Warranty Intelligence Center</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Auto-Forecast
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Calculates when client devices are due for follow-up maintenance or warranty expiration and triggers instant workshop alerts.
            </p>
          </div>

          <button
            data-testid="btn-trigger-all-due-alerts"
            onClick={handleTriggerAllDueNotifications}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-heading shadow-sm flex items-center gap-2 transition-all active:scale-95 shrink-0 self-start sm:self-auto border border-indigo-400/30 cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Trigger All Due Notifications</span>
          </button>
        </div>

        {/* Bulk Trigger Toast / Alert */}
        {bulkTriggerMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bulkTriggerMsg}</span>
          </div>
        )}

        {/* 3 Clickable KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* KPI 1: Warranty Expiring Soon */}
          <button
            type="button"
            data-testid="kpi-filter-warranty-expiring"
            onClick={() => setDeviceFilter(deviceFilter === 'warranty_soon' ? 'all' : 'warranty_soon')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              deviceFilter === 'warranty_soon'
                ? 'bg-amber-500/25 border-amber-400 text-white ring-2 ring-amber-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Warranty Expiring Watch
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                warrantyExpiringCount > 0 ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-slate-400'
              }`}>
                ≤7 Days / Expired
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-white font-mono">
              {warrantyExpiringCount} <span className="text-xs font-normal text-slate-400 font-sans">client{warrantyExpiringCount === 1 ? '' : 's'}</span>
            </div>
            <span className="text-[11px] text-amber-300/90 block mt-0.5">
              {deviceFilter === 'warranty_soon' ? 'Active Filter: Showing Expiring Warranties' : 'Click to filter expiring warranties'}
            </span>
          </button>

          {/* KPI 2: Follow-up Maintenance Due */}
          <button
            type="button"
            data-testid="kpi-filter-maintenance-due"
            onClick={() => setDeviceFilter(deviceFilter === 'maintenance_due' ? 'all' : 'maintenance_due')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              deviceFilter === 'maintenance_due'
                ? 'bg-sky-500/25 border-sky-400 text-white ring-2 ring-sky-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                Maintenance Due Watch
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                maintenanceDueCount > 0 ? 'bg-sky-400/20 text-sky-300' : 'bg-white/10 text-slate-400'
              }`}>
                Due / Overdue
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-white font-mono">
              {maintenanceDueCount} <span className="text-xs font-normal text-slate-400 font-sans">client{maintenanceDueCount === 1 ? '' : 's'}</span>
            </div>
            <span className="text-[11px] text-sky-300/90 block mt-0.5">
              {deviceFilter === 'maintenance_due' ? 'Active Filter: Showing Maintenance Due' : 'Click to filter checkups due'}
            </span>
          </button>

          {/* KPI 3: Total Tracked Devices */}
          <button
            type="button"
            data-testid="kpi-filter-with-devices"
            onClick={() => setDeviceFilter(deviceFilter === 'with_devices' ? 'all' : 'with_devices')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              deviceFilter === 'with_devices'
                ? 'bg-indigo-500/25 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Tracked Client Devices
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono bg-white/10 text-slate-300">
                Total
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-white font-mono">
              {totalTrackedDevices} <span className="text-xs font-normal text-slate-400 font-sans">devices</span>
            </div>
            <span className="text-[11px] text-indigo-300/90 block mt-0.5">
              {deviceFilter === 'with_devices' ? 'Active Filter: Showing Clients with Devices' : 'Click to show all clients with devices'}
            </span>
          </button>
        </div>
      </div>

      {/* Comprehensive Search Options & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Main Search Bar & Target Field Selector */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Target Field Option Dropdown */}
          <div className="sm:w-44 shrink-0">
            <label className="sr-only">Search Field Option</label>
            <div className="relative">
              <select
                data-testid="select-customer-search-field"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-sky-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">🔍 Search: All Fields</option>
                <option value="name">👤 Customer Name</option>
                <option value="mobile">📞 Mobile Number</option>
                <option value="address">📍 Residential Area</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              data-testid="input-search-customers"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchField === 'name' ? 'Search customer by full name...' :
                searchField === 'mobile' ? 'Search by mobile number (+91)...' :
                searchField === 'address' ? 'Search by street, area, or city...' :
                'Search customers by name, phone (+91), or residential area...'
              }
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search Options Toggle */}
            <button
              data-testid="btn-toggle-customer-search-options"
              onClick={() => setShowSearchOptions(!showSearchOptions)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showSearchOptions || activeSearchOptionsCount > 0
                  ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              <span>Search Options</span>
              {activeSearchOptionsCount > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeSearchOptionsCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSearchOptions ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Search Option Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Options:
          </span>
          {[
            { label: '🛡️ Warranty Expiring Soon', device: 'warranty_soon' as const },
            { label: '🔧 Maintenance Due', device: 'maintenance_due' as const },
            { label: '📱 Has Devices', device: 'with_devices' as const },
            { label: '🪙 Has Loyalty Coins', coins: 'has_coins' as const },
            { label: '👑 High Tier (≥100 Coins)', coins: 'high_coins' as const },
            { label: '🔁 Repeat Clients (2+ Repairs)', activity: 'repeat' as const },
            { label: '🆕 Single Repair', activity: 'single' as const }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (preset.device) setDeviceFilter(deviceFilter === preset.device ? 'all' : preset.device);
                if (preset.coins) setCoinsFilter(coinsFilter === preset.coins ? 'all' : preset.coins);
                if (preset.activity) setActivityFilter(activityFilter === preset.activity ? 'all' : preset.activity);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors border text-[11px] ${
                (preset.device && deviceFilter === preset.device) ||
                (preset.coins && coinsFilter === preset.coins) ||
                (preset.activity && activityFilter === preset.activity)
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-semibold'
                  : 'bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border-slate-200/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Advanced Search Options Tray */}
        {showSearchOptions && (
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <span>Advanced Customer Search & Filter Options</span>
              </span>
              <button
                type="button"
                onClick={handleResetSearchOptions}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Options</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Coins Balance Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Loyalty Coins Balance
                </label>
                <select
                  data-testid="select-option-customer-coins"
                  value={coinsFilter}
                  onChange={(e) => setCoinsFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Balances</option>
                  <option value="has_coins">🪙 Has Loyalty Coins (&gt;0)</option>
                  <option value="high_coins">👑 High Balance (≥ 100 Coins)</option>
                  <option value="zero_coins">0 Coins</option>
                </select>
              </div>

              {/* Repair Activity Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Repair History Activity
                </label>
                <select
                  data-testid="select-option-customer-activity"
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Repair Activity</option>
                  <option value="repeat">🔁 Repeat Clients (2+ jobs)</option>
                  <option value="single">🔧 Single Repair Done</option>
                  <option value="none">⏳ No Repairs Yet</option>
                </select>
              </div>

              {/* Device Health & Warranty Watch Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Device Health & Warranty
                </label>
                <select
                  data-testid="select-option-device-filter"
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Devices Watch</option>
                  <option value="warranty_soon">🛡️ Warranty Expiring (≤7d / Expired)</option>
                  <option value="maintenance_due">🔧 Follow-Up Maintenance Due</option>
                  <option value="with_devices">📱 Has Client Devices</option>
                </select>
              </div>

              {/* Sort Order Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <select
                  data-testid="select-option-customer-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="name_az">🔤 Name (A-Z)</option>
                  <option value="coins_high">🪙 Coins: High to Low</option>
                  <option value="repairs_most">🔧 Most Repairs First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Search Options Summary & Match Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-sky-700">{filtered.length}</strong> of {myCustomers.length} customers
            </span>

            {/* Active search filter chips */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-medium">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-sky-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchField !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-medium">
                Field: {searchField}
                <button type="button" onClick={() => setSearchField('all')} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {coinsFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-medium">
                Coins: {coinsFilter}
                <button type="button" onClick={() => setCoinsFilter('all')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-medium">
                Activity: {activityFilter}
                <button type="button" onClick={() => setActivityFilter('all')} className="hover:text-purple-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {deviceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-medium">
                Device: {deviceFilter === 'warranty_soon' ? 'Warranty Expiring' : deviceFilter === 'maintenance_due' ? 'Maintenance Due' : 'Has Devices'}
                <button type="button" onClick={() => setDeviceFilter('all')} className="hover:text-indigo-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortBy !== 'name_az' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-medium">
                Sorted: {sortBy}
                <button type="button" onClick={() => setSortBy('name_az')} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {(searchQuery || activeSearchOptionsCount > 0) && (
            <button
              type="button"
              onClick={handleResetSearchOptions}
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold underline transition-colors"
            >
              Clear all search options
            </button>
          )}
        </div>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const count = tickets.filter(t => t.customerId === customer.id).length;
          const coins = customer.coinsBalance ?? 0;

          return (
            <div
              key={customer.id}
              data-testid={`card-customer-${customer.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      {customer.fullName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{customer.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-semibold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-100">
                      {count} {count === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </div>
                </div>

                {/* Coin Loyalty Badge */}
                <div className="mb-3 flex items-center justify-between p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 font-mono">
                        {coins} QuickFix Coins
                      </span>
                      <span className="text-[10px] text-amber-700 block -mt-0.5">
                        ₹{coins} repair discount value
                      </span>
                    </div>
                  </div>

                  <button
                    data-testid={`btn-give-coins-${customer.id}`}
                    onClick={() => {
                      setAwardingCustomer(customer);
                      setCoinAmount(50);
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    <Gift className="w-3 h-3" />
                    <span>+ Give Coins</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono font-medium text-slate-800">
                      {maskPhone(customer.mobileNumber, true)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.address}, {customer.city}</span>
                  </div>
                </div>

                {customer.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mb-3">
                    "{customer.notes}"
                  </p>
                )}

                {/* Device Health & Warranty Follow-Up Card Section */}
                {(() => {
                  const summary = customerSummariesMap.get(customer.id) || calculateCustomerSummary(customer, tickets, deviceMaintenanceSchedules);
                  return (
                    <div className="mb-3 p-2.5 rounded-xl border bg-slate-50 border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <CalendarClock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Device Watch & Follow-Up</span>
                        </div>
                        {summary.primaryDevice && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            summary.statusBadge.type === 'danger' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            summary.statusBadge.type === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            summary.statusBadge.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {summary.statusBadge.label}
                          </span>
                        )}
                      </div>

                      {summary.primaryDevice ? (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="font-semibold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate font-medium">
                              <Smartphone className="w-3 h-3 text-slate-500 shrink-0" />
                              {summary.primaryDevice.deviceBrand} {summary.primaryDevice.deviceModel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Repaired: {summary.primaryDevice.repairDate}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 ${
                              summary.primaryDevice.warrantyStatus === 'expired' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                              summary.primaryDevice.warrantyStatus === 'expiring_soon' ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' :
                              'bg-white border-slate-200 text-slate-700'
                            }`}>
                              <ShieldAlert className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                🛡️ {summary.primaryDevice.warrantyDaysRemaining < 0 ? 'Expired' : `${summary.primaryDevice.warrantyDaysRemaining}d warranty left`}
                              </span>
                            </div>

                            <div className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 ${
                              summary.primaryDevice.maintenanceStatus === 'overdue' ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold' :
                              summary.primaryDevice.maintenanceStatus === 'due_soon' ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' :
                              'bg-white border-slate-200 text-slate-700'
                            }`}>
                              <Wrench className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                🔧 {summary.primaryDevice.maintenanceDaysRemaining < 0 ? 'Maint Overdue' : `Due in ${summary.primaryDevice.maintenanceDaysRemaining}d`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          No repair history on record yet.
                        </p>
                      )}

                      <button
                        type="button"
                        data-testid={`btn-open-maintenance-${customer.id}`}
                        onClick={() => {
                          setMaintenanceModalCustomer(customer);
                          setInitialModalTicketId(summary.primaryDevice?.ticketId);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Calculate Follow-Up & Trigger Alert</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`btn-customer-history-${customer.id}`}
                    onClick={() => setSelectedCustomer(customer)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Jobs ({count})</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    data-testid={`btn-customer-ledger-${customer.id}`}
                    onClick={() => setShowLedgerCustomer(customer)}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ledger</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    data-testid={`btn-call-${customer.id}`}
                    onClick={() => window.open(`tel:${customer.mobileNumber}`, '_self')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    data-testid={`btn-whatsapp-${customer.id}`}
                    onClick={() => {
                      const raw = customer.whatsappNumber.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${raw}?text=Hello%20${customer.fullName},%20regarding%20your%20repair%20at%20${encodeURIComponent(currentTech.shopName)}...`, '_blank');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900">
              {myCustomers.length === 0 ? 'Zero Customers in Directory • Fresh Directory Setup' : 'No Matching Customers Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {myCustomers.length === 0 
                ? 'Your customer directory currently has 0 entries. Add your first customer to track incoming device repairs, WhatsApp receipts, warranties, and loyalty reward coins.'
                : `No customers match your active search filter "${searchQuery}". Reset filters or add a new customer.`}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              data-testid="btn-empty-add-first-customer"
              type="button"
              onClick={() => setActiveTab('add_customer')}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Customer</span>
            </button>
            {myCustomers.length > 0 && (
              <button
                type="button"
                onClick={handleResetSearchOptions}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Award Customer Coins */}
      {awardingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-200" />
                <h3 className="font-heading font-bold text-base">Award Customer Coins</h3>
              </div>
              <button 
                onClick={() => setAwardingCustomer(null)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAwardCoinsSubmit} className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 block">{awardingCustomer.fullName}</span>
                  <span className="text-[11px] font-mono text-amber-800">{awardingCustomer.mobileNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-amber-700 font-bold block">Current Balance</span>
                  <span className="font-mono font-bold text-sm text-amber-900">{awardingCustomer.coinsBalance || 0} Coins</span>
                </div>
              </div>

              {awardSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{awardSuccessMsg}</span>
                </div>
              )}

              {/* Amount Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Coin Reward Amount (1 Coin = ₹1)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[25, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCoinAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                        coinAmount === amt
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Coin Credit
                </label>
                <select
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none mb-2"
                >
                  <option value="Repeat repair loyalty reward">Repeat repair loyalty reward</option>
                  <option value="Quick pick-up goodwill bonus">Quick pick-up goodwill bonus</option>
                  <option value="Customer referral point bonus">Customer referral point bonus</option>
                  <option value="Festival & holiday promotion">Festival & holiday promotion</option>
                  <option value="Google review / feedback bonus">Google review / feedback bonus</option>
                </select>
                <input
                  type="text"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  placeholder="Or enter custom remark..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAwardingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-confirm-award-customer-coins"
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Give {coinAmount} Coins</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Customer Coin Ledger */}
      {showLedgerCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-heading font-bold text-sm">
                    {showLedgerCustomer.fullName} - Coin History
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Current Balance: {showLedgerCustomer.coinsBalance || 0} Coins (₹{showLedgerCustomer.coinsBalance || 0})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowLedgerCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2.5 text-xs">
              {customerCoinTransactions
                .filter(tx => tx.customerId === showLedgerCustomer.id)
                .map(tx => (
                  <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        tx.type === 'AWARDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type === 'AWARDED' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{tx.reason}</span>
                          {tx.ticketId && (
                            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1 rounded">
                              {tx.ticketId}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {tx.date} • by {tx.technicianName}
                        </span>
                      </div>
                    </div>

                    <div className={`font-mono font-bold text-sm text-right shrink-0 ${
                      tx.type === 'AWARDED' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'AWARDED' ? '+' : '-'}{tx.amount}
                      <span className="text-[10px] font-sans block text-slate-400">coins</span>
                    </div>
                  </div>
                ))}

              {customerCoinTransactions.filter(tx => tx.customerId === showLedgerCustomer.id).length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No coin transactions recorded for this customer yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Ticket History Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm">{selectedCustomer.fullName}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{selectedCustomer.mobileNumber}</span>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Lifetime Repair Tickets ({customerTickets.length})
              </span>

              {customerTickets.length > 0 ? (
                customerTickets.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                      <span className="text-sky-700">{t.id}</span>
                      <span className="text-[10px] font-sans uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {t.repairStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                      {t.deviceBrand} {t.deviceModel}
                    </div>
                    <div className="text-[11px] text-slate-600 italic">
                      "{t.problemDescription}"
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Logged: {t.createdAt}</span>
                      <span className="font-bold text-slate-900 font-mono">₹{t.totalCharges}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No tickets found for this customer yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Device Follow-up Maintenance & Warranty Calculator */}
      {maintenanceModalCustomer && (
        <DeviceMaintenanceModal
          customer={maintenanceModalCustomer}
          isOpen={!!maintenanceModalCustomer}
          onClose={() => {
            setMaintenanceModalCustomer(null);
            setInitialModalTicketId(undefined);
          }}
          initialTicketId={initialModalTicketId}
        />
      )}
    </div>
  );
};

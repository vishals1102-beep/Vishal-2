import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Printer, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Camera, 
  Star, 
  FileText, 
  Share2,
  ChevronRight,
  ArrowRight,
  QrCode,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Tag,
  DollarSign,
  Plus
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { RepairTicket, RepairStatus } from '../../types';
import { EditPartsAndLaborModal } from './EditPartsAndLaborModal';

export const RepairHistoryView: React.FC = () => {
  const { 
    tickets, 
    currentTech, 
    formatINR, 
    updateTicketStatus, 
    addAfterRepairPhoto, 
    setActiveInvoiceTicket, 
    addCustomerFeedback,
    setActiveTab,
    createWarrantyClaim
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [editingPartsTicket, setEditingPartsTicket] = useState<RepairTicket | null>(null);

  // Search Options States
  const [searchField, setSearchField] = useState<'all' | 'id' | 'imei' | 'customer' | 'device' | 'problem' | 'parts'>('all');
  const [showSearchOptions, setShowSearchOptions] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedWarranty, setSelectedWarranty] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'customer_az'>('newest');

  // Modal actions state
  const [newStatus, setNewStatus] = useState<RepairStatus>('completed');
  const [statusNote, setStatusNote] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('Super fast screen and battery fix, works like new phone!');

  // QR Label state
  const [showQrSticker, setShowQrSticker] = useState<RepairTicket | null>(null);
  const [qrStickerDataUrl, setQrStickerDataUrl] = useState<string>('');

  const handleGenerateTicketSticker = async (ticket: RepairTicket) => {
    setShowQrSticker(ticket);
    try {
      const payload = JSON.stringify({
        ticketId: ticket.id,
        imei: ticket.imeiSerialNumber,
        customer: ticket.customerName,
        phone: ticket.customerMobile,
        device: `${ticket.deviceBrand} ${ticket.deviceModel}`
      });
      const url = await QRCode.toDataURL(payload, {
        width: 250,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setQrStickerDataUrl(url);
    } catch (e) {
      console.error('Failed generating QR code sticker', e);
    }
  };

  const myTickets = tickets.filter(t => t.technicianId === currentTech.id);

  // Active search options count
  const activeSearchOptionsCount = 
    (searchField !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedPayment !== 'all' ? 1 : 0) +
    (selectedWarranty !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const handleResetSearchOptions = () => {
    setSearchQuery('');
    setSearchField('all');
    setSelectedBrand('all');
    setSelectedPayment('all');
    setSelectedWarranty('all');
    setSelectedPriceRange('all');
    setSortBy('newest');
    setFilterStatus('all');
  };

  // Distinct brands available in technician's tickets
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    myTickets.forEach(t => {
      if (t.deviceBrand) brandsSet.add(t.deviceBrand);
    });
    return Array.from(brandsSet).sort();
  }, [myTickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return myTickets.filter(ticket => {
      // 1. Status Filter
      if (filterStatus !== 'all' && ticket.repairStatus !== filterStatus) {
        return false;
      }

      // 2. Search Query with Field Option
      if (q) {
        if (searchField === 'id') {
          if (!ticket.id.toLowerCase().includes(q)) return false;
        } else if (searchField === 'imei') {
          if (!ticket.imeiSerialNumber.toLowerCase().includes(q)) return false;
        } else if (searchField === 'customer') {
          if (!ticket.customerName.toLowerCase().includes(q) && !ticket.customerMobile.includes(q)) return false;
        } else if (searchField === 'device') {
          if (!ticket.deviceBrand.toLowerCase().includes(q) && !ticket.deviceModel.toLowerCase().includes(q)) return false;
        } else if (searchField === 'problem') {
          if (!ticket.problemDescription.toLowerCase().includes(q) && !(ticket.repairDetailsNotes || '').toLowerCase().includes(q)) return false;
        } else if (searchField === 'parts') {
          if (!ticket.partsUsed.some(p => p.toLowerCase().includes(q))) return false;
        } else {
          // 'all'
          const matchesAny = 
            ticket.id.toLowerCase().includes(q) ||
            ticket.imeiSerialNumber.includes(q) ||
            ticket.customerName.toLowerCase().includes(q) ||
            ticket.customerMobile.includes(q) ||
            ticket.deviceBrand.toLowerCase().includes(q) ||
            ticket.deviceModel.toLowerCase().includes(q) ||
            ticket.problemDescription.toLowerCase().includes(q) ||
            ticket.partsUsed.some(p => p.toLowerCase().includes(q));
          if (!matchesAny) return false;
        }
      }

      // 3. Brand Option
      if (selectedBrand !== 'all') {
        if (ticket.deviceBrand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 4. Payment Option
      if (selectedPayment !== 'all') {
        if (ticket.paymentStatus !== selectedPayment) return false;
      }

      // 5. Warranty Option
      if (selectedWarranty !== 'all') {
        const expTime = new Date(ticket.warrantyExpiryDate).getTime();
        const now = Date.now();
        const isCurrentlyActive = !isNaN(expTime) && expTime >= now;
        if (selectedWarranty === 'active' && !isCurrentlyActive) return false;
        if (selectedWarranty === 'expired' && isCurrentlyActive) return false;
      }

      // 6. Price Range Option
      if (selectedPriceRange !== 'all') {
        const amt = ticket.totalCharges;
        if (selectedPriceRange === 'under2k' && amt >= 2000) return false;
        if (selectedPriceRange === '2k_5k' && (amt < 2000 || amt > 5000)) return false;
        if (selectedPriceRange === '5k_10k' && (amt < 5000 || amt > 10000)) return false;
        if (selectedPriceRange === 'above10k' && amt <= 10000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      if (sortBy === 'amount_high') {
        return b.totalCharges - a.totalCharges;
      }
      if (sortBy === 'amount_low') {
        return a.totalCharges - b.totalCharges;
      }
      if (sortBy === 'customer_az') {
        return a.customerName.localeCompare(b.customerName);
      }
      // 'newest' default
      return 0;
    });
  }, [myTickets, filterStatus, searchQuery, searchField, selectedBrand, selectedPayment, selectedWarranty, selectedPriceRange, sortBy]);

  const handleUpdateStatus = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, newStatus, statusNote || `Status shifted to ${newStatus}`);
    // Refresh selected
    setSelectedTicket({
      ...selectedTicket,
      repairStatus: newStatus
    });
    setStatusNote('');
  };

  const handleAddPhoto = () => {
    if (!selectedTicket || !afterPhotoUrl) return;
    addAfterRepairPhoto(selectedTicket.id, afterPhotoUrl);
    setSelectedTicket({
      ...selectedTicket,
      afterRepairPhotos: [...selectedTicket.afterRepairPhotos, afterPhotoUrl]
    });
  };

  const handleAddFeedback = () => {
    if (!selectedTicket) return;
    addCustomerFeedback(selectedTicket.id, feedbackRating, feedbackComment);
    setSelectedTicket({
      ...selectedTicket,
      customerFeedbackRating: feedbackRating,
      customerFeedbackComment: feedbackComment
    });
  };

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">Received</span>;
      case 'in_diagnostic':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 text-sky-800">In Diagnostic</span>;
      case 'in_repair':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">In Repair</span>;
      case 'waiting_parts':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Waiting Parts</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Completed / Tested</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-800">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Repair Ticket Pipeline & Service History
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {myTickets.length} total logged repairs • Live status lifecycle & bench quality control
          </p>
        </div>

        <button
          data-testid="btn-create-new-ticket"
          onClick={() => setActiveTab('new_repair')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Wrench className="w-4 h-4" />
          <span>New Repair Ticket</span>
        </button>
      </div>

      {/* Filter Tabs & Comprehensive Search Options */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Repair Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Repairs' },
              { id: 'received', label: 'Received' },
              { id: 'in_diagnostic', label: 'Diagnostic' },
              { id: 'in_repair', label: 'On Bench' },
              { id: 'waiting_parts', label: 'Waiting Parts' },
              { id: 'completed', label: 'Ready Pickup' },
              { id: 'delivered', label: 'Delivered' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === f.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            data-testid="btn-toggle-search-options"
            onClick={() => setShowSearchOptions(!showSearchOptions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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

        {/* Main Search Bar with Target Field Selector */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Target Field Option Dropdown */}
          <div className="sm:w-48 shrink-0">
            <label className="sr-only">Search Field Option</label>
            <div className="relative">
              <select
                data-testid="select-search-field-option"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-sky-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">🔍 Search: All Fields</option>
                <option value="id">🎫 Ticket ID (QF-REP-...)</option>
                <option value="imei">📱 IMEI / Serial (15 digits)</option>
                <option value="customer">👤 Customer / Mobile</option>
                <option value="device">📱 Device Brand & Model</option>
                <option value="problem">⚠️ Problem / Fault Notes</option>
                <option value="parts">🔩 Parts Replaced</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              data-testid="input-search-tickets"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchField === 'id' ? 'Enter ticket ID, e.g. QF-REP-010...' :
                searchField === 'imei' ? 'Enter 15-digit IMEI or serial number...' :
                searchField === 'customer' ? 'Enter customer full name or 10-digit mobile...' :
                searchField === 'device' ? 'Enter brand or model, e.g. iPhone 13, OnePlus 11...' :
                searchField === 'problem' ? 'Search fault, e.g. display flickering, no power...' :
                searchField === 'parts' ? 'Search parts used, e.g. OLED screen combo, battery...' :
                'Search by Ticket ID, 15-digit IMEI, customer name, mobile, or model...'
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
        </div>

        {/* Quick Search Option Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Options:
          </span>
          {[
            { label: '📱 Screen / Display Fixes', query: 'Screen', field: 'parts' as const },
            { label: '🔋 Battery Swaps', query: 'Battery', field: 'parts' as const },
            { label: '💳 Unpaid / Pending', payment: 'pending' },
            { label: '🛡️ Active Warranty', warranty: 'active' },
            { label: '💰 High Value (>₹5k)', price: '5k_10k' },
            { label: '⚡ In Diagnostic', status: 'in_diagnostic' }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (preset.query) setSearchQuery(preset.query);
                if (preset.field) setSearchField(preset.field);
                if (preset.payment) setSelectedPayment(preset.payment);
                if (preset.warranty) setSelectedWarranty(preset.warranty);
                if (preset.price) setSelectedPriceRange(preset.price);
                if (preset.status) setFilterStatus(preset.status);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium whitespace-nowrap transition-colors border border-slate-200/80 text-[11px]"
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
                <span>Advanced Search & Filtering Options</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Brand Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Device Brand
                </label>
                <select
                  data-testid="select-option-brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                  {!availableBrands.includes('Apple') && <option value="Apple">Apple</option>}
                  {!availableBrands.includes('Samsung') && <option value="Samsung">Samsung</option>}
                  {!availableBrands.includes('OnePlus') && <option value="OnePlus">OnePlus</option>}
                  {!availableBrands.includes('Xiaomi') && <option value="Xiaomi">Xiaomi</option>}
                  {!availableBrands.includes('Vivo') && <option value="Vivo">Vivo</option>}
                  {!availableBrands.includes('Realme') && <option value="Realme">Realme</option>}
                </select>
              </div>

              {/* Payment Status Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Payment Settlement
                </label>
                <select
                  data-testid="select-option-payment"
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">✅ Paid & Settled</option>
                  <option value="pending">⏳ Pending Payment</option>
                </select>
              </div>

              {/* Warranty Coverage Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Warranty Status
                </label>
                <select
                  data-testid="select-option-warranty"
                  value={selectedWarranty}
                  onChange={(e) => setSelectedWarranty(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Warranty Terms</option>
                  <option value="active">🛡️ Under Active Warranty</option>
                  <option value="expired">⌛ Warranty Expired</option>
                </select>
              </div>

              {/* Price Range Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Bill Amount Range
                </label>
                <select
                  data-testid="select-option-price-range"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Amounts</option>
                  <option value="under2k">Under ₹2,000</option>
                  <option value="2k_5k">₹2,000 - ₹5,000</option>
                  <option value="5k_10k">₹5,000 - ₹10,000</option>
                  <option value="above10k">Above ₹10,000</option>
                </select>
              </div>

              {/* Sort Order Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <select
                  data-testid="select-option-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="newest">🕒 Newest First</option>
                  <option value="oldest">🕰️ Oldest First</option>
                  <option value="amount_high">💰 Price: High to Low</option>
                  <option value="amount_low">🪙 Price: Low to High</option>
                  <option value="customer_az">🔤 Customer Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Search Options Summary & Match Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-sky-700">{filteredTickets.length}</strong> of {myTickets.length} tickets
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

            {selectedBrand !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-medium">
                Brand: {selectedBrand}
                <button type="button" onClick={() => setSelectedBrand('all')} className="hover:text-purple-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPayment !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                Payment: {selectedPayment}
                <button type="button" onClick={() => setSelectedPayment('all')} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedWarranty !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-medium">
                Warranty: {selectedWarranty}
                <button type="button" onClick={() => setSelectedWarranty('all')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPriceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-medium">
                Price: {selectedPriceRange}
                <button type="button" onClick={() => setSelectedPriceRange('all')} className="hover:text-blue-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-medium">
                Sorted: {sortBy}
                <button type="button" onClick={() => setSortBy('newest')} className="hover:text-slate-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {(searchQuery || activeSearchOptionsCount > 0 || filterStatus !== 'all') && (
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

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket ID & IMEI</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  data-testid={`row-ticket-${ticket.id}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-sky-700 block">{ticket.id}</span>
                    <span className="text-[10px] text-slate-400">IMEI: {ticket.imeiSerialNumber}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{ticket.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{ticket.customerMobile}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{ticket.deviceBrand} {ticket.deviceModel}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {ticket.problemDescription}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(ticket.repairStatus)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-purple-700 block">{ticket.warrantyPeriodDays} Days</span>
                    <span className="text-[10px] text-slate-400">Exp: {ticket.warrantyExpiryDate}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatINR(ticket.totalCharges)}
                    <span className={`block text-[10px] font-sans font-semibold uppercase ${
                      ticket.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {ticket.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        data-testid={`btn-edit-parts-${ticket.id}`}
                        onClick={() => setEditingPartsTicket(ticket)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                        title="Edit Parts & Labour Charges"
                      >
                        <Wrench className="w-4 h-4 text-amber-700" />
                      </button>

                      <button
                        data-testid={`btn-quick-invoice-${ticket.id}`}
                        onClick={() => setActiveInvoiceTicket(ticket)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        data-testid={`btn-inspect-ticket-${ticket.id}`}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setNewStatus(ticket.repairStatus);
                        }}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {myTickets.length === 0 ? 'Zero Repair Jobs • Fresh Workbench Queue' : 'No Repair Tickets Match Filter'}
              </h3>
              <p className="text-xs text-slate-500">
                {myTickets.length === 0
                  ? 'Your repair pipeline is currently clear with 0 jobs. Intake a customer device with IMEI, fault diagnosis, and repair charges to create your first repair ticket.'
                  : 'No tickets found matching your selected search query and status filters.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                data-testid="btn-empty-log-new-repair"
                onClick={() => setActiveTab('new_repair')}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Repair Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-400 text-base">{selectedTicket.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-semibold">{selectedTicket.deviceBrand} {selectedTicket.deviceModel}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Status Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Current State</span>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(selectedTicket.repairStatus)}
                    <span className="text-xs text-slate-600 font-medium">Payment: {selectedTicket.paymentStatus.toUpperCase()} ({selectedTicket.paymentMode})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    data-testid="btn-modal-edit-parts"
                    onClick={() => setEditingPartsTicket(selectedTicket)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Edit Parts and Precision Labour Charges"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Edit Parts & Labour</span>
                  </button>

                  <button
                    data-testid="btn-modal-qr-sticker"
                    onClick={() => handleGenerateTicketSticker(selectedTicket)}
                    className="px-3 py-2 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    title="Generate printable Device QR Sticker"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Device QR Label</span>
                  </button>

                  <button
                    data-testid="btn-modal-invoice"
                    onClick={() => setActiveInvoiceTicket(selectedTicket)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    data-testid="btn-modal-claim"
                    onClick={() => {
                      setActiveTab('warranty');
                      setSelectedTicket(null);
                    }}
                    className="px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Warranty Claim</span>
                  </button>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 space-y-3">
                <h4 className="font-heading font-bold text-xs text-sky-950 uppercase tracking-wider">
                  Update Bench Lifecycle Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    data-testid="select-update-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-900 font-semibold"
                  >
                    <option value="received">Received</option>
                    <option value="in_diagnostic">In Diagnostic</option>
                    <option value="in_repair">In Repair</option>
                    <option value="waiting_parts">Waiting Parts</option>
                    <option value="completed">Completed & Tested</option>
                    <option value="delivered">Delivered to Customer</option>
                  </select>

                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Bench notes (e.g. Display installed, bench test passed)"
                    className="sm:col-span-2 px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <button
                  data-testid="btn-confirm-update-status"
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Status Update
                </button>
              </div>

              {/* Device Specs & Fault */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-heading font-bold text-slate-900">Device Identity</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>Model: <strong>{selectedTicket.deviceBrand} {selectedTicket.deviceModel}</strong></div>
                    <div>IMEI / Serial: <span className="font-mono">{selectedTicket.imeiSerialNumber}</span></div>
                    <div>Color: {selectedTicket.deviceColor}</div>
                    <div>Screen Lock: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[11px]">{selectedTicket.passcodeLockPattern}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-slate-900">Fault, Parts & Labour</h4>
                    <button
                      type="button"
                      data-testid={`btn-edit-parts-card-${selectedTicket.id}`}
                      onClick={() => setEditingPartsTicket(selectedTicket)}
                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div>Problem: <strong>{selectedTicket.problemDescription}</strong></div>
                    <div>Parts Installed: <strong className="text-slate-900">{selectedTicket.partsUsed.join(', ') || 'No parts listed'}</strong></div>
                    <div className="flex items-center gap-3 pt-0.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <div>Parts: <strong className="font-mono text-slate-900 block">{formatINR(selectedTicket.partsCost)}</strong></div>
                      <div>Labour: <strong className="font-mono text-slate-900 block">{formatINR(selectedTicket.laborCharges)}</strong></div>
                      {selectedTicket.discount > 0 && (
                        <div>Disc: <strong className="font-mono text-emerald-700 block">-{formatINR(selectedTicket.discount)}</strong></div>
                      )}
                      <div>Total: <strong className="font-mono text-sky-800 text-sm block">{formatINR(selectedTicket.totalCharges)}</strong></div>
                    </div>
                    <div>Warranty: {selectedTicket.warrantyPeriodDays} Days (Exp: {selectedTicket.warrantyExpiryDate})</div>
                  </div>
                </div>
              </div>

              {/* Before & After Photos */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Quality Audit Photos (Before & After)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photos */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Before Repair Condition</span>
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedTicket.beforeRepairPhotos.map((url, i) => (
                        <img key={i} src={url} alt="Before" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                      ))}
                    </div>
                  </div>

                  {/* After Photos */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">After Repair Quality Proof</span>
                    <div className="flex gap-2 overflow-x-auto mb-2">
                      {selectedTicket.afterRepairPhotos.length > 0 ? (
                        selectedTicket.afterRepairPhotos.map((url, i) => (
                          <img key={i} src={url} alt="After" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No after photos attached yet.</span>
                      )}
                    </div>
                    <button
                      data-testid="btn-add-after-photo"
                      onClick={handleAddPhoto}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Attach Bench Finished Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Feedback & Rating */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Customer Review & Workshop Rating</span>
                </h4>

                {selectedTicket.customerFeedbackRating ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {'★'.repeat(selectedTicket.customerFeedbackRating)}
                      <span className="text-slate-600 text-xs ml-1">({selectedTicket.customerFeedbackRating}/5 Stars)</span>
                    </div>
                    <p className="text-slate-700 italic">"{selectedTicket.customerFeedbackComment}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Stars:</span>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackRating(r)}
                          className={`text-lg ${feedbackRating >= r ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Customer review comment..."
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        onClick={handleAddFeedback}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Record Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Printable Device QR Code Sticker Modal */}
      {showQrSticker && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-400" />
                <h3 className="font-heading font-bold text-sm">Device Label Sticker</h3>
              </div>
              <button 
                onClick={() => setShowQrSticker(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col items-center text-center space-y-4">
              {/* Thermal Label Sticker Preview */}
              <div className="w-64 p-3.5 bg-white border-2 border-dashed border-slate-400 rounded-xl shadow-xs text-left text-slate-900 font-mono space-y-2">
                <div className="flex items-center justify-between border-b pb-1 border-slate-200">
                  <div>
                    <span className="font-bold text-[11px] truncate text-slate-900 block">
                      {currentTech.shopName}
                    </span>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1 font-sans">
                      <span>🇮🇳</span> Make in India
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-bold">{showQrSticker.id}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {qrStickerDataUrl ? (
                    <img src={qrStickerDataUrl} alt="Device QR Code" className="w-20 h-20 rounded border border-slate-200 p-0.5 shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 animate-pulse rounded shrink-0" />
                  )}

                  <div className="text-[10px] space-y-0.5 overflow-hidden">
                    <div className="font-bold text-slate-900 line-clamp-1 text-[11px]">
                      {showQrSticker.deviceBrand} {showQrSticker.deviceModel}
                    </div>
                    <div className="text-slate-600 font-mono text-[9px]">
                      IMEI: {showQrSticker.imeiSerialNumber}
                    </div>
                    <div className="text-slate-700 font-sans text-[10px] truncate">
                      Cust: {showQrSticker.customerName}
                    </div>
                    <div className="text-slate-500 font-mono text-[9px]">
                      Ph: {showQrSticker.customerMobile}
                    </div>
                    <div className="text-slate-400 text-[9px] font-sans">
                      Date: {showQrSticker.createdAt}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-center pt-1 text-slate-400 border-t border-slate-200 font-sans">
                  Scan with QuickFix Camera Scanner
                </div>
              </div>

              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={() => setShowQrSticker(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  data-testid="btn-print-device-qr-sticker"
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sticker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parts & Labour Charges Modal */}
      <EditPartsAndLaborModal
        ticket={editingPartsTicket}
        isOpen={!!editingPartsTicket}
        onClose={() => setEditingPartsTicket(null)}
        onSaved={(updated) => {
          if (selectedTicket && selectedTicket.id === updated.id) {
            setSelectedTicket(updated);
          }
        }}
      />
    </div>
  );
};

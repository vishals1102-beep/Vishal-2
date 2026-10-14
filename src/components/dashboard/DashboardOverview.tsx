import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Plus, 
  Search, 
  ArrowRight, 
  Printer, 
  Share2, 
  Cpu, 
  HelpCircle,
  MessageSquare,
  QrCode,
  Boxes,
  Coins,
  Flame,
  Snowflake,
  Bot,
  Lightbulb,
  Sparkles,
  Tag,
  RotateCcw,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RepairTicket, ActiveTab } from '../../types';
import { EditPartsAndLaborModal } from './EditPartsAndLaborModal';
import { AndroidNativeViewerModal } from './AndroidNativeViewerModal';

export const DashboardOverview: React.FC = () => {
  const { 
    currentTech, 
    tickets, 
    formatINR, 
    setActiveTab, 
    setActiveInvoiceTicket, 
    warrantyClaims,
    updateTicketStatus,
    inventory,
    customers,
    setInventorySubTab,
    loadSampleDemoData,
    resetAllToCleanSlate
  } = useApp();

  const [editingPartsTicket, setEditingPartsTicket] = useState<RepairTicket | null>(null);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // Metrics
  const myTickets = tickets.filter(t => t.technicianId === currentTech.id);
  const activeJobs = myTickets.filter(t => t.repairStatus !== 'delivered' && t.repairStatus !== 'cancelled');
  const completedToday = myTickets.filter(t => t.repairStatus === 'completed');
  const totalRevenue = myTickets
    .filter(t => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.totalCharges, 0);
  const pendingClaims = warrantyClaims.filter(c => c.status === 'under_inspection');
  const lowStockItems = inventory ? inventory.filter(i => i.stockQuantity <= i.lowStockThreshold) : [];
  const totalCoinsInCirculation = customers ? customers.reduce((acc, c) => acc + (c.coinsBalance || 0), 0) : 0;

  const recentJobs = [...myTickets].slice(0, 5);

  const getStatusBadge = (status: RepairTicket['repairStatus']) => {
    switch (status) {
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">Received</span>;
      case 'in_diagnostic':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 text-sky-800">Diagnostic</span>;
      case 'in_repair':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">In Repair</span>;
      case 'waiting_parts':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Waiting Parts</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Ready Pickup</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-800">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Fresh Workshop Onboarding Setup Banner */}
      {tickets.length === 0 && customers.length === 0 && inventory.length === 0 && (
        <div 
          data-testid="banner-fresh-workshop-onboarding"
          className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-sky-800/40 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Clean Slate • Ready for Your Workshop Data</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Welcome to Quick Fix Electronics Hub!
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your workshop database is fresh with 0 pre-loaded items. Get started right away by registering your first customer, adding spare parts to inventory, and logging repair tickets.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                data-testid="btn-onboarding-load-demo"
                onClick={() => loadSampleDemoData()}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Load sample workshop data for preview"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              data-testid="btn-onboarding-add-customer"
              onClick={() => setActiveTab('add_customer')}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                  1. Add Customers
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Register walk-in or corporate customers with phone numbers for tracking.
                </p>
              </div>
            </button>

            <button
              type="button"
              data-testid="btn-onboarding-add-inventory"
              onClick={() => setActiveTab('inventory')}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                  2. Add Spare Inventory
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Add combo screens, battery packs, and ICs with cost and selling price.
                </p>
              </div>
            </button>

            <button
              type="button"
              data-testid="btn-onboarding-new-repair"
              onClick={() => setActiveTab('new_repair')}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  3. Log Repair Job Ticket
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Intake device with IMEI serial, problem fault, parts used & issue invoice.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Verification Guard Alert Banner (if pending) */}
      {currentTech.verificationStatus === 'pending' && (
        <div 
          data-testid="banner-pending-verification"
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-sm text-amber-950">
                Account Under Admin Verification Review
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Your workshop registration (ID: <strong>{currentTech.id}</strong>) is currently being inspected by the national verification staff. You can log repairs and create invoices; B2B peer marketplace deals will activate once verified.
              </p>
            </div>
          </div>
          <button
            data-testid="btn-view-kyc-status"
            onClick={() => setActiveTab('profile')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap self-end sm:self-center transition-colors"
          >
            Check KYC Status
          </button>
        </div>
      )}

      {/* Workshop Hero Greeting & Quick Action Tray */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Workshop Command Center
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{currentTech.city}, {currentTech.state}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {currentTech.shopName}
            </h1>
            {/* Make in India and Indian flag down to shop name */}
            <div className="flex items-center gap-2 mt-1.5 mb-1">
              <span className="text-base select-none" role="img" aria-label="Indian Flag">🇮🇳</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-orange-500/25 via-white/10 to-emerald-500/25 text-white border border-white/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-orange-400 ring-2 ring-orange-400/40 animate-pulse" />
                Make in India
              </span>
              <span className="text-[11px] text-orange-200/90 font-medium hidden sm:inline">
                • Atmanirbhar Bharat Electronics Lab
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Operator: <strong>{currentTech.fullName}</strong> ({currentTech.id}) • {currentTech.workingHours}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              data-testid="btn-action-qr-scan"
              onClick={() => setActiveTab('qr_scanner')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-heading font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Label</span>
            </button>

            <button
              data-testid="btn-action-new-repair"
              onClick={() => setActiveTab('new_repair')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Repair</span>
            </button>

            <button
              data-testid="btn-action-inventory"
              onClick={() => setActiveTab('inventory')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Boxes className="w-3.5 h-3.5 text-sky-400" />
              <span>Spares Stock</span>
              {lowStockItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              data-testid="btn-action-add-customer"
              onClick={() => setActiveTab('add_customer')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>

            <button
              data-testid="btn-action-android-source"
              onClick={() => setShowAndroidModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Native Android App & Source Code Export"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android App / Code (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric KPI Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Jobs
            </span>
            <span className="font-heading text-2xl font-bold text-slate-900 mt-0.5 block">
              {activeJobs.length}
            </span>
            <span className="text-[11px] text-sky-600 font-medium">On Bench / Diagnostics</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ready Pickup
            </span>
            <span className="font-heading text-2xl font-bold text-slate-900 mt-0.5 block">
              {completedToday.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Completed & Tested</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Revenue Settled
            </span>
            <span className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 block font-mono">
              {formatINR(totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Cash / Card / Bank Transfer</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Warranty Claims
            </span>
            <span className="font-heading text-2xl font-bold text-slate-900 mt-0.5 block">
              {pendingClaims.length}
            </span>
            <span className="text-[11px] text-purple-600 font-medium">Under Guarantee Review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Repair Pipeline Tracker Visual */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-900">
            Current Workshop Pipeline Stages
          </h3>
          <button
            onClick={() => setActiveTab('repair_history')}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Received', count: myTickets.filter(t => t.repairStatus === 'received').length, color: 'bg-slate-100 text-slate-800' },
            { label: 'Diagnostic', count: myTickets.filter(t => t.repairStatus === 'in_diagnostic').length, color: 'bg-sky-100 text-sky-800' },
            { label: 'In Repair', count: myTickets.filter(t => t.repairStatus === 'in_repair').length, color: 'bg-blue-100 text-blue-800' },
            { label: 'Waiting Parts', count: myTickets.filter(t => t.repairStatus === 'waiting_parts').length, color: 'bg-amber-100 text-amber-800' },
            { label: 'Completed', count: myTickets.filter(t => t.repairStatus === 'completed').length, color: 'bg-emerald-100 text-emerald-800' },
            { label: 'Delivered', count: myTickets.filter(t => t.repairStatus === 'delivered').length, color: 'bg-purple-100 text-purple-800' }
          ].map((stage, idx) => (
            <div key={idx} className={`${stage.color} p-3 rounded-xl flex flex-col items-center justify-center text-center`}>
              <span className="font-heading font-bold text-xl">{stage.count}</span>
              <span className="text-[11px] font-semibold mt-0.5">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workshop Quick Operations: QR Device Label Scanner & Spares Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* QR Code Scanner Quick Card */}
        <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white p-5 rounded-2xl border border-sky-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-400/30">
                <QrCode className="w-3.5 h-3.5" />
                <span>Camera Label Scanner</span>
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                Instant Device History Retrieval
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                Point your camera at customer device QR stickers or barcodes to instantly fetch repair history, technician notes, and customer coin points.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-sky-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <button
              data-testid="btn-open-camera-scanner-card"
              onClick={() => setActiveTab('qr_scanner')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-heading font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Camera Scanner</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Supports live camera & image files
            </span>
          </div>
        </div>

        {/* Spares Inventory & Coins Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Spares Stock & Loyalty Coins
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                Manage Inventory →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mt-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Stocked Components</span>
                <span className="font-heading font-bold text-lg text-slate-900">
                  {inventory ? inventory.reduce((a, b) => a + b.stockQuantity, 0) : 0} units
                </span>
                <span className={`text-[10px] font-semibold block ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {lowStockItems.length > 0 ? `${lowStockItems.length} items low stock` : 'Stock levels healthy'}
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-amber-800 text-[11px] block">Customer Coins in Circulation</span>
                <span className="font-heading font-bold text-lg text-amber-950 font-mono">
                  {totalCoinsInCirculation} Coins
                </span>
                <span className="text-[10px] text-amber-700 font-semibold block">
                  ₹{totalCoinsInCirculation} discount reserve
                </span>
              </div>
            </div>
            {/* Direct Inventory Intelligence Shortcuts */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setInventorySubTab('top_sales');
                  setActiveTab('inventory');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="View top velocity parts"
              >
                <Flame className="w-3 h-3 text-amber-600" />
                <span>Most Sale Parts</span>
              </button>

              <button
                onClick={() => {
                  setInventorySubTab('dead_stock');
                  setActiveTab('inventory');
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="View non-moving dead stock and recovery discounts"
              >
                <Snowflake className="w-3 h-3 text-sky-600" />
                <span>Dead Stock</span>
              </button>

              <button
                onClick={() => {
                  setInventorySubTab('auto_order');
                  setActiveTab('inventory');
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Auto reorder calculated from last month stock usage"
              >
                <Bot className="w-3 h-3 text-indigo-600" />
                <span>Auto Spare Order</span>
              </button>

              <button
                onClick={() => {
                  setInventorySubTab('suggestions');
                  setActiveTab('inventory');
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="AI inventory suggestions and stocking tips"
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Suggestions</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px]">
              Technicians can award coins on device scan
            </span>
            <button
              onClick={() => setActiveTab('customers')}
              className="font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 text-[11px]"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Customer Loyalty Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Active Repair Tickets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">Recent Repair Tickets</h3>
            <p className="text-xs text-slate-500">Live workbench queue and delivery schedules</p>
          </div>
          <button
            onClick={() => setActiveTab('repair_history')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Manage Pipeline →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket ID & IMEI</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device & Fault</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Charges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.length > 0 ? (
                recentJobs.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-sky-700 block">{ticket.id}</span>
                      <span className="text-[10px] text-slate-400">IMEI: {ticket.imeiSerialNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{ticket.customerName}</span>
                      <span className="text-[11px] text-slate-500">{ticket.customerMobile}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
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
                          data-testid={`btn-dashboard-edit-parts-${ticket.id}`}
                          onClick={() => setEditingPartsTicket(ticket)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                          title="Edit Parts & Labour Charges"
                        >
                          <Wrench className="w-4 h-4 text-amber-700" />
                        </button>

                        <button
                          data-testid={`btn-invoice-${ticket.id}`}
                          onClick={() => setActiveInvoiceTicket(ticket)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View & Print Repair Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {ticket.repairStatus === 'in_repair' && (
                          <button
                            data-testid={`btn-mark-ready-${ticket.id}`}
                            onClick={() => updateTicketStatus(ticket.id, 'completed', 'Bench testing and quality inspection passed 100%')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-heading font-bold text-sm text-slate-900">
                          No active repair tickets yet
                        </div>
                        <div className="text-xs text-slate-500">
                          Intake a customer device with IMEI, diagnostics & charges to start your repair queue.
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('new_repair')}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Log First Repair Job</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Community Quick Links Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('parts_sharing')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-400 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">Parts Marketplace</h4>
              <p className="text-xs text-slate-500">Buy & swap genuine displays, PMIC chips & housings</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('tech_help')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">Technical Help Board</h4>
              <p className="text-xs text-slate-500">Ask motherboard schematic & jumper bypass tips</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('whatsapp_group')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition-colors shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">Tech WhatsApp Hub</h4>
              <p className="text-xs text-slate-500">Live technician peer chat & regional groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Parts & Labour Modal */}
      <EditPartsAndLaborModal
        ticket={editingPartsTicket}
        isOpen={!!editingPartsTicket}
        onClose={() => setEditingPartsTicket(null)}
      />

      {/* Android Native Kotlin & Jetpack Compose Modal */}
      <AndroidNativeViewerModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
};

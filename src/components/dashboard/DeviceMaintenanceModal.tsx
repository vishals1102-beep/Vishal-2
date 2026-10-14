import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  BellRing, 
  CalendarClock, 
  Wrench, 
  Sparkles, 
  Cpu, 
  BatteryCharging, 
  Smartphone, 
  Send, 
  Copy, 
  Check, 
  X,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { Customer, RepairTicket, DeviceMaintenanceSchedule } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  ServiceCategory, 
  CalculatedDeviceHealth, 
  getCategoryDetails, 
  detectServiceCategory, 
  parseDateString, 
  formatDateString, 
  addDays, 
  generateWhatsAppReminder 
} from '../../utils/maintenanceCalculator';

interface DeviceMaintenanceModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  initialTicketId?: string;
}

export const DeviceMaintenanceModal: React.FC<DeviceMaintenanceModalProps> = ({
  customer,
  isOpen,
  onClose,
  initialTicketId
}) => {
  const { 
    tickets, 
    currentTech, 
    addNotification, 
    deviceMaintenanceSchedules, 
    saveDeviceMaintenanceSchedule 
  } = useApp();

  // Find tickets for this customer
  const customerTickets = tickets.filter(
    t => t.customerId === customer.id || 
    (t.customerMobile && customer.mobileNumber && t.customerMobile.replace(/\D/g, '').endsWith(customer.mobileNumber.replace(/\D/g, '').slice(-10)))
  );

  // Selected device ticket or custom mode
  const [selectedTicketId, setSelectedTicketId] = useState<string>(() => {
    if (initialTicketId) return initialTicketId;
    return customerTickets[0]?.id || 'custom';
  });

  const selectedTicket = customerTickets.find(t => t.id === selectedTicketId);

  // Custom device fields if no ticket or custom mode
  const [customBrand, setCustomBrand] = useState<string>('Apple iPhone');
  const [customModel, setCustomModel] = useState<string>('iPhone 15 Pro');
  
  // Date and parameters state
  const [serviceDateStr, setServiceDateStr] = useState<string>('2026-09-20');
  const [warrantyDays, setWarrantyDays] = useState<number>(90);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('screen');
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(30);
  const [customNotes, setCustomNotes] = useState<string>('');

  // UI feedback states
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Load existing schedule or initialize from selected ticket
  useEffect(() => {
    if (selectedTicket) {
      setCustomBrand(selectedTicket.deviceBrand);
      setCustomModel(selectedTicket.deviceModel);
      
      const repDate = selectedTicket.completedAt || selectedTicket.deliveredAt || selectedTicket.createdAt;
      const d = parseDateString(repDate);
      const iso = d.toISOString().split('T')[0];
      setServiceDateStr(iso);
      
      setWarrantyDays(selectedTicket.warrantyPeriodDays || 60);
      const detected = detectServiceCategory(selectedTicket);
      setServiceCategory(detected);
      setCustomIntervalDays(getCategoryDetails(detected).defaultIntervalDays);
      setCustomNotes(selectedTicket.problemDescription || '');
    } else {
      // Default to today
      setServiceDateStr(new Date().toISOString().split('T')[0]);
      setWarrantyDays(90);
      setServiceCategory('screen');
      setCustomIntervalDays(30);
    }

    // Check if there is an existing saved schedule
    const existing = deviceMaintenanceSchedules.find(
      s => s.customerId === customer.id && (selectedTicket ? s.ticketId === selectedTicket.id : s.deviceModel === customModel)
    );
    if (existing) {
      setWarrantyDays(existing.warrantyPeriodDays);
      setServiceCategory(existing.serviceCategory);
      setCustomIntervalDays(existing.maintenanceIntervalDays);
      if (existing.notes) setCustomNotes(existing.notes);
    }
  }, [selectedTicketId, customer.id]);

  if (!isOpen) return null;

  // --- Calculations ---
  const serviceDateObj = parseDateString(serviceDateStr);
  const today = new Date();

  // 1. Warranty calculation
  const warrantyExpiryObj = addDays(serviceDateObj, warrantyDays);
  const warrantyExpiryStr = formatDateString(warrantyExpiryObj);
  const warrantyDaysRemaining = Math.ceil((warrantyExpiryObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let warrantyStatus: 'expired' | 'expiring_today' | 'expiring_soon' | 'active' = 'active';
  if (warrantyDaysRemaining < 0) warrantyStatus = 'expired';
  else if (warrantyDaysRemaining === 0) warrantyStatus = 'expiring_today';
  else if (warrantyDaysRemaining <= 7) warrantyStatus = 'expiring_soon';

  const warrantyPercentageUsed = Math.min(
    100,
    Math.max(0, Math.round(((warrantyDays - warrantyDaysRemaining) / warrantyDays) * 100))
  );

  // 2. Maintenance calculation
  const categoryMeta = getCategoryDetails(serviceCategory);
  const maintenanceDueObj = addDays(serviceDateObj, customIntervalDays);
  const maintenanceDueStr = formatDateString(maintenanceDueObj);
  const maintenanceDaysRemaining = Math.ceil((maintenanceDueObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let maintenanceStatus: 'overdue' | 'due_today' | 'due_soon' | 'upcoming' = 'upcoming';
  if (maintenanceDaysRemaining < 0) maintenanceStatus = 'overdue';
  else if (maintenanceDaysRemaining === 0) maintenanceStatus = 'due_today';
  else if (maintenanceDaysRemaining <= 7) maintenanceStatus = 'due_soon';

  // Construct device object for WhatsApp generator
  const activeDeviceData: CalculatedDeviceHealth = {
    ticketId: selectedTicket?.id,
    deviceBrand: selectedTicket ? selectedTicket.deviceBrand : customBrand,
    deviceModel: selectedTicket ? selectedTicket.deviceModel : customModel,
    repairDate: formatDateString(serviceDateObj),
    warrantyPeriodDays: warrantyDays,
    warrantyExpiryDate: warrantyExpiryStr,
    warrantyDaysRemaining,
    warrantyStatus,
    warrantyStatusText: warrantyDaysRemaining < 0 ? `Expired ${Math.abs(warrantyDaysRemaining)}d ago` : `${warrantyDaysRemaining} days remaining`,
    serviceCategory,
    serviceCategoryLabel: categoryMeta.label,
    recommendedIntervalDays: customIntervalDays,
    maintenanceDueDate: maintenanceDueStr,
    maintenanceDaysRemaining,
    maintenanceStatus,
    maintenanceStatusText: maintenanceDaysRemaining < 0 ? `Overdue by ${Math.abs(maintenanceDaysRemaining)}d` : `${maintenanceDaysRemaining} days until due`,
    recommendedChecklist: categoryMeta.checklist,
    customerGuidance: categoryMeta.guidance,
    urgencyLevel: maintenanceStatus === 'overdue' || warrantyStatus === 'expiring_today' ? 'high' : 'normal'
  };

  const whatsappMessage = generateWhatsAppReminder(
    customer,
    activeDeviceData,
    currentTech.shopName,
    currentTech.mobileNumber
  );

  // Handle Triggering Warranty Notification
  const handleTriggerWarrantyNotification = () => {
    const title = warrantyDaysRemaining <= 0
      ? `🛡️ Warranty Expired: ${customer.fullName} (${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel})`
      : `🛡️ Warranty Expiring Alert: ${customer.fullName} (${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel})`;

    const message = warrantyDaysRemaining <= 0
      ? `${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel} warranty expired on ${warrantyExpiryStr}. Inform customer about paid maintenance & battery/touch wellness check.`
      : `${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel} warranty expires in ${warrantyDaysRemaining} days (${warrantyExpiryStr}). Prompt customer for free final checkup.`;

    addNotification({
      title,
      message,
      type: 'warranty',
      actionRoute: '/dashboard/customers'
    });

    saveDeviceMaintenanceSchedule({
      id: selectedTicket ? `SCHED-${selectedTicket.id}` : `SCHED-${customer.id}-${Date.now()}`,
      customerId: customer.id,
      ticketId: selectedTicket?.id,
      customerName: customer.fullName,
      customerMobile: customer.mobileNumber,
      deviceBrand: activeDeviceData.deviceBrand,
      deviceModel: activeDeviceData.deviceModel,
      serviceCategory,
      serviceName: categoryMeta.label,
      repairDate: formatDateString(serviceDateObj),
      warrantyPeriodDays: warrantyDays,
      warrantyExpiryDate: warrantyExpiryStr,
      maintenanceIntervalDays: customIntervalDays,
      maintenanceDueDate: maintenanceDueStr,
      status: 'notified',
      lastNotifiedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      notes: customNotes
    });

    setNotificationSuccess(`Warranty alert successfully triggered and dispatched to Workshop Action Center!`);
    setTimeout(() => setNotificationSuccess(null), 3000);
  };

  // Handle Triggering Follow-up Maintenance Notification
  const handleTriggerMaintenanceNotification = () => {
    const title = maintenanceDaysRemaining < 0
      ? `🚨 Maintenance Overdue: ${customer.fullName} (${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel})`
      : `🔧 Follow-up Checkup Due: ${customer.fullName} (${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel})`;

    const message = maintenanceDaysRemaining < 0
      ? `Follow-up ${categoryMeta.label} for ${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel} was due on ${maintenanceDueStr} (${Math.abs(maintenanceDaysRemaining)} days overdue). Reach out to Sunil/Customer via WhatsApp.`
      : `Scheduled ${categoryMeta.label} for ${activeDeviceData.deviceBrand} ${activeDeviceData.deviceModel} is due on ${maintenanceDueStr} (${maintenanceDaysRemaining} days remaining).`;

    addNotification({
      title,
      message,
      type: 'repair',
      actionRoute: '/dashboard/customers'
    });

    saveDeviceMaintenanceSchedule({
      id: selectedTicket ? `SCHED-${selectedTicket.id}` : `SCHED-${customer.id}-${Date.now()}`,
      customerId: customer.id,
      ticketId: selectedTicket?.id,
      customerName: customer.fullName,
      customerMobile: customer.mobileNumber,
      deviceBrand: activeDeviceData.deviceBrand,
      deviceModel: activeDeviceData.deviceModel,
      serviceCategory,
      serviceName: categoryMeta.label,
      repairDate: formatDateString(serviceDateObj),
      warrantyPeriodDays: warrantyDays,
      warrantyExpiryDate: warrantyExpiryStr,
      maintenanceIntervalDays: customIntervalDays,
      maintenanceDueDate: maintenanceDueStr,
      status: 'notified',
      lastNotifiedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      notes: customNotes
    });

    setNotificationSuccess(`Maintenance alert successfully triggered and added to Workshop Notification Center!`);
    setTimeout(() => setNotificationSuccess(null), 3000);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const rawNumber = customer.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-white/10 text-sky-200">
                <CalendarClock className="w-5 h-5" />
              </span>
              <h2 className="font-heading font-bold text-lg text-white">
                Device Maintenance & Warranty Intelligence Calculator
              </h2>
            </div>
            <p className="text-xs text-sky-100/90">
              Customer: <strong className="text-white">{customer.fullName}</strong> ({customer.mobileNumber}) • Automatic follow-up forecasting & alerts
            </p>
          </div>

          <button
            data-testid="btn-close-maintenance-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Notification Alert Banner */}
          {notificationSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notificationSuccess}</span>
            </div>
          )}

          {/* Device Selection Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-600" />
                Select Customer Device:
              </span>
              <span className="text-[11px] text-slate-500">
                {customerTickets.length} repair job{customerTickets.length === 1 ? '' : 's'} on record
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {customerTickets.map(t => (
                <button
                  key={t.id}
                  type="button"
                  data-testid={`btn-select-device-${t.id}`}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedTicketId === t.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t.deviceBrand} {t.deviceModel}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedTicketId === t.id ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t.id}
                  </span>
                </button>
              ))}

              <button
                type="button"
                data-testid="btn-select-custom-device"
                onClick={() => setSelectedTicketId('custom')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  selectedTicketId === 'custom'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>+ Custom Device Intake</span>
              </button>
            </div>

            {selectedTicketId === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Device Brand</label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="e.g. Apple, Samsung, OnePlus"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Device Model</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. iPhone 15, Galaxy S24 Ultra"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reference Date Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Service / Repair Date
              </label>
              <input
                type="date"
                value={serviceDateStr}
                onChange={(e) => setServiceDateStr(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Device Under Inspection
              </label>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 truncate">
                {activeDeviceData.deviceBrand} {activeDeviceData.deviceModel}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Current Local Date
              </label>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
                {formatDateString(today)}
              </div>
            </div>
          </div>

          {/* SECTION 1: Warranty Expiration Calculator Card */}
          <div className="bg-white rounded-2xl border-2 border-indigo-100 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-50 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  warrantyStatus === 'expired' ? 'bg-rose-100 text-rose-700' :
                  warrantyStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    1. Warranty Expiration Calculator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Computes expiration countdown and triggers workshop warranty alert
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  warrantyStatus === 'expired' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  warrantyStatus === 'expiring_today' ? 'bg-rose-600 text-white animate-pulse' :
                  warrantyStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {warrantyStatus === 'expired' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {warrantyStatus === 'expiring_soon' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                  {warrantyStatus === 'active' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{activeDeviceData.warrantyStatusText}</span>
                </span>
              </div>
            </div>

            {/* Warranty Period Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Warranty Coverage Period:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: '15 Days', val: 15 },
                  { label: '30 Days', val: 30 },
                  { label: '60 Days', val: 60 },
                  { label: '90 Days', val: 90 },
                  { label: '180 Days (6 Mo)', val: 180 },
                  { label: '365 Days (1 Yr)', val: 365 }
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setWarrantyDays(p.val)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold font-mono transition-all border ${
                      warrantyDays === p.val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Warranty Visual Banner */}
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Calculated Expiration Date:</span>
                  <strong className="font-heading text-sm text-indigo-950">{warrantyExpiryStr}</strong>
                  <span className="text-[11px] text-indigo-700 block">
                    ({warrantyDays} days coverage from {formatDateString(serviceDateObj)})
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Coverage Elapsed:</span>
                  <span className="font-mono font-bold text-xs text-indigo-900">
                    {warrantyPercentageUsed}% of warranty time used
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    warrantyPercentageUsed >= 100 ? 'bg-rose-500' :
                    warrantyPercentageUsed >= 85 ? 'bg-amber-500' :
                    'bg-indigo-600'
                  }`}
                  style={{ width: `${warrantyPercentageUsed}%` }}
                />
              </div>
            </div>

            {/* Trigger Warranty Notification Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Pushes a high-priority alert to your Workshop Bell notification center
              </span>
              <button
                type="button"
                data-testid="btn-trigger-warranty-alert"
                onClick={handleTriggerWarrantyNotification}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Trigger Warranty Alert Notification</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Follow-up Maintenance Schedule Calculator */}
          <div className="bg-white rounded-2xl border-2 border-sky-100 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  maintenanceStatus === 'overdue' ? 'bg-rose-100 text-rose-700' :
                  maintenanceStatus === 'due_soon' ? 'bg-amber-100 text-amber-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    2. Follow-Up Maintenance Due Calculator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Calculates next service interval & generates preventative technician checklist
                  </p>
                </div>
              </div>

              {/* Maintenance Status Badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  maintenanceStatus === 'overdue' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  maintenanceStatus === 'due_today' ? 'bg-rose-600 text-white animate-pulse' :
                  maintenanceStatus === 'due_soon' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {maintenanceStatus === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />}
                  {maintenanceStatus === 'due_soon' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                  {maintenanceStatus === 'upcoming' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                  <span>{activeDeviceData.maintenanceStatusText}</span>
                </span>
              </div>
            </div>

            {/* Maintenance Category Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Service Repair Category & Auto-Recommended Interval:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'screen', label: '📱 Display & Seal (30d)', defaultDays: 30 },
                  { id: 'battery', label: '🔋 Battery Diagnostic (90d)', defaultDays: 90 },
                  { id: 'charging', label: '⚡ Port & Fast Charge (60d)', defaultDays: 60 },
                  { id: 'motherboard', label: '🔬 Board / Liquid Check (21d)', defaultDays: 21 },
                  { id: 'general', label: '🛠️ General Tune-Up (120d)', defaultDays: 120 },
                  { id: 'custom', label: '⚙️ Custom Interval', defaultDays: 45 }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setServiceCategory(cat.id as ServiceCategory);
                      setCustomIntervalDays(cat.defaultDays);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      serviceCategory === cat.id
                        ? 'bg-sky-50 text-sky-900 border-sky-400 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Interval Slider */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Adjust Follow-up Maintenance Interval:</span>
                <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  {customIntervalDays} Days Interval
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="365"
                step="1"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(parseInt(e.target.value) || 30)}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Week (7d)</span>
                <span>1 Month (30d)</span>
                <span>3 Months (90d)</span>
                <span>6 Months (180d)</span>
                <span>1 Year (365d)</span>
              </div>
            </div>

            {/* Calculated Due Date & Technician Checklist */}
            <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Recommended Next Service Due:</span>
                  <strong className="font-heading text-sm text-sky-950">{maintenanceDueStr}</strong>
                  <span className="text-[11px] text-sky-700 block">
                    {activeDeviceData.maintenanceStatusText}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Category:</span>
                  <span className="text-xs font-bold text-slate-800">{categoryMeta.label}</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="pt-2 border-t border-sky-200/80">
                <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  Recommended Complimentary Service Checklist:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categoryMeta.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-white/80 p-1.5 rounded-lg border border-sky-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trigger Maintenance Notification Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Creates an actionable reminder in Workshop Action Center
              </span>
              <button
                type="button"
                data-testid="btn-trigger-maintenance-alert"
                onClick={handleTriggerMaintenanceNotification}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Trigger Maintenance Due Notification</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: WhatsApp Customer Reminder Dispatcher */}
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-emerald-950">
                    3. Direct WhatsApp Customer Reminder
                  </h3>
                  <p className="text-[11px] text-emerald-800">
                    Automated polite reminder dispatch to {customer.fullName} ({customer.whatsappNumber})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  data-testid="btn-send-whatsapp-maintenance-reminder"
                  onClick={handleSendWhatsApp}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="bg-white p-3 rounded-xl border border-emerald-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs">
              {whatsappMessage}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Calculations auto-save to customer device history and survive session refresh.</span>
          </div>

          <button
            type="button"
            data-testid="btn-done-maintenance-modal"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Done & Return to Customers
          </button>
        </div>

      </div>
    </div>
  );
};

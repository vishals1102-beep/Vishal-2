import { Customer, RepairTicket, DeviceMaintenanceSchedule } from '../types';

export type ServiceCategory = 'screen' | 'battery' | 'charging' | 'motherboard' | 'general' | 'custom';

export interface CalculatedDeviceHealth {
  ticketId?: string;
  deviceBrand: string;
  deviceModel: string;
  repairDate: string;
  problemDescription?: string;
  partsUsed?: string[];
  
  // Warranty calculations
  warrantyPeriodDays: number;
  warrantyExpiryDate: string;
  warrantyDaysRemaining: number;
  warrantyStatus: 'expired' | 'expiring_today' | 'expiring_soon' | 'active';
  warrantyStatusText: string;
  
  // Follow-up Maintenance calculations
  serviceCategory: ServiceCategory;
  serviceCategoryLabel: string;
  recommendedIntervalDays: number;
  maintenanceDueDate: string;
  maintenanceDaysRemaining: number;
  maintenanceStatus: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  maintenanceStatusText: string;
  recommendedChecklist: string[];
  customerGuidance: string;
  
  // Overall Priority
  urgencyLevel: 'high' | 'medium' | 'normal';
}

export interface CustomerDeviceSummary {
  customerId: string;
  customerName: string;
  devices: CalculatedDeviceHealth[];
  hasExpiringWarranty: boolean; // expiring in <= 7 days (or expired)
  hasWarrantyDueSoon: boolean; // expiring in 0-7 days
  hasMaintenanceDue: boolean; // due in <= 7 days or overdue
  urgentDevicesCount: number;
  primaryDevice?: CalculatedDeviceHealth;
  statusBadge: {
    label: string;
    type: 'danger' | 'warning' | 'info' | 'success';
  };
}

/**
 * Robust date parsing supporting "18 Sep 2026", "2026-09-18", "18/09/2026"
 */
export function parseDateString(dateStr?: string): Date {
  if (!dateStr) return new Date();
  
  const trimmed = dateStr.trim();
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;
  
  // Format: "18 Sep 2026"
  const tokens = trimmed.split(/[\s,/-]+/);
  if (tokens.length >= 3) {
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    // Check if second token is month word
    const mKey = tokens[1].toLowerCase().slice(0, 3);
    if (monthMap[mKey] !== undefined) {
      const day = parseInt(tokens[0], 10);
      const year = parseInt(tokens[2], 10);
      if (!isNaN(day) && !isNaN(year)) {
        return new Date(year, monthMap[mKey], day);
      }
    }
  }

  return new Date();
}

/**
 * Format a Date object to "01 Oct 2026"
 */
export function formatDateString(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Add days to a given date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Auto-detect repair service category from parts used and description
 */
export function detectServiceCategory(ticket: Partial<RepairTicket>): ServiceCategory {
  const text = `${ticket.problemDescription || ''} ${(ticket.partsUsed || []).join(' ')} ${ticket.repairDetailsNotes || ''}`.toLowerCase();
  
  if (text.includes('battery') || text.includes('drain') || text.includes('mah') || text.includes('swollen')) {
    return 'battery';
  }
  if (text.includes('screen') || text.includes('oled') || text.includes('display') || text.includes('touch') || text.includes('glass') || text.includes('combo')) {
    return 'screen';
  }
  if (text.includes('charging') || text.includes('port') || text.includes('flex') || text.includes('type-c') || text.includes('usb') || text.includes('sub-board')) {
    return 'charging';
  }
  if (text.includes('water') || text.includes('liquid') || text.includes('moisture') || text.includes('corrosion') || text.includes('ic') || text.includes('short')) {
    return 'motherboard';
  }
  return 'general';
}

/**
 * Get category metadata (default interval, title, checklist, guidance)
 */
export function getCategoryDetails(category: ServiceCategory) {
  switch (category) {
    case 'screen':
      return {
        label: 'Display & Touch Screen Service',
        defaultIntervalDays: 30,
        checklist: [
          'Inspect IP68/B-7000 waterproof frame adhesive curing',
          'Test multi-touch digitizer responsiveness & corner latency',
          'TrueTone & ambient light sensor calibration verification',
          'Complimentary ultrasonic speaker mesh acoustic clean'
        ],
        guidance: 'Recommended at 30 days to ensure adhesive seal has set completely and digitizer remains glitch-free.'
      };
    case 'battery':
      return {
        label: 'Battery Health & Thermal Diagnostic',
        defaultIntervalDays: 90,
        checklist: [
          'Analyze battery discharge curve & cycle count degradation',
          'Perform thermal infrared scan during fast-charging load',
          'Inspect battery pouch for microscopic gas swelling or frame push',
          'Calibrate fuel gauge BMS IC percentage curve'
        ],
        guidance: 'Recommended at 90 days (3 months) to verify lithium cell stability and ensure zero thermal throttling.'
      };
    case 'charging':
      return {
        label: 'Charging Port & Flex Voltage Maintenance',
        defaultIntervalDays: 60,
        checklist: [
          'Ultrasonic cleaning of Type-C / Lightning port pocket lint',
          'Microscopic inspection of connector pin gold plating oxidation',
          'Test 45W/65W Power Delivery fast-charge handshake stability',
          'Verify microphone acoustic membrane clarity'
        ],
        guidance: 'Recommended at 60 days to clear pocket lint and verify fast charge protocol without heat.'
      };
    case 'motherboard':
      return {
        label: 'Motherboard IC & Post-Liquid Checkup',
        defaultIntervalDays: 21,
        checklist: [
          'Secondary microscope inspection for latent mineral salts / corrosion',
          'Thermal paste curing & shielding plate ground inspection',
          'VREG and PMIC secondary power rail impedance measurements',
          'RF modem signal reception & Wi-Fi antenna continuity check'
        ],
        guidance: 'Recommended at 21 days for post-liquid or IC repairs to catch residual oxidation early.'
      };
    case 'custom':
      return {
        label: 'Custom Scheduled Workshop Checkup',
        defaultIntervalDays: 45,
        checklist: [
          'Comprehensive hardware diagnostic & sensor testing',
          'Port cleaning & acoustic chamber inspection',
          'Fast charging & battery health evaluation'
        ],
        guidance: 'Customized maintenance schedule tailored specifically for this device.'
      };
    case 'general':
    default:
      return {
        label: 'Routine Preventative Workshop Tune-Up',
        defaultIntervalDays: 120,
        checklist: [
          'Earpiece & loudspeaker ultrasonic acoustic dust clearing',
          'Chassis frame alignment & external screw tightness verification',
          'Operating system cache, thermal governor & storage check',
          'Tempered glass & protective bumper condition review'
        ],
        guidance: 'Preventative quarterly checkup to extend device longevity and maintain peak speed.'
      };
  }
}

/**
 * Calculate comprehensive health, warranty expiration, and maintenance due for a single ticket/device
 */
export function calculateDeviceHealth(
  ticket: RepairTicket,
  customSchedule?: DeviceMaintenanceSchedule,
  referenceDate: Date = new Date()
): CalculatedDeviceHealth {
  const repairDateObj = parseDateString(ticket.completedAt || ticket.deliveredAt || ticket.createdAt);
  const repairDateStr = formatDateString(repairDateObj);
  
  // 1. Warranty Calculation
  const warrantyDays = customSchedule?.warrantyPeriodDays ?? (ticket.warrantyPeriodDays || 30);
  let warrantyExpiryObj: Date;
  
  if (customSchedule?.warrantyExpiryDate) {
    warrantyExpiryObj = parseDateString(customSchedule.warrantyExpiryDate);
  } else if (ticket.warrantyExpiryDate) {
    warrantyExpiryObj = parseDateString(ticket.warrantyExpiryDate);
  } else {
    warrantyExpiryObj = addDays(repairDateObj, warrantyDays);
  }
  
  const warrantyExpiryStr = formatDateString(warrantyExpiryObj);
  const diffTimeWarranty = warrantyExpiryObj.getTime() - referenceDate.getTime();
  const warrantyDaysRemaining = Math.ceil(diffTimeWarranty / (1000 * 60 * 60 * 24));
  
  let warrantyStatus: CalculatedDeviceHealth['warrantyStatus'] = 'active';
  let warrantyStatusText = `Active (${warrantyDaysRemaining} days remaining)`;
  
  if (warrantyDaysRemaining < 0) {
    warrantyStatus = 'expired';
    warrantyStatusText = `Expired ${Math.abs(warrantyDaysRemaining)} days ago`;
  } else if (warrantyDaysRemaining === 0) {
    warrantyStatus = 'expiring_today';
    warrantyStatusText = 'Expires Today!';
  } else if (warrantyDaysRemaining <= 7) {
    warrantyStatus = 'expiring_soon';
    warrantyStatusText = `Expires in ${warrantyDaysRemaining} days`;
  }

  // 2. Maintenance Calculation
  const detectedCategory = customSchedule?.serviceCategory ?? detectServiceCategory(ticket);
  const categoryMeta = getCategoryDetails(detectedCategory);
  const maintenanceInterval = customSchedule?.maintenanceIntervalDays ?? categoryMeta.defaultIntervalDays;
  
  let maintenanceDueObj: Date;
  if (customSchedule?.maintenanceDueDate) {
    maintenanceDueObj = parseDateString(customSchedule.maintenanceDueDate);
  } else {
    maintenanceDueObj = addDays(repairDateObj, maintenanceInterval);
  }
  
  const maintenanceDueStr = formatDateString(maintenanceDueObj);
  const diffTimeMaint = maintenanceDueObj.getTime() - referenceDate.getTime();
  const maintenanceDaysRemaining = Math.ceil(diffTimeMaint / (1000 * 60 * 60 * 24));
  
  let maintenanceStatus: CalculatedDeviceHealth['maintenanceStatus'] = 'upcoming';
  let maintenanceStatusText = `Due in ${maintenanceDaysRemaining} days`;
  
  if (maintenanceDaysRemaining < 0) {
    maintenanceStatus = 'overdue';
    maintenanceStatusText = `Overdue by ${Math.abs(maintenanceDaysRemaining)} days`;
  } else if (maintenanceDaysRemaining === 0) {
    maintenanceStatus = 'due_today';
    maintenanceStatusText = 'Due for Service Today!';
  } else if (maintenanceDaysRemaining <= 7) {
    maintenanceStatus = 'due_soon';
    maintenanceStatusText = `Due in ${maintenanceDaysRemaining} days`;
  }

  // 3. Priority level
  let urgencyLevel: CalculatedDeviceHealth['urgencyLevel'] = 'normal';
  if (maintenanceStatus === 'overdue' || maintenanceStatus === 'due_today' || warrantyStatus === 'expiring_today' || (warrantyStatus === 'expiring_soon' && warrantyDaysRemaining <= 3)) {
    urgencyLevel = 'high';
  } else if (maintenanceStatus === 'due_soon' || warrantyStatus === 'expiring_soon') {
    urgencyLevel = 'medium';
  }

  return {
    ticketId: ticket.id,
    deviceBrand: ticket.deviceBrand,
    deviceModel: ticket.deviceModel,
    repairDate: repairDateStr,
    problemDescription: ticket.problemDescription,
    partsUsed: ticket.partsUsed,
    
    warrantyPeriodDays: warrantyDays,
    warrantyExpiryDate: warrantyExpiryStr,
    warrantyDaysRemaining,
    warrantyStatus,
    warrantyStatusText,
    
    serviceCategory: detectedCategory,
    serviceCategoryLabel: categoryMeta.label,
    recommendedIntervalDays: maintenanceInterval,
    maintenanceDueDate: maintenanceDueStr,
    maintenanceDaysRemaining,
    maintenanceStatus,
    maintenanceStatusText,
    recommendedChecklist: categoryMeta.checklist,
    customerGuidance: categoryMeta.guidance,
    
    urgencyLevel
  };
}

/**
 * Aggregate summary for a single customer across all their devices
 */
export function calculateCustomerSummary(
  customer: Customer,
  allTickets: RepairTicket[],
  customSchedules: DeviceMaintenanceSchedule[] = [],
  referenceDate: Date = new Date()
): CustomerDeviceSummary {
  // Find all tickets for this customer
  const custTickets = allTickets.filter(
    t => t.customerId === customer.id || 
    (t.customerMobile && customer.mobileNumber && t.customerMobile.replace(/\D/g, '').endsWith(customer.mobileNumber.replace(/\D/g, '').slice(-10)))
  );
  
  // Calculate health for each ticket
  const devices: CalculatedDeviceHealth[] = custTickets.map(t => {
    const custom = customSchedules.find(s => s.ticketId === t.id || (s.customerId === customer.id && s.deviceModel === t.deviceModel));
    return calculateDeviceHealth(t, custom, referenceDate);
  });
  
  // Check if customer has devices with urgent warranty or maintenance
  const hasWarrantyDueSoon = devices.some(d => d.warrantyStatus === 'expiring_soon' || d.warrantyStatus === 'expiring_today');
  const hasExpiringWarranty = devices.some(d => d.warrantyStatus === 'expiring_soon' || d.warrantyStatus === 'expiring_today' || d.warrantyStatus === 'expired');
  const hasMaintenanceDue = devices.some(d => d.maintenanceStatus === 'due_soon' || d.maintenanceStatus === 'due_today' || d.maintenanceStatus === 'overdue');
  
  const urgentCount = devices.filter(d => d.urgencyLevel === 'high' || d.urgencyLevel === 'medium').length;
  
  // Sort devices so most urgent appears first
  const sortedDevices = [...devices].sort((a, b) => {
    const order = { high: 0, medium: 1, normal: 2 };
    return order[a.urgencyLevel] - order[b.urgencyLevel];
  });
  
  const primaryDevice = sortedDevices[0];
  
  // Status badge determine
  let statusBadge: CustomerDeviceSummary['statusBadge'] = {
    label: 'All Devices Healthy',
    type: 'success'
  };
  
  if (devices.length === 0) {
    statusBadge = {
      label: 'No Devices Under Watch',
      type: 'info'
    };
  } else if (devices.some(d => d.maintenanceStatus === 'overdue')) {
    const overdueDev = devices.find(d => d.maintenanceStatus === 'overdue');
    statusBadge = {
      label: `Maintenance Overdue (${overdueDev?.deviceModel})`,
      type: 'danger'
    };
  } else if (hasWarrantyDueSoon) {
    const expiringDev = devices.find(d => d.warrantyStatus === 'expiring_soon' || d.warrantyStatus === 'expiring_today');
    statusBadge = {
      label: `Warranty Expiring (${expiringDev?.warrantyDaysRemaining}d left)`,
      type: 'warning'
    };
  } else if (hasMaintenanceDue) {
    const dueDev = devices.find(d => d.maintenanceStatus === 'due_soon' || d.maintenanceStatus === 'due_today');
    statusBadge = {
      label: `Service Due Soon (${dueDev?.deviceModel})`,
      type: 'warning'
    };
  } else if (devices.some(d => d.warrantyStatus === 'expired')) {
    statusBadge = {
      label: 'Warranty Expired (Service Ready)',
      type: 'info'
    };
  }

  return {
    customerId: customer.id,
    customerName: customer.fullName,
    devices: sortedDevices,
    hasExpiringWarranty,
    hasWarrantyDueSoon,
    hasMaintenanceDue,
    urgentDevicesCount: urgentCount,
    primaryDevice,
    statusBadge
  };
}

/**
 * Generate polite WhatsApp reminder message
 */
export function generateWhatsAppReminder(
  customer: Customer,
  device: CalculatedDeviceHealth,
  shopName: string = 'QuickFix Mobile Workshop',
  shopPhone: string = '+91 95413 71468'
): string {
  const isWarranty = device.warrantyDaysRemaining <= 7 && device.warrantyDaysRemaining >= 0;
  const isMaintenance = device.maintenanceStatus === 'overdue' || device.maintenanceStatus === 'due_today' || device.maintenanceStatus === 'due_soon';
  
  let header = `Namaste ${customer.fullName} ji 🙏\nThis is a courtesy service reminder from *${shopName}*.`;
  let deviceDetails = `📱 *Device:* ${device.deviceBrand} ${device.deviceModel}\n🗓️ *Last Service Date:* ${device.repairDate}`;
  
  let notificationBody = '';
  
  if (isWarranty && isMaintenance) {
    notificationBody = `⚠️ *Action Recommended:*\n1. Your repair warranty is expiring on *${device.warrantyExpiryDate}* (${device.warrantyDaysRemaining} days remaining).\n2. Your device is also due for its scheduled *${device.serviceCategoryLabel}* (Due: ${device.maintenanceDueDate}).\n\nPlease visit our workshop for a *free complimentary checkup & inspection* before warranty concludes.`;
  } else if (isWarranty) {
    notificationBody = `🛡️ *Warranty Notice:*\nYour repair warranty for ${device.deviceBrand} ${device.deviceModel} is scheduled to expire on *${device.warrantyExpiryDate}* (${device.warrantyDaysRemaining === 0 ? 'Today' : `in ${device.warrantyDaysRemaining} days`}).\n\nIf you are experiencing any touch latency, display anomalies, or battery drops, please bring the device to our workshop for a free zero-cost inspection while full warranty coverage is active.`;
  } else {
    notificationBody = `🔧 *Follow-up Maintenance Due:*\nYour device is due for its periodic *${device.serviceCategoryLabel}* (Scheduled: *${device.maintenanceDueDate}*).\n\n*Included in our complimentary checkup:*\n${device.recommendedChecklist.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nRegular checkups prevent unexpected breakdowns and keep your device performing like new!`;
  }
  
  let footer = `📍 *Workshop Support:* ${shopPhone}\nThank you for choosing ${shopName}! We look forward to assisting you.`;
  
  return `${header}\n\n${deviceDetails}\n\n${notificationBody}\n\n${footer}`;
}

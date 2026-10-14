export type UserRole = 'technician' | 'admin' | 'employee';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type RepairStatus = 
  | 'received' 
  | 'in_diagnostic' 
  | 'in_repair' 
  | 'waiting_parts' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'partial';
export type PaymentMode = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer';

export interface TechnicianProfile {
  id: string; // e.g. QF-TECH-4821
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  about: string;
  shopName: string;
  state: string;
  district: string;
  city: string;
  shopAddress: string;
  completeAddress: string;
  workingHours: string;
  experienceYears: number;
  brandsWorkedOn: string[];
  servicesProvided: string[];
  availableTools: string[];
  technicianPhoto: string;
  shopPhoto: string;
  idDocumentType: 'Aadhaar Card' | 'PAN Card' | 'Trade License' | 'GST Certificate';
  idDocumentUrl: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  joinedDate: string;
  rating: number;
  totalRepairsCompleted: number;
  // Own UPI Barcode / QR details configured on Visiting Card (VC)
  upiId?: string;
  upiPayeeName?: string;
  upiQrImageUrl?: string;
  upiBarcodeType?: 'qr' | 'barcode';
  password?: string;
}

export interface Customer {
  id: string;
  technicianId: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  address: string;
  city: string;
  notes?: string;
  createdAt: string;
  totalTicketsCount: number;
  coinsBalance?: number; // Technician-awarded loyalty coins (1 Coin = ₹1)
}

export interface CustomerCoinTransaction {
  id: string; // e.g. COIN-TX-9901
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  amount: number; // positive number
  type: 'AWARDED' | 'REDEEMED';
  reason: string;
  ticketId?: string;
  date: string;
}

export type InventoryCategory = 
  | 'Combo'
  | 'Battery'
  | 'Charging Flex'
  | 'Charging Board'
  | 'Frame'
  | 'Middle'
  | 'Back Panel'
  | 'Full Body'
  | 'Others'
  | 'Screens & Displays'
  | 'Screens' 
  | 'Batteries' 
  | 'Charging Ports' 
  | 'Charging Ports & Flex'
  | 'Motherboard ICs' 
  | 'ICs & Motherboard'
  | 'Camera Modules' 
  | 'Cameras'
  | 'Flex Cables' 
  | 'Back Glass' 
  | 'Back Glass & Housings'
  | 'Speakers & Mics' 
  | 'Tools & Consumables'
  | 'Accessories';

export interface InventoryItem {
  id: string; // e.g. INV-SCR-101
  sku: string; // e.g. SCR-IP13-OLED
  barcode: string; // e.g. 8901004128912
  name: string;
  category: InventoryCategory;
  compatibleBrands?: string[];
  compatibleModels?: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  costPrice: number; // in ₹
  sellingPrice: number; // in ₹
  locationBin: string; // e.g. "Rack A - Bin 3"
  supplierName: string;
  supplierContact?: string;
  supplierPhone?: string;
  lastRestockedAt: string;
  notes?: string;
}

export interface RepairTicket {
  id: string; // e.g. QF-REP-202608-4109
  technicianId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerWhatsapp: string;
  customerAddress: string;
  
  // Device
  deviceBrand: string;
  deviceModel: string;
  imeiSerialNumber: string;
  passcodeLockPattern?: string;
  deviceColor: string;
  
  // Repair
  problemDescription: string;
  beforeRepairPhotos: string[];
  repairDetailsNotes: string;
  partsUsed: string[];
  afterRepairPhotos: string[];
  
  // Financials (in ₹ INR)
  partsCost: number;
  laborCharges: number;
  discount: number;
  taxRate?: number; // e.g. 18 for 18% GST
  taxAmount?: number; // computed tax in ₹
  totalCharges: number;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  
  // Warranty
  warrantyPeriodDays: number;
  warrantyExpiryDate: string;
  warrantyTerms: string;
  
  // Status & Timestamps
  repairStatus: RepairStatus;
  createdAt: string;
  estimatedDelivery: string;
  completedAt?: string;
  deliveredAt?: string;
  
  // Feedback
  customerFeedbackRating?: number; // 1-5
  customerFeedbackComment?: string;
}

export interface WarrantyClaim {
  id: string;
  ticketId: string;
  technicianId: string;
  customerName: string;
  deviceInfo: string;
  claimDate: string;
  issueReported: string;
  status: 'under_inspection' | 'approved_replacement' | 'rejected' | 'repaired';
  resolutionNotes?: string;
}

export interface PartListing {
  id: string;
  technicianId: string;
  technicianName: string;
  technicianCity: string;
  technicianWhatsapp: string;
  title: string;
  brand: string;
  compatibleModels: string[];
  partCategory: string;
  condition: 'Brand New (Original)' | 'OEM Tested' | 'Extracted Original (Used)' | 'Refurbished Grade A';
  price: number;
  quantityAvailable: number;
  photoUrl: string;
  postedDate: string;
  status: 'available' | 'sold';
}

export interface ToolListing {
  id: string;
  technicianId: string;
  technicianName: string;
  technicianShop: string;
  technicianCity: string;
  technicianWhatsapp: string;
  toolName: string;
  category: string;
  brand: string;
  condition: string;
  dailyRentPrice: number;
  securityDeposit: number;
  photoUrl: string;
  isAvailable: boolean;
  specs: string;
}

export interface HelpPostReply {
  id: string;
  authorTechId: string;
  authorName: string;
  authorCity: string;
  isVerified: boolean;
  replyText: string;
  timestamp: string;
  upvotes: number;
  isSolution: boolean;
}

export interface HelpPost {
  id: string;
  authorTechId: string;
  authorName: string;
  authorCity: string;
  deviceBrand: string;
  deviceModel: string;
  title: string;
  problemDetails: string;
  schematicOrPhotoUrl?: string;
  createdAt: string;
  replies: HelpPostReply[];
  tags: string[];
  isResolved: boolean;
}

export interface WhatsAppMessage {
  id: string;
  senderName: string;
  senderTechId: string;
  senderCity: string;
  message: string;
  timestamp: string;
  badge?: string;
}

export interface NotificationItem {
  id: string;
  technicianId: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'repair' | 'warranty' | 'part_inquiry' | 'system' | 'admin_review';
  isRead: boolean;
  actionRoute?: string;
}

export interface DeviceMaintenanceSchedule {
  id: string; // e.g. 'SCHED-CUST-001-01'
  customerId: string;
  ticketId?: string;
  customerName: string;
  customerMobile: string;
  deviceBrand: string;
  deviceModel: string;
  serviceCategory: 'screen' | 'battery' | 'charging' | 'motherboard' | 'general' | 'custom';
  serviceName: string;
  repairDate: string;
  warrantyPeriodDays: number;
  warrantyExpiryDate: string;
  maintenanceIntervalDays: number;
  maintenanceDueDate: string;
  status: 'pending' | 'notified' | 'completed' | 'cancelled';
  lastNotifiedAt?: string;
  notes?: string;
}

export type Technician = TechnicianProfile;

export interface WarrantyPartUpload {
  id: string; // e.g. WPU-2026-8801
  ticketId: string;
  technicianId: string;
  technicianName: string;
  customerName: string;
  deviceModel: string;
  partName: string;
  partCategory: string;
  partBrand: string;
  serialBatchNumber: string;
  supplierName: string;
  claimReason: string;
  technicalRemarks: string;
  customerRemarks: string;
  vendorRmaNotes?: string;
  warrantyStatus: 'approved_free_replacement' | 'bench_repaired' | 'rejected_physical_damage' | 'pending_vendor_credit';
  photos: {
    faultyPartPhoto: string;
    serialBarcodePhoto?: string;
    replacementPartPhoto?: string;
    benchTestingPhoto?: string;
    extraPhotos?: string[];
  };
  uploadTimestamp: string;
  replacementCost: number;
}

export interface AdminProfile {
  name: string;
  mobileNumber: string;
  alternateMobile: string;
  email: string;
  role: 'super_admin';
  isOtpVerified: boolean;
  verifiedAt?: string;
}

export interface Employee {
  id: string; // e.g. EMP-101
  technicianId: string; // workshop tech ID
  fullName: string;
  mobileNumber: string;
  roleTitle: string; // e.g. 'Counter Sales & Dispatch' or 'Junior Technician'
  pin: string; // 4-digit PIN for quick switch
  status: 'active' | 'inactive';
  joinedDate: string;
  totalSalesCount: number;
  totalPartsDebited: number;
}

export interface PartDebitSale {
  id: string; // e.g. DEBIT-202609-0101
  inventoryItemId: string;
  partName: string;
  sku: string;
  quantityDebited: number;
  unitSellingPrice: number;
  totalAmount: number;
  debitedByRole: 'main_user' | 'employee';
  debitedById: string;
  debitedByName: string;
  customerName?: string;
  customerPhone?: string;
  paymentMode: 'Cash' | 'UPI' | 'Card';
  saleRemarks?: string;
  timestamp: string;
}

export interface LowStockReorderItem {
  inventoryItemId: string;
  partName: string;
  sku: string;
  category: InventoryCategory;
  currentStock: number;
  threshold: number;
  orderQuantity: number;
  supplierName: string;
  supplierPhone?: string;
  costPrice: number;
  addedAt: string;
}

export type ActiveStaff = 
  | { type: 'owner'; name: string }
  | { type: 'employee'; employee: Employee };

export type ActiveTab = 
  | 'landing'
  | 'login'
  | 'logout'
  | 'register'
  | 'dashboard'
  | 'qr_scanner'
  | 'inventory'
  | 'employees'
  | 'profile'
  | 'customers'
  | 'add_customer'
  | 'new_repair'
  | 'repair_history'
  | 'warranty'
  | 'warranty_upload'
  | 'warranty_parts_upload'
  | 'payments'
  | 'parts_sharing'
  | 'tools_sharing'
  | 'tech_help'
  | 'whatsapp_group'
  | 'notifications'
  | 'reports'
  | 'admin_verify'
  | 'admin_verification';

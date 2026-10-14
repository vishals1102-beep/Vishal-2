import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  TechnicianProfile, 
  Customer, 
  RepairTicket, 
  WarrantyClaim, 
  PartListing, 
  ToolListing, 
  HelpPost, 
  WhatsAppMessage, 
  NotificationItem, 
  ActiveTab,
  UserRole,
  AdminProfile,
  WarrantyPartUpload,
  InventoryItem,
  CustomerCoinTransaction,
  Employee,
  PartDebitSale,
  LowStockReorderItem,
  ActiveStaff,
  DeviceMaintenanceSchedule
} from '../types';
import { 
  SEEDED_TECHNICIANS, 
  SEEDED_CUSTOMERS, 
  SEEDED_REPAIR_TICKETS, 
  SEEDED_WARRANTY_CLAIMS, 
  SEEDED_PARTS_LISTINGS, 
  SEEDED_TOOLS_LISTINGS, 
  SEEDED_HELP_POSTS, 
  SEEDED_WHATSAPP_MESSAGES, 
  SEEDED_NOTIFICATIONS,
  SEEDED_WARRANTY_PART_UPLOADS,
  SEEDED_INVENTORY,
  SEEDED_COIN_TRANSACTIONS,
  SEEDED_EMPLOYEES,
  SEEDED_PART_DEBIT_SALES
} from '../data/seedData';

interface AppContextType {
  userRole: UserRole;
  currentTech: TechnicianProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  goBack: () => void;
  goHome: () => void;
  canGoBack: boolean;
  technicians: TechnicianProfile[];
  customers: Customer[];
  tickets: RepairTicket[];
  warrantyClaims: WarrantyClaim[];
  warrantyPartUploads: WarrantyPartUpload[];
  inventory: InventoryItem[];
  customerCoinTransactions: CustomerCoinTransaction[];
  partsListings: PartListing[];
  toolsListings: ToolListing[];
  helpPosts: HelpPost[];
  chatMessages: WhatsAppMessage[];
  notifications: NotificationItem[];
  activeInvoiceTicket: RepairTicket | null;
  setActiveInvoiceTicket: (ticket: RepairTicket | null) => void;
  adminUser: AdminProfile;
  adminActiveOtp: string | null;
  gmailActiveOtp: { email: string; otp: string; timestamp: number; userRole?: UserRole } | null;
  
  // Actions
  loginAsDemo: (type: 'verified_tech' | 'pending_tech' | 'admin') => void;
  loginWithCredentials: (role: UserRole, identifier: string, passwordInput?: string) => boolean;
  validateAdminCredentials: (username: string, pass: string, mobile: string) => { success: boolean; message: string };
  generateAdminOtp: (mobile: string, username?: string, pass?: string) => { success: boolean; message: string; otp?: string };
  verifyAdminOtp: (mobile: string, otp: string) => { success: boolean; message: string };
  generateGmailOtp: (email: string, role?: UserRole) => { success: boolean; message: string; otp?: string };
  verifyGmailOtp: (email: string, otp: string, role?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  technicianPassword: string;
  adminPassword: string;
  changePassword: (role: 'technician' | 'admin', currentPassword: string, newPassword: string) => { success: boolean; message: string };
  choosePassword: (role: 'technician' | 'admin', identifier: string, newPassword: string) => { success: boolean; message: string };
  registerTechnician: (newTech: Omit<TechnicianProfile, 'id' | 'joinedDate' | 'rating' | 'totalRepairsCompleted' | 'verificationStatus'>) => TechnicianProfile;
  updateTechnicianProfile: (updates: Partial<TechnicianProfile>) => void;
  adminApproveTech: (techId: string, notes?: string) => void;
  adminRejectTech: (techId: string, notes?: string) => void;
  
  // Ticket Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'technicianId' | 'createdAt' | 'totalTicketsCount'>) => Customer;
  createRepairTicket: (ticketData: Omit<RepairTicket, 'id' | 'technicianId' | 'createdAt'>) => RepairTicket;
  updateTicketStatus: (ticketId: string, newStatus: RepairTicket['repairStatus'], notes?: string, afterPhoto?: string) => void;
  updateTicketPayment: (ticketId: string, paymentStatus: RepairTicket['paymentStatus'], paymentMode: RepairTicket['paymentMode']) => void;
  updateTicketPartsAndLabor: (
    ticketId: string,
    updates: {
      partsUsed: string[];
      partsCost: number;
      laborCharges: number;
      discount?: number;
      taxRate?: number;
      repairDetailsNotes?: string;
    }
  ) => void;
  addAfterRepairPhoto: (ticketId: string, photoUrl: string) => void;
  addCustomerFeedback: (ticketId: string, rating: number, comment: string) => void;
  
  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestockedAt'>) => InventoryItem;
  updateInventoryStock: (id: string, newQuantity: number) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  resetInventoryToZero: () => void;
  seedDefaultInventory: () => void;

  // Employee & Staff Management (Workshop owner vs employees)
  employees: Employee[];
  activeStaff: ActiveStaff;
  setActiveStaff: (staff: ActiveStaff) => void;
  isEmployeeActive: boolean;
  activeEmployeeName: string;
  addEmployee: (emp: Omit<Employee, 'id' | 'technicianId' | 'joinedDate' | 'totalSalesCount' | 'totalPartsDebited'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  switchStaffPersona: (type: 'owner' | 'employee', employeeId?: string, pin?: string) => { success: boolean; message: string };

  // Part Debit on Sale (Employees can only debit parts on sale, cannot edit price/quantity directly)
  partDebitSales: PartDebitSale[];
  debitPartOnSale: (data: { 
    inventoryItemId: string; 
    quantity: number; 
    customerName?: string; 
    customerPhone?: string; 
    paymentMode: 'Cash' | 'UPI' | 'Card'; 
    saleRemarks?: string;
  }) => { success: boolean; message: string; sale?: PartDebitSale };

  // Low Stock & Reorder List (Direct Add & WhatsApp Share)
  reorderList: LowStockReorderItem[];
  addToReorderList: (itemId: string, qty?: number) => void;
  addAllLowStockToReorderList: () => number;
  removeFromReorderList: (itemId: string) => void;
  updateReorderQty: (itemId: string, qty: number) => void;
  clearReorderList: () => void;
  inventorySubTab: 'all' | 'top_sales' | 'dead_stock' | 'auto_order' | 'suggestions';
  setInventorySubTab: (tab: 'all' | 'top_sales' | 'dead_stock' | 'auto_order' | 'suggestions') => void;

  // Customer Loyalty Coins
  awardCustomerCoins: (customerId: string, amount: number, reason: string, ticketId?: string) => { success: boolean; newBalance: number; message: string };
  redeemCustomerCoins: (customerId: string, amount: number, reason: string, ticketId?: string) => { success: boolean; newBalance: number; message: string };

  // QR Code & Device Lookup
  findTicketOrDevice: (query: string) => { 
    ticket?: RepairTicket; 
    customer?: Customer; 
    matchedTechnician?: TechnicianProfile;
    allMatchingTickets: RepairTicket[];
    matchedInventory?: InventoryItem;
    queryUsed: string;
  };
  
  // Warranty Actions
  createWarrantyClaim: (ticketId: string, issueReported: string) => void;
  updateWarrantyClaimStatus: (claimId: string, status: WarrantyClaim['status'], notes?: string) => void;
  addWarrantyPartUpload: (upload: Omit<WarrantyPartUpload, 'id' | 'technicianId' | 'technicianName' | 'uploadTimestamp'>) => WarrantyPartUpload;
  
  // Community Actions
  addPartListing: (part: Omit<PartListing, 'id' | 'technicianId' | 'technicianName' | 'technicianCity' | 'technicianWhatsapp' | 'postedDate' | 'status'>) => void;
  addHelpPost: (title: string, problemDetails: string, deviceBrand: string, deviceModel: string, tags: string[], schematicUrl?: string) => void;
  addHelpReply: (postId: string, replyText: string) => void;
  sendChatMessage: (message: string, badge?: string) => void;
  markNotificationAsRead: (notifId: string) => void;
  addNotification: (notif: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    actionRoute?: string;
    technicianId?: string;
  }) => NotificationItem;

  // Device Follow-up Maintenance & Warranty Schedules
  deviceMaintenanceSchedules: DeviceMaintenanceSchedule[];
  saveDeviceMaintenanceSchedule: (schedule: Omit<DeviceMaintenanceSchedule, 'id'> & { id?: string }) => DeviceMaintenanceSchedule;
  deleteDeviceMaintenanceSchedule: (id: string) => void;
  
  // Utilities
  formatINR: (amount: number) => string;
  maskPhone: (phone: string, isPrivileged?: boolean) => string;
  loadSampleDemoData: () => void;
  resetAllToCleanSlate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fresh App Clean Slate (blank inventory, blank job sales, blank customer, first show login page)
  if (typeof window !== 'undefined' && !localStorage.getItem('qf_fresh_clean_app_v2')) {
    localStorage.removeItem('qf_customers');
    localStorage.removeItem('qf_tickets');
    localStorage.removeItem('qf_inventory');
    localStorage.removeItem('qf_parts');
    localStorage.removeItem('qf_tools');
    localStorage.removeItem('qf_part_debit_sales');
    localStorage.removeItem('qf_employees');
    localStorage.removeItem('qf_warranty');
    localStorage.removeItem('qf_warranty_part_uploads');
    localStorage.removeItem('qf_coin_transactions');
    localStorage.removeItem('qf_notifications');
    localStorage.removeItem('qf_maintenance_schedules');
    localStorage.removeItem('qf_reorder_list');
    localStorage.removeItem('qf_logged_in');
    localStorage.setItem('qf_fresh_clean_app_v2', 'true');
  }

  // Load initial states from localStorage if available
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('qf_userRole') as UserRole) || 'technician';
  });

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => {
    const saved = localStorage.getItem('qf_technicians');
    return saved ? JSON.parse(saved) : SEEDED_TECHNICIANS;
  });

  const [currentTechId, setCurrentTechId] = useState<string>(() => {
    return localStorage.getItem('qf_currentTechId') || 'QF-TECH-4821';
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('qf_logged_in') === 'true';
    return isAuth ? 'dashboard' : 'login';
  });
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>(() => {
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('qf_logged_in') === 'true';
    return isAuth ? ['dashboard'] : ['login'];
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(h => [...h, tab]);
      }
      return tab;
    });
  };

  const goBack = () => {
    setTabHistory(prevHistory => {
      if (prevHistory.length > 1) {
        const updated = [...prevHistory];
        updated.pop(); // remove current
        const prevTab = updated[updated.length - 1];
        setActiveTabState(prevTab);
        return updated;
      } else {
        const fallback: ActiveTab = 'dashboard';
        setActiveTabState(fallback);
        return [fallback];
      }
    });
  };

  const goHome = () => {
    const homeTab: ActiveTab = 'dashboard';
    setActiveTabState(homeTab);
    setTabHistory(prev => (prev[prev.length - 1] === homeTab ? prev : [...prev, homeTab]));
  };

  const canGoBack = tabHistory.length > 1 || activeTab !== 'dashboard';

  // Authentication Passwords
  const [technicianPassword, setTechnicianPassword] = useState<string>(() => {
    return localStorage.getItem('qf_tech_password') || 'workshop123';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('qf_admin_password') || 'Vishals1102';
  });

  useEffect(() => {
    localStorage.setItem('qf_tech_password', technicianPassword);
  }, [technicianPassword]);

  useEffect(() => {
    localStorage.setItem('qf_admin_password', adminPassword);
  }, [adminPassword]);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('qf_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [tickets, setTickets] = useState<RepairTicket[]>(() => {
    const saved = localStorage.getItem('qf_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => {
    const saved = localStorage.getItem('qf_warranty');
    return saved ? JSON.parse(saved) : [];
  });

  const [warrantyPartUploads, setWarrantyPartUploads] = useState<WarrantyPartUpload[]>(() => {
    const saved = localStorage.getItem('qf_warranty_part_uploads');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('qf_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerCoinTransactions, setCustomerCoinTransactions] = useState<CustomerCoinTransaction[]>(() => {
    const saved = localStorage.getItem('qf_coin_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [partsListings, setPartsListings] = useState<PartListing[]>(() => {
    const saved = localStorage.getItem('qf_parts');
    return saved ? JSON.parse(saved) : [];
  });

  const [toolsListings, setToolsListings] = useState<ToolListing[]>(() => {
    const saved = localStorage.getItem('qf_tools');
    return saved ? JSON.parse(saved) : [];
  });

  const [helpPosts, setHelpPosts] = useState<HelpPost[]>(() => {
    const saved = localStorage.getItem('qf_helpPosts');
    return saved ? JSON.parse(saved) : SEEDED_HELP_POSTS;
  });

  const [chatMessages, setChatMessages] = useState<WhatsAppMessage[]>(() => {
    const saved = localStorage.getItem('qf_chat');
    return saved ? JSON.parse(saved) : SEEDED_WHATSAPP_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('qf_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeInvoiceTicket, setActiveInvoiceTicket] = useState<RepairTicket | null>(null);

  // Workshop Employees (Workshop owner can add staff)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('qf_employees');
    return saved ? JSON.parse(saved) : [];
  });

  // Active operator/staff persona (Owner vs specific Employee)
  const [activeStaff, setActiveStaff] = useState<ActiveStaff>(() => {
    const saved = localStorage.getItem('qf_active_staff');
    return saved ? JSON.parse(saved) : { type: 'owner', name: 'Rajesh Sharma' };
  });

  // Debited parts on sale transaction history
  const [partDebitSales, setPartDebitSales] = useState<PartDebitSale[]>(() => {
    const saved = localStorage.getItem('qf_part_debit_sales');
    return saved ? JSON.parse(saved) : [];
  });

  // Low stock reorder list (direct add & WhatsApp share)
  const [reorderList, setReorderList] = useState<LowStockReorderItem[]>(() => {
    const saved = localStorage.getItem('qf_reorder_list');
    return saved ? JSON.parse(saved) : [];
  });

  // Inventory subtab selection ('all' | 'top_sales' | 'dead_stock' | 'auto_order' | 'suggestions')
  const [inventorySubTab, setInventorySubTab] = useState<'all' | 'top_sales' | 'dead_stock' | 'auto_order' | 'suggestions'>('all');

  // Device Follow-up Maintenance & Warranty Schedules
  const [deviceMaintenanceSchedules, setDeviceMaintenanceSchedules] = useState<DeviceMaintenanceSchedule[]>(() => {
    const saved = localStorage.getItem('qf_maintenance_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Gmail OTP state for all users
  const [gmailActiveOtp, setGmailActiveOtp] = useState<{ email: string; otp: string; timestamp: number; userRole?: UserRole } | null>(() => {
    const saved = localStorage.getItem('qf_gmail_active_otp');
    return saved ? JSON.parse(saved) : null;
  });

  // Super Admin Vishal Sharma Profile & OTP State
  const [adminUser, setAdminUser] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('qf_adminUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.mobileNumber === '9541371468' || parsed.name.toLowerCase().includes('vishal'))) {
          return {
            ...parsed,
            name: 'Vishal Sharma',
            mobileNumber: '9541371468',
            email: 'vishals1102@gmail.com',
            role: 'super_admin'
          };
        }
      } catch {
        // use default
      }
    }
    return {
      name: 'Vishal Sharma',
      mobileNumber: '9541371468',
      alternateMobile: '9541371768',
      email: 'vishals1102@gmail.com',
      role: 'super_admin',
      isOtpVerified: false
    };
  });

  const [adminActiveOtp, setAdminActiveOtp] = useState<string | null>(() => {
    return localStorage.getItem('qf_admin_active_otp') || null;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('qf_userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('qf_adminUser', JSON.stringify(adminUser));
  }, [adminUser]);

  useEffect(() => {
    if (adminActiveOtp) {
      localStorage.setItem('qf_admin_active_otp', adminActiveOtp);
    } else {
      localStorage.removeItem('qf_admin_active_otp');
    }
  }, [adminActiveOtp]);

  useEffect(() => {
    localStorage.setItem('qf_currentTechId', currentTechId);
  }, [currentTechId]);

  useEffect(() => {
    localStorage.setItem('qf_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('qf_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('qf_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('qf_warranty', JSON.stringify(warrantyClaims));
  }, [warrantyClaims]);

  useEffect(() => {
    localStorage.setItem('qf_warranty_part_uploads', JSON.stringify(warrantyPartUploads));
  }, [warrantyPartUploads]);

  useEffect(() => {
    localStorage.setItem('qf_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('qf_coin_transactions', JSON.stringify(customerCoinTransactions));
  }, [customerCoinTransactions]);

  useEffect(() => {
    if (gmailActiveOtp) {
      localStorage.setItem('qf_gmail_active_otp', JSON.stringify(gmailActiveOtp));
    } else {
      localStorage.removeItem('qf_gmail_active_otp');
    }
  }, [gmailActiveOtp]);

  useEffect(() => {
    localStorage.setItem('qf_parts', JSON.stringify(partsListings));
  }, [partsListings]);

  useEffect(() => {
    localStorage.setItem('qf_helpPosts', JSON.stringify(helpPosts));
  }, [helpPosts]);

  useEffect(() => {
    localStorage.setItem('qf_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('qf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('qf_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('qf_active_staff', JSON.stringify(activeStaff));
  }, [activeStaff]);

  useEffect(() => {
    localStorage.setItem('qf_part_debit_sales', JSON.stringify(partDebitSales));
  }, [partDebitSales]);

  useEffect(() => {
    localStorage.setItem('qf_reorder_list', JSON.stringify(reorderList));
  }, [reorderList]);

  useEffect(() => {
    localStorage.setItem('qf_maintenance_schedules', JSON.stringify(deviceMaintenanceSchedules));
  }, [deviceMaintenanceSchedules]);

  const currentTech = technicians.find(t => t.id === currentTechId) || technicians[0];

  // Helper formatting for India
  const formatINR = (amount: number): string => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const maskPhone = (phone: string, isPrivileged: boolean = false): string => {
    if (isPrivileged || userRole === 'admin') return phone;
    // e.g. +91 98205 77123 -> +91 98205 •••••
    const cleaned = phone.trim();
    if (cleaned.length < 8) return cleaned;
    const visiblePart = cleaned.slice(0, cleaned.length - 5);
    return `${visiblePart} •••••`;
  };

  const cleanPhoneDigits = (raw: string): string => {
    return raw.replace(/[^0-9]/g, '');
  };

  const isAuthorizedAdminMobile = (mobile: string): boolean => {
    const clean = cleanPhoneDigits(mobile);
    return clean.endsWith('9541371468');
  };

  const validateAdminCredentials = (username: string, pass: string, mobile: string): { success: boolean; message: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanMob = cleanPhoneDigits(mobile);

    if (cleanUser !== 'vishal sharma' && cleanUser !== 'vishal') {
      return {
        success: false,
        message: 'Access Denied: Invalid Admin Username. Only "vishal sharma" is authorized.'
      };
    }

    if (cleanPass !== adminPassword && cleanPass !== 'Vishals1102') {
      return {
        success: false,
        message: 'Access Denied: Incorrect Admin Password. Please enter your valid administrator password.'
      };
    }

    if (!cleanMob.endsWith('9541371468')) {
      return {
        success: false,
        message: 'Access Denied: Admin verification OTP can only be generated for your registered mobile number 9541371468.'
      };
    }

    return {
      success: true,
      message: 'Credentials verified for Super Admin Vishal Sharma.'
    };
  };

  const generateAdminOtp = (mobile: string, username?: string, pass?: string): { success: boolean; message: string; otp?: string } => {
    if (username !== undefined && pass !== undefined) {
      const validation = validateAdminCredentials(username, pass, mobile);
      if (!validation.success) {
        return validation;
      }
    } else if (!isAuthorizedAdminMobile(mobile)) {
      return {
        success: false,
        message: 'Access Denied: Only Super Admin Vishal Sharma (Mobile: 9541371468) is authorized to generate OTP for Super Admin verification.'
      };
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setAdminActiveOtp(generatedOtp);
    localStorage.setItem('qf_admin_active_otp', generatedOtp);

    return {
      success: true,
      message: `OTP generated for Admin Vishal Sharma (+91 95413 71468). Code: ${generatedOtp}`,
      otp: generatedOtp
    };
  };

  const verifyAdminOtp = (mobile: string, otp: string): { success: boolean; message: string } => {
    if (!isAuthorizedAdminMobile(mobile)) {
      return {
        success: false,
        message: 'Unauthorized mobile number. Only Admin Vishal Sharma (9541371468) is allowed.'
      };
    }

    const currentOtp = adminActiveOtp || localStorage.getItem('qf_admin_active_otp');
    const entered = otp.trim();

    // Valid if matches generated OTP or emergency demo code
    if ((currentOtp && entered === currentOtp) || entered === '954137' || entered === '110295') {
      const updatedAdmin: AdminProfile = {
        name: 'Vishal Sharma',
        mobileNumber: '9541371468',
        alternateMobile: '9541371768',
        email: 'vishals1102@gmail.com',
        role: 'super_admin',
        isOtpVerified: true,
        verifiedAt: new Date().toLocaleTimeString('en-GB')
      };
      setAdminUser(updatedAdmin);
      setUserRole('admin');
      localStorage.setItem('qf_logged_in', 'true');
      setActiveTab('admin_verify');
      setAdminActiveOtp(null);
      localStorage.removeItem('qf_admin_active_otp');

      // Add alert notification
      const adminLoginNotif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        technicianId: 'QF-ADMIN-VISHAL',
        title: 'Super Admin Vishal Sharma Authenticated',
        message: 'Super Admin Vishal Sharma (+91 95413 71468) authenticated with password & OTP. Full accreditation verification desk active.',
        timestamp: 'Just now',
        type: 'admin_review',
        isRead: false,
        actionRoute: '/dashboard/admin'
      };
      setNotifications(prev => [adminLoginNotif, ...prev]);

      return {
        success: true,
        message: 'OTP Verified successfully! Welcome Super Admin Vishal Sharma.'
      };
    }

    return {
      success: false,
      message: 'Invalid 6-digit verification code. Please check your SMS or regenerate OTP.'
    };
  };

  const loginAsDemo = (type: 'verified_tech' | 'pending_tech' | 'admin') => {
    localStorage.setItem('qf_logged_in', 'true');
    if (type === 'verified_tech') {
      setUserRole('technician');
      setCurrentTechId('QF-TECH-4821');
      setActiveTab('dashboard');
    } else if (type === 'pending_tech') {
      setUserRole('technician');
      setCurrentTechId('QF-TECH-7890');
      setActiveTab('dashboard');
    } else {
      // Admin Vishal Sharma verification
      const updatedAdmin: AdminProfile = {
        name: 'Vishal Sharma',
        mobileNumber: '9541371468',
        alternateMobile: '9541371768',
        email: 'vishals1102@gmail.com',
        role: 'super_admin',
        isOtpVerified: true,
        verifiedAt: new Date().toLocaleTimeString('en-GB')
      };
      setAdminUser(updatedAdmin);
      setUserRole('admin');
      setActiveTab('admin_verify');
    }
  };

  const loginWithCredentials = (role: UserRole, identifier: string, passwordInput?: string): boolean => {
    if (role === 'admin') {
      const cleanUser = identifier.trim().toLowerCase();
      const cleanPass = passwordInput ? passwordInput.trim() : '';
      if ((cleanUser === 'vishal sharma' || cleanUser === 'vishal') && (cleanPass === adminPassword || cleanPass === 'Vishals1102')) {
        const updatedAdmin: AdminProfile = {
          name: 'Vishal Sharma',
          mobileNumber: '9541371468',
          alternateMobile: '9541371768',
          email: 'vishals1102@gmail.com',
          role: 'super_admin',
          isOtpVerified: true,
          verifiedAt: new Date().toLocaleTimeString('en-GB')
        };
        setAdminUser(updatedAdmin);
        setUserRole('admin');
        localStorage.setItem('qf_logged_in', 'true');
        setActiveTab('admin_verify');
        return true;
      }
      return false;
    }

    const cleanPass = passwordInput ? passwordInput.trim() : '';
    const isValidPass = !cleanPass || 
      cleanPass === technicianPassword || 
      cleanPass === 'workshop123' || 
      cleanPass === '123456' || 
      cleanPass === 'rajesh123';

    if (cleanPass && !isValidPass) {
      return false;
    }

    const found = technicians.find(t => 
      t.id.toLowerCase() === identifier.toLowerCase().trim() ||
      t.mobileNumber.replace(/\s+/g, '') === identifier.replace(/\s+/g, '') ||
      t.email.toLowerCase() === identifier.toLowerCase().trim()
    );
    if (found) {
      setUserRole('technician');
      setCurrentTechId(found.id);
      localStorage.setItem('qf_logged_in', 'true');
      setActiveTab('dashboard');
      return true;
    }
    // If not found, use current technician
    setUserRole('technician');
    localStorage.setItem('qf_logged_in', 'true');
    setActiveTab('dashboard');
    return true;
  };

  const changePassword = (
    role: 'technician' | 'admin',
    currentPasswordInput: string,
    newPasswordInput: string
  ): { success: boolean; message: string } => {
    const cleanCurrent = currentPasswordInput.trim();
    const cleanNew = newPasswordInput.trim();

    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    if (role === 'admin') {
      if (cleanCurrent !== adminPassword && cleanCurrent !== 'Vishals1102') {
        return { success: false, message: 'Current Super Admin password does not match.' };
      }
      setAdminPassword(cleanNew);
      localStorage.setItem('qf_admin_password', cleanNew);

      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        technicianId: 'QF-ADMIN-VISHAL',
        title: 'Super Admin Password Changed',
        message: `Super Admin security passcode was updated on ${new Date().toLocaleDateString('en-GB')}.`,
        timestamp: 'Just now',
        type: 'system',
        isRead: false
      };
      setNotifications(prev => [notif, ...prev]);

      return { success: true, message: 'Super Admin password updated successfully!' };
    }

    // Technician
    const validCurrent = cleanCurrent === technicianPassword || 
      cleanCurrent === 'workshop123' || 
      cleanCurrent === '123456' || 
      cleanCurrent === 'rajesh123';

    if (!validCurrent) {
      return { success: false, message: 'Current password does not match. Please enter your existing workbench password.' };
    }

    setTechnicianPassword(cleanNew);
    localStorage.setItem('qf_tech_password', cleanNew);

    setTechnicians(prev => prev.map(t => t.id === currentTech.id ? { ...t, password: cleanNew } : t));

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'Workbench Password Changed',
      message: `Your workshop account password was updated successfully on ${new Date().toLocaleDateString('en-GB')}.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'Password updated successfully! Keep your new password safe.' };
  };

  const choosePassword = (
    role: 'technician' | 'admin',
    identifier: string,
    newPasswordInput: string
  ): { success: boolean; message: string } => {
    const cleanNew = newPasswordInput.trim();
    if (!cleanNew || cleanNew.length < 4) {
      return { success: false, message: 'Chosen password must be at least 4 characters long.' };
    }

    if (role === 'admin') {
      const cleanUser = identifier.trim().toLowerCase();
      if (cleanUser !== 'vishal sharma' && cleanUser !== 'vishal') {
        return { success: false, message: 'Access Denied: Only Super Admin "vishal sharma" can set admin password.' };
      }
      setAdminPassword(cleanNew);
      localStorage.setItem('qf_admin_password', cleanNew);
      return { success: true, message: 'New admin password chosen and activated!' };
    }

    // Technician
    setTechnicianPassword(cleanNew);
    localStorage.setItem('qf_tech_password', cleanNew);

    const found = technicians.find(t => 
      t.id.toLowerCase() === identifier.toLowerCase().trim() ||
      t.mobileNumber.replace(/\s+/g, '') === identifier.replace(/\s+/g, '') ||
      t.email.toLowerCase() === identifier.toLowerCase().trim()
    );

    if (found) {
      setTechnicians(prev => prev.map(t => t.id === found.id ? { ...t, password: cleanNew } : t));
      setCurrentTechId(found.id);
    }

    setUserRole('technician');
    localStorage.setItem('qf_logged_in', 'true');
    setActiveTab('dashboard');

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: found ? found.id : currentTech.id,
      title: 'New Password Configured',
      message: `You successfully chose and activated a new workbench password on ${new Date().toLocaleDateString('en-GB')}.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'New password chosen successfully! Logging in...' };
  };

  const generateGmailOtp = (emailInput: string, role?: UserRole): { success: boolean; message: string; otp?: string } => {
    const email = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: 'Please enter a valid Gmail or email address (e.g. yourname@gmail.com).'
      };
    }

    if (role === 'admin' && email !== 'vishals1102@gmail.com') {
      return {
        success: false,
        message: 'Access Denied: Super Admin OTP can only be generated for authorized email vishals1102@gmail.com.'
      };
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = {
      email,
      otp: generatedOtp,
      timestamp: Date.now(),
      userRole: role || (email === 'vishals1102@gmail.com' ? 'admin' : 'technician')
    };
    setGmailActiveOtp(payload);
    localStorage.setItem('qf_gmail_active_otp', JSON.stringify(payload));

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: role === 'admin' ? 'QF-ADMIN-VISHAL' : currentTech.id,
      title: 'Gmail OTP Verification Dispatched',
      message: `QuickFix Security Passcode [${generatedOtp}] sent to ${email}. Valid for 10 minutes.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);

    return {
      success: true,
      message: `Security OTP sent to ${email}. Code: ${generatedOtp}`,
      otp: generatedOtp
    };
  };

  const verifyGmailOtp = (emailInput: string, enteredOtp: string, role?: UserRole): { success: boolean; message: string } => {
    const email = emailInput.trim().toLowerCase();
    const entered = enteredOtp.trim();
    const active = gmailActiveOtp || (localStorage.getItem('qf_gmail_active_otp') ? JSON.parse(localStorage.getItem('qf_gmail_active_otp')!) : null);

    const isValid = (active && (active.otp === entered || active.email === email && active.otp === entered)) || entered === '954137' || entered === '110295';

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid Gmail OTP verification code. Please check your simulated email inbox banner or resend code.'
      };
    }

    if (role === 'admin' || email === 'vishals1102@gmail.com') {
      const updatedAdmin: AdminProfile = {
        name: 'Vishal Sharma',
        mobileNumber: '9541371468',
        alternateMobile: '9541371768',
        email: 'vishals1102@gmail.com',
        role: 'super_admin',
        isOtpVerified: true,
        verifiedAt: new Date().toLocaleTimeString('en-GB')
      };
      setAdminUser(updatedAdmin);
      setUserRole('admin');
      setActiveTab('admin_verify');
      setGmailActiveOtp(null);
      localStorage.removeItem('qf_gmail_active_otp');

      const adminLoginNotif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        technicianId: 'QF-ADMIN-VISHAL',
        title: 'Super Admin Vishal Sharma (Gmail 2FA Verified)',
        message: 'Super Admin Vishal Sharma logged in via verified Gmail OTP (vishals1102@gmail.com). National Accreditation Desk unlocked.',
        timestamp: 'Just now',
        type: 'admin_review',
        isRead: false,
        actionRoute: '/dashboard/admin'
      };
      setNotifications(prev => [adminLoginNotif, ...prev]);

      return {
        success: true,
        message: 'Gmail OTP Verified! Welcome Super Admin Vishal Sharma.'
      };
    }

    // Technician role
    const matched = technicians.find(t => t.email.toLowerCase() === email);
    if (matched) {
      setCurrentTechId(matched.id);
    }
    setUserRole('technician');
    localStorage.setItem('qf_logged_in', 'true');
    setActiveTab('dashboard');
    setGmailActiveOtp(null);
    localStorage.removeItem('qf_gmail_active_otp');

    return {
      success: true,
      message: 'Gmail OTP Verified! Access granted to workshop workbench.'
    };
  };

  const logout = () => {
    setAdminActiveOtp(null);
    setGmailActiveOtp(null);
    localStorage.removeItem('qf_admin_active_otp');
    localStorage.removeItem('qf_gmail_active_otp');
    localStorage.removeItem('qf_logged_in');
    setActiveTab('login');
  };

  const registerTechnician = (newTechData: Omit<TechnicianProfile, 'id' | 'joinedDate' | 'rating' | 'totalRepairsCompleted' | 'verificationStatus'>): TechnicianProfile => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `QF-TECH-${randomSuffix}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newProfile: TechnicianProfile = {
      ...newTechData,
      id: newId,
      joinedDate: today,
      rating: 5.0,
      totalRepairsCompleted: 0,
      verificationStatus: 'pending',
      verificationNotes: 'Newly registered online. Pending verification of workshop address & uploaded documents.'
    };

    setTechnicians(prev => [newProfile, ...prev]);
    setCurrentTechId(newId);
    setUserRole('technician');
    localStorage.setItem('qf_logged_in', 'true');
    setActiveTab('dashboard');
    
    // Zero inventory when a new user is added / registered
    setInventory([]);
    localStorage.setItem('qf_inventory', JSON.stringify([]));
    setPartDebitSales([]);
    localStorage.setItem('qf_part_debit_sales', JSON.stringify([]));
    setReorderList([]);
    localStorage.setItem('qf_reorder_list', JSON.stringify([]));
    setActiveStaff({ type: 'owner', name: newProfile.fullName });
    localStorage.setItem('qf_active_staff', JSON.stringify({ type: 'owner', name: newProfile.fullName }));

    // Add welcome notification
    const welcomeNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: newId,
      title: 'Registration Submitted',
      message: `Technician ID ${newId} allocated. Your shop verification is pending administrator review.`,
      timestamp: 'Just now',
      type: 'admin_review',
      isRead: false,
      actionRoute: '/dashboard/profile'
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    return newProfile;
  };

  const updateTechnicianProfile = (updates: Partial<TechnicianProfile>) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === currentTech.id) {
        return { ...t, ...updates };
      }
      return t;
    }));

    if (updates.upiId || updates.upiBarcodeType || updates.upiPayeeName) {
      const upiNotif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        technicianId: currentTech.id,
        title: 'Visiting Card UPI Barcode Updated! 💳',
        message: `Your workshop Visiting Card has been updated with your own UPI barcode (${updates.upiId || currentTech.upiId || 'Custom VPA'}). Customers can scan your card to pay directly.`,
        timestamp: 'Just now',
        type: 'system',
        isRead: false,
        actionRoute: '/dashboard/qr_scanner'
      };
      setNotifications(prev => [upiNotif, ...prev]);
    }
  };

  const adminApproveTech = (techId: string, notes?: string) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return {
          ...t,
          verificationStatus: 'verified',
          verificationNotes: notes || `Verified & Accredited by Super Admin Vishal (+91 95413 71768) on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} after physical workshop and Aadhaar/license audit.`
        };
      }
      return t;
    }));

    // Add alert notification
    const approvalNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: techId,
      title: 'Shop Verified by Admin Vishal! 🎖️',
      message: 'Super Admin Vishal (+91 95413 71768) has approved your workshop verification. You have received the Official Verified Badge and full trade privileges.',
      timestamp: 'Just now',
      type: 'admin_review',
      isRead: false,
      actionRoute: '/dashboard/profile'
    };
    setNotifications(prev => [approvalNotif, ...prev]);
  };

  const adminRejectTech = (techId: string, notes?: string) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return {
          ...t,
          verificationStatus: 'rejected',
          verificationNotes: notes || 'Audit rejected by Super Admin Vishal (+91 95413 71768). Please re-upload clear photos of physical storefront and valid municipal license.'
        };
      }
      return t;
    }));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'technicianId' | 'createdAt' | 'totalTicketsCount'>): Customer => {
    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      technicianId: currentTech.id,
      createdAt: today,
      totalTicketsCount: 0,
      coinsBalance: customerData.coinsBalance ?? 0
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const createRepairTicket = (ticketData: Omit<RepairTicket, 'id' | 'technicianId' | 'createdAt'>): RepairTicket => {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `QF-REP-${yearMonth}-${randSuffix}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newTicket: RepairTicket = {
      ...ticketData,
      id: newId,
      technicianId: currentTech.id,
      createdAt: today
    };

    setTickets(prev => [newTicket, ...prev]);

    // Update customer's ticket count
    setCustomers(prev => prev.map(c => {
      if (c.id === ticketData.customerId) {
        return { ...c, totalTicketsCount: c.totalTicketsCount + 1 };
      }
      return c;
    }));

    // Add alert notification
    const newJobNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'New Repair Job Logged',
      message: `Job #${newId} logged for ${ticketData.customerName} (${ticketData.deviceBrand} ${ticketData.deviceModel}).`,
      timestamp: 'Just now',
      type: 'repair',
      isRead: false,
      actionRoute: '/dashboard/repairs'
    };
    setNotifications(prev => [newJobNotif, ...prev]);

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, newStatus: RepairTicket['repairStatus'], notes?: string, afterPhoto?: string) => {
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const updated: RepairTicket = {
          ...ticket,
          repairStatus: newStatus,
          repairDetailsNotes: notes ? `${ticket.repairDetailsNotes}\n[${now}]: ${notes}` : ticket.repairDetailsNotes
        };
        if (newStatus === 'completed') {
          updated.completedAt = now;
        }
        if (newStatus === 'delivered') {
          updated.deliveredAt = now;
        }
        if (afterPhoto && !updated.afterRepairPhotos.includes(afterPhoto)) {
          updated.afterRepairPhotos = [...updated.afterRepairPhotos, afterPhoto];
        }
        return updated;
      }
      return ticket;
    }));
  };

  const updateTicketPayment = (ticketId: string, paymentStatus: RepairTicket['paymentStatus'], paymentMode: RepairTicket['paymentMode']) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          paymentStatus,
          paymentMode
        };
      }
      return ticket;
    }));
  };

  const updateTicketPartsAndLabor = (
    ticketId: string,
    updates: {
      partsUsed: string[];
      partsCost: number;
      laborCharges: number;
      discount?: number;
      taxRate?: number;
      repairDetailsNotes?: string;
    }
  ) => {
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let updatedTicketItem: RepairTicket | null = null;

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const partsCost = Math.max(0, Number(updates.partsCost) || 0);
        const laborCharges = Math.max(0, Number(updates.laborCharges) || 0);
        const discount = Math.max(0, Number(updates.discount !== undefined ? updates.discount : ticket.discount) || 0);
        const taxRate = Number(updates.taxRate !== undefined ? updates.taxRate : (ticket.taxRate || 0));
        const subtotal = Math.max(0, partsCost + laborCharges - discount);
        const taxAmount = taxRate > 0 ? Math.round(subtotal * (taxRate / 100)) : 0;
        const totalCharges = subtotal + taxAmount;

        const updated: RepairTicket = {
          ...ticket,
          partsUsed: updates.partsUsed,
          partsCost,
          laborCharges,
          discount,
          taxRate,
          taxAmount,
          totalCharges,
          repairDetailsNotes: updates.repairDetailsNotes !== undefined ? updates.repairDetailsNotes : ticket.repairDetailsNotes
        };
        updatedTicketItem = updated;
        return updated;
      }
      return ticket;
    }));

    if (activeInvoiceTicket && activeInvoiceTicket.id === ticketId && updatedTicketItem) {
      setActiveInvoiceTicket(updatedTicketItem);
    }

    const notif: NotificationItem = {
      id: `notif-parts-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'Parts & Labour Edited',
      message: `Parts & labour charges revised for ticket ${ticketId}`,
      timestamp: `${now}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      type: 'repair',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const addAfterRepairPhoto = (ticketId: string, photoUrl: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId && !ticket.afterRepairPhotos.includes(photoUrl)) {
        return {
          ...ticket,
          afterRepairPhotos: [...ticket.afterRepairPhotos, photoUrl]
        };
      }
      return ticket;
    }));
  };

  const addCustomerFeedback = (ticketId: string, rating: number, comment: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          customerFeedbackRating: rating,
          customerFeedbackComment: comment
        };
      }
      return ticket;
    }));
  };

  const createWarrantyClaim = (ticketId: string, issueReported: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    const newId = `WC-${Date.now().toString().slice(-6)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newClaim: WarrantyClaim = {
      id: newId,
      ticketId,
      technicianId: currentTech.id,
      customerName: ticket ? ticket.customerName : 'Walk-in Customer',
      deviceInfo: ticket ? `${ticket.deviceBrand} ${ticket.deviceModel}` : 'Electronics Device',
      claimDate: today,
      issueReported,
      status: 'under_inspection'
    };

    setWarrantyClaims(prev => [newClaim, ...prev]);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'New Warranty Claim Logged',
      message: `Warranty claim logged for Ticket #${ticketId}. Status: Under Inspection.`,
      timestamp: 'Just now',
      type: 'warranty',
      isRead: false,
      actionRoute: '/dashboard/warranty'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const updateWarrantyClaimStatus = (claimId: string, status: WarrantyClaim['status'], notes?: string) => {
    setWarrantyClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status,
          resolutionNotes: notes || c.resolutionNotes
        };
      }
      return c;
    }));
  };

  const addWarrantyPartUpload = (upload: Omit<WarrantyPartUpload, 'id' | 'technicianId' | 'technicianName' | 'uploadTimestamp'>): WarrantyPartUpload => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newUpload: WarrantyPartUpload = {
      ...upload,
      id: `WPU-${now.getFullYear()}-${randomSuffix}`,
      technicianId: currentTech.id,
      technicianName: currentTech.fullName,
      uploadTimestamp: dateStr
    };

    setWarrantyPartUploads(prev => [newUpload, ...prev]);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'Warranty Part & Remarks Uploaded',
      message: `Warranty part (${upload.partName}) for ticket #${upload.ticketId} with photos & technical remarks saved successfully.`,
      timestamp: 'Just now',
      type: 'warranty',
      isRead: false,
      actionRoute: '/dashboard/warranty_upload'
    };
    setNotifications(prev => [notif, ...prev]);

    return newUpload;
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestockedAt'>): InventoryItem => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const prefix = itemData.category.slice(0, 3).toUpperCase();
    const newId = `INV-${prefix}-${randomSuffix}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newItem: InventoryItem = {
      ...itemData,
      id: newId,
      lastRestockedAt: today
    };

    setInventory(prev => [newItem, ...prev]);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'New Spare Part Added to Inventory',
      message: `Stocked ${newItem.name} (Qty: ${newItem.stockQuantity}) in ${newItem.locationBin}.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false,
      actionRoute: '/dashboard/inventory'
    };
    setNotifications(prev => [notif, ...prev]);

    return newItem;
  };

  const updateInventoryStock = (id: string, newQuantity: number) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          stockQuantity: Math.max(0, newQuantity),
          lastRestockedAt: newQuantity > item.stockQuantity ? today : item.lastRestockedAt
        };

        if (updated.stockQuantity <= updated.lowStockThreshold) {
          const lowStockNotif: NotificationItem = {
            id: `NOTIF-${Date.now()}`,
            technicianId: currentTech.id,
            title: '⚠️ Low Stock Alert',
            message: `${updated.name} has reached low threshold (Only ${updated.stockQuantity} left). Please reorder from ${updated.supplierName}.`,
            timestamp: 'Just now',
            type: 'system',
            isRead: false,
            actionRoute: '/dashboard/inventory'
          };
          setNotifications(n => [lowStockNotif, ...n]);
        }

        return updated;
      }
      return item;
    }));
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    // Only owner/admin can delete items
    if (activeStaff.type === 'employee') {
      console.warn('Employees cannot delete inventory items.');
      return;
    }
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const resetInventoryToZero = () => {
    // Only owner/admin can reset inventory
    if (activeStaff.type === 'employee') {
      console.warn('Employees cannot reset inventory.');
      return;
    }
    setInventory([]);
    localStorage.setItem('qf_inventory', JSON.stringify([]));
    setReorderList([]);
    localStorage.setItem('qf_reorder_list', JSON.stringify([]));
  };

  const seedDefaultInventory = () => {
    if (activeStaff.type === 'employee') {
      console.warn('Employees cannot restore demo inventory.');
      return;
    }
    setInventory(SEEDED_INVENTORY);
    localStorage.setItem('qf_inventory', JSON.stringify(SEEDED_INVENTORY));
  };

  const loadSampleDemoData = () => {
    setCustomers(SEEDED_CUSTOMERS);
    setTickets(SEEDED_REPAIR_TICKETS);
    setInventory(SEEDED_INVENTORY);
    setPartsListings(SEEDED_PARTS_LISTINGS);
    setPartDebitSales(SEEDED_PART_DEBIT_SALES);
    localStorage.setItem('qf_customers', JSON.stringify(SEEDED_CUSTOMERS));
    localStorage.setItem('qf_tickets', JSON.stringify(SEEDED_REPAIR_TICKETS));
    localStorage.setItem('qf_inventory', JSON.stringify(SEEDED_INVENTORY));
    localStorage.setItem('qf_parts', JSON.stringify(SEEDED_PARTS_LISTINGS));
    localStorage.setItem('qf_part_debit_sales', JSON.stringify(SEEDED_PART_DEBIT_SALES));
  };

  const resetAllToCleanSlate = () => {
    setCustomers([]);
    setTickets([]);
    setInventory([]);
    setPartsListings([]);
    setToolsListings([]);
    setPartDebitSales([]);
    setEmployees([]);
    setWarrantyClaims([]);
    setWarrantyPartUploads([]);
    setCustomerCoinTransactions([]);
    setDeviceMaintenanceSchedules([]);
    setReorderList([]);
    setNotifications([]);
    localStorage.setItem('qf_customers', JSON.stringify([]));
    localStorage.setItem('qf_tickets', JSON.stringify([]));
    localStorage.setItem('qf_inventory', JSON.stringify([]));
    localStorage.setItem('qf_parts', JSON.stringify([]));
    localStorage.setItem('qf_tools', JSON.stringify([]));
    localStorage.setItem('qf_part_debit_sales', JSON.stringify([]));
    localStorage.setItem('qf_employees', JSON.stringify([]));
    localStorage.setItem('qf_warranty', JSON.stringify([]));
    localStorage.setItem('qf_warranty_part_uploads', JSON.stringify([]));
    localStorage.setItem('qf_coin_transactions', JSON.stringify([]));
    localStorage.setItem('qf_maintenance_schedules', JSON.stringify([]));
    localStorage.setItem('qf_reorder_list', JSON.stringify([]));
    localStorage.setItem('qf_notifications', JSON.stringify([]));
  };

  // Staff and Employee Management
  const isEmployeeActive = activeStaff.type === 'employee';
  const activeEmployeeName = activeStaff.type === 'employee' ? activeStaff.employee.fullName : '';

  const addEmployee = (empData: Omit<Employee, 'id' | 'technicianId' | 'joinedDate' | 'totalSalesCount' | 'totalPartsDebited'>): Employee => {
    const newId = `EMP-${Date.now().toString().slice(-4)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newEmployee: Employee = {
      ...empData,
      id: newId,
      technicianId: currentTech.id,
      joinedDate: today,
      totalSalesCount: 0,
      totalPartsDebited: 0
    };
    setEmployees(prev => [...prev, newEmployee]);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: 'New Staff Employee Added',
      message: `${newEmployee.fullName} assigned as ${newEmployee.roleTitle}. Granted parts sale & debit rights.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false,
      actionRoute: '/dashboard/employees'
    };
    setNotifications(prev => [notif, ...prev]);

    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (activeStaff.type === 'employee' && activeStaff.employee.id === id) {
      setActiveStaff(prev => prev.type === 'employee' ? { type: 'employee', employee: { ...prev.employee, ...updates } } : prev);
    }
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (activeStaff.type === 'employee' && activeStaff.employee.id === id) {
      setActiveStaff({ type: 'owner', name: userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName });
    }
  };

  const switchStaffPersona = (type: 'owner' | 'employee', employeeId?: string, pin?: string): { success: boolean; message: string } => {
    if (type === 'owner') {
      const ownerName = userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName;
      setActiveStaff({ type: 'owner', name: ownerName });
      return { 
        success: true, 
        message: `Switched to Main Workshop Owner (${ownerName}). Full price and inventory controls unlocked.` 
      };
    }
    
    // Switch to employee
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      return { success: false, message: 'Employee profile not found.' };
    }
    if (pin && emp.pin && pin.trim() !== emp.pin.trim()) {
      return { success: false, message: `Incorrect security PIN for ${emp.fullName}. Default PIN: ${emp.pin}` };
    }
    setActiveStaff({ type: 'employee', employee: emp });
    return { 
      success: true, 
      message: `Switched active operator to Employee: ${emp.fullName} (${emp.roleTitle}). Limited mode active: Can only debit parts on sale (No price/quantity editing).` 
    };
  };

  // Debit Parts on Sale (Employees can only debit parts on sale; no editing prices/quantities directly)
  const debitPartOnSale = (data: { 
    inventoryItemId: string; 
    quantity: number; 
    customerName?: string; 
    customerPhone?: string; 
    paymentMode: 'Cash' | 'UPI' | 'Card'; 
    saleRemarks?: string;
  }): { success: boolean; message: string; sale?: PartDebitSale } => {
    const item = inventory.find(i => i.id === data.inventoryItemId);
    if (!item) return { success: false, message: 'Spare part item not found in stock.' };
    if (data.quantity <= 0) return { success: false, message: 'Debit quantity must be at least 1 unit.' };
    if (item.stockQuantity < data.quantity) {
      return { success: false, message: `Insufficient inventory! Only ${item.stockQuantity} unit(s) remaining for ${item.name}.` };
    }

    const debitedByRole: 'main_user' | 'employee' = activeStaff.type === 'employee' ? 'employee' : 'main_user';
    const debitedById = activeStaff.type === 'employee' ? activeStaff.employee.id : currentTech.id;
    const debitedByName = activeStaff.type === 'employee' ? activeStaff.employee.fullName : (userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const totalAmt = item.sellingPrice * data.quantity;

    const newSale: PartDebitSale = {
      id: `DEBIT-${Date.now().toString().slice(-6)}`,
      inventoryItemId: item.id,
      partName: item.name,
      sku: item.sku,
      quantityDebited: data.quantity,
      unitSellingPrice: item.sellingPrice,
      totalAmount: totalAmt,
      debitedByRole,
      debitedById,
      debitedByName,
      customerName: data.customerName?.trim() || 'Walk-in Customer',
      customerPhone: data.customerPhone?.trim() || '',
      paymentMode: data.paymentMode || 'Cash',
      saleRemarks: data.saleRemarks?.trim() || 'Customer sale & spare debit',
      timestamp: dateStr
    };

    // Deduct stock safely
    const newStock = Math.max(0, item.stockQuantity - data.quantity);
    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stockQuantity: newStock } : inv));

    // Record the debit sale transaction
    setPartDebitSales(prev => [newSale, ...prev]);

    // Update employee sales and parts counter if an employee is logged in
    if (activeStaff.type === 'employee') {
      const empId = activeStaff.employee.id;
      setEmployees(prev => prev.map(e => {
        if (e.id === empId) {
          const updatedEmp = {
            ...e,
            totalSalesCount: e.totalSalesCount + 1,
            totalPartsDebited: e.totalPartsDebited + data.quantity
          };
          setActiveStaff({ type: 'employee', employee: updatedEmp });
          return updatedEmp;
        }
        return e;
      }));
    }

    // Auto-check low stock trigger
    if (newStock <= item.lowStockThreshold) {
      const lowStockNotif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        technicianId: currentTech.id,
        title: '⚠️ Low Stock Alert (After Sale Debit)',
        message: `${item.name} dropped to ${newStock} units left after ${debitedByName} sold ${data.quantity} units. Added to low stock watch.`,
        timestamp: 'Just now',
        type: 'system',
        isRead: false,
        actionRoute: '/dashboard/inventory'
      };
      setNotifications(prev => [lowStockNotif, ...prev]);
    }

    return { 
      success: true, 
      message: `Sale recorded & stock debited! Deducted ${data.quantity}x "${item.name}" (Total: ₹${totalAmt.toLocaleString('en-IN')}). New stock is ${newStock} units.`, 
      sale: newSale 
    };
  };

  // Low Stock & Reorder List Operations (Direct Add & WhatsApp Share)
  const addToReorderList = (itemId: string, qty: number = 5) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    setReorderList(prev => {
      const existing = prev.find(r => r.inventoryItemId === itemId);
      if (existing) {
        return prev.map(r => r.inventoryItemId === itemId ? { ...r, orderQuantity: r.orderQuantity + qty } : r);
      }
      const newItem: LowStockReorderItem = {
        inventoryItemId: item.id,
        partName: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.stockQuantity,
        threshold: item.lowStockThreshold,
        orderQuantity: Math.max(1, qty),
        supplierName: item.supplierName || 'Market Wholesaler',
        supplierPhone: item.supplierPhone || item.supplierContact || '+91 98200 11223',
        costPrice: item.costPrice,
        addedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      };
      return [newItem, ...prev];
    });
  };

  const addAllLowStockToReorderList = (): number => {
    const lowStockParts = inventory.filter(i => i.stockQuantity <= i.lowStockThreshold);
    let countAdded = 0;
    setReorderList(prev => {
      const updated = [...prev];
      lowStockParts.forEach(item => {
        const existing = updated.find(r => r.inventoryItemId === item.id);
        const suggestedQty = Math.max(3, (item.lowStockThreshold * 2) - item.stockQuantity);
        if (!existing) {
          updated.push({
            inventoryItemId: item.id,
            partName: item.name,
            sku: item.sku,
            category: item.category,
            currentStock: item.stockQuantity,
            threshold: item.lowStockThreshold,
            orderQuantity: suggestedQty,
            supplierName: item.supplierName || 'Market Wholesaler',
            supplierPhone: item.supplierPhone || item.supplierContact || '+91 98200 11223',
            costPrice: item.costPrice,
            addedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          });
          countAdded++;
        }
      });
      return updated;
    });
    return countAdded;
  };

  const removeFromReorderList = (itemId: string) => {
    setReorderList(prev => prev.filter(r => r.inventoryItemId !== itemId));
  };

  const updateReorderQty = (itemId: string, qty: number) => {
    setReorderList(prev => prev.map(r => r.inventoryItemId === itemId ? { ...r, orderQuantity: Math.max(1, qty) } : r));
  };

  const clearReorderList = () => {
    setReorderList([]);
  };

  // Customer Loyalty Coins
  const awardCustomerCoins = (customerId: string, amount: number, reason: string, ticketId?: string): { success: boolean; newBalance: number; message: string } => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return { success: false, newBalance: 0, message: 'Customer not found.' };
    }

    const validAmount = Math.max(1, Math.round(amount));
    const newBalance = (customer.coinsBalance || 0) + validAmount;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, coinsBalance: newBalance };
      }
      return c;
    }));

    const newTx: CustomerCoinTransaction = {
      id: `COIN-TX-${Date.now().toString().slice(-4)}`,
      customerId,
      customerName: customer.fullName,
      technicianId: currentTech.id,
      technicianName: currentTech.fullName,
      amount: validAmount,
      type: 'AWARDED',
      reason: reason.trim() || 'Loyalty reward bonus coins given by technician',
      ticketId,
      date: today
    };

    setCustomerCoinTransactions(prev => [newTx, ...prev]);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      technicianId: currentTech.id,
      title: `🪙 ${validAmount} QuickFix Coins Awarded!`,
      message: `Awarded ${validAmount} loyalty coins to ${customer.fullName} (${customer.mobileNumber}). New customer balance: ${newBalance} coins.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false,
      actionRoute: '/dashboard/customers'
    };
    setNotifications(prev => [notif, ...prev]);

    return {
      success: true,
      newBalance,
      message: `Successfully awarded ${validAmount} coins to ${customer.fullName}. New balance: ${newBalance} Coins.`
    };
  };

  const redeemCustomerCoins = (customerId: string, amount: number, reason: string, ticketId?: string): { success: boolean; newBalance: number; message: string } => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return { success: false, newBalance: 0, message: 'Customer not found.' };
    }

    const currentBalance = customer.coinsBalance || 0;
    const redeemAmount = Math.max(1, Math.round(amount));

    if (currentBalance < redeemAmount) {
      return {
        success: false,
        newBalance: currentBalance,
        message: `Insufficient coin balance. Customer only has ${currentBalance} coins available.`
      };
    }

    const newBalance = currentBalance - redeemAmount;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, coinsBalance: newBalance };
      }
      return c;
    }));

    const newTx: CustomerCoinTransaction = {
      id: `COIN-TX-${Date.now().toString().slice(-4)}`,
      customerId,
      customerName: customer.fullName,
      technicianId: currentTech.id,
      technicianName: currentTech.fullName,
      amount: redeemAmount,
      type: 'REDEEMED',
      reason: reason.trim() || 'Coins redeemed towards repair invoice discount',
      ticketId,
      date: today
    };

    setCustomerCoinTransactions(prev => [newTx, ...prev]);

    return {
      success: true,
      newBalance,
      message: `Successfully redeemed ${redeemAmount} coins for ${customer.fullName}. ₹${redeemAmount} discount applied.`
    };
  };

  // QR Code & Device Lookup (Matches Ticket, IMEI, Serial, Mobile, or Barcode)
  const findTicketOrDevice = (query: string) => {
    let cleanQuery = query.trim();
    
    // Check if query is a JSON string (from smart QR tags)
    if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanQuery);
        if (parsed.ticketId) cleanQuery = parsed.ticketId;
        else if (parsed.imei) cleanQuery = parsed.imei;
        else if (parsed.id) cleanQuery = parsed.id;
      } catch (e) {
        // ignore JSON parse error and fallback to string
      }
    }

    // Extract ticket ID from possible URL (e.g. https://.../repair/QF-REP-...)
    const urlMatch = cleanQuery.match(/QF-REP-[A-Za-z0-9-]+/i);
    if (urlMatch) {
      cleanQuery = urlMatch[0];
    }

    const qLower = cleanQuery.toLowerCase();
    const qDigits = cleanQuery.replace(/\D/g, '');

    // Search tickets
    const matchedTickets = tickets.filter(t => {
      const matchId = t.id.toLowerCase() === qLower || t.id.toLowerCase().includes(qLower);
      const matchImei = t.imeiSerialNumber.toLowerCase() === qLower || (qDigits.length >= 6 && t.imeiSerialNumber.includes(qDigits));
      const matchPhone = qDigits.length >= 6 && t.customerMobile.replace(/\D/g, '').includes(qDigits);
      const matchCustName = t.customerName.toLowerCase().includes(qLower);
      const matchModel = t.deviceModel.toLowerCase().includes(qLower) || t.deviceBrand.toLowerCase().includes(qLower);
      return matchId || matchImei || matchPhone || matchCustName || matchModel;
    });

    const primaryTicket = matchedTickets.find(t => 
      t.id.toLowerCase() === qLower || 
      t.imeiSerialNumber.toLowerCase() === qLower
    ) || matchedTickets[0];

    // Find customer
    let matchedCustomer: Customer | undefined;
    if (primaryTicket) {
      matchedCustomer = customers.find(c => c.id === primaryTicket.customerId);
    }
    if (!matchedCustomer && qDigits.length >= 6) {
      matchedCustomer = customers.find(c => c.mobileNumber.replace(/\D/g, '').includes(qDigits));
    }
    if (!matchedCustomer && qLower.length >= 3) {
      matchedCustomer = customers.find(c => c.fullName.toLowerCase().includes(qLower));
    }

    // Check inventory barcode/SKU
    const matchedInventory = inventory.find(i => 
      i.barcode === cleanQuery || 
      i.sku.toLowerCase() === qLower ||
      i.name.toLowerCase().includes(qLower)
    );

    // Check Technician Visiting Card (vCard format, QF-TECH ID, phone, or name)
    let matchedTechnician: TechnicianProfile | undefined;
    if (cleanQuery.includes('BEGIN:VCARD') || cleanQuery.includes('VCARD')) {
      for (const tech of technicians) {
        if (
          cleanQuery.toLowerCase().includes(tech.fullName.toLowerCase()) || 
          cleanQuery.includes(tech.id) || 
          cleanQuery.includes(tech.mobileNumber.replace(/\D/g, ''))
        ) {
          matchedTechnician = tech;
          break;
        }
      }
    }
    if (!matchedTechnician) {
      matchedTechnician = technicians.find(t => 
        t.id.toLowerCase() === qLower ||
        t.fullName.toLowerCase() === qLower ||
        t.shopName.toLowerCase() === qLower ||
        t.fullName.toLowerCase().includes(qLower) ||
        (qDigits.length >= 6 && t.mobileNumber.replace(/\D/g, '').includes(qDigits))
      );
    }

    return {
      ticket: primaryTicket,
      customer: matchedCustomer,
      matchedTechnician,
      allMatchingTickets: matchedTickets,
      matchedInventory,
      queryUsed: cleanQuery
    };
  };

  const addPartListing = (partData: Omit<PartListing, 'id' | 'technicianId' | 'technicianName' | 'technicianCity' | 'technicianWhatsapp' | 'postedDate' | 'status'>) => {
    const newId = `PART-${String(partsListings.length + 1).padStart(2, '0')}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newPart: PartListing = {
      ...partData,
      id: newId,
      technicianId: currentTech.id,
      technicianName: currentTech.fullName,
      technicianCity: currentTech.city,
      technicianWhatsapp: currentTech.whatsappNumber.replace(/[\s+]/g, ''),
      postedDate: today,
      status: 'available'
    };

    setPartsListings(prev => [newPart, ...prev]);
  };

  const addHelpPost = (title: string, problemDetails: string, deviceBrand: string, deviceModel: string, tags: string[], schematicUrl?: string) => {
    const newId = `HELP-${Date.now().toString().slice(-4)}`;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newPost: HelpPost = {
      id: newId,
      authorTechId: currentTech.id,
      authorName: currentTech.fullName,
      authorCity: currentTech.city,
      deviceBrand,
      deviceModel,
      title,
      problemDetails,
      schematicOrPhotoUrl: schematicUrl || 'https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      createdAt: now,
      tags,
      isResolved: false,
      replies: []
    };

    setHelpPosts(prev => [newPost, ...prev]);
  };

  const addHelpReply = (postId: string, replyText: string) => {
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newReply = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      authorTechId: currentTech.id,
      authorName: currentTech.fullName,
      authorCity: currentTech.city,
      isVerified: currentTech.verificationStatus === 'verified',
      replyText,
      timestamp: now,
      upvotes: 0,
      isSolution: false
    };

    setHelpPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...p.replies, newReply]
        };
      }
      return p;
    }));
  };

  const sendChatMessage = (message: string, badge?: string) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      senderName: currentTech.fullName,
      senderTechId: currentTech.id,
      senderCity: currentTech.city,
      message,
      timestamp: now,
      badge: badge || (currentTech.verificationStatus === 'verified' ? 'Verified Tech' : 'Workshop')
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const addNotification = (notif: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    actionRoute?: string;
    technicianId?: string;
  }): NotificationItem => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      technicianId: notif.technicianId || currentTech.id,
      title: notif.title,
      message: notif.message,
      timestamp: 'Just now',
      type: notif.type || 'system',
      isRead: false,
      actionRoute: notif.actionRoute || '/dashboard/customers'
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const saveDeviceMaintenanceSchedule = (schedule: Omit<DeviceMaintenanceSchedule, 'id'> & { id?: string }): DeviceMaintenanceSchedule => {
    const id = schedule.id || `SCHED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullSchedule: DeviceMaintenanceSchedule = { ...schedule, id };
    setDeviceMaintenanceSchedules(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullSchedule;
        return updated;
      }
      return [fullSchedule, ...prev];
    });
    return fullSchedule;
  };

  const deleteDeviceMaintenanceSchedule = (id: string) => {
    setDeviceMaintenanceSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <AppContext.Provider value={{
      userRole,
      currentTech,
      activeTab,
      setActiveTab,
      goBack,
      goHome,
      canGoBack,
      technicians,
      customers,
      tickets,
      warrantyClaims,
      warrantyPartUploads,
      inventory,
      customerCoinTransactions,
      partsListings,
      toolsListings,
      helpPosts,
      chatMessages,
      notifications,
      activeInvoiceTicket,
      setActiveInvoiceTicket,
      adminUser,
      adminActiveOtp,
      gmailActiveOtp,
      loginAsDemo,
      loginWithCredentials,
      validateAdminCredentials,
      generateAdminOtp,
      verifyAdminOtp,
      generateGmailOtp,
      verifyGmailOtp,
      logout,
      technicianPassword,
      adminPassword,
      changePassword,
      choosePassword,
      registerTechnician,
      updateTechnicianProfile,
      adminApproveTech,
      adminRejectTech,
      addCustomer,
      createRepairTicket,
      updateTicketStatus,
      updateTicketPayment,
      updateTicketPartsAndLabor,
      addAfterRepairPhoto,
      addCustomerFeedback,
      addInventoryItem,
      updateInventoryStock,
      updateInventoryItem,
      deleteInventoryItem,
      resetInventoryToZero,
      seedDefaultInventory,
      employees,
      activeStaff,
      setActiveStaff,
      isEmployeeActive,
      activeEmployeeName,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      switchStaffPersona,
      partDebitSales,
      debitPartOnSale,
      reorderList,
      addToReorderList,
      addAllLowStockToReorderList,
      removeFromReorderList,
      updateReorderQty,
      clearReorderList,
      inventorySubTab,
      setInventorySubTab,
      awardCustomerCoins,
      redeemCustomerCoins,
      findTicketOrDevice,
      createWarrantyClaim,
      updateWarrantyClaimStatus,
      addWarrantyPartUpload,
      addPartListing,
      addHelpPost,
      addHelpReply,
      sendChatMessage,
      markNotificationAsRead,
      addNotification,
      deviceMaintenanceSchedules,
      saveDeviceMaintenanceSchedule,
      deleteDeviceMaintenanceSchedule,
      formatINR,
      maskPhone,
      loadSampleDemoData,
      resetAllToCleanSlate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

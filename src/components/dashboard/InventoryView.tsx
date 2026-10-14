import React, { useState, useRef, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  IndianRupee, 
  Printer, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Package, 
  PlusCircle, 
  MinusCircle, 
  Phone, 
  Tag, 
  Sparkles, 
  QrCode,
  Layers,
  ArrowUpDown,
  Smartphone,
  Battery,
  Zap,
  CircuitBoard,
  Square,
  Shield,
  Camera,
  Volume2,
  Mic,
  Cpu,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  ShoppingBag,
  Lock,
  Unlock,
  Share2,
  MessageSquare,
  Copy,
  Users,
  Check,
  ShieldCheck,
  Flame,
  Snowflake,
  Bot,
  Lightbulb
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { InventoryItem, InventoryCategory, PartDebitSale } from '../../types';
import { 
  calculateAllPartSalesStats, 
  getTopSellingParts, 
  getDeadStockList, 
  calculateAutoSpareOrder, 
  generateInventorySuggestions 
} from '../../utils/inventoryAnalytics';
import { TopSellingPartsView } from './inventory/TopSellingPartsView';
import { DeadStockView } from './inventory/DeadStockView';
import { AutoSpareOrderView } from './inventory/AutoSpareOrderView';
import { InventorySuggestionsView } from './inventory/InventorySuggestionsView';

export type InventoryViewMode = 'all' | 'top_sales' | 'dead_stock' | 'auto_order' | 'suggestions';

export interface PartTypeScrollOption {
  id: string;
  name: string;
  category: InventoryCategory;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  skuPrefix: string;
  templateName: string;
  suggestedBin: string;
  defaultCost: number;
  defaultSell: number;
}

export const PART_TYPE_SCROLL_OPTIONS: PartTypeScrollOption[] = [
  {
    id: 'combo',
    name: 'Combo',
    category: 'Combo',
    tag: 'Folder / Display + Touch',
    icon: Smartphone,
    skuPrefix: 'CMB',
    templateName: 'Combo Display Folder Assembly (Touch + LCD)',
    suggestedBin: 'Shelf A - Combo Tray',
    defaultCost: 1800,
    defaultSell: 2800
  },
  {
    id: 'battery',
    name: 'Battery',
    category: 'Battery',
    tag: 'Li-Ion Power Cell',
    icon: Battery,
    skuPrefix: 'BAT',
    templateName: 'Original High Capacity Battery Pack',
    suggestedBin: 'Shelf B - Battery Drawer',
    defaultCost: 750,
    defaultSell: 1400
  },
  {
    id: 'charging_flex',
    name: 'Charging Flex',
    category: 'Charging Flex',
    tag: 'Main Sub-Flex Ribbon',
    icon: Zap,
    skuPrefix: 'CFX',
    templateName: 'Charging Port Main Sub-Flex Ribbon Cable',
    suggestedBin: 'Shelf C - Flex Cables',
    defaultCost: 350,
    defaultSell: 750
  },
  {
    id: 'charging_board',
    name: 'Charging Board',
    category: 'Charging Board',
    tag: 'CC Board / Mic PCB',
    icon: CircuitBoard,
    skuPrefix: 'CBD',
    templateName: 'CC Sub-Board Dock PCB with Mic',
    suggestedBin: 'Shelf C - CC Boards',
    defaultCost: 450,
    defaultSell: 950
  },
  {
    id: 'frame',
    name: 'Frame',
    category: 'Frame',
    tag: 'Display Bezel Frame',
    icon: Square,
    skuPrefix: 'FRM',
    templateName: 'Display Outer Bezel Frame Bracket',
    suggestedBin: 'Shelf D - Frame Bin',
    defaultCost: 650,
    defaultSell: 1250
  },
  {
    id: 'middle',
    name: 'Middle',
    category: 'Middle',
    tag: 'Chassis / Middle Ring',
    icon: Layers,
    skuPrefix: 'MID',
    templateName: 'Middle Ring Housing Chassis Assembly',
    suggestedBin: 'Shelf D - Middle Rings',
    defaultCost: 850,
    defaultSell: 1600
  },
  {
    id: 'back_panel',
    name: 'Back Panel',
    category: 'Back Panel',
    tag: 'Back Glass / Door',
    icon: Shield,
    skuPrefix: 'BKP',
    templateName: 'Back Glass Door Panel Cover with Camera Lens',
    suggestedBin: 'Shelf E - Back Panels',
    defaultCost: 550,
    defaultSell: 1100
  },
  {
    id: 'full_body',
    name: 'Full Body',
    category: 'Full Body',
    tag: 'Complete Housing Shell',
    icon: Package,
    skuPrefix: 'FBD',
    templateName: 'Complete Full Body Housing Shell with Buttons',
    suggestedBin: 'Shelf E - Full Bodies',
    defaultCost: 1900,
    defaultSell: 3200
  },
  {
    id: 'camera',
    name: 'Camera',
    category: 'Camera Modules',
    tag: 'Front / Rear Lens',
    icon: Camera,
    skuPrefix: 'CAM',
    templateName: 'Camera Sensor Module Assembly',
    suggestedBin: 'Optics Cabinet - Bin 01',
    defaultCost: 1200,
    defaultSell: 2200
  },
  {
    id: 'speaker',
    name: 'Speaker / Ringer',
    category: 'Speakers & Mics',
    tag: 'Buzzer & Earpiece',
    icon: Volume2,
    skuPrefix: 'SPK',
    templateName: 'Loudspeaker Buzzer & Ringer Unit',
    suggestedBin: 'Shelf B - Audio Bin',
    defaultCost: 280,
    defaultSell: 650
  },
  {
    id: 'mic',
    name: 'Mic / Audio',
    category: 'Charging Ports & Flex',
    tag: 'Microphone & Sensor',
    icon: Mic,
    skuPrefix: 'MIC',
    templateName: 'Microphone Sensor Flex Ribbon',
    suggestedBin: 'Shelf C - Flex Cables',
    defaultCost: 200,
    defaultSell: 500
  },
  {
    id: 'motherboard_ic',
    name: 'Motherboard / IC',
    category: 'Motherboard ICs',
    tag: 'Power / Charging IC',
    icon: Cpu,
    skuPrefix: 'IC',
    templateName: 'Power Management SMD IC Chip',
    suggestedBin: 'SMD Cabinet - Drawer 01',
    defaultCost: 850,
    defaultSell: 1800
  },
  {
    id: 'others',
    name: 'Others',
    category: 'Others',
    tag: 'General Spares & Misc',
    icon: MoreHorizontal,
    skuPrefix: 'OTH',
    templateName: 'Specialized Electronics Spare Component',
    suggestedBin: 'Bin General',
    defaultCost: 300,
    defaultSell: 600
  }
];

export const InventoryView: React.FC = () => {
  const { 
    inventory, 
    addInventoryItem, 
    updateInventoryStock, 
    updateInventoryItem,
    deleteInventoryItem, 
    resetInventoryToZero,
    seedDefaultInventory,
    formatINR, 
    currentTech,
    activeStaff,
    isEmployeeActive,
    switchStaffPersona,
    debitPartOnSale,
    partDebitSales,
    reorderList,
    addToReorderList,
    addAllLowStockToReorderList,
    removeFromReorderList,
    updateReorderQty,
    clearReorderList,
    customers,
    tickets,
    setActiveTab,
    userRole,
    inventorySubTab,
    setInventorySubTab
  } = useApp();

  const viewMode: InventoryViewMode = inventorySubTab || 'all';
  const setViewMode = (mode: InventoryViewMode) => setInventorySubTab(mode);
  const [bufferMultiplier, setBufferMultiplier] = useState<number>(1.2);

  // Precompute analytics & intelligence
  const salesStatsMap = useMemo(() => {
    return calculateAllPartSalesStats(inventory, partDebitSales || [], tickets || []);
  }, [inventory, partDebitSales, tickets]);

  const topSellingParts = useMemo(() => {
    return getTopSellingParts(salesStatsMap);
  }, [salesStatsMap]);

  const deadStockList = useMemo(() => {
    return getDeadStockList(salesStatsMap);
  }, [salesStatsMap]);

  const autoOrdersList = useMemo(() => {
    return calculateAutoSpareOrder(inventory, salesStatsMap, bufferMultiplier);
  }, [inventory, salesStatsMap, bufferMultiplier]);

  const suggestionsData = useMemo(() => {
    return generateInventorySuggestions(inventory, salesStatsMap, deadStockList, autoOrdersList);
  }, [inventory, salesStatsMap, deadStockList, autoOrdersList]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Staff Permission Alert / Notification
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  // Debit on Sale Modal State
  const [debitItem, setDebitItem] = useState<InventoryItem | null>(null);
  const [debitQty, setDebitQty] = useState<number>(1);
  const [debitCustomerName, setDebitCustomerName] = useState<string>('');
  const [debitCustomerPhone, setDebitCustomerPhone] = useState<string>('');
  const [debitPaymentMode, setDebitPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [debitRemarks, setDebitRemarks] = useState<string>('');
  const [debitSuccessSale, setDebitSuccessSale] = useState<PartDebitSale | null>(null);
  const [debitError, setDebitError] = useState<string | null>(null);

  // Reorder List Modal State (Direct Add & WhatsApp Share)
  const [showReorderModal, setShowReorderModal] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');

  // Owner Edit Price / Master Quantity Modal
  const [editingPriceItem, setEditingPriceItem] = useState<InventoryItem | null>(null);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editStockQuantity, setEditStockQuantity] = useState<number>(0);
  const [editLowThreshold, setEditLowThreshold] = useState<number>(1);

  // Search Options States
  const [searchField, setSearchField] = useState<'all' | 'name' | 'sku' | 'barcode' | 'model' | 'bin' | 'supplier'>('all');
  const [showSearchOptions, setShowSearchOptions] = useState<boolean>(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under1k' | '1k_3k' | 'above3k'>('all');
  const [sortBy, setSortBy] = useState<'name_az' | 'stock_low' | 'stock_high' | 'price_high' | 'price_low'>('name_az');

  // Quick Scroll Part Type selection inside Add Modal
  const [selectedPartType, setSelectedPartType] = useState<string>('combo');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Barcode & QR Label Modal
  const [labelItem, setLabelItem] = useState<InventoryItem | null>(null);
  const [qrLabelUrl, setQrLabelUrl] = useState<string>('');

  // Add Item Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Combo' as InventoryCategory,
    compatibleModels: '',
    stockQuantity: 5,
    lowStockThreshold: 2,
    costPrice: 1800,
    sellingPrice: 2800,
    locationBin: 'Shelf A - Combo Tray',
    supplierName: 'Metro Mobile Spares',
    supplierPhone: '+91 98200 11223',
    notes: ''
  });

  const categories: { label: string; value: string }[] = [
    { label: 'All Spares', value: 'ALL' },
    { label: 'Combo', value: 'Combo' },
    { label: 'Battery', value: 'Battery' },
    { label: 'Charging Flex', value: 'Charging Flex' },
    { label: 'Charging Board', value: 'Charging Board' },
    { label: 'Frame', value: 'Frame' },
    { label: 'Middle', value: 'Middle' },
    { label: 'Back Panel', value: 'Back Panel' },
    { label: 'Full Body', value: 'Full Body' },
    { label: 'Displays & OLEDs', value: 'Screens & Displays' },
    { label: 'Cameras', value: 'Camera Modules' },
    { label: 'Motherboard ICs', value: 'Motherboard ICs' },
    { label: 'Speakers & Mics', value: 'Speakers & Mics' },
    { label: 'Others', value: 'Others' }
  ];

  // Active search options count
  const activeSearchOptionsCount = 
    (searchField !== 'all' ? 1 : 0) +
    (stockFilter !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (showLowStockOnly ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (sortBy !== 'name_az' ? 1 : 0);

  const handleResetSearchOptions = () => {
    setSearchQuery('');
    setSearchField('all');
    setSelectedCategory('ALL');
    setShowLowStockOnly(false);
    setStockFilter('all');
    setPriceFilter('all');
    setSortBy('name_az');
  };

  // Filtering with Search Options
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return inventory.filter(item => {
      // 1. Search Query with Field Option
      if (q) {
        if (searchField === 'name') {
          if (!item.name.toLowerCase().includes(q)) return false;
        } else if (searchField === 'sku') {
          if (!item.sku.toLowerCase().includes(q)) return false;
        } else if (searchField === 'barcode') {
          if (!item.barcode.includes(q)) return false;
        } else if (searchField === 'model') {
          const matchesModel = (item.compatibleModels || item.compatibleBrands || []).some((m: string) => m.toLowerCase().includes(q));
          if (!matchesModel) return false;
        } else if (searchField === 'bin') {
          if (!item.locationBin.toLowerCase().includes(q)) return false;
        } else if (searchField === 'supplier') {
          if (!item.supplierName.toLowerCase().includes(q)) return false;
        } else {
          // 'all'
          const matchesAny = 
            item.name.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.barcode.includes(q) ||
            item.locationBin.toLowerCase().includes(q) ||
            item.supplierName.toLowerCase().includes(q) ||
            (item.compatibleModels || item.compatibleBrands || []).some((m: string) => m.toLowerCase().includes(q));
          if (!matchesAny) return false;
        }
      }

      // 2. Category Option
      const matchesCategory = 
        selectedCategory === 'ALL' || 
        item.category === selectedCategory ||
        (selectedCategory === 'Combo' && (item.category === 'Screens' || item.category === 'Screens & Displays')) ||
        (selectedCategory === 'Battery' && (item.category === 'Batteries')) ||
        (selectedCategory === 'Charging Flex' && (item.category === 'Charging Ports' || item.category === 'Charging Ports & Flex' || item.category === 'Flex Cables')) ||
        (selectedCategory === 'Charging Board' && (item.category === 'Charging Ports' || item.category === 'Charging Ports & Flex')) ||
        (selectedCategory === 'Back Panel' && (item.category === 'Back Glass' || item.category === 'Back Glass & Housings')) ||
        (selectedCategory === 'Frame' && item.name.toLowerCase().includes('frame')) ||
        (selectedCategory === 'Middle' && (item.name.toLowerCase().includes('middle') || item.category === 'Back Glass & Housings')) ||
        (selectedCategory === 'Full Body' && item.name.toLowerCase().includes('full body')) ||
        (selectedCategory === 'Screens & Displays' && (item.category === 'Combo' || item.category === 'Screens')) ||
        (selectedCategory === 'Camera Modules' && (item.category === 'Cameras')) ||
        (selectedCategory === 'Motherboard ICs' && (item.category === 'ICs & Motherboard'));

      if (!matchesCategory) return false;

      // 3. Low Stock Quick Toggle
      if (showLowStockOnly && item.stockQuantity > item.lowStockThreshold) {
        return false;
      }

      // 4. Stock Filter Option
      if (stockFilter === 'in_stock' && item.stockQuantity <= item.lowStockThreshold) return false;
      if (stockFilter === 'low_stock' && (item.stockQuantity === 0 || item.stockQuantity > item.lowStockThreshold)) return false;
      if (stockFilter === 'out_of_stock' && item.stockQuantity > 0) return false;

      // 5. Price Filter Option
      if (priceFilter === 'under1k' && item.sellingPrice >= 1000) return false;
      if (priceFilter === '1k_3k' && (item.sellingPrice < 1000 || item.sellingPrice > 3000)) return false;
      if (priceFilter === 'above3k' && item.sellingPrice <= 3000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'stock_low') return a.stockQuantity - b.stockQuantity;
      if (sortBy === 'stock_high') return b.stockQuantity - a.stockQuantity;
      if (sortBy === 'price_high') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'price_low') return a.sellingPrice - b.sellingPrice;
      // 'name_az'
      return a.name.localeCompare(b.name);
    });
  }, [inventory, searchQuery, searchField, selectedCategory, showLowStockOnly, stockFilter, priceFilter, sortBy]);

  // KPI Calculations
  const totalUnits = inventory.reduce((acc, curr) => acc + curr.stockQuantity, 0);
  const totalCostValuation = inventory.reduce((acc, curr) => acc + (curr.stockQuantity * curr.costPrice), 0);
  const totalRetailValuation = inventory.reduce((acc, curr) => acc + (curr.stockQuantity * curr.sellingPrice), 0);
  const potentialProfit = totalRetailValuation - totalCostValuation;
  const lowStockItems = inventory.filter(i => i.stockQuantity <= i.lowStockThreshold);

  // Auto-generate SKU / Barcode helper
  const handleGenerateSku = (prefixOverride?: string) => {
    const rawPrefix = prefixOverride || formData.category.slice(0, 3);
    const prefix = rawPrefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'PAR';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generatedSku = `SKU-${prefix}-${rand}`;
    const generatedBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setFormData(prev => ({
      ...prev,
      sku: generatedSku,
      barcode: generatedBarcode
    }));
  };

  // Scroll Part Type strip left / right
  const handleScrollPartTypes = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle selecting a Part Type from the scroll strip
  const handleSelectPartType = (opt: PartTypeScrollOption) => {
    setSelectedPartType(opt.id);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generatedSku = `SKU-${opt.skuPrefix}-${rand}`;
    const generatedBarcode = formData.barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setFormData(prev => {
      // If name is blank or matches a template name, suggest the template name
      const isBlankOrTemplate = !prev.name.trim() || 
        PART_TYPE_SCROLL_OPTIONS.some(o => prev.name.includes(o.templateName) || prev.name === o.name);

      return {
        ...prev,
        category: opt.category,
        sku: generatedSku,
        barcode: generatedBarcode,
        name: isBlankOrTemplate ? opt.templateName : prev.name,
        locationBin: (prev.locationBin === 'Shelf A - Combo Tray' || prev.locationBin === 'Bin A-01') ? opt.suggestedBin : prev.locationBin,
        costPrice: prev.costPrice === 1800 || prev.costPrice === 1200 ? opt.defaultCost : prev.costPrice,
        sellingPrice: prev.sellingPrice === 2800 || prev.sellingPrice === 2200 ? opt.defaultSell : prev.sellingPrice
      };
    });
  };

  const handleOpenAddModal = (presetId?: string) => {
    const targetOpt = presetId 
      ? PART_TYPE_SCROLL_OPTIONS.find(o => o.id === presetId) 
      : PART_TYPE_SCROLL_OPTIONS[0];

    const opt = targetOpt || PART_TYPE_SCROLL_OPTIONS[0];
    setSelectedPartType(opt.id);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generatedSku = `SKU-${opt.skuPrefix}-${rand}`;
    const generatedBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    setFormData({
      name: '',
      sku: generatedSku,
      barcode: generatedBarcode,
      category: opt.category,
      compatibleModels: '',
      stockQuantity: 5,
      lowStockThreshold: 2,
      costPrice: opt.defaultCost,
      sellingPrice: opt.defaultSell,
      locationBin: opt.suggestedBin,
      supplierName: 'Metro Mobile Spares Hub',
      supplierPhone: '+91 98200 11223',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const modelsArray = formData.compatibleModels
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    addInventoryItem({
      name: formData.name.trim(),
      sku: formData.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: formData.barcode.trim() || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: formData.category,
      compatibleModels: modelsArray.length > 0 ? modelsArray : ['Universal'],
      stockQuantity: Number(formData.stockQuantity) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 1,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      locationBin: formData.locationBin.trim() || 'Bin General',
      supplierName: formData.supplierName.trim() || 'Local Electronics Market',
      supplierPhone: formData.supplierPhone.trim() || '+91 98200 11223',
      notes: formData.notes.trim()
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      category: 'Combo',
      compatibleModels: '',
      stockQuantity: 5,
      lowStockThreshold: 2,
      costPrice: 1800,
      sellingPrice: 2800,
      locationBin: 'Shelf A - Combo Tray',
      supplierName: '',
      supplierPhone: '',
      notes: ''
    });
  };

  // Open Barcode Label
  const handleOpenLabel = async (item: InventoryItem) => {
    setLabelItem(item);
    try {
      const qrData = JSON.stringify({
        sku: item.sku,
        barcode: item.barcode,
        name: item.name,
        price: item.sellingPrice,
        bin: item.locationBin
      });
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setQrLabelUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate label QR', err);
    }
  };

  // Open Debit on Sale Modal
  const handleOpenDebitSale = (item: InventoryItem) => {
    if (item.stockQuantity <= 0) {
      setPermissionAlert(`"${item.name}" is completely out of stock! Cannot debit zero stock.`);
      return;
    }
    setDebitItem(item);
    setDebitQty(1);
    setDebitCustomerName('');
    setDebitCustomerPhone('');
    setDebitPaymentMode('Cash');
    setDebitRemarks('');
    setDebitSuccessSale(null);
    setDebitError(null);
  };

  const handleConfirmDebitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitItem) return;

    const res = debitPartOnSale({
      inventoryItemId: debitItem.id,
      quantity: debitQty,
      customerName: debitCustomerName,
      customerPhone: debitCustomerPhone,
      paymentMode: debitPaymentMode,
      saleRemarks: debitRemarks
    });

    if (res.success && res.sale) {
      setDebitSuccessSale(res.sale);
      setDebitError(null);
    } else {
      setDebitError(res.message);
    }
  };

  // Owner Price & Quantity Editing (Blocked for employees)
  const handleOpenEditPrice = (item: InventoryItem) => {
    if (isEmployeeActive) {
      setPermissionAlert('🔒 Restricted: Only the workshop owner (main user) can edit selling prices or arbitrary quantities. Staff can only debit parts upon sale.');
      return;
    }
    setEditingPriceItem(item);
    setEditSellingPrice(item.sellingPrice);
    setEditCostPrice(item.costPrice);
    setEditStockQuantity(item.stockQuantity);
    setEditLowThreshold(item.lowStockThreshold);
  };

  const handleSaveEditPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem || isEmployeeActive) return;

    const updatedQty = Math.max(0, Number(editStockQuantity));
    updateInventoryStock(editingPriceItem.id, updatedQty);

    const target = inventory.find(i => i.id === editingPriceItem.id);
    if (target) {
      target.sellingPrice = Math.max(0, Number(editSellingPrice));
      target.costPrice = Math.max(0, Number(editCostPrice));
      target.lowStockThreshold = Math.max(1, Number(editLowThreshold));
    }
    setEditingPriceItem(null);
    setPermissionAlert(`✓ Successfully updated prices and stock settings for "${editingPriceItem.name}".`);
  };

  // Reorder List Actions (Direct Add & WhatsApp Share)
  const handleDirectAddReorder = (itemId: string, qty = 5) => {
    addToReorderList(itemId, qty);
    const item = inventory.find(i => i.id === itemId);
    setPermissionAlert(`✓ Added "${item?.name || 'Part'}" to Reorder List (${qty} pcs).`);
  };

  const handleAddAllLowStockToReorder = () => {
    const count = addAllLowStockToReorderList();
    setShowReorderModal(true);
    setPermissionAlert(`✓ Added ${count} low stock parts to the Reorder List! Ready to share on WhatsApp.`);
  };

  // Generate WhatsApp text for purchase reorder
  const generateWhatsAppReorderMessage = (selectedSup?: string) => {
    const list = (selectedSup && selectedSup !== 'ALL')
      ? reorderList.filter(r => r.supplierName === selectedSup)
      : reorderList;

    const totalUnits = list.reduce((acc, curr) => acc + curr.orderQuantity, 0);

    let text = `📦 *URGENT SPARE PARTS PURCHASE REORDER*\n` +
      `🏪 *Workshop:* ${currentTech.shopName}\n` +
      `📍 *Location:* ${currentTech.city}, ${currentTech.state} (${currentTech.id})\n` +
      `👤 *Owner:* ${currentTech.fullName} (${currentTech.mobileNumber})\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\n` +
      `──────────────────────────────\n` +
      `📋 *REQUIRED PARTS LIST (${list.length} Items - ${totalUnits} Units Total):*\n\n`;

    list.forEach((item, idx) => {
      text += `${idx + 1}. *${item.partName}*\n` +
        `   • SKU: ${item.sku}\n` +
        `   • Category: ${item.category}\n` +
        `   • In-Stock: ${item.currentStock} pcs (Threshold: ${item.threshold})\n` +
        `   • ⚡ *REQUIRED ORDER QTY: ${item.orderQuantity} pcs*\n` +
        `   • Supplier: ${item.supplierName}\n\n`;
    });

    text += `──────────────────────────────\n` +
      `⚡ *Kindly check stock availability, confirm wholesale pricing, and dispatch via express courier ASAP!*\n` +
      `🙏 *Thank you - ${currentTech.shopName}*`;

    return text;
  };

  const handleShareWhatsApp = (supplierName?: string, supplierPhone?: string) => {
    const message = generateWhatsAppReorderMessage(supplierName);
    const cleanPhone = supplierPhone ? supplierPhone.replace(/[^0-9]/g, '') : '';
    const url = (cleanPhone && cleanPhone.length >= 10)
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyWhatsApp = (supplierName?: string) => {
    const msg = generateWhatsAppReorderMessage(supplierName);
    navigator.clipboard.writeText(msg);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Spares & Components Inventory
              </h1>
              <p className="text-xs text-slate-500">
                Track mobile phone displays, batteries, flex cables, ICs, shelf bins, and supplier reorders
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reorder List & WhatsApp Share Button */}
          <button
            data-testid="btn-open-reorder-modal"
            onClick={() => setShowReorderModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            title="Open Spare Parts Reorder List and Share to WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reorder List</span>
            {reorderList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-900 text-emerald-100 rounded-full text-[10px] font-mono">
                {reorderList.length}
              </span>
            )}
          </button>

          {/* Manage Staff Button */}
          <button
            data-testid="btn-manage-staff-inventory"
            onClick={() => setActiveTab('employees')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>Staff Permissions</span>
          </button>

          {/* Owner Quick Zero Inventory Reset / Restore Option */}
          {!isEmployeeActive && (
            inventory.length > 0 ? (
              <button
                data-testid="btn-zero-inventory"
                onClick={() => {
                  if (confirm('Set inventory to ZERO for a fresh workshop setup? All spare items will be removed.')) {
                    resetInventoryToZero();
                    setPermissionAlert('✓ Inventory cleared. Zero inventory active for this workshop.');
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Clear all stock to start with zero inventory"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Zero Inventory</span>
              </button>
            ) : (
              <button
                data-testid="btn-restore-inventory"
                onClick={() => {
                  seedDefaultInventory();
                  setPermissionAlert('✓ Standard starter spares inventory loaded.');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Load demo starter inventory"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Load Demo Spares</span>
              </button>
            )
          )}

          {/* Add Spare Part Button (Locked for staff) */}
          {isEmployeeActive ? (
            <button
              onClick={() => setPermissionAlert('🔒 Restricted: Only the workshop owner (main user) can add new spare parts to inventory.')}
              className="px-4 py-2 bg-slate-200 text-slate-500 text-xs font-bold font-heading rounded-xl flex items-center gap-1.5 cursor-not-allowed"
              title="Add part disabled for employees"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Part (Owner Only)</span>
            </button>
          ) : (
            <button
              data-testid="btn-add-spare-part"
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Spare Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Staff Operator Status Banner */}
      {activeStaff.type === 'employee' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold block">
                Operating as Staff: {activeStaff.employee.fullName} ({activeStaff.employee.roleTitle})
              </span>
              <span className="text-amber-800 text-[11px]">
                You can record customer sales and debit parts below. Selling prices and arbitrary quantity changes are restricted to the workshop owner.
              </span>
            </div>
          </div>
          <button
            onClick={() => switchStaffPersona('owner')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shrink-0 self-start sm:self-auto text-xs"
          >
            Switch to Owner
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Workshop Owner Mode:</strong> Logged in as <strong>{userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName}</strong>. Full authority over selling prices, cost valuations, and stock adjustments.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('employees')}
            className="text-xs text-indigo-700 font-bold hover:underline shrink-0"
          >
            Configure 2 Staff Accounts →
          </button>
        </div>
      )}

      {/* Permission or Success Notice */}
      {permissionAlert && (
        <div className="p-3 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{permissionAlert}</span>
          <button onClick={() => setPermissionAlert(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Inventory Intelligence Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            data-testid="tab-inventory-all"
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              viewMode === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>All Spares Stock</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              viewMode === 'all' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {inventory.length}
            </span>
          </button>

          <button
            data-testid="tab-inventory-top-sales"
            onClick={() => setViewMode('top_sales')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              viewMode === 'top_sales'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Most Sale Parts</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              viewMode === 'top_sales' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {topSellingParts.length}
            </span>
          </button>

          <button
            data-testid="tab-inventory-dead-stock"
            onClick={() => setViewMode('dead_stock')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              viewMode === 'dead_stock'
                ? 'bg-sky-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50/70'
            }`}
          >
            <Snowflake className="w-4 h-4 text-sky-400" />
            <span>Dead Stock List</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              viewMode === 'dead_stock' ? 'bg-sky-800 text-sky-100' : 'bg-rose-100 text-rose-800'
            }`}>
              {deadStockList.length}
            </span>
          </button>

          <button
            data-testid="tab-inventory-auto-order"
            onClick={() => setViewMode('auto_order')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              viewMode === 'auto_order'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-800 hover:bg-indigo-50/70'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Auto Spare Order (Last Month Stock)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              viewMode === 'auto_order' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {autoOrdersList.length}
            </span>
          </button>

          <button
            data-testid="tab-inventory-suggestions"
            onClick={() => setViewMode('suggestions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              viewMode === 'suggestions'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/70'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-300" />
            <span>Suggestions</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
              viewMode === 'suggestions' ? 'bg-purple-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {suggestionsData.suggestions.length}
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'top_sales' ? (
        <TopSellingPartsView
          topParts={topSellingParts}
          formatINR={formatINR}
          onOpenDebit={handleOpenDebitSale}
          onAddToReorder={(itemId, qty) => addToReorderList(itemId, qty)}
          inventory={inventory}
        />
      ) : viewMode === 'dead_stock' ? (
        <DeadStockView
          deadStockList={deadStockList}
          formatINR={formatINR}
          updateInventoryItem={updateInventoryItem}
          setActiveTab={setActiveTab}
          shopName={currentTech?.shopName || 'QuickFix Workshop'}
        />
      ) : viewMode === 'auto_order' ? (
        <AutoSpareOrderView
          autoOrders={autoOrdersList}
          formatINR={formatINR}
          onAddAllToReorder={() => {
            autoOrdersList.forEach(o => addToReorderList(o.item.id, o.recommendedOrderQty));
          }}
          onAddSingleToReorder={(itemId, qty) => addToReorderList(itemId, qty)}
          bufferMultiplier={bufferMultiplier}
          onBufferChange={setBufferMultiplier}
          shopName={currentTech?.shopName || 'QuickFix Workshop'}
          shopAddress={`${currentTech?.city || 'Mumbai'}, ${currentTech?.state || 'Maharashtra'}`}
          shopPhone={currentTech?.whatsappNumber || currentTech?.mobileNumber || '+91 95413 71468'}
        />
      ) : viewMode === 'suggestions' ? (
        <InventorySuggestionsView
          suggestions={suggestionsData.suggestions}
          healthScore={suggestionsData.healthScore}
          totalLockedCapital={suggestionsData.totalLockedCapital}
          fastMovingRatio={suggestionsData.fastMovingRatio}
          formatINR={formatINR}
          onAddToReorder={(itemId, qty) => addToReorderList(itemId, qty)}
          updateInventoryItem={updateInventoryItem}
          setActiveTab={setActiveTab}
          inventory={inventory}
        />
      ) : (
        <>
          {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Stock Units</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {totalUnits}
          </div>
          <span className="text-[11px] text-slate-400">
            Across {inventory.length} spare parts
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Inventory Valuation</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 font-mono">
            {formatINR(totalCostValuation)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Retail: {formatINR(totalRetailValuation)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Projected Profit</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-indigo-900 font-mono">
            {formatINR(potentialProfit)}
          </div>
          <span className="text-[11px] text-slate-400">
            {totalCostValuation > 0 ? Math.round((potentialProfit / totalCostValuation) * 100) : 0}% markup
          </span>
        </div>

        <div 
          onClick={() => setShowLowStockOnly(prev => !prev)}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            lowStockItems.length > 0 
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className={`text-xs font-semibold ${lowStockItems.length > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Low Stock Alerts
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-heading ${lowStockItems.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {lowStockItems.length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">
            {showLowStockOnly ? 'Showing low stock items' : 'Click to filter'}
          </span>
        </div>
      </div>

      {/* Low Stock Urgent Warning Banner */}
      {lowStockItems.length > 0 && !showLowStockOnly && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {lowStockItems.length} spare part{lowStockItems.length > 1 ? 's' : ''} below reorder threshold:
              </span>
              <span className="text-rose-700">
                {lowStockItems.map(i => `${i.name} (${i.stockQuantity} left)`).join(', ')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              data-testid="btn-direct-add-all-low-stock"
              onClick={handleAddAllLowStockToReorder}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
              title="Add all low stock parts to reorder list with 1 click"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>⚡ Direct Add All ({lowStockItems.length}) to Reorder List</span>
            </button>

            <button
              data-testid="btn-share-whatsapp-low-stock"
              onClick={() => {
                addAllLowStockToReorderList();
                setShowReorderModal(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              title="Open purchase list and share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              data-testid="btn-filter-low-stock-banner"
              onClick={() => setShowLowStockOnly(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs"
            >
              Filter Low Stock
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Search Options & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Main Search Bar & Target Field Selector */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Target Field Option Dropdown */}
          <div className="sm:w-48 shrink-0">
            <label className="sr-only">Search Field Option</label>
            <div className="relative">
              <select
                data-testid="select-inventory-search-field"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-sky-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">🔍 Search: All Fields</option>
                <option value="name">📦 Part Name</option>
                <option value="sku">🏷️ SKU Code</option>
                <option value="barcode">📶 Barcode Number</option>
                <option value="model">📱 Compatible Model</option>
                <option value="bin">🗄️ Shelf / Bin Location</option>
                <option value="supplier">🏢 Supplier Name</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              data-testid="input-search-inventory"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchField === 'name' ? 'Search part name, e.g. AMOLED Display, Battery...' :
                searchField === 'sku' ? 'Enter SKU code, e.g. SKU-COM-4120...' :
                searchField === 'barcode' ? 'Enter barcode digits, e.g. 8904...' :
                searchField === 'model' ? 'Search device model, e.g. OnePlus 11, iPhone 13...' :
                searchField === 'bin' ? 'Search shelf/bin, e.g. Shelf A, Tray 2...' :
                searchField === 'supplier' ? 'Search supplier name...' :
                'Search by part name, SKU, barcode, device model, or shelf location...'
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
              data-testid="btn-toggle-inventory-search-options"
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

            {/* Quick Low Stock Toggle */}
            <button
              data-testid="btn-toggle-low-stock-filter"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showLowStockOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Low Stock</span>
            </button>
          </div>
        </div>

        {/* Quick Search Option Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Options:
          </span>
          {[
            { label: '📱 AMOLED Displays', category: 'Screens & Displays' },
            { label: '🔋 Battery Packs', category: 'Battery' },
            { label: '⚡ Charging Flex', category: 'Charging Flex' },
            { label: '⚠️ Low Stock (<3)', stock: 'low_stock' as const },
            { label: '💎 High Value (>₹3k)', price: 'above3k' as const }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (preset.category) setSelectedCategory(preset.category);
                if (preset.stock) setStockFilter(preset.stock);
                if (preset.price) setPriceFilter(preset.price);
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
                <span>Advanced Inventory Search & Filter Options</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stock Status Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Stock Level Availability
                </label>
                <select
                  data-testid="select-option-stock-filter"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in_stock">✅ In Stock (Available)</option>
                  <option value="low_stock">⚠️ Low Stock (Near Reorder)</option>
                  <option value="out_of_stock">❌ Out of Stock (0 units)</option>
                </select>
              </div>

              {/* Price Range Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Retail Price Range
                </label>
                <select
                  data-testid="select-option-price-filter"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="under1k">Under ₹1,000</option>
                  <option value="1k_3k">₹1,000 - ₹3,000</option>
                  <option value="above3k">Above ₹3,000</option>
                </select>
              </div>

              {/* Sort Order Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <select
                  data-testid="select-option-inventory-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option value="name_az">🔤 Part Name (A-Z)</option>
                  <option value="stock_low">📉 Stock: Low to High</option>
                  <option value="stock_high">📈 Stock: High to Low</option>
                  <option value="price_high">💰 Price: High to Low</option>
                  <option value="price_low">🪙 Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat.value}
              data-testid={`filter-category-${cat.value}`}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Search Options Summary & Match Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-sky-700">{filteredItems.length}</strong> of {inventory.length} spares
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

            {stockFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-medium">
                Stock: {stockFilter}
                <button type="button" onClick={() => setStockFilter('all')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                Price: {priceFilter}
                <button type="button" onClick={() => setPriceFilter('all')} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-medium">
                Category: {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory('ALL')} className="hover:text-purple-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {showLowStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-medium">
                Low Stock Only
                <button type="button" onClick={() => setShowLowStockOnly(false)} className="hover:text-rose-950">
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

      {/* Inventory Items List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isLow = item.stockQuantity <= item.lowStockThreshold;
          return (
            <div
              key={item.id}
              data-testid={`inventory-row-${item.id}`}
              className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isLow ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Part Details */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {item.sku}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {item.category}
                  </span>
                  {isLow && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low Stock Alert</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-700">Location:</strong> {item.locationBin}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">Barcode:</strong> {item.barcode}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">Supplier:</strong> {item.supplierName} ({item.supplierPhone || item.supplierContact || 'Verified'})
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[11px] pt-0.5">
                  <span className="text-slate-400">Fits:</span>
                  {(item.compatibleModels || item.compatibleBrands || []).map((m: string) => (
                    <span key={m} className="px-1.5 py-0.2 bg-slate-50 rounded text-slate-600 border border-slate-200 text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing, Debit on Sale & Stock Controls */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Cost vs Selling Price */}
                {isEmployeeActive ? (
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-900 font-mono text-sm flex items-center justify-end gap-1" title="Selling price is fixed by workshop owner">
                      <span>{formatINR(item.sellingPrice)}</span>
                      <Lock className="w-3 h-3 text-amber-600" />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cost: •••••• (Owner Only)
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleOpenEditPrice(item)}
                    className="text-right text-xs cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Click to edit selling price or cost (Owner)"
                  >
                    <div className="font-bold text-slate-900 font-mono text-sm group-hover:text-sky-600 flex items-center justify-end gap-1">
                      <span>{formatINR(item.sellingPrice)}</span>
                      <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cost: {formatINR(item.costPrice)} (+{formatINR(item.sellingPrice - item.costPrice)})
                    </div>
                  </div>
                )}

                {/* Prominent Debit on Sale Button (Available to both employees and owner!) */}
                <button
                  data-testid={`btn-debit-sale-${item.id}`}
                  onClick={() => handleOpenDebitSale(item)}
                  disabled={item.stockQuantity <= 0}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 shrink-0"
                  title={item.stockQuantity > 0 ? "Debit part upon customer sale" : "Out of stock"}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Debit on Sale</span>
                </button>

                {/* Stock Quantity Controls */}
                {isEmployeeActive ? (
                  /* Employee View: Quantity Stepper Locked (Employees cannot edit quantity directly) */
                  <div 
                    className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200"
                    title="Stock quantity editing locked for staff. To reduce stock, record a customer sale."
                  >
                    <div className="px-1 text-center min-w-[36px]">
                      <span className={`font-mono font-bold text-sm block ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.stockQuantity}
                      </span>
                      <span className="text-[9px] text-slate-400 block -mt-1">units</span>
                    </div>
                    <div className="p-0.5 text-amber-700 bg-amber-50 rounded" title="Quantity locked for staff">
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>
                ) : (
                  /* Owner View: Full Stock Stepper Controls */
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      data-testid={`btn-decrease-stock-${item.id}`}
                      onClick={() => updateInventoryStock(item.id, item.stockQuantity - 1)}
                      disabled={item.stockQuantity <= 0}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40"
                      title="Deduct 1 unit (Owner)"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>

                    <div 
                      onClick={() => handleOpenEditPrice(item)}
                      className="px-2 text-center min-w-[36px] cursor-pointer hover:bg-white rounded transition-colors"
                      title="Click to edit quantity or price"
                    >
                      <span className={`font-mono font-bold text-sm block ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.stockQuantity}
                      </span>
                      <span className="text-[9px] text-slate-400 block -mt-1">units</span>
                    </div>

                    <button
                      data-testid={`btn-increase-stock-${item.id}`}
                      onClick={() => updateInventoryStock(item.id, item.stockQuantity + 1)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-sky-600"
                      title="Add 1 unit (Owner)"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Direct Add to Reorder List Button */}
                {(() => {
                  const isInReorder = reorderList.some(r => r.inventoryItemId === item.id);
                  return (
                    <button
                      data-testid={`btn-add-reorder-${item.id}`}
                      onClick={() => handleDirectAddReorder(item.id, 5)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isInReorder 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                      }`}
                      title={isInReorder ? "Already in reorder list (Click to add +5 more)" : "Add to WhatsApp purchase reorder list"}
                    >
                      {isInReorder ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4 text-slate-500" />}
                    </button>
                  );
                })()}

                {/* Actions: QR Label & Delete (Delete is Owner only) */}
                <div className="flex items-center gap-1">
                  <button
                    data-testid={`btn-open-label-${item.id}`}
                    onClick={() => handleOpenLabel(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-colors"
                    title="Print Part Barcode / QR Label"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  {!isEmployeeActive && (
                    <>
                      <button
                        data-testid={`btn-edit-price-${item.id}`}
                        onClick={() => handleOpenEditPrice(item)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors"
                        title="Edit Price & Quantity (Owner Only)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        data-testid={`btn-delete-part-${item.id}`}
                        onClick={() => {
                          if (confirm(`Remove "${item.name}" from inventory?`)) {
                            deleteInventoryItem(item.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                        title="Delete Part (Owner Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {inventory.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Boxes className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Zero Inventory • Clean Workshop Setup
              </h3>
              <p className="text-xs text-slate-500">
                Your workshop currently has 0 spare parts in stock. As the main user, you have complete authority to add spare parts, configure cost & selling prices, and print QR barcode labels.
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-amber-800 font-medium bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 inline-flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Staff / Employee Protection: Employees can only debit parts upon sale, never edit prices or stock.</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isEmployeeActive ? (
                <>
                  <button
                    data-testid="btn-empty-add-part"
                    onClick={() => handleOpenAddModal()}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Spare Part</span>
                  </button>

                  <button
                    data-testid="btn-empty-load-demo"
                    onClick={() => {
                      seedDefaultInventory();
                      setPermissionAlert('✓ Standard starter spares inventory loaded.');
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Load Demo Starter Parts (Optional)</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-amber-700 font-medium">
                  Staff member logged in. Please ask the workshop owner to add initial spare parts to stock.
                </div>
              )}
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No spare parts found matching your criteria. Click "Add Spare Part" to add to stock.
          </div>
        ) : null}
      </div>
      </>
      )}

      {/* MODAL: Add New Spare Part */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-heading font-bold text-base">Add Spare Part to Stock</h3>
                  <p className="text-[11px] text-slate-400">Select part type or customize specifications</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick Part Type Scroll Strip */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-heading font-bold text-xs text-slate-800">
                      Quick Part Type (Scroll to Select)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleScrollPartTypes('left')}
                      className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                      title="Scroll left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScrollPartTypes('right')}
                      className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                      title="Scroll right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scroll Strip */}
                <div 
                  ref={scrollContainerRef}
                  className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {PART_TYPE_SCROLL_OPTIONS.map((opt) => {
                    const isSelected = selectedPartType === opt.id || formData.category === opt.category;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        data-testid={`btn-quick-part-${opt.id}`}
                        onClick={() => handleSelectPartType(opt)}
                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border select-none ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50/50 shadow-2xs'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-heading font-bold text-xs whitespace-nowrap">
                              {opt.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-sky-200" />}
                          </div>
                          <span className={`text-[10px] block whitespace-nowrap ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                            {opt.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Part Name / Component Title *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Original OLED Screen Assembly with Frame"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />

                {/* Quick Name Appenders */}
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-600 shrink-0">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = PART_TYPE_SCROLL_OPTIONS.find(o => o.id === selectedPartType);
                      const base = cur ? cur.name : 'Component';
                      setFormData(prev => ({ ...prev, name: `${base} Original (Tested 100%)` }));
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                  >
                    Original 100% Tested
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = PART_TYPE_SCROLL_OPTIONS.find(o => o.id === selectedPartType);
                      const base = cur ? cur.name : 'Component';
                      setFormData(prev => ({ ...prev, name: `${base} with Frame Assembly` }));
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                  >
                    With Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = PART_TYPE_SCROLL_OPTIONS.find(o => o.id === selectedPartType);
                      const base = cur ? cur.name : 'Component';
                      setFormData(prev => ({ ...prev, name: `${base} Grade A+ OEM Quality` }));
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                  >
                    Grade A+ OEM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category / Spare Type</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as InventoryCategory;
                      setFormData({ ...formData, category: newCat });
                      const matched = PART_TYPE_SCROLL_OPTIONS.find(o => o.category === newCat);
                      if (matched) setSelectedPartType(matched.id);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  >
                    {categories.filter(c => c.value !== 'ALL').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">SKU Code</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateSku()}
                      className="text-[10px] text-sky-600 font-semibold hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Barcode (EAN-13 / Code-128)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compatible Device Models (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.compatibleModels}
                  onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
                  placeholder="e.g. iPhone 15, iPhone 15 Pro, iPhone 14 Pro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Quantity (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling / Retail Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Shelf / Bin</label>
                  <input
                    type="text"
                    value={formData.locationBin}
                    onChange={(e) => setFormData({ ...formData, locationBin: e.target.value })}
                    placeholder="e.g. Bin B-03, Drawer 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name & Contact</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="e.g. Metro Mobile Spares (+91 98200...)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-submit-new-spare"
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Part Barcode / QR Label */}
      {labelItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-sky-400" />
                <h3 className="font-heading font-bold text-sm">Spare Part Sticker Label</h3>
              </div>
              <button 
                onClick={() => setLabelItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col items-center text-center space-y-4">
              {/* Thermal Label Sticker Preview */}
              <div className="w-64 p-4 bg-white border-2 border-dashed border-slate-400 rounded-xl shadow-xs text-left text-slate-900 font-mono space-y-2">
                <div className="flex items-center justify-between border-b pb-1 border-slate-200">
                  <div>
                    <span className="font-bold text-[11px] truncate text-slate-900 block">
                      {currentTech.shopName}
                    </span>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1 font-sans">
                      <span>🇮🇳</span> Make in India
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{labelItem.locationBin}</span>
                </div>

                <div className="flex items-center gap-3">
                  {qrLabelUrl ? (
                    <img src={qrLabelUrl} alt="Part QR" className="w-20 h-20 rounded border border-slate-200 p-0.5" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 animate-pulse rounded" />
                  )}

                  <div className="text-[10px] space-y-0.5 overflow-hidden">
                    <div className="font-bold text-slate-900 line-clamp-2 text-[11px]">
                      {labelItem.name}
                    </div>
                    <div className="text-slate-600 font-mono text-[9px]">
                      SKU: {labelItem.sku}
                    </div>
                    <div className="text-slate-600 font-mono text-[9px]">
                      BC: {labelItem.barcode}
                    </div>
                    <div className="font-bold text-slate-900 text-xs pt-1">
                      MRP: {formatINR(labelItem.sellingPrice)}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-center pt-1 text-slate-400 border-t border-slate-200 font-sans">
                  QuickFix Workshop Spares Stock
                </div>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  onClick={() => setLabelItem(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  data-testid="btn-print-part-label"
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

      {/* MODAL: Debit Part on Customer Sale (Employees can only debit parts on sale; no editing prices/quantities) */}
      {debitItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-heading font-bold text-base">Record Sale & Debit Spare Part</h3>
                  <p className="text-[11px] text-emerald-200">
                    Stock will be deducted automatically with an audit entry
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setDebitItem(null); setDebitSuccessSale(null); }}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {debitSuccessSale ? (
              /* Success Receipt View */
              <div className="p-5 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-heading font-bold text-emerald-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Sale & Part Debit Recorded Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Deducted <strong>{debitSuccessSale.quantityDebited} unit(s)</strong> of "{debitSuccessSale.partName}".
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-emerald-100 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction ID:</span>
                      <span className="font-bold text-slate-800">{debitSuccessSale.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Debited By:</span>
                      <span className="font-bold text-slate-800">{debitSuccessSale.debitedByName} ({debitSuccessSale.debitedByRole === 'employee' ? 'Staff' : 'Owner'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Sale Amount:</span>
                      <span className="font-bold text-emerald-700 text-xs">{formatINR(debitSuccessSale.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-bold text-slate-800">{debitSuccessSale.paymentMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer:</span>
                      <span className="text-slate-800">{debitSuccessSale.customerName || 'Walk-in'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      const text = `🧾 *QUICK FIX SPARES SALE SLIP*\n` +
                        `🏪 *Shop:* ${currentTech.shopName}\n` +
                        `👤 *Staff:* ${debitSuccessSale.debitedByName}\n` +
                        `📅 *Date:* ${debitSuccessSale.timestamp}\n` +
                        `─────────────────────────\n` +
                        `🔧 *Part Sold:* ${debitSuccessSale.partName}\n` +
                        `🔖 *SKU:* ${debitSuccessSale.sku}\n` +
                        `📦 *Qty:* ${debitSuccessSale.quantityDebited} unit(s)\n` +
                        `💵 *Unit Price:* ₹${debitSuccessSale.unitSellingPrice.toLocaleString('en-IN')}\n` +
                        `💰 *Total Sale:* ₹${debitSuccessSale.totalAmount.toLocaleString('en-IN')}\n` +
                        `💳 *Payment:* ${debitSuccessSale.paymentMode}\n` +
                        `👤 *Customer:* ${debitSuccessSale.customerName}\n` +
                        `─────────────────────────\n` +
                        `✅ *Inventory stock debited from workshop.*`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Sale Slip to WhatsApp</span>
                  </button>

                  <button
                    onClick={() => { setDebitItem(null); setDebitSuccessSale(null); }}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Debit Form */
              <form onSubmit={handleConfirmDebitSale} className="p-5 space-y-4 text-xs">
                {debitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{debitError}</span>
                  </div>
                )}

                {/* Selected Part Overview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">{debitItem.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono">{debitItem.sku}</span>
                      <span>•</span>
                      <span>{debitItem.category}</span>
                      <span>•</span>
                      <span>{debitItem.locationBin}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Available</span>
                    <span className="font-bold text-sky-700 text-sm font-mono">{debitItem.stockQuantity} pcs</span>
                  </div>
                </div>

                {/* Fixed Selling Price (Notice: Non-editable for employees) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <span>Selling Price (Unit)</span>
                      <span title="Fixed by owner"><Lock className="w-3 h-3 text-amber-700" /></span>
                    </label>
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span>{formatINR(debitItem.sellingPrice)}</span>
                      <span className="text-[10px] text-amber-800 font-sans font-semibold">Fixed by Owner</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity to Sell & Debit *</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDebitQty(q => Math.max(1, q - 1))}
                        disabled={debitQty <= 1}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={debitItem.stockQuantity}
                        value={debitQty}
                        onChange={(e) => setDebitQty(Math.min(debitItem.stockQuantity, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDebitQty(q => Math.min(debitItem.stockQuantity, q + 1))}
                        disabled={debitQty >= debitItem.stockQuantity}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total Billing Amount */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold text-xs">Total Sale Billing Amount:</span>
                  <span className="font-heading font-bold text-lg text-emerald-800 font-mono">
                    {formatINR(debitItem.sellingPrice * debitQty)}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Name (Optional)</label>
                    <input
                      type="text"
                      value={debitCustomerName}
                      onChange={(e) => setDebitCustomerName(e.target.value)}
                      placeholder="e.g. Sunil Deshmukh"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Mobile</label>
                    <input
                      type="text"
                      value={debitCustomerPhone}
                      onChange={(e) => setDebitCustomerPhone(e.target.value)}
                      placeholder="e.g. +91 98200 11223"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                    <select
                      value={debitPaymentMode}
                      onChange={(e) => setDebitPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    >
                      <option value="Cash">Cash (Counter)</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Card">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recording Staff Operator</label>
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-medium truncate">
                      {activeStaff.type === 'employee' ? activeStaff.employee.fullName : (userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Remarks / Repair Reference</label>
                  <input
                    type="text"
                    value={debitRemarks}
                    onChange={(e) => setDebitRemarks(e.target.value)}
                    placeholder="e.g. Display replacement for Vivo Y20 customer repair"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDebitItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="btn-confirm-debit-sale"
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm Sale & Debit ({debitQty} Unit{debitQty > 1 ? 's' : ''})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Owner Edit Price & Stock Settings (Owner Only) */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-heading font-bold text-base">Edit Price & Stock Settings</h3>
                  <p className="text-[11px] text-indigo-200">Owner master pricing and quantity controls</p>
                </div>
              </div>
              <button onClick={() => setEditingPriceItem(null)} className="text-indigo-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditPrice} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-heading font-bold text-sm text-slate-900">{editingPriceItem.name}</h4>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  SKU: {editingPriceItem.sku} • Bin: {editingPriceItem.locationBin}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Retail price shown to staff</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Wholesale purchase cost</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Master Stock Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    value={editStockQuantity}
                    onChange={(e) => setEditStockQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert Level *</label>
                  <input
                    type="number"
                    min={1}
                    value={editLowThreshold}
                    onChange={(e) => setEditLowThreshold(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Master Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Spare Parts Reorder List & WhatsApp Share */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-heading font-bold text-base">Spare Parts Reorder List (WhatsApp Share)</h3>
                  <p className="text-[11px] text-emerald-200">
                    Compile low stock items and dispatch immediate purchase order to wholesale suppliers via WhatsApp
                  </p>
                </div>
              </div>
              <button onClick={() => setShowReorderModal(false)} className="text-emerald-300 hover:text-white">✕</button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {copiedNotice && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-center font-bold animate-in fade-in">
                  ✓ Purchase order text copied to clipboard! You can paste directly into WhatsApp or SMS.
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addAllLowStockToReorderList()}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 rounded-xl flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add All Low Stock ({lowStockItems.length})</span>
                  </button>

                  {reorderList.length > 0 && (
                    <button
                      onClick={clearReorderList}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold rounded-xl"
                    >
                      Clear List
                    </button>
                  )}
                </div>

                {/* Filter by Supplier */}
                {reorderList.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">Filter Supplier:</span>
                    <select
                      value={supplierFilter}
                      onChange={(e) => setSupplierFilter(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs outline-none"
                    >
                      <option value="ALL">All Suppliers</option>
                      {Array.from(new Set(reorderList.map(r => r.supplierName))).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Reorder Items Table */}
              {reorderList.length > 0 ? (
                <div className="space-y-2.5">
                  {reorderList
                    .filter(item => supplierFilter === 'ALL' || item.supplierName === supplierFilter)
                    .map((item) => (
                      <div 
                        key={item.inventoryItemId}
                        className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-heading font-bold text-xs text-slate-900">{item.partName}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-mono text-slate-700">{item.sku}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="text-rose-700 font-semibold">Stock: {item.currentStock} left (Alert: {item.threshold})</span>
                            <span>•</span>
                            <span className="text-slate-700 font-medium">Supplier: {item.supplierName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {/* Order Quantity Stepper */}
                          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateReorderQty(item.inventoryItemId, item.orderQuantity - 1)}
                              disabled={item.orderQuantity <= 1}
                              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-mono font-bold text-slate-900 text-xs">
                              {item.orderQuantity} pcs
                            </span>
                            <button
                              type="button"
                              onClick={() => updateReorderQty(item.inventoryItemId, item.orderQuantity + 1)}
                              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromReorderList(item.inventoryItemId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Remove from list"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Summary Bar */}
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold">Total Parts</span>
                        <span className="font-bold text-slate-900 text-sm">{reorderList.length} items</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold">Total Required Units</span>
                        <span className="font-bold text-emerald-800 text-sm font-mono">
                          {reorderList.reduce((acc, curr) => acc + curr.orderQuantity, 0)} pcs
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block font-semibold">Estimated Cost (Wholesale)</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {formatINR(reorderList.reduce((acc, curr) => acc + (curr.orderQuantity * curr.costPrice), 0))}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Message Preview Box */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 text-slate-100 text-[11px] font-mono space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>WhatsApp Preview Message:</span>
                      <span className="text-emerald-400">Ready to Send</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 max-h-36 overflow-y-auto pt-1 leading-relaxed">
                      {generateWhatsAppReorderMessage(supplierFilter)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Your Reorder List is Empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Click the "+ Reorder List" button on any spare part in your inventory, or click below to automatically pull all {lowStockItems.length} low stock parts.
                    </p>
                  </div>
                  <button
                    onClick={() => addAllLowStockToReorderList()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add All {lowStockItems.length} Low Stock Parts Now</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer / WhatsApp Share Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopyWhatsApp(supplierFilter)}
                disabled={reorderList.length === 0}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Order Text</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReorderModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Close
                </button>

                <button
                  data-testid="btn-share-whatsapp-send"
                  onClick={() => handleShareWhatsApp(supplierFilter)}
                  disabled={reorderList.length === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-2 disabled:opacity-40 transition-transform active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Entire Order on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

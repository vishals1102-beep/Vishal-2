import React, { useState } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Receipt, 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Info, 
  Boxes, 
  Clock, 
  Wrench,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface CostPreset {
  id: string;
  name: string;
  category: string;
  partsCost: number;
  laborCharges: number;
  taxRate: number;
  partsDescription: string;
  suggestedWarrantyDays: number;
  notes: string;
}

export const REPAIR_COST_PRESETS: CostPreset[] = [
  {
    id: 'combo_screen',
    name: 'Screen / Combo Replacement',
    category: 'Display',
    partsCost: 2800,
    laborCharges: 750,
    taxRate: 18,
    partsDescription: 'Original Quality AMOLED / In-Cell Combo Display Assembly',
    suggestedWarrantyDays: 90,
    notes: 'Tested for touch response, multi-touch calibration & color gamut'
  },
  {
    id: 'battery_swap',
    name: 'Battery Replacement',
    category: 'Power',
    partsCost: 1400,
    laborCharges: 400,
    taxRate: 18,
    partsDescription: 'Original High-Capacity Li-Ion Battery Pack with adhesive pull-tabs',
    suggestedWarrantyDays: 180,
    notes: 'Calibrated cycle count and safety tested up to 100% capacity'
  },
  {
    id: 'charging_board',
    name: 'Charging Port / CC Sub-Board',
    category: 'Charging',
    partsCost: 950,
    laborCharges: 450,
    taxRate: 18,
    partsDescription: 'Original Type-C / Lightning CC Sub-Board with Mic IC',
    suggestedWarrantyDays: 90,
    notes: 'Fast charge & data synchronization transfer confirmed'
  },
  {
    id: 'back_panel',
    name: 'Back Glass / Housing Panel',
    category: 'Body',
    partsCost: 1100,
    laborCharges: 500,
    taxRate: 18,
    partsDescription: 'Back Glass Cover Panel with Camera Lens & Pre-cut Seal',
    suggestedWarrantyDays: 60,
    notes: 'Laser back glass extraction & clean structural realignment'
  },
  {
    id: 'microsoldering_ic',
    name: 'Motherboard IC / Chip-Level',
    category: 'Motherboard',
    partsCost: 1800,
    laborCharges: 2200,
    taxRate: 18,
    partsDescription: 'SMD Power Management IC (PMIC / Charging IC / Audio Codec)',
    suggestedWarrantyDays: 90,
    notes: 'Micro-soldering, underfill cleaning & hot air BGA reballing'
  },
  {
    id: 'water_damage',
    name: 'Water Damage Decontamination',
    category: 'Cleaning',
    partsCost: 450,
    laborCharges: 1250,
    taxRate: 18,
    partsDescription: 'PCB Ultrasonic IPA bath chemical cleaning & RF shields re-seal',
    suggestedWarrantyDays: 30,
    notes: 'Ultrasonic board cleaning, corrosion removal & thermal camera short detection'
  }
];

interface ItemizedPart {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface RepairCostCalculatorProps {
  partsCost: number;
  setPartsCost: (val: number) => void;
  laborCharges: number;
  setLaborCharges: (val: number) => void;
  discount: number;
  setDiscount: (val: number) => void;
  taxRate: number;
  setTaxRate: (val: number) => void;
  taxMode: 'exclusive' | 'inclusive';
  setTaxMode: (val: 'exclusive' | 'inclusive') => void;
  partsUsedString: string;
  setPartsUsedString: (val: string) => void;
  deviceBrand: string;
  deviceModel: string;
  onSelectPresetWarranty?: (days: number, notes: string) => void;
}

export const RepairCostCalculator: React.FC<RepairCostCalculatorProps> = ({
  partsCost,
  setPartsCost,
  laborCharges,
  setLaborCharges,
  discount,
  setDiscount,
  taxRate,
  setTaxRate,
  taxMode,
  setTaxMode,
  partsUsedString,
  setPartsUsedString,
  deviceBrand,
  deviceModel,
  onSelectPresetWarranty
}) => {
  const { formatINR, inventory } = useApp();

  // Mode: simple manual total vs itemized parts
  const [isItemizedMode, setIsItemizedMode] = useState<boolean>(false);
  const [itemizedParts, setItemizedParts] = useState<ItemizedPart[]>([
    { id: '1', name: 'Primary Replacement Part', price: partsCost || 0, qty: 1 }
  ]);
  const [showInventoryPicker, setShowInventoryPicker] = useState<boolean>(false);

  // Hourly calculator toggle
  const [showHourlyLabor, setShowHourlyLabor] = useState<boolean>(false);
  const [laborHours, setLaborHours] = useState<number>(1.5);
  const [hourlyRate, setHourlyRate] = useState<number>(600);

  // Copy quote status
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Computations
  const numParts = Math.max(0, Number(partsCost) || 0);
  const numLabor = Math.max(0, Number(laborCharges) || 0);
  const subtotal = numParts + numLabor;
  const numDiscount = Math.max(0, Number(discount) || 0);
  const taxableAmount = Math.max(0, subtotal - numDiscount);

  let taxAmount = 0;
  let estimatedTotal = 0;

  if (taxMode === 'exclusive') {
    taxAmount = Math.round(taxableAmount * (Number(taxRate || 0) / 100));
    estimatedTotal = taxableAmount + taxAmount;
  } else {
    // Inclusive tax: total is taxableAmount, tax portion is extracted
    estimatedTotal = taxableAmount;
    taxAmount = Math.round(taxableAmount - (taxableAmount / (1 + (Number(taxRate || 0) / 100))));
  }

  const cgstAmount = Math.round(taxAmount / 2);
  const sgstAmount = taxAmount - cgstAmount;

  // Sync itemized parts to partsCost
  const handleItemizedChange = (newItems: ItemizedPart[]) => {
    setItemizedParts(newItems);
    const sum = newItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    setPartsCost(sum);
    const names = newItems.map(i => i.name).filter(Boolean).join(', ');
    if (names) {
      setPartsUsedString(names);
    }
  };

  const handleAddItemizedPart = () => {
    const newItem: ItemizedPart = {
      id: String(Date.now()),
      name: '',
      price: 500,
      qty: 1
    };
    handleItemizedChange([...itemizedParts, newItem]);
  };

  const handleRemoveItemizedPart = (id: string) => {
    const remaining = itemizedParts.filter(p => p.id !== id);
    handleItemizedChange(remaining);
  };

  const handleAddFromInventory = (invItem: any) => {
    const newItem: ItemizedPart = {
      id: String(Date.now()),
      name: invItem.name,
      price: invItem.sellingPrice,
      qty: 1
    };
    handleItemizedChange([...itemizedParts, newItem]);
    setShowInventoryPicker(false);
  };

  // Quick apply labor tier
  const handleApplyLaborTier = (amount: number) => {
    setLaborCharges(amount);
    setShowHourlyLabor(false);
  };

  // Quick apply hourly calculation
  const handleComputeHourly = (hours: number, rate: number) => {
    setLaborHours(hours);
    setHourlyRate(rate);
    setLaborCharges(Math.round(hours * rate));
  };

  // Quick apply repair preset
  const handleApplyPreset = (preset: CostPreset) => {
    setPartsCost(preset.partsCost);
    setLaborCharges(preset.laborCharges);
    setTaxRate(preset.taxRate);
    setPartsUsedString(preset.partsDescription);
    if (onSelectPresetWarranty) {
      onSelectPresetWarranty(preset.suggestedWarrantyDays, preset.notes);
    }
  };

  // Copy Quotation Text for WhatsApp / SMS
  const handleCopyQuote = () => {
    const quoteText = `🔧 *Quick Fix Electronics - Repair Estimate*
Device: ${deviceBrand || 'Device'} ${deviceModel || ''}
----------------------------------------
📦 Replacement Parts: ${formatINR(numParts)}
🛠️ Labor & Bench Diagnostic: ${formatINR(numLabor)}
🏷️ Subtotal: ${formatINR(subtotal)}
${numDiscount > 0 ? `🎁 Special Discount: -${formatINR(numDiscount)}\n` : ''}📑 Taxable Amount: ${formatINR(taxableAmount)}
🏛️ GST (${taxRate}% ${taxMode}): +${formatINR(taxAmount)}
----------------------------------------
💰 *ESTIMATED TOTAL: ${formatINR(estimatedTotal)}*
----------------------------------------
*Note: Estimate includes precision fitting & diagnostic testing.*`;

    navigator.clipboard.writeText(quoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  return (
    <div 
      data-testid="repair-cost-calculator"
      className="bg-white rounded-2xl border-2 border-sky-100 shadow-sm overflow-hidden"
    >
      {/* Top Banner / Calculator Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                Live Repair Cost Calculator
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                Auto-Compute
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Computes parts, technician labor, and applicable GST/taxes in real-time
            </p>
          </div>
        </div>

        {/* Quick Quote Action */}
        <button
          type="button"
          data-testid="btn-copy-cost-quote"
          onClick={handleCopyQuote}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-semibold transition-all active:scale-95 border border-sky-400/30 shadow-xs"
          title="Copy formatted quotation text for customer WhatsApp or SMS"
        >
          {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedQuote ? 'Estimate Copied!' : 'Copy Quote for Customer'}</span>
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Presets Strip: 1-Click Diagnostic Estimates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1-Click Diagnostic Pricing Presets
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Loads standard parts + labor + 18% GST</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {REPAIR_COST_PRESETS.map((preset) => {
              const presetTotal = preset.partsCost + preset.laborCharges + Math.round((preset.partsCost + preset.laborCharges) * 0.18);
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`btn-cost-preset-${preset.id}`}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                      {preset.category}
                    </span>
                    <span className="text-xs font-heading font-bold text-slate-800 line-clamp-1 group-hover:text-sky-900">
                      {preset.name}
                    </span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Est. Total</span>
                    <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-sky-700">
                      {formatINR(presetTotal)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Core 3-Column Calculator Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          {/* Column 1: Parts Cost */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span>1. Parts Cost (₹)</span>
                <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsItemizedMode(!isItemizedMode)}
                className="text-[10px] text-sky-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>{isItemizedMode ? 'Lump Sum' : 'Itemize Parts'}</span>
              </button>
            </div>

            {!isItemizedMode ? (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">₹</span>
                  <input
                    data-testid="input-calc-parts-cost"
                    type="number"
                    min="0"
                    value={partsCost}
                    onChange={(e) => setPartsCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:border-sky-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {[500, 1200, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPartsCost(amt)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-[10px] font-mono text-slate-600"
                    >
                      +{formatINR(amt)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {itemizedParts.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200 text-xs">
                      <input
                        type="text"
                        placeholder="Part name"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...itemizedParts];
                          updated[idx].name = e.target.value;
                          handleItemizedChange(updated);
                        }}
                        className="flex-1 px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded focus:bg-white outline-none"
                      />
                      <div className="w-16 relative">
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...itemizedParts];
                            updated[idx].price = Number(e.target.value);
                            handleItemizedChange(updated);
                          }}
                          className="w-full px-1.5 py-1 text-[11px] font-mono font-bold bg-slate-50 border border-slate-200 rounded focus:bg-white outline-none"
                        />
                      </div>
                      {itemizedParts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemizedPart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddItemizedPart}
                    className="flex-1 py-1 rounded-lg border border-dashed border-sky-300 hover:bg-sky-50 text-[10px] font-semibold text-sky-700 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>

                  {inventory && inventory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInventoryPicker(!showInventoryPicker)}
                      className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-[10px] font-semibold text-sky-800 flex items-center gap-1"
                    >
                      <Boxes className="w-3 h-3" />
                      <span>Stock</span>
                    </button>
                  )}
                </div>

                {/* Inventory Quick Picker Dropdown */}
                {showInventoryPicker && (
                  <div className="p-2 bg-white rounded-xl border border-sky-200 shadow-md max-h-36 overflow-y-auto space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Pick from Workshop Stock:</span>
                    {inventory.slice(0, 6).map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => handleAddFromInventory(inv)}
                        className="w-full text-left p-1 rounded hover:bg-sky-50 text-[10px] flex items-center justify-between text-slate-800"
                      >
                        <span className="truncate pr-1">{inv.name}</span>
                        <span className="font-mono font-bold text-sky-700">{formatINR(inv.sellingPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Labor Charges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span>2. Labor Charges (₹)</span>
                <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHourlyLabor(!showHourlyLabor)}
                className="text-[10px] text-sky-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>{showHourlyLabor ? 'Direct Input' : 'Hourly Rate'}</span>
              </button>
            </div>

            {!showHourlyLabor ? (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">₹</span>
                  <input
                    data-testid="input-calc-labor-charges"
                    type="number"
                    min="0"
                    value={laborCharges}
                    onChange={(e) => setLaborCharges(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:border-sky-500 outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Labor Skill Tiers */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyLaborTier(350)}
                    className={`px-2 py-1 rounded-lg text-left text-[10px] border transition-all ${
                      laborCharges === 350 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold">Basic Clean</span>
                    <span className="font-mono">₹350</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyLaborTier(650)}
                    className={`px-2 py-1 rounded-lg text-left text-[10px] border transition-all ${
                      laborCharges === 650 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold">Standard Swap</span>
                    <span className="font-mono">₹650</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyLaborTier(1200)}
                    className={`px-2 py-1 rounded-lg text-left text-[10px] border transition-all ${
                      laborCharges === 1200 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold">Full Housing</span>
                    <span className="font-mono">₹1,200</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyLaborTier(2200)}
                    className={`px-2 py-1 rounded-lg text-left text-[10px] border transition-all ${
                      laborCharges === 2200 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold">Micro-Soldering</span>
                    <span className="font-mono">₹2,200</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Bench Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={laborHours}
                      onChange={(e) => handleComputeHourly(Number(e.target.value), hourlyRate)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Rate / Hr (₹)</label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={hourlyRate}
                      onChange={(e) => handleComputeHourly(laborHours, Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 flex justify-between items-center pt-1 border-t border-slate-100">
                  <span>Computed Labor:</span>
                  <span className="font-mono font-bold text-sky-700">{formatINR(laborCharges)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Taxes (GST) & Discount */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. GST / Service Tax Rate
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTaxMode('exclusive')}
                    className={`px-1.5 py-0.5 rounded font-semibold ${
                      taxMode === 'exclusive' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    + Tax
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxMode('inclusive')}
                    className={`px-1.5 py-0.5 rounded font-semibold ${
                      taxMode === 'inclusive' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tax Incl.
                  </button>
                </div>
              </div>

              {/* Tax Rate Selection Buttons */}
              <div className="grid grid-cols-4 gap-1">
                {[18, 12, 5, 0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    data-testid={`btn-calc-tax-${rate}`}
                    onClick={() => setTaxRate(rate)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      taxRate === rate
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {taxRate === 18 && 'Standard 18% GST (9% CGST + 9% SGST for Electronics Service)'}
                {taxRate === 12 && '12% GST (Consolidated parts & hardware rate)'}
                {taxRate === 5 && '5% GST (Essential electronic components)'}
                {taxRate === 0 && '0% Tax Exempt / Composition Scheme'}
              </span>
            </div>

            {/* Discount field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Discount (₹)
                </label>
                {discount > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Saved {formatINR(discount)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 font-mono">₹</span>
                <input
                  data-testid="input-calc-discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-emerald-700 focus:border-sky-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation Breakdown & Estimated Total Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-2xl text-white p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block mb-0.5">
                Customer Price Quotation
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-300">Estimated Total:</span>
                <span 
                  data-testid="text-calc-estimated-total"
                  className="font-heading font-black text-2xl sm:text-3xl text-sky-300 font-mono tracking-tight"
                >
                  {formatINR(estimatedTotal)}
                </span>
                {taxMode === 'inclusive' && (
                  <span className="text-[10px] text-slate-400 font-semibold">(Inclusive of GST)</span>
                )}
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Subtotal</span>
                <span className="text-xs font-mono font-bold text-white">{formatINR(subtotal)}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Discount</span>
                <span className="text-xs font-mono font-bold text-emerald-400">-{formatINR(numDiscount)}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">GST ({taxRate}%)</span>
                <span className="text-xs font-mono font-bold text-amber-300">+{formatINR(taxAmount)}</span>
              </div>
            </div>
          </div>

          {/* Mathematical Step-by-Step Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block mb-0.5">1. Replacement Parts</span>
              <span className="font-mono font-bold text-white">{formatINR(numParts)}</span>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block mb-0.5">2. Service & Labor</span>
              <span className="font-mono font-bold text-white">{formatINR(numLabor)}</span>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block mb-0.5">3. Taxable Subtotal</span>
              <span className="font-mono font-bold text-white">{formatINR(taxableAmount)}</span>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block mb-0.5">
                4. GST Breakdown ({taxRate}%)
              </span>
              <span className="font-mono font-bold text-amber-300">
                {taxRate > 0 ? (
                  <>
                    CGST {formatINR(cgstAmount)} + SGST {formatINR(sgstAmount)}
                  </>
                ) : (
                  '₹0.00 (Exempt)'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

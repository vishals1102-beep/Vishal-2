import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Boxes, 
  Check, 
  Percent, 
  Receipt, 
  Sparkles, 
  Sliders, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Printer,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RepairTicket } from '../../types';

interface EditPartsAndLaborModalProps {
  ticket: RepairTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedTicket: RepairTicket) => void;
}

export const EditPartsAndLaborModal: React.FC<EditPartsAndLaborModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSaved
}) => {
  const { 
    inventory, 
    formatINR, 
    updateTicketPartsAndLabor,
    setActiveInvoiceTicket 
  } = useApp();

  const [partsList, setPartsList] = useState<string[]>([]);
  const [newPartInput, setNewPartInput] = useState('');
  const [partsCost, setPartsCost] = useState<number>(0);
  const [laborCharges, setLaborCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [repairNotes, setRepairNotes] = useState('');
  const [showHourly, setShowHourly] = useState(false);
  const [hours, setHours] = useState<number>(1.5);
  const [hourlyRate, setHourlyRate] = useState<number>(450);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (ticket) {
      setPartsList(ticket.partsUsed ? [...ticket.partsUsed] : []);
      setPartsCost(ticket.partsCost || 0);
      setLaborCharges(ticket.laborCharges || 0);
      setDiscount(ticket.discount || 0);
      setTaxRate(ticket.taxRate !== undefined ? ticket.taxRate : 18);
      setRepairNotes(ticket.repairDetailsNotes || '');
      setSavedSuccess(false);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  // Real-time computations
  const numParts = Math.max(0, Number(partsCost) || 0);
  const numLabor = Math.max(0, Number(laborCharges) || 0);
  const numDiscount = Math.max(0, Number(discount) || 0);
  const taxableSubtotal = Math.max(0, numParts + numLabor - numDiscount);
  const taxAmount = taxRate > 0 ? Math.round(taxableSubtotal * (taxRate / 100)) : 0;
  const grandTotal = taxableSubtotal + taxAmount;

  // Handle adding part name
  const handleAddPart = () => {
    if (!newPartInput.trim()) return;
    setPartsList(prev => [...prev, newPartInput.trim()]);
    setNewPartInput('');
  };

  // Handle removing a part
  const handleRemovePart = (index: number) => {
    setPartsList(prev => prev.filter((_, i) => i !== index));
  };

  // Handle picking from inventory
  const handleSelectFromInventory = (invId: string) => {
    if (!invId) return;
    const invItem = inventory.find(i => i.id === invId);
    if (invItem) {
      const formattedName = `${invItem.name} (${invItem.sku})`;
      if (!partsList.includes(formattedName)) {
        setPartsList(prev => [...prev, formattedName]);
      }
      // Add price if zero, or increment
      if (partsCost === 0) {
        setPartsCost(invItem.sellingPrice);
      } else {
        setPartsCost(prev => prev + invItem.sellingPrice);
      }
    }
    setSelectedInventoryId('');
  };

  // Quick apply labor tier
  const handleApplyLaborTier = (amount: number) => {
    setLaborCharges(amount);
    setShowHourly(false);
  };

  // Apply hourly rate
  const handleApplyHourly = (h: number, rate: number) => {
    setHours(h);
    setHourlyRate(rate);
    setLaborCharges(Math.round(h * rate));
  };

  // Save changes
  const handleSave = (openInvoiceAfter = false) => {
    const updatedData = {
      partsUsed: partsList.length > 0 ? partsList : ['Standard Diagnostics'],
      partsCost: numParts,
      laborCharges: numLabor,
      discount: numDiscount,
      taxRate: taxRate,
      repairDetailsNotes: repairNotes
    };

    updateTicketPartsAndLabor(ticket.id, updatedData);

    const updatedTicket: RepairTicket = {
      ...ticket,
      partsUsed: updatedData.partsUsed,
      partsCost: numParts,
      laborCharges: numLabor,
      discount: numDiscount,
      taxRate: taxRate,
      taxAmount: taxAmount,
      totalCharges: grandTotal,
      repairDetailsNotes: repairNotes
    };

    setSavedSuccess(true);
    if (onSaved) onSaved(updatedTicket);

    if (openInvoiceAfter) {
      setActiveInvoiceTicket(updatedTicket);
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600/30 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-white">
                  Edit Parts & Labour Charges
                </h3>
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  {ticket.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {ticket.deviceBrand} {ticket.deviceModel} • {ticket.customerName}
              </p>
            </div>
          </div>

          <button
            data-testid="btn-close-edit-parts-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Parts, Labour charges and Billing successfully updated!</span>
            </div>
          )}

          {/* Section 1: Parts Replaced & Installed */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-sky-600" />
                <span className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Parts Replaced & Installed
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {partsList.length} {partsList.length === 1 ? 'part' : 'parts'} listed
              </span>
            </div>

            {/* List of currently attached parts */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-lg border border-slate-200">
              {partsList.length === 0 ? (
                <span className="text-slate-400 italic text-[11px]">No specific parts tagged yet. Add parts below.</span>
              ) : (
                partsList.map((part, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold"
                  >
                    <span>{part}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="text-sky-500 hover:text-rose-600 transition-colors"
                      title="Remove Part"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Part Add Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Custom Part Input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newPartInput}
                  onChange={(e) => setNewPartInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPart())}
                  placeholder="Type part name (e.g. OLED Display Combo)"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  data-testid="btn-add-custom-part"
                  onClick={handleAddPart}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Select from Inventory */}
              <div className="relative">
                <select
                  data-testid="select-inventory-part"
                  value={selectedInventoryId}
                  onChange={(e) => handleSelectFromInventory(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">📦 Pick from Spares Inventory...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatINR(item.sellingPrice)}) - {item.stockQuantity} in stock
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Total Parts Cost Input */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-700 text-xs">
                Total Parts Cost (Wholesale / Customer Price in ₹):
              </label>
              <div className="relative sm:w-48">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="input-edit-parts-cost"
                  type="number"
                  min="0"
                  value={partsCost}
                  onChange={(e) => setPartsCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Precision Labour Charges */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Precision Labour Charges
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHourly(!showHourly)}
                className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>{showHourly ? 'Switch to Direct Input' : 'Calculate Hourly'}</span>
              </button>
            </div>

            {/* Direct Input */}
            {!showHourly ? (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-600">Technician Service & Bench Fee:</span>
                  <div className="relative sm:w-48">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      data-testid="input-edit-labor-charges"
                      type="number"
                      min="0"
                      value={laborCharges}
                      onChange={(e) => setLaborCharges(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Preset Skill Tiers */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Tiers:</span>
                  {[
                    { label: 'Basic ₹350', val: 350 },
                    { label: 'Standard ₹650', val: 650 },
                    { label: 'SMD Level ₹1,200', val: 1200 },
                    { label: 'Micro-solder ₹2,200', val: 2200 }
                  ].map(tier => (
                    <button
                      key={tier.val}
                      type="button"
                      onClick={() => handleApplyLaborTier(tier.val)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors border ${
                        laborCharges === tier.val
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Hourly Calculator */
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Time Spent (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hours}
                      onChange={(e) => handleApplyHourly(Number(e.target.value), hourlyRate)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Hourly Rate (₹/hr)
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={hourlyRate}
                      onChange={(e) => handleApplyHourly(hours, Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Computed Labour Charges:</span>
                  <span className="font-mono font-bold text-amber-700">{formatINR(laborCharges)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Financials, Discount & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount & Taxes */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider block">
                3. Discounts & Taxes
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Loyalty Discount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    data-testid="input-edit-discount"
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  GST Tax Slab (%)
                </label>
                <select
                  data-testid="select-edit-tax-rate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
                >
                  <option value={0}>0% (Tax Exempt / Unregistered)</option>
                  <option value={5}>5% GST (Essential Services)</option>
                  <option value={12}>12% GST (Electronics Components)</option>
                  <option value={18}>18% GST (Standard Electronics Services)</option>
                  <option value={28}>28% GST (Luxury Devices)</option>
                </select>
              </div>
            </div>

            {/* Live Billing Summary Card */}
            <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                  <span className="font-heading font-bold text-slate-300">Live Bill Preview</span>
                  <span className="text-[10px] text-sky-400 font-mono">Invoice Recalculation</span>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Parts Subtotal:</span>
                    <span className="font-mono text-slate-200">{formatINR(numParts)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Labour Charges:</span>
                    <span className="font-mono text-slate-200">{formatINR(numLabor)}</span>
                  </div>
                  {numDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Less Discount:</span>
                      <span className="font-mono">-{formatINR(numDiscount)}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>GST ({taxRate}%):</span>
                      <span className="font-mono text-slate-200">+{formatINR(taxAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Total Bill:</span>
                <span className="font-heading font-extrabold text-lg text-amber-400 font-mono">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Bench & Invoice Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Repair Remarks & Notes (Printed on Invoice & Customer WhatsApp)
            </label>
            <textarea
              rows={2}
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              placeholder="e.g. Display installed with 90-day touch warranty. Thermal paste reapplied."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
            />
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-sky-600" />
            <span>Updating parts & labour automatically adjusts customer invoices & payment records.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              data-testid="btn-cancel-edit-parts"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              data-testid="btn-save-edit-parts"
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              data-testid="btn-save-and-invoice"
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              title="Save and directly open the updated invoice sheet"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Invoice</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

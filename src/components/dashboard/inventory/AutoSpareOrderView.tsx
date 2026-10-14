import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  ShoppingBag, 
  CheckCircle2, 
  IndianRupee, 
  Package, 
  Sliders, 
  Send, 
  MessageSquare, 
  PlusCircle, 
  AlertTriangle, 
  Truck, 
  Edit3, 
  Check, 
  Copy,
  ChevronDown
} from 'lucide-react';
import { InventoryItem } from '../../../types';
import { AutoReorderItem, generateSupplierWhatsAppPO } from '../../../utils/inventoryAnalytics';

interface AutoSpareOrderViewProps {
  autoOrders: AutoReorderItem[];
  formatINR: (amount: number) => string;
  onAddAllToReorder: () => void;
  onAddSingleToReorder: (itemId: string, qty: number) => void;
  bufferMultiplier: number;
  onBufferChange: (val: number) => void;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

export const AutoSpareOrderView: React.FC<AutoSpareOrderViewProps> = ({
  autoOrders,
  formatINR,
  onAddAllToReorder,
  onAddSingleToReorder,
  bufferMultiplier,
  onBufferChange,
  shopName,
  shopAddress,
  shopPhone
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [editableQuantities, setEditableQuantities] = useState<Record<string, number>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<string | null>(null);

  // Extract suppliers
  const suppliers = useMemo(() => {
    const set = new Set(autoOrders.map(o => o.supplierName));
    return ['ALL', ...Array.from(set)];
  }, [autoOrders]);

  // Filter
  const filteredOrders = useMemo(() => {
    return autoOrders.filter(o => selectedSupplier === 'ALL' || o.supplierName === selectedSupplier);
  }, [autoOrders, selectedSupplier]);

  // Compute quantity for an item (defaults to calculated)
  const getQty = (item: AutoReorderItem) => {
    if (editableQuantities[item.item.id] !== undefined) {
      return editableQuantities[item.item.id];
    }
    return item.recommendedOrderQty;
  };

  const handleQtyChange = (itemId: string, val: number) => {
    setEditableQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, val)
    }));
  };

  // Aggregate totals
  const totalUnits = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + getQty(o), 0);
  }, [filteredOrders, editableQuantities]);

  const totalCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (getQty(o) * o.item.costPrice), 0);
  }, [filteredOrders, editableQuantities]);

  // Bulk add to reorder list
  const handleAddAll = () => {
    filteredOrders.forEach(o => {
      onAddSingleToReorder(o.item.id, getQty(o));
    });
    setSuccessToast(`✓ Successfully queued ${totalUnits} units across ${filteredOrders.length} spares to your Reorder List!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // WhatsApp PO Dispatch
  const handleDispatchSupplierPO = (supplier: string) => {
    const supplierItems = filteredOrders.filter(o => o.supplierName === supplier);
    const targetSupplier = supplierItems[0]?.supplierName || supplier;
    const targetPhone = supplierItems[0]?.supplierPhone || '+91 98200 11223';

    // Map quantities
    const itemsForPO = supplierItems.map(o => ({
      ...o,
      recommendedOrderQty: getQty(o)
    }));

    const poMessage = generateSupplierWhatsAppPO(
      targetSupplier,
      targetPhone,
      itemsForPO,
      shopName,
      shopAddress,
      shopPhone
    );

    const rawPhone = targetPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${rawPhone || '919820011223'}?text=${encodeURIComponent(poMessage)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Automated Intelligence Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-sky-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-800/40 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                <Bot className="w-5 h-5" />
              </span>
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <span>Automated Spare Order Engine</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                  Last Month Run-Rate
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Auto-computes required replenishment quantities based on last month's parts consumption and custom safety buffers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="btn-auto-add-all-reorder"
              onClick={handleAddAll}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Auto-Add All to Reorder List</span>
            </button>
          </div>
        </div>

        {/* Buffer Multiplier & Supplier Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Safety Buffer:
            </span>
            {[
              { val: 1.0, label: '1.0x (Lean / Exact)' },
              { val: 1.2, label: '1.2x (Recommended +20%)' },
              { val: 1.5, label: '1.5x (Peak Rush +50%)' }
            ].map(b => (
              <button
                key={b.val}
                type="button"
                data-testid={`btn-buffer-${b.val}`}
                onClick={() => onBufferChange(b.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  bufferMultiplier === b.val
                    ? 'bg-sky-500 text-white border-sky-400 shadow-2xs'
                    : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/15'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Supplier Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Supplier:</span>
            <select
              data-testid="select-auto-order-supplier"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-medium outline-none cursor-pointer"
            >
              {suppliers.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s === 'ALL' ? 'All Wholesalers & Importers' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Summary Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Items To Replenish</span>
            <div className="font-heading font-bold text-xl text-white font-mono">
              {filteredOrders.length} <span className="text-xs font-sans font-normal text-slate-400">spare types</span>
            </div>
            <span className="text-[11px] text-sky-300 block mt-0.5">
              Filtered for current demand
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Total Recommended Units</span>
            <div className="font-heading font-bold text-xl text-amber-300 font-mono">
              {totalUnits} <span className="text-xs font-sans font-normal text-slate-400">pcs</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Based on {bufferMultiplier}x monthly run-rate
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Estimated Purchase Order Value</span>
            <div className="font-heading font-bold text-xl text-emerald-300 font-mono">
              {formatINR(totalCost)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Calculated at wholesale cost price
            </span>
          </div>
        </div>
      </div>

      {/* Grouped by Supplier Quick Purchase Orders Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-sky-600" />
            Quick Supplier WhatsApp Purchase Orders:
          </span>
          <span className="text-[11px] text-slate-500">
            One-click formatted WhatsApp PO dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {suppliers.filter(s => s !== 'ALL').map(supp => {
            const suppOrders = autoOrders.filter(o => o.supplierName === supp);
            const suppCost = suppOrders.reduce((sum, o) => sum + (getQty(o) * o.item.costPrice), 0);
            const suppUnits = suppOrders.reduce((sum, o) => sum + getQty(o), 0);

            return (
              <div 
                key={supp}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between text-xs space-y-2"
              >
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{supp}</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {suppOrders.length} spares • {suppUnits} units • {formatINR(suppCost)}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`btn-dispatch-po-${supp.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleDispatchSupplierPO(supp)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp PO</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto Orders Table / Cards */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const qty = getQty(order);
          const estCost = qty * order.item.costPrice;

          return (
            <div
              key={order.item.id}
              data-testid={`card-auto-order-${order.item.id}`}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              {/* Item Info */}
              <div className="space-y-1 sm:w-2/5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                    order.urgency === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
                    order.urgency === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-sky-100 text-sky-800'
                  }`}>
                    {order.urgency === 'critical' ? 'Out of Stock' : order.urgency === 'high' ? 'Low Stock' : 'Monthly Buffer'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{order.item.sku}</span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900">
                  {order.item.name}
                </h3>

                <p className="text-[11px] text-slate-500">
                  {order.reason}
                </p>

                <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-0.5">
                  <span>Last Month: <strong className="text-slate-900">{order.lastMonthUsage} pcs used</strong></span>
                  <span>In-Stock: <strong className="text-slate-900">{order.currentStock} pcs</strong></span>
                  <span>Wholesale: <strong className="text-slate-900">{formatINR(order.item.costPrice)}/pc</strong></span>
                </div>
              </div>

              {/* Supplier & Bin */}
              <div className="sm:w-1/4 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Supplier</span>
                <span className="font-semibold text-slate-800 block truncate">{order.supplierName}</span>
                <span className="text-[11px] font-mono text-slate-500 block">{order.supplierPhone}</span>
                <span className="text-[10px] text-slate-400 block">Bin: {order.item.locationBin}</span>
              </div>

              {/* Order Quantity Input & Cost */}
              <div className="sm:w-1/3 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Cost</span>
                  <span className="font-heading font-bold text-base text-slate-900 font-mono">
                    {formatINR(estCost)}
                  </span>
                </div>

                {/* Number input for qty */}
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 text-center">Order Qty</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={qty}
                      onChange={(e) => handleQtyChange(order.item.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs text-slate-900 outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="button"
                    data-testid={`btn-add-single-reorder-${order.item.id}`}
                    onClick={() => {
                      onAddSingleToReorder(order.item.id, qty);
                      setSuccessToast(`✓ Added ${qty} units of "${order.item.name}" to Reorder List.`);
                      setTimeout(() => setSuccessToast(null), 2500);
                    }}
                    className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl transition-colors mt-3"
                    title="Add to Reorder List"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No replenishment orders needed right now. All spares are comfortably above the {bufferMultiplier}x monthly stock buffer!
        </div>
      )}
    </div>
  );
};

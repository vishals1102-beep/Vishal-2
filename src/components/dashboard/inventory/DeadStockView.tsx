import React, { useState, useMemo } from 'react';
import { 
  Snowflake, 
  Lock, 
  AlertTriangle, 
  Clock, 
  Tag, 
  Share2, 
  MessageSquare, 
  CheckCircle2, 
  TrendingDown, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  IndianRupee,
  PackageX
} from 'lucide-react';
import { InventoryItem } from '../../../types';
import { DeadStockItem } from '../../../utils/inventoryAnalytics';

interface DeadStockViewProps {
  deadStockList: DeadStockItem[];
  formatINR: (amount: number) => string;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  setActiveTab: (tab: any) => void;
  shopName: string;
}

export const DeadStockView: React.FC<DeadStockViewProps> = ({
  deadStockList,
  formatINR,
  updateInventoryItem,
  setActiveTab,
  shopName
}) => {
  const [agingFilter, setAgingFilter] = useState<'ALL' | '30' | '60'>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter
  const filteredList = useMemo(() => {
    return deadStockList.filter(item => {
      if (agingFilter === '60') return item.agingDays >= 60;
      if (agingFilter === '30') return item.agingDays >= 30;
      return true;
    });
  }, [deadStockList, agingFilter]);

  // Total locked capital
  const totalLocked = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + item.lockedCapital, 0);
  }, [filteredList]);

  const totalUnits = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + item.stockQuantity, 0);
  }, [filteredList]);

  // Action: Apply Clearance Price
  const handleApplyClearance = (item: DeadStockItem) => {
    updateInventoryItem(item.itemId, {
      sellingPrice: item.suggestedClearancePrice,
      notes: `Clearance markdown applied on ${new Date().toLocaleDateString('en-GB')}`
    });
    setSuccessToast(`✓ Marked down "${item.name}" from ₹${item.sellingPrice} to ₹${item.suggestedClearancePrice} for quick walk-in clearance!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Action: WhatsApp Supplier Return Request
  const handleWhatsAppSupplierRMA = (item: DeadStockItem) => {
    const rawPhone = (item.supplierPhone || '').replace(/[^0-9]/g, '');
    const message = `Namaste ${item.supplierName} ji 🙏\n` +
      `Regarding inventory return / credit note request from *${shopName}*:\n\n` +
      `We have *${item.stockQuantity} pcs* of *${item.name}* (SKU: \`${item.sku}\`) received on ${item.lastRestockedAt}.\n` +
      `Since there is low customer movement for this model in our area, could we request an exchange or vendor credit of *₹${item.lockedCapital.toLocaleString('en-IN')}* towards our upcoming order of fast-moving screens/batteries?\n\n` +
      `Kindly confirm if return/swap is possible. Thank you! 🙏`;

    window.open(`https://wa.me/${rawPhone || '919820011223'}?text=${encodeURIComponent(message)}`, '_blank');
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

      {/* Dead Stock Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 rounded-2xl border border-sky-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-800/40 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                <Snowflake className="w-5 h-5 text-sky-300" />
              </span>
              <h2 className="font-heading font-bold text-base text-white">
                Dead Stock & Dormant Spares Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Identifies non-moving spare parts, measures trapped working capital, and provides one-click clearance actions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-slate-400">Aging filter:</span>
            {[
              { id: 'ALL', label: 'All Inactive (>21d)' },
              { id: '30', label: '30+ Days Stagnant' },
              { id: '60', label: '60+ Days Critical' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAgingFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  agingFilter === f.id
                    ? 'bg-sky-600 text-white border-sky-500 shadow-2xs'
                    : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/15'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-rose-400" /> Total Locked Capital
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-rose-300 font-mono">
              {formatINR(totalLocked)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Tied up in non-moving parts
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <PackageX className="w-3.5 h-3.5 text-amber-400" /> Dormant Spare Units
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-amber-300 font-mono">
              {totalUnits} <span className="text-xs font-normal text-slate-400 font-sans">units</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Across {filteredList.length} dormant spare item{filteredList.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" /> Liquidation Potential
              </span>
            </div>
            <div className="font-heading font-bold text-xl text-emerald-300 font-mono">
              ~{formatINR(Math.round(totalLocked * 0.88))}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Estimated recovery via clearance or peer swap
            </span>
          </div>
        </div>
      </div>

      {/* Dead Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item) => {
          const isCritical = item.agingDays >= 45;

          return (
            <div
              key={item.itemId}
              data-testid={`card-dead-stock-${item.itemId}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      SKU: {item.sku} • {item.category}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{item.agingDays}d Dormant</span>
                  </span>
                </div>

                {/* Capital Locked Highlight Box */}
                <div className="my-3 p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">Locked Working Capital</span>
                    <span className="font-heading font-bold text-base text-rose-950 font-mono">
                      {formatINR(item.lockedCapital)}
                    </span>
                    <span className="text-[10px] text-rose-700 block mt-0.5">
                      {item.stockQuantity} pcs @ {formatINR(item.costPrice)} cost
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Rack Location</span>
                    <span className="font-mono font-semibold text-slate-800 block">
                      {item.locationBin}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      0 sales recorded
                    </span>
                  </div>
                </div>

                {/* Recommendation Banner */}
                <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Smart Recovery Strategy:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {item.clearanceRecommendation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  data-testid={`btn-clearance-discount-${item.itemId}`}
                  onClick={() => handleApplyClearance(item)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                  title="Drop price to clearance rate"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>15% Clearance Price ({formatINR(item.suggestedClearancePrice)})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid={`btn-share-parts-network-${item.itemId}`}
                    onClick={() => setActiveTab('parts_sharing')}
                    className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="List on Parts Sharing network for peer technicians"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Peer Share</span>
                  </button>

                  <button
                    type="button"
                    data-testid={`btn-supplier-rma-${item.itemId}`}
                    onClick={() => handleWhatsAppSupplierRMA(item)}
                    className="p-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="WhatsApp supplier for return / credit note"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supplier Return</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No dead stock found under the "{agingFilter === 'ALL' ? 'All Inactive' : `${agingFilter}+ Days`}" criteria. Your inventory turnover is healthy!
        </div>
      )}
    </div>
  );
};

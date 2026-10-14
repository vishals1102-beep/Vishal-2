import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Package, 
  IndianRupee, 
  Zap, 
  AlertTriangle, 
  PlusCircle, 
  ArrowUpDown, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ShoppingBag,
  Send,
  Boxes
} from 'lucide-react';
import { InventoryItem } from '../../../types';
import { PartSalesStat } from '../../../utils/inventoryAnalytics';

interface TopSellingPartsViewProps {
  topParts: PartSalesStat[];
  formatINR: (amount: number) => string;
  onOpenDebit: (item: InventoryItem) => void;
  onAddToReorder: (itemId: string, qty: number) => void;
  inventory: InventoryItem[];
}

export const TopSellingPartsView: React.FC<TopSellingPartsViewProps> = ({
  topParts,
  formatINR,
  onOpenDebit,
  onAddToReorder,
  inventory
}) => {
  const [sortBy, setSortBy] = useState<'units' | 'revenue' | 'margin'>('units');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(topParts.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [topParts]);

  // Sort and filter
  const sortedAndFiltered = useMemo(() => {
    return topParts
      .filter(p => categoryFilter === 'ALL' || p.category === categoryFilter)
      .sort((a, b) => {
        if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
        if (sortBy === 'margin') return b.marginPercent - a.marginPercent;
        return b.unitsSold - a.unitsSold;
      });
  }, [topParts, categoryFilter, sortBy]);

  // Aggregate stats
  const totalUnitsSold = useMemo(() => topParts.reduce((sum, p) => sum + p.unitsSold, 0), [topParts]);
  const totalRevenue = useMemo(() => topParts.reduce((sum, p) => sum + p.totalRevenue, 0), [topParts]);
  const totalProfit = useMemo(() => topParts.reduce((sum, p) => sum + p.profit, 0), [topParts]);
  const bestSeller = topParts[0];

  const handleQuickReorder = (itemId: string, name: string) => {
    onAddToReorder(itemId, 5);
    setSuccessToast(`✓ Added 5 units of "${name}" to your Reorder List.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Toast alert */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-amber-100 text-xs font-medium mb-1">
            <span>#1 Top Seller</span>
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <div className="font-heading font-bold text-sm truncate text-white" title={bestSeller?.name}>
            {bestSeller ? bestSeller.name : 'N/A'}
          </div>
          <div className="text-[11px] text-amber-100 mt-1 font-mono">
            {bestSeller ? `${bestSeller.unitsSold} units sold this month` : ''}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Monthly Spares Sold</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading font-bold text-xl text-slate-900 font-mono">
            {totalUnitsSold} <span className="text-xs font-sans font-normal text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Fast Turnaround
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Sales Revenue</span>
            <IndianRupee className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-heading font-bold text-xl text-slate-900 font-mono">
            {formatINR(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gross parts sales value
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Gross Profit Margin</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-heading font-bold text-xl text-indigo-900 font-mono">
            {formatINR(totalProfit)}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            ~{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}% Net Margins
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            Fast-Moving Spares ({sortedAndFiltered.length}):
          </span>

          {/* Category Filter */}
          <select
            data-testid="select-top-sales-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Sort by:</span>
          {[
            { id: 'units', label: 'Most Units Sold' },
            { id: 'revenue', label: 'Highest Revenue' },
            { id: 'margin', label: 'Highest Margin %' }
          ].map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortBy(s.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                sortBy === s.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Top Selling Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAndFiltered.map((part, index) => {
          const invItem = inventory.find(i => i.id === part.itemId);
          const isStockLow = part.stockQuantity <= part.lowStockThreshold;
          const isCriticalBurn = part.daysOfStockRemaining <= 5 && part.stockQuantity > 0;

          return (
            <div 
              key={part.itemId}
              data-testid={`card-top-part-${part.itemId}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header Strip with Rank Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      index === 1 ? 'bg-slate-200 text-slate-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                        {part.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        {part.sku} • {part.category}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{part.salesVelocityPerWeek}/wk</span>
                  </span>
                </div>

                {/* Performance Metrics Bar */}
                <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Units Sold</span>
                    <span className="font-heading font-bold text-base text-slate-900 font-mono">
                      {part.unitsSold}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue</span>
                    <span className="font-heading font-bold text-base text-emerald-700 font-mono">
                      {formatINR(part.totalRevenue)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Margin</span>
                    <span className="font-heading font-bold text-base text-indigo-700 font-mono">
                      +{part.marginPercent}%
                    </span>
                  </div>
                </div>

                {/* Current Stock Health & Burn Rate Indicator */}
                <div className="mb-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Current Inventory:</span>
                    <span className={`font-mono font-bold ${
                      part.stockQuantity === 0 ? 'text-rose-600' :
                      isStockLow ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {part.stockQuantity} in stock (Min: {part.lowStockThreshold})
                    </span>
                  </div>

                  {/* Stock run-out warning */}
                  {isCriticalBurn && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Critical velocity: Projected to run out in {part.daysOfStockRemaining} days!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Rack / Bin: <strong className="text-slate-700">{part.locationBin}</strong></span>
                    <span>Supplier: <strong className="text-slate-700">{part.supplierName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  data-testid={`btn-quick-debit-${part.itemId}`}
                  onClick={() => invItem && onOpenDebit(invItem)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Debit Sale</span>
                </button>

                <button
                  type="button"
                  data-testid={`btn-quick-reorder-${part.itemId}`}
                  onClick={() => handleQuickReorder(part.itemId, part.name)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>+ Reorder Stock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedAndFiltered.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No fast-moving items found in this category.
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  Flame, 
  Snowflake, 
  IndianRupee, 
  TrendingUp, 
  Share2, 
  PlusCircle, 
  Tag, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { InventoryItem } from '../../../types';
import { InventorySuggestion } from '../../../utils/inventoryAnalytics';

interface InventorySuggestionsViewProps {
  suggestions: InventorySuggestion[];
  healthScore: number;
  totalLockedCapital: number;
  fastMovingRatio: number;
  formatINR: (amount: number) => string;
  onAddToReorder: (itemId: string, qty: number) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  setActiveTab: (tab: any) => void;
  inventory: InventoryItem[];
}

export const InventorySuggestionsView: React.FC<InventorySuggestionsViewProps> = ({
  suggestions,
  healthScore,
  totalLockedCapital,
  fastMovingRatio,
  formatINR,
  onAddToReorder,
  updateInventoryItem,
  setActiveTab,
  inventory
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [executedIds, setExecutedIds] = useState<string[]>([]);

  const handleAction = (suggestion: InventorySuggestion) => {
    if (suggestion.actionType === 'add_reorder' && suggestion.targetItemId) {
      onAddToReorder(suggestion.targetItemId, suggestion.suggestedValue || 5);
      setSuccessToast(`✓ Executed suggestion: Added ${suggestion.suggestedValue || 5} units of "${suggestion.targetItemName}" to Reorder List!`);
      setExecutedIds(prev => [...prev, suggestion.id]);
    } else if (suggestion.actionType === 'discount_clearance' && suggestion.targetItemId && suggestion.suggestedValue) {
      updateInventoryItem(suggestion.targetItemId, {
        sellingPrice: suggestion.suggestedValue,
        notes: `Smart clearance discount applied on ${new Date().toLocaleDateString('en-GB')}`
      });
      setSuccessToast(`✓ Applied clearance pricing of ₹${suggestion.suggestedValue} to "${suggestion.targetItemName}"!`);
      setExecutedIds(prev => [...prev, suggestion.id]);
    } else if (suggestion.actionType === 'peer_share') {
      setActiveTab('parts_sharing');
    } else if (suggestion.actionType === 'bundle_deal') {
      setSuccessToast(`✓ Saved service bundle tip to workshop repair presets.`);
      setExecutedIds(prev => [...prev, suggestion.id]);
    }

    setTimeout(() => setSuccessToast(null), 3500);
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

      {/* Workshop Health Score Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 text-white p-5 rounded-2xl border border-indigo-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <Lightbulb className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <span>Inventory Intelligence & Optimization Suggestions</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Real-time Analytics
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Actionable AI-driven insights to maximize parts profit margins, prevent repair delays, and liquidate stagnant capital.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-3 bg-white/10 p-2.5 px-4 rounded-xl border border-white/15 self-start sm:self-auto">
            <div>
              <span className="text-[10px] uppercase text-indigo-200 block font-semibold">Inventory Health</span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-2xl text-emerald-400 font-mono">
                  {healthScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-300">
              {healthScore >= 80 ? 'A+' : healthScore >= 70 ? 'B' : 'C'}
            </div>
          </div>
        </div>

        {/* 3 Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Fast-Moving Ratio</span>
            <div className="font-heading font-bold text-xl text-white font-mono flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{fastMovingRatio}%</span>
            </div>
            <span className="text-[11px] text-amber-300/90 block mt-0.5">
              Proportion of active, high-turnover parts
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Locked Dead Capital</span>
            <div className="font-heading font-bold text-xl text-rose-300 font-mono flex items-center gap-1.5">
              <Snowflake className="w-4 h-4 text-rose-400" />
              <span>{formatINR(totalLockedCapital)}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Available for clearance or peer exchange
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Active Suggestions</span>
            <div className="font-heading font-bold text-xl text-emerald-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{suggestions.length} Tips</span>
            </div>
            <span className="text-[11px] text-emerald-300/90 block mt-0.5">
              Tailored for your workshop volume
            </span>
          </div>
        </div>
      </div>

      {/* Suggestion Cards List */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const isDone = executedIds.includes(suggestion.id);

          return (
            <div
              key={suggestion.id}
              data-testid={`card-suggestion-${suggestion.id}`}
              className={`bg-white p-5 rounded-2xl border transition-all ${
                isDone 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                      suggestion.type === 'restock_urgency' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      suggestion.type === 'dead_stock_clearance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      suggestion.type === 'peer_share' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      suggestion.type === 'margin_boost' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {suggestion.badge}
                    </span>

                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Action Completed</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900">
                    {suggestion.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {suggestion.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                    <span><strong>Expected Impact:</strong> {suggestion.impact}</span>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    data-testid={`btn-execute-suggestion-${suggestion.id}`}
                    disabled={isDone}
                    onClick={() => handleAction(suggestion)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 ${
                      isDone
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : suggestion.type === 'restock_urgency'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : suggestion.type === 'dead_stock_clearance'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>{suggestion.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-sky-600 shrink-0" />
        <span>Suggestions update dynamically as you record repair jobs, debit sales, and update stock quantities.</span>
      </div>
    </div>
  );
};

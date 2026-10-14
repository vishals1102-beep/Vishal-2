import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  MessageSquare,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToolListing } from '../../types';

export const ToolsSharingView: React.FC = () => {
  const { toolsListings, formatINR, currentTech } = useApp();
  const [selectedTool, setSelectedTool] = useState<ToolListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = toolsListings.filter(t => 
    t.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.technicianCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-amber-500" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Specialized Bench Tools Sharing
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Rent high-end laser back-glass removers, 4K microscopes & JCID programmers from nearby certified labs
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="input-search-tools"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment by name, brand (JCID / QianLi), or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map(tool => (
          <div
            key={tool.id}
            data-testid={`card-tool-${tool.id}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={tool.photoUrl}
                  alt={tool.toolName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase backdrop-blur-xs ${
                    tool.isAvailable 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-800 text-slate-200'
                  }`}>
                    {tool.isAvailable ? 'Available for Rent' : 'Currently on Rent'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-xs shadow-md">
                  {formatINR(tool.dailyRentPrice)} / Day
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {tool.brand} Bench Gear
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Deposit: {formatINR(tool.securityDeposit)}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                  {tool.toolName}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                  "{tool.specs}"
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    {tool.technicianShop}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {tool.technicianCity}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                data-testid={`btn-rent-tool-${tool.id}`}
                onClick={() => setSelectedTool(tool)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Reserve Equipment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reserve Tool Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm">Rent Specialized Tool</h3>
              <button onClick={() => setSelectedTool(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img src={selectedTool.photoUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <div>
                  <h4 className="font-heading font-bold text-slate-900">{selectedTool.toolName}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedTool.brand}</p>
                  <p className="text-amber-600 font-bold font-mono">₹{selectedTool.dailyRentPrice} / Day</p>
                </div>
              </div>

              <div className="space-y-2 text-slate-700">
                <p><strong>Owner Workshop:</strong> {selectedTool.technicianShop}</p>
                <p><strong>Pickup Location:</strong> {selectedTool.technicianCity}, India</p>
                <p><strong>Refundable Security Deposit:</strong> ₹{selectedTool.securityDeposit}</p>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  Tool rental agreements require inspection of technician ID card upon bench handover.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Close
                </button>
                <button
                  data-testid="btn-whatsapp-tool-owner"
                  onClick={() => {
                    const raw = selectedTool.technicianWhatsapp.replace(/[^0-9]/g, '');
                    const msg = `Hello ${selectedTool.technicianShop}, I am ${currentTech.fullName} from ${currentTech.shopName}. I would like to rent your "${selectedTool.toolName}" listed on Quick Fix for ₹${selectedTool.dailyRentPrice}/day. When can I pick it up?`;
                    window.open(`https://wa.me/${raw}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Owner for Handover</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

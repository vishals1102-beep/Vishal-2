import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  IndianRupee,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PartListing } from '../../types';

export const PartsMarketplaceView: React.FC = () => {
  const { partsListings, addPartListing, currentTech, formatINR } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showPostModal, setShowPostModal] = useState(false);

  // New listing form state
  const [partTitle, setPartTitle] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [compatibleModels, setCompatibleModels] = useState('iPhone 14 Pro, iPhone 14 Pro Max');
  const [category, setCategory] = useState('Screens & Displays');
  const [condition, setCondition] = useState<PartListing['condition']>('Extracted Original (Used)');
  const [price, setPrice] = useState(6500);
  const [quantity, setQuantity] = useState(2);

  const samplePhoto = 'https://images.pexels.com/photos/31862950/pexels-photo-31862950.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

  const categories = [
    'All',
    'Screens & Displays',
    'Motherboard ICs & PMIC',
    'Flex Cables & Cameras',
    'Housings & Back Glass',
    'Batteries'
  ];

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partTitle.trim()) return;

    addPartListing({
      title: partTitle,
      brand,
      compatibleModels: compatibleModels.split(',').map(s => s.trim()),
      partCategory: category,
      condition,
      price: Number(price) || 0,
      quantityAvailable: Number(quantity) || 1,
      photoUrl: samplePhoto
    });

    setShowPostModal(false);
    setPartTitle('');
  };

  const filtered = partsListings.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.partCategory === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.compatibleModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.technicianCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              B2B Spare Parts Marketplace
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Source genuine OEM displays, PMIC chips & pull housings directly from verified Indian technicians
          </p>
        </div>

        <button
          data-testid="btn-post-spare-part"
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>List Spare Part for Sale</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="input-search-parts"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spare parts by component name, phone model, or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Parts Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(part => {
          const isMyListing = part.technicianId === currentTech.id;
          return (
            <div
              key={part.id}
              data-testid={`card-part-${part.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={part.photoUrl}
                    alt={part.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                      {part.condition}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sky-600/90 text-white backdrop-blur-xs">
                      {part.partCategory}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shadow-md">
                    {formatINR(part.price)}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                    {part.title}
                  </h3>

                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Fits: </span>
                    {part.compatibleModels.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <span>{part.technicianName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                    </div>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {part.technicianCity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                {isMyListing ? (
                  <div className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold text-center">
                    Your Active Listing ({part.quantityAvailable} in stock)
                  </div>
                ) : (
                  <button
                    data-testid={`btn-whatsapp-deal-${part.id}`}
                    onClick={() => {
                      const raw = part.technicianWhatsapp.replace(/[^0-9]/g, '');
                      const msg = `Hello ${part.technicianName}, I am ${currentTech.fullName} from ${currentTech.shopName} (${currentTech.city}). I saw your B2B listing for "${part.title}" on Quick Fix for ₹${part.price}. Is it available?`;
                      window.open(`https://wa.me/${raw}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Seller for Deal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900">
              {partsListings.length === 0 ? 'No Spare Parts Listed Yet • Clean Marketplace' : 'No Spare Parts Match Search'}
            </h3>
            <p className="text-xs text-slate-500">
              {partsListings.length === 0
                ? 'Your marketplace feed has 0 active spare listings. List display assemblies, PMIC ICs, pulled batteries, or charging flex cables to sell or share with fellow technicians.'
                : `No spare parts match your active category "${selectedCategory}" or search "${searchQuery}".`}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              data-testid="btn-empty-list-spare-part"
              type="button"
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List First Spare Part</span>
            </button>
            {partsListings.length > 0 && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post Spare Part Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm">List Spare Part for Workshop Sale</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateListing} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Component Title *
                </label>
                <input
                  type="text"
                  value={partTitle}
                  onChange={(e) => setPartTitle(e.target.value)}
                  placeholder="e.g. Original Super Retina XDR OLED Display"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Apple / Samsung / Vivo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Screens & Displays">Screens & Displays</option>
                    <option value="Motherboard ICs & PMIC">Motherboard ICs & PMIC</option>
                    <option value="Flex Cables & Cameras">Flex Cables & Cameras</option>
                    <option value="Housings & Back Glass">Housings & Back Glass</option>
                    <option value="Batteries">Batteries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compatible Models (Comma separated)
                </label>
                <input
                  type="text"
                  value={compatibleModels}
                  onChange={(e) => setCompatibleModels(e.target.value)}
                  placeholder="e.g. iPhone 13, iPhone 13 Pro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Brand New (Original)">Brand New (Original)</option>
                    <option value="OEM Tested">OEM Tested</option>
                    <option value="Extracted Original (Used)">Extracted Original (Used)</option>
                    <option value="Refurbished Grade A">Refurbished Grade A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-confirm-post-part"
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

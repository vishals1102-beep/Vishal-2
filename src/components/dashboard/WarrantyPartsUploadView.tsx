import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Cpu, 
  Wrench, 
  Plus, 
  Sparkles, 
  Filter, 
  Search, 
  Printer, 
  X, 
  Eye, 
  IndianRupee,
  ExternalLink,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WarrantyPartUpload } from '../../types';

export const WarrantyPartsUploadView: React.FC = () => {
  const { 
    tickets, 
    warrantyPartUploads, 
    addWarrantyPartUpload, 
    formatINR, 
    currentTech,
    setActiveTab 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'upload_form' | 'gallery'>('upload_form');

  // Form State
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [partName, setPartName] = useState('');
  const [partCategory, setPartCategory] = useState('Screens & Displays');
  const [partBrand, setPartBrand] = useState('OEM Standard');
  const [serialBatchNumber, setSerialBatchNumber] = useState('');
  const [supplierName, setSupplierName] = useState('Karol Bagh Spares Hub');
  const [replacementCost, setReplacementCost] = useState<number>(3500);
  const [claimReason, setClaimReason] = useState('');
  const [technicalRemarks, setTechnicalRemarks] = useState('');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [vendorRmaNotes, setVendorRmaNotes] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyPartUpload['warrantyStatus']>('approved_free_replacement');

  // Photo URLs
  const [faultyPartPhoto, setFaultyPartPhoto] = useState<string>('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80');
  const [serialBarcodePhoto, setSerialBarcodePhoto] = useState<string>('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80');
  const [replacementPartPhoto, setReplacementPartPhoto] = useState<string>('https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80');
  const [benchTestingPhoto, setBenchTestingPhoto] = useState<string>('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');

  // UI state
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [previewItem, setPreviewItem] = useState<WarrantyPartUpload | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Selected ticket info
  const currentSelectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Autofill sample data preset
  const handleLoadSampleData = () => {
    setPartName('Super Retina OLED Touch Assembly (120Hz)');
    setPartCategory('Screens & Displays');
    setPartBrand('Apple OEM High-Grade');
    setSerialBatchNumber(`SN-OLED-BATCH-${Math.floor(100000 + Math.random() * 900000)}`);
    setSupplierName('Lamington Road Wholesalers Ltd');
    setReplacementCost(8200);
    setClaimReason('Spontaneous touch digitizer ghosting & vertical line appearing 14 days post-installation.');
    setTechnicalRemarks('Microscopic visual inspection reveals 0 flex tear, 0 bezel crimp, 0 liquid ingress on IC solder pads. Multi-meter continuity testing confirms defective touch driver COF IC bonding. 100% genuine component failure eligible for free replacement under 90-day warranty.');
    setCustomerRemarks('Customer returned handset reporting erratic touch responsiveness while typing WhatsApp messages. Zero drop marks on screen protector.');
    setVendorRmaNotes('Distributor RMA #LMG-9921 authorized. Replacement credit note issued.');
    setWarrantyStatus('approved_free_replacement');
    setFaultyPartPhoto('https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80');
    setSerialBarcodePhoto('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80');
    setReplacementPartPhoto('https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80');
    setBenchTestingPhoto('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');
  };

  const handleFileUpload = (setter: (url: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!partName.trim()) {
      setFormError('Please enter the Part Name');
      return;
    }
    if (!claimReason.trim()) {
      setFormError('Please specify the Claim Reason');
      return;
    }
    if (!technicalRemarks.trim()) {
      setFormError('Please provide technician bench remarks');
      return;
    }
    if (!faultyPartPhoto) {
      setFormError('Please upload at least one photo of the faulty part');
      return;
    }

    const created = addWarrantyPartUpload({
      ticketId: selectedTicketId || (currentSelectedTicket ? currentSelectedTicket.id : 'QF-REP-GENERIC'),
      customerName: currentSelectedTicket ? currentSelectedTicket.customerName : 'Walk-in Customer',
      deviceModel: currentSelectedTicket ? `${currentSelectedTicket.deviceBrand} ${currentSelectedTicket.deviceModel}` : 'Electronics Device',
      partName: partName.trim(),
      partCategory,
      partBrand,
      serialBatchNumber: serialBatchNumber || `SN-${Date.now().toString().slice(-6)}`,
      supplierName,
      claimReason: claimReason.trim(),
      technicalRemarks: technicalRemarks.trim(),
      customerRemarks: customerRemarks.trim() || 'Claim filed within warranty duration.',
      vendorRmaNotes: vendorRmaNotes.trim(),
      warrantyStatus,
      photos: {
        faultyPartPhoto,
        serialBarcodePhoto: serialBarcodePhoto || undefined,
        replacementPartPhoto: replacementPartPhoto || undefined,
        benchTestingPhoto: benchTestingPhoto || undefined
      },
      replacementCost: Number(replacementCost) || 0
    });

    setFormSuccess(`Warranty Part & Remarks Uploaded! Record ID: ${created.id}`);
    setPreviewItem(created);
    setActiveSubTab('gallery');
  };

  const filteredUploads = warrantyPartUploads.filter(item => {
    const matchesSearch = 
      item.partName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.ticketId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.serialBatchNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.deviceModel.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesCat = categoryFilter === 'ALL' || item.partCategory === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5">
              <Camera className="w-3 h-3" />
              Warranty Audit & Evidence Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              {warrantyPartUploads.length} Parts Documented
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Warranty Parts Photos & Remarks Upload
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Upload high-resolution bench inspection photos, component barcode serials, and diagnostic remarks for manufacturer RMA and free warranty replacements.
          </p>
        </div>

        {/* Action switch tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700 shrink-0">
          <button
            data-testid="tab-upload-form"
            onClick={() => setActiveSubTab('upload_form')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'upload_form'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Part</span>
          </button>

          <button
            data-testid="tab-view-gallery"
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'gallery'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Evidence Records ({warrantyPartUploads.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: UPLOAD FORM */}
      {activeSubTab === 'upload_form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('gallery')}
                className="underline font-bold text-emerald-900"
              >
                View in Records
              </button>
            </div>
          )}

          {/* Quick preset loader */}
          <div className="flex items-center justify-between p-3.5 bg-sky-50 border border-sky-200 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Need to test quickly? Click to autofill real workshop warranty replacement details:</span>
            </div>
            <button
              type="button"
              data-testid="btn-autofill-sample-part"
              onClick={handleLoadSampleData}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
            >
              Autofill Sample Evidence
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Job & Part Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>Associated Repair Job</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Ticket
                  </label>
                  <select
                    data-testid="select-ticket-id"
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  >
                    {tickets.map(t => (
                      <option key={t.id} value={t.id}>
                        #{t.id} - {t.customerName} ({t.deviceBrand} {t.deviceModel})
                      </option>
                    ))}
                  </select>
                </div>

                {currentSelectedTicket && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-bold text-slate-900">{currentSelectedTicket.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Device:</span>
                      <span className="font-semibold text-slate-800">{currentSelectedTicket.deviceBrand} {currentSelectedTicket.deviceModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IMEI / Serial:</span>
                      <span className="font-mono text-slate-700">{currentSelectedTicket.imeiSerialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Original Repair:</span>
                      <span className="text-slate-700">{currentSelectedTicket.problemDescription}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Part Specs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>Component Specifications</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Part Name *
                  </label>
                  <input
                    data-testid="input-part-name"
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. OLED Display Assembly, Battery Pack..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={partCategory}
                      onChange={(e) => setPartCategory(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                    >
                      <option value="Screens & Displays">Screens & Displays</option>
                      <option value="Batteries">Batteries</option>
                      <option value="Motherboard ICs">Motherboard ICs</option>
                      <option value="Charging Sub-boards">Charging Sub-boards</option>
                      <option value="Camera Modules">Camera Modules</option>
                      <option value="Flex Cables">Flex Cables</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Part Brand
                    </label>
                    <input
                      type="text"
                      value={partBrand}
                      onChange={(e) => setPartBrand(e.target.value)}
                      placeholder="e.g. Apple OEM, Foxconn"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Serial / QR Barcode Batch #
                  </label>
                  <input
                    data-testid="input-serial-batch"
                    type="text"
                    value={serialBatchNumber}
                    onChange={(e) => setSerialBatchNumber(e.target.value)}
                    placeholder="e.g. SN-OLED-2026-9901"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Spares Supplier
                    </label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="e.g. Karol Bagh Spares"
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Part Value (INR)
                    </label>
                    <input
                      type="number"
                      value={replacementCost}
                      onChange={(e) => setReplacementCost(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Warranty Disposition Status
                  </label>
                  <select
                    data-testid="select-warranty-status"
                    value={warrantyStatus}
                    onChange={(e) => setWarrantyStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="approved_free_replacement">Approved - 100% Free Replacement under Warranty</option>
                    <option value="bench_repaired">Bench Repaired / Micro-soldered (Zero Cost)</option>
                    <option value="pending_vendor_credit">Pending Supplier / Distributor RMA Credit</option>
                    <option value="rejected_physical_damage">Void - Physical / Liquid Impact Damage Detected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Column: Photos Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-sky-600" />
                    <span>Parts Photos Evidence</span>
                  </h2>
                  <span className="text-[10px] text-slate-400">4 Audit Views</span>
                </div>

                {/* Photo 1: Faulty Part */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Defective / Faulty Part Photo *</span>
                    <span className="text-[10px] text-rose-600 font-semibold">Required</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors relative">
                    {faultyPartPhoto ? (
                      <div className="relative group">
                        <img 
                          src={faultyPartPhoto} 
                          alt="Faulty Part" 
                          className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setFaultyPartPhoto('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-600 block">Upload Faulty Component Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload(setFaultyPartPhoto)} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Photo 2: Serial / Barcode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Serial / Barcode Label Photo
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
                    {serialBarcodePhoto ? (
                      <div className="relative group">
                        <img 
                          src={serialBarcodePhoto} 
                          alt="Barcode" 
                          className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setSerialBarcodePhoto('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-600 block">Upload Barcode / QR Label</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload(setSerialBarcodePhoto)} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Photo 3: Replacement Part */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Fresh Replacement Part Photo
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
                    {replacementPartPhoto ? (
                      <div className="relative group">
                        <img 
                          src={replacementPartPhoto} 
                          alt="Replacement Part" 
                          className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setReplacementPartPhoto('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-600 block">Upload New Replacement Component</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload(setReplacementPartPhoto)} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Photo 4: Bench / Microscope Inspection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    4. Bench / Microscope / Multimeter Reading Photo
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
                    {benchTestingPhoto ? (
                      <div className="relative group">
                        <img 
                          src={benchTestingPhoto} 
                          alt="Bench Reading" 
                          className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setBenchTestingPhoto('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-600 block">Upload Microscope / Diagnostic View</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload(setBenchTestingPhoto)} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Diagnostic Remarks & RMA Notes */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Technical Remarks & Findings</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Complaint / Defect Description *
                  </label>
                  <textarea
                    data-testid="textarea-claim-reason"
                    required
                    rows={3}
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    placeholder="Describe how the defect surfaced, timeline since last service..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Technician Bench Diagnosis Remarks *
                  </label>
                  <textarea
                    data-testid="textarea-technical-remarks"
                    required
                    rows={4}
                    value={technicalRemarks}
                    onChange={(e) => setTechnicalRemarks(e.target.value)}
                    placeholder="Enter multimeter voltage, microscope findings, IC condition, proof of no physical/liquid damage..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Feedback / Handset Condition Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={customerRemarks}
                    onChange={(e) => setCustomerRemarks(e.target.value)}
                    placeholder="e.g. Case was intact, tempered glass undamaged..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Distributor RMA / Return Authorization Notes
                  </label>
                  <input
                    type="text"
                    value={vendorRmaNotes}
                    onChange={(e) => setVendorRmaNotes(e.target.value)}
                    placeholder="e.g. Authorized under RMA #KBH-991, 100% credit granted"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    data-testid="btn-submit-warranty-upload"
                    type="submit"
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Save Warranty Part Photos & Remarks</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUB-VIEW 2: GALLERY & RECORDS LIST */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          {/* Search and Category Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                data-testid="input-search-warranty-parts"
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by part, ticket #, customer, serial..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Screens & Displays', 'Batteries', 'Motherboard ICs', 'Charging Sub-boards'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUploads.map((item) => (
              <div 
                key={item.id}
                data-testid={`card-warranty-part-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-500">Ticket #{item.ticketId}</span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 mt-1">
                      {item.partName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.deviceModel} • Customer: <span className="text-slate-800 font-semibold">{item.customerName}</span>
                    </p>
                  </div>

                  <span className={`
                    text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0
                    ${item.warrantyStatus === 'approved_free_replacement'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : item.warrantyStatus === 'rejected_physical_damage'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }
                  `}>
                    {item.warrantyStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Photos Grid in Card */}
                <div className="p-4 bg-slate-900">
                  <div className="grid grid-cols-3 gap-2">
                    {item.photos.faultyPartPhoto && (
                      <div className="relative group">
                        <img 
                          src={item.photos.faultyPartPhoto} 
                          alt="Faulty Part" 
                          className="h-20 w-full object-cover rounded-lg border border-slate-700" 
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded">
                          Defect
                        </span>
                      </div>
                    )}
                    {item.photos.serialBarcodePhoto && (
                      <div className="relative group">
                        <img 
                          src={item.photos.serialBarcodePhoto} 
                          alt="Serial Barcode" 
                          className="h-20 w-full object-cover rounded-lg border border-slate-700" 
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded">
                          Serial
                        </span>
                      </div>
                    )}
                    {item.photos.replacementPartPhoto && (
                      <div className="relative group">
                        <img 
                          src={item.photos.replacementPartPhoto} 
                          alt="Replacement" 
                          className="h-20 w-full object-cover rounded-lg border border-slate-700" 
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded">
                          New Part
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks & Details Body */}
                <div className="p-4 flex-1 space-y-3 text-xs text-slate-700">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Customer Complaint
                    </span>
                    <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-800">
                      "{item.claimReason}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Technician Bench Diagnosis Remarks
                    </span>
                    <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-800 font-mono text-[11px] leading-relaxed">
                      {item.technicalRemarks}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Serial / Batch #</span>
                      <span className="font-mono font-bold text-slate-800">{item.serialBatchNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Spares Supplier</span>
                      <span className="font-semibold text-slate-800">{item.supplierName}</span>
                    </div>
                  </div>

                  {item.vendorRmaNotes && (
                    <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px]">
                      <span className="font-bold">Vendor RMA: </span>{item.vendorRmaNotes}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    Value: <span className="font-bold text-slate-900">{formatINR(item.replacementCost)}</span>
                  </div>
                  <button
                    data-testid={`btn-view-evidence-${item.id}`}
                    onClick={() => setPreviewItem(item)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Inspection Certificate</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredUploads.length === 0 && (
              <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-base text-slate-800">No Warranty Part Records Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No parts match your current search or category filter. Switch filters or upload a new warranty part with diagnostic remarks.
                </p>
                <button
                  onClick={() => setActiveSubTab('upload_form')}
                  className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-sky-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Part Evidence</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECTION CERTIFICATE MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded">
                    {previewItem.id}
                  </span>
                  <span className="text-xs text-slate-400">Date: {previewItem.uploadTimestamp}</span>
                </div>
                <h2 className="text-lg font-heading font-bold text-white">
                  Official Warranty Part Audit Certificate
                </h2>
                <p className="text-xs text-slate-400">
                  Quick Fix Electronics Verification & RMA Dossier
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-800">
              {/* Device and Customer Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Customer Name</span>
                  <span className="font-bold text-sm text-slate-900">{previewItem.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Device Model</span>
                  <span className="font-bold text-sm text-slate-900">{previewItem.deviceModel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Repair Ticket #</span>
                  <span className="font-mono font-bold text-sky-700">{previewItem.ticketId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Authorizing Technician</span>
                  <span className="font-semibold text-slate-800">{previewItem.technicianName} ({currentTech.shopName})</span>
                </div>
              </div>

              {/* Photos Gallery View */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  <span>Photographic Evidence</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {previewItem.photos.faultyPartPhoto && (
                    <div className="space-y-1">
                      <img 
                        src={previewItem.photos.faultyPartPhoto} 
                        alt="Faulty Part" 
                        className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                      />
                      <span className="text-[10px] text-slate-600 font-bold block text-center">Faulty Part</span>
                    </div>
                  )}
                  {previewItem.photos.serialBarcodePhoto && (
                    <div className="space-y-1">
                      <img 
                        src={previewItem.photos.serialBarcodePhoto} 
                        alt="Serial Barcode" 
                        className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                      />
                      <span className="text-[10px] text-slate-600 font-bold block text-center">Barcode Serial</span>
                    </div>
                  )}
                  {previewItem.photos.replacementPartPhoto && (
                    <div className="space-y-1">
                      <img 
                        src={previewItem.photos.replacementPartPhoto} 
                        alt="Replacement Part" 
                        className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                      />
                      <span className="text-[10px] text-slate-600 font-bold block text-center">New Replacement</span>
                    </div>
                  )}
                  {previewItem.photos.benchTestingPhoto && (
                    <div className="space-y-1">
                      <img 
                        src={previewItem.photos.benchTestingPhoto} 
                        alt="Bench Microscope" 
                        className="h-28 w-full object-cover rounded-lg border border-slate-200" 
                      />
                      <span className="text-[10px] text-slate-600 font-bold block text-center">Bench Diagnosis</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Diagnosis Analysis */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Bench Technical Remarks & Findings</span>
                </h3>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800">
                  {previewItem.technicalRemarks}
                </div>
              </div>

              {/* Customer Remarks */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Customer Statement:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  "{previewItem.claimReason}"
                </p>
              </div>

              {/* Component Barcode & Settlement */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">
                    Warranty Settlement: 100% Free Replacement
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Part: {previewItem.partName} • Serial: {previewItem.serialBatchNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-emerald-800">Covered Value</div>
                  <div className="font-bold text-base text-emerald-950">
                    {formatINR(previewItem.replacementCost)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

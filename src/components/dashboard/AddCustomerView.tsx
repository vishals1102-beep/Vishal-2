import React, { useState } from 'react';
import { 
  UserPlus, 
  ArrowLeft, 
  Check, 
  Smartphone, 
  MapPin, 
  FileText,
  Building2,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AddCustomerView: React.FC = () => {
  const { addCustomer, setActiveTab, currentTech } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '+91 ',
    whatsappNumber: '+91 ',
    address: '',
    city: currentTech.city || 'Mumbai',
    notes: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    addCustomer({
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
      address: formData.address || 'Local Walk-in Customer',
      city: formData.city,
      notes: formData.notes
    });

    setIsSaved(true);
    setTimeout(() => {
      setActiveTab('customers');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('customers')}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl text-slate-900">
            Register New Customer
          </h1>
          <p className="text-xs text-slate-500">
            Create a customer record for tracking electronics repairs & warranty records
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Full Name *
            </label>
            <input
              data-testid="input-customer_name"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (+91) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="input-customer_mobile"
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="+91 98200 XXXXX"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp Number (For Invoices) *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="input-customer_whatsapp"
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+91 98200 XXXXX"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Residential / Work Address
              </label>
              <input
                data-testid="input-customer_address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Flat 301, Sunshine Heights, Andheri East"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                data-testid="input-customer_city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Preferences or Internal Notes
            </label>
            <textarea
              data-testid="input-customer_notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Regular corporate client; wants OEM parts only; prefers evening pickup."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              data-testid="btn-save-customer"
              type="submit"
              disabled={isSaved}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4" />}
              <span>{isSaved ? 'Customer Saved!' : 'Save & Register Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

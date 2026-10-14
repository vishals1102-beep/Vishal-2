import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Building2, 
  UserCheck, 
  FileText, 
  Phone, 
  MapPin, 
  Clock, 
  Search,
  ExternalLink,
  Eye,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Technician } from '../../types';

export const AdminVerificationView: React.FC = () => {
  const { technicians, adminApproveTech, adminRejectTech, adminUser, userRole, setActiveTab } = useApp();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [complianceNote, setComplianceNote] = useState('Verified & Accredited by Super Admin Vishal Sharma (+91 95413 71468) after physical storefront and government KYC audit.');

  const pendingTechs = technicians.filter(t => t.verificationStatus === 'pending');
  
  const displayTechs = technicians.filter(t => {
    const matchesFilter = activeFilter === 'all' || t.verificationStatus === activeFilter;
    const matchesSearch = 
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (tech: Technician) => {
    const finalNote = complianceNote || `Verified & Approved by Super Admin Vishal Sharma (+91 95413 71468) on ${new Date().toLocaleDateString('en-GB')}.`;
    adminApproveTech(tech.id, finalNote);
    setSelectedTech(null);
  };

  const handleReject = (tech: Technician) => {
    const finalNote = complianceNote || `Application rejected by Super Admin Vishal Sharma (+91 95413 71468). Re-upload valid trade license.`;
    adminRejectTech(tech.id, finalNote);
    setSelectedTech(null);
  };

  // If unauthorized role attempts access
  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Restricted Admin Access</h2>
          <p className="text-xs text-slate-600 mt-1">
            Only designated <strong>Super Admin Vishal Sharma (Mobile: 9541371468)</strong> with verified username, password, and SMS OTP is empowered to audit and accredit new workshop accounts.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('login')}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Sign In as Admin Vishal Sharma (Password & OTP)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              National Accreditation Desk
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white">
            Super Admin Verification Console
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Official KYC verification desk operated by <strong className="text-white font-bold">Admin Vishal Sharma</strong>. Sole authorized officer for issuing Quick Fix verified workshop accreditations.
          </p>
        </div>

        {/* Admin Vishal Verified Session Card */}
        <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Vishal Sharma</span>
              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                OTP Verified
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              +91 95413 71468 • Chief Verifier
            </div>
          </div>
        </div>
      </div>

      {/* Sole Verification Authority Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Sole Verification Authority: Super Admin Vishal Sharma</span>
            <span className="text-indigo-800 text-[11px]">
              Only Admin Vishal Sharma can review new workshop registrations, audit storefront photos and trade documents, and grant the National Certified Workshop status.
            </span>
          </div>
        </div>
        <div className="shrink-0 font-mono text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200">
          {pendingTechs.length} Pending Approvals
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            data-testid="tab-admin-pending"
            onClick={() => setActiveFilter('pending')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pending Verification ({pendingTechs.length})
          </button>
          <button
            data-testid="tab-admin-all"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Registered Technicians ({technicians.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="input-search-admin-techs"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Tech ID, Name or City..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayTechs.map(tech => (
          <div
            key={tech.id}
            data-testid={`card-admin-tech-${tech.id}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={tech.technicianPhoto}
                    alt={tech.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                      {tech.fullName}
                      {tech.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </h3>
                    <p className="text-xs text-sky-700 font-semibold">{tech.shopName}</p>
                    <p className="text-[11px] font-mono text-slate-400">ID: {tech.id}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  tech.verificationStatus === 'verified' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {tech.verificationStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{tech.completeAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{tech.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>KYC Proof: <strong>{tech.idDocumentType}</strong></span>
                </div>
              </div>

              {/* Photo previews */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100">
                  <img src={tech.shopPhoto} alt="Storefront" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Storefront
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100">
                  <img src={tech.idDocumentUrl} alt="Document" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    {tech.idDocumentType}
                  </span>
                </div>
              </div>

              {tech.verificationNotes && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                  Notes: {tech.verificationNotes}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                data-testid={`btn-inspect-admin-${tech.id}`}
                onClick={() => setSelectedTech(tech)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Examine Documents</span>
              </button>

              {tech.verificationStatus === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`btn-admin-reject-${tech.id}`}
                    onClick={() => handleReject(tech)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    data-testid={`btn-admin-approve-${tech.id}`}
                    onClick={() => handleApprove(tech)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Examine Tech Modal */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm">KYC Audit: {selectedTech.fullName}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{selectedTech.id} • {selectedTech.shopName}</span>
              </div>
              <button onClick={() => setSelectedTech(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Physical Storefront Photo
                  </span>
                  <img src={selectedTech.shopPhoto} alt="Shop" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    {selectedTech.idDocumentType} Proof
                  </span>
                  <img src={selectedTech.idDocumentUrl} alt="KYC Doc" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-slate-700">
                <p><strong>Bench Experience:</strong> {selectedTech.experienceYears} Years</p>
                <p><strong>Address:</strong> {selectedTech.completeAddress}</p>
                <p><strong>Tools Owned:</strong> {selectedTech.availableTools.join(', ')}</p>
                <p><strong>Brands Repaired:</strong> {selectedTech.brandsWorkedOn.join(', ')}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compliance Audit & Verification Remarks
                </label>
                <textarea
                  rows={2}
                  value={complianceNote}
                  onChange={(e) => setComplianceNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTech(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Close
                </button>
                {selectedTech.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedTech)}
                      className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTech)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Issue Certified Status</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  Wrench, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Share2,
  FileCheck,
  Building2,
  Camera,
  KeyRound,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TechnicianVisitingCard } from '../common/TechnicianVisitingCard';
import { ChangePasswordModal } from '../common/ChangePasswordModal';

export const ProfileView: React.FC = () => {
  const { currentTech, setActiveTab } = useApp();
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showVisitingCardModal, setShowVisitingCardModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 relative">
          <div className="absolute right-4 top-4 flex items-center gap-2 flex-wrap justify-end">
            <button
              data-testid="btn-change-password-header"
              onClick={() => setShowChangePasswordModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>

            <button
              data-testid="btn-view-visiting-card"
              onClick={() => setShowVisitingCardModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Visiting Card & UPI</span>
            </button>

            <button
              data-testid="btn-view-digital-id"
              onClick={() => setShowIdCardModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Digital ID</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img 
                src={currentTech.technicianPhoto} 
                alt={currentTech.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-extrabold text-2xl text-slate-900">
                    {currentTech.fullName}
                  </h1>
                  {currentTech.verificationStatus === 'verified' ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-xs text-sky-700 font-semibold">{currentTech.shopName}</p>
                {/* Make in India and Indian flag down to shop name */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm">🇮🇳</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    Make in India Certified Workshop
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {currentTech.id} • Member Since {currentTech.joinedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                data-testid="btn-share-profile-whatsapp"
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://wa.me/?text=Check%20out%20my%20verified%20electronics%20repair%20workshop%20on%20Quick%20Fix:%20${encodeURIComponent(url)}`, '_blank');
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Shop</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-700 max-w-3xl leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            "{currentTech.about}"
          </p>
        </div>
      </div>

      {/* Grid: Details & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Workshop Contact & Timing */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Workshop Contact & Hours
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-900">Physical Address</span>
                  <span className="text-slate-600">{currentTech.completeAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Calling & WhatsApp</span>
                  <span className="text-slate-600 font-mono">{currentTech.mobileNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Email Address</span>
                  <span className="text-slate-600">{currentTech.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-900">Working Hours</span>
                  <span className="text-slate-600">{currentTech.workingHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storefront Photo preview */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Storefront & Bench Setup
            </span>
            <img 
              src={currentTech.shopPhoto} 
              alt="Shop" 
              className="w-full h-40 object-cover rounded-xl border border-slate-200"
            />
          </div>

          {/* Account Security & Password Management Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Security & Password
                  </h3>
                  <p className="text-[11px] text-slate-500">Workbench credentials</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Protected
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono font-bold text-slate-900">{currentTech.id}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Login Mobile:</span>
                <span className="font-mono font-bold text-slate-900">{currentTech.mobileNumber}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono text-slate-800 tracking-wider">••••••••••••</span>
              </div>
            </div>

            <button
              data-testid="btn-change-password-card"
              type="button"
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Workbench Password</span>
            </button>
          </div>
        </div>

        {/* Center & Right Column: Verification & Skillsets */}
        <div className="md:col-span-2 space-y-6">
          {/* KYC Compliance Status Card */}
          <div className={`p-5 rounded-2xl border shadow-xs ${
            currentTech.verificationStatus === 'verified' 
              ? 'bg-emerald-50/50 border-emerald-200' 
              : 'bg-amber-50/50 border-amber-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {currentTech.verificationStatus === 'verified' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    {currentTech.verificationStatus === 'verified' 
                      ? 'National Certified Electronics Technician' 
                      : 'KYC Document Verification In Progress'
                    }
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    {currentTech.verificationNotes}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-800">
                    <span>Document: <strong>{currentTech.idDocumentType}</strong></span>
                    <span>•</span>
                    <span>Experience: <strong>{currentTech.experienceYears} Years</strong></span>
                    <span>•</span>
                    <span>Track Record: <strong>{currentTech.totalRepairsCompleted}+ Completed</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands & Services */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Authorized Device Brands & Skill Matrix
            </h3>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Brands Worked On
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTech.brandsWorkedOn.map(b => (
                  <span key={b} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Repair Services Offered
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTech.servicesProvided.map(s => (
                  <span key={s} className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200/60 rounded-lg text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Workshop Bench Tools & Diagnostics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTech.availableTools.map(t => (
                  <span key={t} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-lg text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Technician ID Card Modal */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <span className="font-heading font-bold text-sm">Official Technician ID Credential</span>
              <button 
                onClick={() => setShowIdCardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-full bg-gradient-to-br from-slate-900 to-sky-950 text-white p-5 rounded-2xl shadow-lg text-left relative overflow-hidden border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-sky-400" />
                    <span className="font-heading font-bold text-xs">QUICK FIX ELECTRONICS</span>
                  </div>
                  <span className="font-mono text-[11px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                    {currentTech.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={currentTech.technicianPhoto} 
                    alt={currentTech.fullName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-sky-400"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-base text-white">{currentTech.fullName}</h4>
                    <p className="text-xs text-sky-300 font-semibold">{currentTech.shopName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 mb-0.5">
                      <span className="text-xs">🇮🇳</span>
                      <span className="text-[10px] font-bold text-orange-300 tracking-wide uppercase">Make in India</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{currentTech.city}, {currentTech.state}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-t border-slate-700 pt-2">
                  <div>
                    <span className="text-slate-500 block">STATUS</span>
                    <span className="font-bold text-emerald-400 uppercase">{currentTech.verificationStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">JOINED</span>
                    <span className="font-bold text-white">{currentTech.joinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print ID Card</span>
                </button>
                <button
                  onClick={() => setShowIdCardModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visiting Card & Own UPI Barcode Modal */}
      {showVisitingCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Technician Visiting Card & Own UPI Barcode
                </h3>
                <p className="text-xs text-slate-500">
                  Your workshop's official business card with vCard 3.0 and own direct UPI payment barcode
                </p>
              </div>
              <button
                onClick={() => setShowVisitingCardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <TechnicianVisitingCard technician={currentTech} />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

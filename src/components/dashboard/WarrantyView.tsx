import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Plus, 
  Search, 
  Calendar,
  Check,
  Camera,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WarrantyClaim } from '../../types';

export const WarrantyView: React.FC = () => {
  const { 
    warrantyClaims, 
    tickets, 
    currentTech, 
    createWarrantyClaim, 
    updateWarrantyClaimStatus, 
    formatINR,
    setActiveTab,
    warrantyPartUploads
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'claims' | 'active_warranties'>('claims');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || '');
  const [claimIssue, setClaimIssue] = useState('Ghost touch on bottom right corner after 2 weeks of screen replacement.');

  // Resolution modal
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<WarrantyClaim['status']>('approved_replacement');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const myTickets = tickets.filter(t => t.technicianId === currentTech.id);
  const myClaims = warrantyClaims.filter(c => c.technicianId === currentTech.id);

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tickets.find(ticket => ticket.id === selectedTicketId);
    if (!t) return;

    createWarrantyClaim(t.id, claimIssue);

    setShowClaimModal(false);
    setClaimIssue('');
  };

  const handleResolveClaim = () => {
    if (!selectedClaim) return;
    updateWarrantyClaimStatus(selectedClaim.id, resolutionStatus, resolutionNotes || 'Handled per workshop warranty policy');
    setSelectedClaim(null);
    setResolutionNotes('');
  };

  const getClaimStatusBadge = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'under_inspection':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">Under Inspection</span>;
      case 'approved_replacement':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">Free Replacement Approved</span>;
      case 'repaired':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">Repaired & Re-tested</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800">Claim Rejected (Physical Damage)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Warranty Guarantees & Claims Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitor active customer repair guarantees and resolve claims transparently
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="btn-nav-upload-parts"
            onClick={() => setActiveTab('warranty_upload')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4 text-sky-400" />
            <span>Upload Parts Photos & Remarks</span>
          </button>

          <button
            data-testid="btn-open-claim-modal"
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>File Customer Warranty Claim</span>
          </button>
        </div>
      </div>

      {/* Quick Access to Warranty Parts Photos & Remarks Upload */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">
                Warranty Parts Photos & Remarks Upload Desk
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {warrantyPartUploads.length} Parts Documented
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit defective component photos, barcode serial numbers, and microscope diagnostic remarks for distributor RMA and free replacement audit certificates.
            </p>
          </div>
        </div>

        <button
          data-testid="btn-goto-warranty-upload"
          onClick={() => setActiveTab('warranty_upload')}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-heading rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Open Parts Upload Page</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveSubTab('claims')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'claims' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Warranty Claims ({myClaims.length})
        </button>
        <button
          onClick={() => setActiveSubTab('active_warranties')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'active_warranties' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Active Guarantees ({myTickets.length})
        </button>
      </div>

      {/* Claims SubTab */}
      {activeSubTab === 'claims' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClaims.map(claim => (
              <div
                key={claim.id}
                data-testid={`card-claim-${claim.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-sky-700">{claim.id}</span>
                      <h3 className="font-heading font-bold text-sm text-slate-900 mt-0.5">
                        {claim.deviceInfo}
                      </h3>
                    </div>
                    {getClaimStatusBadge(claim.status)}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>Customer: <strong>{claim.customerName}</strong></p>
                    <p>Original Ticket: <span className="font-mono text-sky-600">{claim.ticketId}</span></p>
                    <p>Date Logged: {claim.claimDate}</p>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 italic mt-2">
                      "{claim.issueReported}"
                    </div>

                    {claim.resolutionNotes && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] font-medium mt-2">
                        Resolution: {claim.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Workshop Policy Guaranteed</span>
                  <button
                    data-testid={`btn-resolve-claim-${claim.id}`}
                    onClick={() => {
                      setSelectedClaim(claim);
                      setResolutionStatus(claim.status);
                    }}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Action / Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {myClaims.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No warranty claims currently logged for this workshop.
            </div>
          )}
        </div>
      )}

      {/* Active Guarantees SubTab */}
      {activeSubTab === 'active_warranties' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket & Device</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Warranty Scope</th>
                  <th className="py-3 px-4">Expires On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-sky-700 block">{ticket.id}</span>
                      <span className="font-sans font-semibold text-slate-800 text-[11px]">{ticket.deviceBrand} {ticket.deviceModel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{ticket.customerName}</span>
                      <span className="text-[11px] text-slate-500">{ticket.customerMobile}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-purple-700 block">{ticket.warrantyPeriodDays} Days Guarantee</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{ticket.warrantyTerms}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-emerald-700 block">{ticket.warrantyExpiryDate}</span>
                      <span className="text-[10px] text-slate-400">Valid</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setShowClaimModal(true);
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs"
                      >
                        File Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* File Warranty Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm">Register Warranty Claim</h3>
              <button onClick={() => setShowClaimModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateClaim} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Associated Repair Ticket *
                </label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                >
                  {myTickets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.customerName} ({t.deviceModel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue / Fault Reported by Customer *
                </label>
                <textarea
                  rows={3}
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder="Describe failure under warranty (e.g. touch unresponsive, battery drains rapidly)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-submit-warranty-claim"
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Warranty Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Resolution Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm">Resolve Claim #{selectedClaim.id}</h3>
              <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Claim Verdict / Status
                </label>
                <select
                  data-testid="select-claim-verdict"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="approved_replacement">Approved - Free Spare Part Replacement</option>
                  <option value="repaired">Bench Repaired & Cleared</option>
                  <option value="rejected">Rejected (Accidental / Water Damage Detected)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Notes for Customer Record
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Free OLED replacement completed under 90-day guarantee warranty."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 border border-slate-200 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-confirm-resolve-claim"
                  onClick={handleResolveClaim}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

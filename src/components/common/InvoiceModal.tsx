import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Wrench, 
  Smartphone, 
  CheckCircle,
  Clock,
  Calendar,
  IndianRupee,
  Edit3
} from 'lucide-react';
import { RepairTicket, TechnicianProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { EditPartsAndLaborModal } from '../dashboard/EditPartsAndLaborModal';

interface InvoiceModalProps {
  ticket: RepairTicket;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ ticket, onClose }) => {
  const { currentTech, formatINR } = useApp();
  const [showEditPartsModal, setShowEditPartsModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const rawNumber = ticket.customerWhatsapp.replace(/[^0-9]/g, '');
    const cleanPhone = rawNumber.startsWith('91') ? rawNumber : `91${rawNumber}`;
    const text = encodeURIComponent(
      `*QUICK FIX ELECTRONICS - REPAIR INVOICE*\n` +
      `*Workshop:* ${currentTech.shopName}\n` +
      `*Ticket ID:* ${ticket.id}\n` +
      `*Customer:* ${ticket.customerName}\n` +
      `*Device:* ${ticket.deviceBrand} ${ticket.deviceModel}\n` +
      `*IMEI:* ${ticket.imeiSerialNumber}\n` +
      `--------------------------\n` +
      `*Parts Cost:* ${formatINR(ticket.partsCost)}\n` +
      `*Labor Charges:* ${formatINR(ticket.laborCharges)}\n` +
      `*Discount:* -${formatINR(ticket.discount)}\n` +
      `*TOTAL AMOUNT:* ${formatINR(ticket.totalCharges)}\n` +
      `*Payment Status:* ${ticket.paymentStatus.toUpperCase()} (${ticket.paymentMode})\n` +
      `--------------------------\n` +
      `*Warranty:* ${ticket.warrantyPeriodDays} Days (Valid until ${ticket.warrantyExpiryDate})\n` +
      `*Terms:* ${ticket.warrantyTerms}\n\n` +
      `Thank you for trusting our workshop! Reach us at ${currentTech.mobileNumber}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div 
      id="invoice-modal-backdrop"
      data-testid="modal-repair-invoice"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm">Official Workshop Repair Invoice</span>
              <div className="text-[11px] text-slate-400 font-mono">{ticket.id}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="btn-invoice-edit-parts"
              onClick={() => setShowEditPartsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition-colors"
              title="Edit Parts and Precision Labour Charges on this Invoice"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Edit Parts & Labour</span>
            </button>

            <button
              data-testid="btn-share-whatsapp-invoice"
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
            <button
              data-testid="btn-print-invoice"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              data-testid="btn-close-invoice"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 overflow-y-auto text-slate-900 space-y-6 print:p-8 print:m-0" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-heading font-bold text-xl text-sky-900">
                  {currentTech.shopName}
                </span>
                {currentTech.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Workshop
                  </span>
                )}
              </div>
              {/* Make in India and Indian flag down to shop name */}
              <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
                <span className="text-xs">🇮🇳</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  Make in India Certified
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm">{currentTech.completeAddress}</p>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-semibold">Phone:</span> {currentTech.mobileNumber} | <span className="font-semibold">Tech ID:</span> {currentTech.id}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">INVOICE NUMBER</span>
                <span className="font-mono text-sm font-bold text-slate-900">{ticket.id}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <div><span className="font-semibold">Date:</span> {ticket.createdAt}</div>
                <div><span className="font-semibold">Delivered:</span> {ticket.deliveredAt || ticket.estimatedDelivery}</div>
              </div>
            </div>
          </div>

          {/* Customer & Device Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CUSTOMER DETAILS
              </span>
              <div className="font-bold text-sm text-slate-900">{ticket.customerName}</div>
              <div className="text-xs text-slate-600">{ticket.customerMobile}</div>
              <div className="text-xs text-slate-500 mt-0.5">{ticket.customerAddress}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                DEVICE & DIAGNOSTIC
              </span>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-600" />
                {ticket.deviceBrand} {ticket.deviceModel} ({ticket.deviceColor})
              </div>
              <div className="text-xs font-mono text-slate-700 mt-0.5">
                <span className="text-slate-500 font-sans font-medium">IMEI/Serial:</span> {ticket.imeiSerialNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1 italic">
                "{ticket.problemDescription}"
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-left">
                    <div className="flex items-center justify-between">
                      <span>Description / Service</span>
                      <button
                        type="button"
                        onClick={() => setShowEditPartsModal(true)}
                        className="print:hidden text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                        title="Edit Parts & Labour Charges"
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        <span>Edit Parts & Labour</span>
                      </button>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ticket.partsUsed && ticket.partsUsed.length > 0 && (
                  <tr>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">Replacement Components & Hardware</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        {ticket.partsUsed.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                      {formatINR(ticket.partsCost)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">Precision Labor & Bench Diagnostic</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {ticket.repairDetailsNotes || 'Level 3/4 Micro-soldering, diagnostic and TrueTone testing'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                    {formatINR(ticket.laborCharges)}
                  </td>
                </tr>

                {ticket.discount > 0 && (
                  <tr className="text-emerald-700">
                    <td className="py-2.5 px-3 font-medium">Special Discount Applied</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      -{formatINR(ticket.discount)}
                    </td>
                  </tr>
                )}

                {ticket.taxAmount !== undefined && ticket.taxAmount > 0 && (
                  <tr className="text-slate-700">
                    <td className="py-2.5 px-3 font-medium">
                      <span>GST / Service Tax ({ticket.taxRate || 18}%)</span>
                      <span className="text-[10px] text-slate-500 block font-normal">
                        CGST ({((ticket.taxRate || 18) / 2).toFixed(1)}%) + SGST ({((ticket.taxRate || 18) / 2).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                      +{formatINR(ticket.taxAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200 font-bold">
                <tr>
                  <td className="py-3 px-3 text-right uppercase text-[11px] text-slate-600">
                    Total Payable Amount:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-base text-slate-950 font-bold">
                    {formatINR(ticket.totalCharges)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment & Warranty Footnotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 mb-1">
                <CheckCircle className="w-4 h-4 text-sky-600" />
                Payment Received
              </div>
              <div className="text-xs text-sky-800 font-medium">
                Status: <span className="font-bold uppercase">{ticket.paymentStatus}</span> ({ticket.paymentMode})
              </div>
              <div className="text-[11px] text-sky-700/80 mt-1">
                Thank you for prompt settlement. Digital tax receipt generated.
              </div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                {ticket.warrantyPeriodDays} Days Workshop Guarantee
              </div>
              <div className="text-xs text-amber-900">
                Valid Until: <span className="font-bold font-mono">{ticket.warrantyExpiryDate}</span>
              </div>
              <div className="text-[11px] text-amber-800/80 mt-1">
                {ticket.warrantyTerms}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-medium">Customer Signature: __________________</p>
            </div>
            <div className="text-right">
              <div className="font-heading font-bold text-slate-800 text-sm">{currentTech.fullName}</div>
              <p className="text-[11px]">Authorized Workshop Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Parts & Labour Modal */}
      <EditPartsAndLaborModal
        ticket={ticket}
        isOpen={showEditPartsModal}
        onClose={() => setShowEditPartsModal(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { 
  IndianRupee, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Printer, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Wrench,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RepairTicket } from '../../types';
import { EditPartsAndLaborModal } from './EditPartsAndLaborModal';

export const PaymentsView: React.FC = () => {
  const { tickets, currentTech, formatINR, setActiveInvoiceTicket, updateTicketPayment, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPartsTicket, setEditingPartsTicket] = useState<RepairTicket | null>(null);

  const myTickets = tickets.filter(t => t.technicianId === currentTech.id);

  const totalPaid = myTickets
    .filter(t => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.totalCharges, 0);

  const totalPending = myTickets
    .filter(t => t.paymentStatus === 'pending')
    .reduce((sum, t) => sum + t.totalCharges, 0);

  const upiCount = myTickets.filter(t => t.paymentMode === 'UPI').length;
  const cashCount = myTickets.filter(t => t.paymentMode === 'Cash').length;
  const cardCount = myTickets.filter(t => t.paymentMode === 'Card').length;

  const handleMarkAsPaid = (ticketId: string) => {
    const targetTicket = myTickets.find(t => t.id === ticketId);
    updateTicketPayment(ticketId, 'paid', targetTicket ? targetTicket.paymentMode : 'Cash');
  };

  const filteredTickets = myTickets.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Payments, Counter Cashflow & Invoicing
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time settlement tracking across Counter Cash, POS Card & Direct Bank Transfers
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Realized Revenue
            </span>
            <span className="font-heading font-bold text-2xl text-slate-900 mt-1 block font-mono">
              {formatINR(totalPaid)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Settled via Counter & Bank</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Counter Dues
            </span>
            <span className="font-heading font-bold text-2xl text-amber-600 mt-1 block font-mono">
              {formatINR(totalPending)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Awaiting customer collection
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Payment Mode Distribution
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>Bank Transfer (NEFT / IMPS)</span>
              </span>
              <span className="font-bold text-slate-900">{upiCount} orders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash Counter</span>
              </span>
              <span className="font-bold text-slate-900">{cashCount} orders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>Card / POS</span>
              </span>
              <span className="font-bold text-slate-900">{cardCount} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Payment Invoices & Receipts
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="input-search-payments"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice or customer..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket / Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Parts + Labor</th>
                <th className="py-3 px-4">Net Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">
                    {ticket.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{ticket.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{ticket.customerMobile}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                      {ticket.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>₹{ticket.partsCost} + ₹{ticket.laborCharges}</span>
                      <button
                        type="button"
                        data-testid={`btn-edit-parts-payment-${ticket.id}`}
                        onClick={() => setEditingPartsTicket(ticket)}
                        className="p-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-800 transition-colors"
                        title="Edit Parts & Labour Charges"
                      >
                        <Wrench className="w-3 h-3 text-amber-700" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {formatINR(ticket.totalCharges)}
                  </td>
                  <td className="py-3 px-4">
                    {ticket.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsPaid(ticket.id)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 transition-colors cursor-pointer"
                        title="Click to mark as paid"
                      >
                        Pending • Click to Settle
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      data-testid={`btn-print-tax-invoice-${ticket.id}`}
                      onClick={() => setActiveInvoiceTicket(ticket)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <IndianRupee className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-heading font-bold text-sm text-slate-900">
                          {myTickets.length === 0 ? 'Zero Payment Records • Fresh Account' : 'No Payments Match Filter'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {myTickets.length === 0
                            ? 'Completed repair tickets and counter sales will show up here to record UPI/Cash settlement and print tax invoices.'
                            : `No payments found matching "${searchQuery}".`}
                        </div>
                      </div>
                      {myTickets.length === 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('new_repair')}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Log Repair Job</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Parts & Labour Modal */}
      <EditPartsAndLaborModal
        ticket={editingPartsTicket}
        isOpen={!!editingPartsTicket}
        onClose={() => setEditingPartsTicket(null)}
      />
    </div>
  );
};

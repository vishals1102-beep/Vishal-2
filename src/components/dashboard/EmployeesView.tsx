import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Boxes, 
  ShoppingBag, 
  ArrowRightLeft, 
  Clock, 
  Edit3, 
  Trash2, 
  Share2, 
  MessageSquare, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export const EmployeesView: React.FC = () => {
  const { 
    currentTech, 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    activeStaff, 
    switchStaffPersona, 
    partDebitSales, 
    formatINR, 
    setActiveTab, 
    userRole 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [pinPromptEmp, setPinPromptEmp] = useState<Employee | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    roleTitle: 'Counter Sales & Parts Dispatch',
    pin: '1234',
    status: 'active' as 'active' | 'inactive'
  });

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      mobileNumber: '+91 ',
      roleTitle: 'Counter Sales & Parts Dispatch',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'active'
    });
    setEditingEmp(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      fullName: emp.fullName,
      mobileNumber: emp.mobileNumber,
      roleTitle: emp.roleTitle,
      pin: emp.pin,
      status: emp.status
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        roleTitle: formData.roleTitle.trim(),
        pin: formData.pin.trim() || '1111',
        status: formData.status
      });
      setStatusMessage({ text: `Employee "${formData.fullName}" updated successfully.`, type: 'success' });
    } else {
      addEmployee({
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        roleTitle: formData.roleTitle.trim(),
        pin: formData.pin.trim() || '1111',
        status: formData.status
      });
      setStatusMessage({ text: `New employee "${formData.fullName}" added to workshop team.`, type: 'success' });
    }
    setShowAddModal(false);
  };

  const handleQuickSwitch = (emp: Employee) => {
    // If PIN is set, prompt or switch directly if pin matches
    const res = switchStaffPersona('employee', emp.id, emp.pin);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleSwitchToOwner = () => {
    const res = switchStaffPersona('owner');
    setStatusMessage({ text: res.message, type: 'success' });
  };

  const shareSaleSlipOnWhatsApp = (sale: typeof partDebitSales[0]) => {
    const text = `🧾 *QUICK FIX SPARES SALE SLIP*\n` +
      `🏪 *Shop:* ${currentTech.shopName}\n` +
      `👤 *Staff / Debited By:* ${sale.debitedByName} (${sale.debitedByRole === 'employee' ? 'Staff' : 'Owner'})\n` +
      `📅 *Date:* ${sale.timestamp}\n` +
      `─────────────────────────\n` +
      `🔧 *Item Sold:* ${sale.partName}\n` +
      `🔖 *SKU:* ${sale.sku}\n` +
      `📦 *Quantity Debited:* ${sale.quantityDebited} unit(s)\n` +
      `💵 *Unit Price:* ₹${sale.unitSellingPrice.toLocaleString('en-IN')}\n` +
      `💰 *Total Sale:* ₹${sale.totalAmount.toLocaleString('en-IN')}\n` +
      `💳 *Payment Mode:* ${sale.paymentMode}\n` +
      `👤 *Customer:* ${sale.customerName || 'Walk-in'} ${sale.customerPhone ? '(' + sale.customerPhone + ')' : ''}\n` +
      `─────────────────────────\n` +
      `✅ *Parts inventory updated & debited from stock.*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">
                Workshop Staff & Employee Permissions
              </h1>
              <p className="text-xs text-slate-500">
                Manage your 2 workshop employees. Staff can only debit parts upon sale, while price and quantity editing remain strictly restricted to the main user (owner).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="btn-add-employee"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-heading rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700 text-sm ml-2">✕</button>
        </div>
      )}

      {/* Current Active Operating Mode Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        activeStaff.type === 'employee' 
          ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
          : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              activeStaff.type === 'employee' 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}>
              {activeStaff.type === 'employee' ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  Current Operating Mode
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeStaff.type === 'employee' 
                    ? 'bg-amber-200 text-amber-900' 
                    : 'bg-indigo-200 text-indigo-900'
                }`}>
                  {activeStaff.type === 'employee' ? 'Staff Limited Mode' : 'Owner Super Authority'}
                </span>
              </div>

              <div className="font-heading font-bold text-base text-slate-900 mt-0.5">
                {activeStaff.type === 'employee' ? (
                  <span>Operating as Staff: <span className="text-amber-800">{activeStaff.employee.fullName}</span> ({activeStaff.employee.roleTitle})</span>
                ) : (
                  <span>Operating as Main User: <span className="text-indigo-800">{userRole === 'admin' ? 'Vishal Sharma' : currentTech.fullName}</span> (Workshop Owner)</span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-0.5">
                {activeStaff.type === 'employee' 
                  ? '🔒 Restriction active: Can only debit parts upon recording a customer sale. Selling prices and master stock quantities are locked.' 
                  : '🔓 Full access active: Can edit selling prices, modify stock quantities arbitrarily, add new parts, and manage employee accounts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeStaff.type === 'employee' ? (
              <button
                data-testid="btn-switch-to-owner"
                onClick={handleSwitchToOwner}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Switch to Main Owner</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-indigo-800 bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200">
                ✓ Full Admin Unlocked
              </span>
            )}

            <button
              onClick={() => setActiveTab('inventory')}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4 text-sky-600" />
              <span>Go to Inventory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Rule Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 font-heading font-bold text-xs uppercase tracking-wider mb-2">
            <Lock className="w-4 h-4" />
            <span>Employee Strict Restrictions (Enforced)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No editing selling prices</strong> (Price tags are read-only and locked).</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No manual stock adjustments</strong> (Cannot click + or - to alter inventory).</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No deleting spare parts</strong> or altering cost valuation.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Allowed to debit parts</strong> ONLY upon customer sale with real-time audit logging.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-heading font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Main User / Workshop Owner Authority</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Change selling and cost prices</strong> anytime on any spare part.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Add new spare parts & stock</strong> with custom SKUs and shelf bins.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Direct low stock 1-click reorder list</strong> with WhatsApp export.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Audit all employee part sales</strong> and daily debit transaction records.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Employees Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Registered Workshop Staff ({employees.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click "Switch Operator" to test or run in that staff member's view
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => {
            const isCurrentlyActive = activeStaff.type === 'employee' && activeStaff.employee.id === emp.id;
            return (
              <div 
                key={emp.id} 
                data-testid={`employee-card-${emp.id}`}
                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                  isCurrentlyActive 
                    ? 'border-amber-400 ring-2 ring-amber-200/80 bg-amber-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-heading font-bold text-sm ${
                      isCurrentlyActive 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-sm text-slate-900">
                          {emp.fullName}
                        </h3>
                        {isCurrentlyActive && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full border border-amber-200">
                            Active Operator
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-sky-700 font-semibold block">
                        {emp.roleTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {emp.mobileNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit Staff Member"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {employees.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove employee ${emp.fullName}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Employee Stats & PIN Security */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Sales Made</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{emp.totalSalesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Parts Debited</span>
                    <span className="font-bold text-sky-700 text-sm font-mono">{emp.totalPartsDebited} pcs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Staff PIN</span>
                    <span className="font-mono text-slate-700 font-bold">•••• ({emp.pin})</span>
                  </div>
                </div>

                {/* Permissions summary */}
                <div className="space-y-1 mb-4 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Authorized to sell & debit parts directly from inventory</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Price editing and arbitrary stock adjustments locked</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {isCurrentlyActive ? (
                    <button
                      onClick={handleSwitchToOwner}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Switch Back to Owner</span>
                    </button>
                  ) : (
                    <button
                      data-testid={`btn-switch-emp-${emp.id}`}
                      onClick={() => handleQuickSwitch(emp)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Switch Operator to {emp.fullName.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Parts Debit & Sales Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Employee Parts Sales & Debit Audit Log</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live tracking of all parts debited when sold to customers by workshop employees.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Debits Recorded: <strong className="text-slate-900">{partDebitSales.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Debited By</th>
                <th className="py-2.5 px-3">Spare Part Sold</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
                <th className="py-2.5 px-3">Customer / Mode</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partDebitSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {sale.timestamp}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-800 block">
                      {sale.debitedByName}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      sale.debitedByRole === 'employee' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {sale.debitedByRole === 'employee' ? 'Staff' : 'Owner'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">
                      {sale.partName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sale.sku}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold font-mono text-slate-900">
                    {sale.quantityDebited}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatINR(sale.unitSellingPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    {formatINR(sale.totalAmount)}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <span className="font-medium text-slate-800 block">
                      {sale.customerName || 'Walk-in'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      via {sale.paymentMode} {sale.saleRemarks ? `• ${sale.saleRemarks}` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => shareSaleSlipOnWhatsApp(sale)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 mx-auto transition-colors"
                      title="Share Sale Receipt on WhatsApp"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
              {partDebitSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No part debits recorded yet. When staff or owners record a sale from Inventory, it automatically logs here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-heading font-bold text-base">
                    {editingEmp ? 'Edit Employee Details' : 'Add Workshop Employee'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Employee will have sales debit rights without price/quantity editing privileges
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Role / Designation</label>
                <select
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                >
                  <option value="Counter Sales & Parts Dispatch">Counter Sales & Parts Dispatch</option>
                  <option value="Junior Hardware Tech & Sales">Junior Hardware Tech & Sales</option>
                  <option value="Service Technician & Sales">Service Technician & Sales</option>
                  <option value="Store Assistant & Front Desk">Store Assistant & Front Desk</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">4-Digit Security Switch PIN *</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                  placeholder="e.g. 1234"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono tracking-widest text-center focus:bg-white focus:border-sky-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Staff can use this 4-digit PIN to switch into their profile.
                </span>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Automatic Role Restrictions:
                </span>
                <p>
                  This employee can debit parts only when recording a customer sale. They will not be able to edit prices or manually adjust inventory stock numbers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingEmp ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

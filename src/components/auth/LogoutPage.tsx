import React from 'react';
import { 
  LogOut, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Home, 
  UserCheck, 
  Lock,
  Smartphone,
  Mail,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LogoutPage: React.FC = () => {
  const { setActiveTab, currentTech, adminUser } = useApp();

  const logoutTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logoutDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      {/* Main Logout Confirmation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="bg-slate-900 text-white p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Session Closed Securely
          </span>

          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            You Have Logged Out
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Your workshop session has been terminated and access tokens have been safely invalidated.
          </p>
        </div>

        {/* Details & Audit Information */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Security Checklist */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Security Audit Log</span>
              <span className="text-slate-400 font-normal lowercase">{logoutDate}, {logoutTime}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Local repair cache secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active 2FA session revoked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer IMEI data protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safe to close browser window</span>
              </div>
            </div>
          </div>

          {/* Quick Re-authentication Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Continue Working
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                data-testid="btn-relogin-tech"
                onClick={() => setActiveTab('login')}
                className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-50 hover:border-sky-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-heading font-bold text-sm text-slate-900">
                  Technician Login
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in using Mobile ID, PIN, or Gmail OTP verification
                </p>
              </button>

              <button
                data-testid="btn-relogin-admin"
                onClick={() => setActiveTab('login')}
                className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-900 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-heading font-bold text-sm text-slate-900">
                  Super Admin Portal
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vishal Sharma accreditation desk (+91 95413 71468)
                </p>
              </button>
            </div>

            <button
              data-testid="btn-return-home"
              onClick={() => setActiveTab('landing')}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Back to Public Directory & B2B Hub</span>
            </button>
          </div>

          {/* Workbench Safety Tip */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Shared Terminal Tip:</span> If you are operating on a shared workshop bench computer or multi-technician station, remember to clear browser history or use private browsing mode.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

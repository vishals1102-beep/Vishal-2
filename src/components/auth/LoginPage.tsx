import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Smartphone, 
  ArrowRight, 
  Sparkles,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  User,
  Eye,
  EyeOff,
  Mail,
  Send,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { 
    loginWithCredentials, 
    loginAsDemo, 
    setActiveTab, 
    generateAdminOtp, 
    verifyAdminOtp,
    validateAdminCredentials,
    generateGmailOtp,
    verifyGmailOtp,
    gmailActiveOtp,
    choosePassword,
    technicianPassword
  } = useApp();
  
  const [roleTab, setRoleTab] = useState<UserRole>('technician');

  // Technician Authentication Method: 'password' | 'choose_password' | 'gmail_otp'
  const [techAuthMode, setTechAuthMode] = useState<'password' | 'choose_password' | 'gmail_otp'>('password');
  const [identifier, setIdentifier] = useState('rajesh.fix@quickfixelectronics.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Choose Password on Login State
  const [chooseIdentifier, setChooseIdentifier] = useState('rajesh.fix@quickfixelectronics.in');
  const [chooseNewPassword, setChooseNewPassword] = useState('');
  const [chooseConfirmPassword, setChooseConfirmPassword] = useState('');
  const [showChooseNewPassword, setShowChooseNewPassword] = useState(false);
  const [showChooseConfirmPassword, setShowChooseConfirmPassword] = useState(false);

  // Universal Gmail OTP state
  const [gmailAddress, setGmailAddress] = useState('rajesh.fix@quickfixelectronics.in');
  const [enteredGmailOtp, setEnteredGmailOtp] = useState('');
  const [gmailOtpSent, setGmailOtpSent] = useState(false);
  const [liveGmailOtpCode, setLiveGmailOtpCode] = useState<string | null>(null);
  const [gmailCountdown, setGmailCountdown] = useState(0);

  // Super Admin Vishal Sharma State
  const [adminUsername, setAdminUsername] = useState('vishal sharma');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminMobile, setAdminMobile] = useState('9541371468');
  const [admin2FaMode, setAdmin2FaMode] = useState<'sms' | 'gmail'>('sms');
  const [adminOtp, setAdminOtp] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [generatedOtpDisplay, setGeneratedOtpDisplay] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gmailCountdown > 0) {
      timer = setTimeout(() => setGmailCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [gmailCountdown]);

  // Standard Technician Login
  const handleTechPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!identifier.trim()) {
      setError('Please enter your mobile number, email, or Technician ID');
      return;
    }
    const success = loginWithCredentials('technician', identifier, password);
    if (!success) {
      setError('Invalid credentials. You can use any of the quick passwords below (e.g. workshop123), choose a new password, or switch to Gmail OTP.');
    }
  };

  // Technician Choose Password Handler
  const handleTechChoosePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!chooseIdentifier.trim()) {
      setError('Please enter your mobile number, email, or Technician ID.');
      return;
    }
    if (!chooseNewPassword || chooseNewPassword.length < 4) {
      setError('Please choose a password with at least 4 characters.');
      return;
    }
    if (chooseNewPassword !== chooseConfirmPassword) {
      setError('Passwords do not match. Please ensure both password fields are identical.');
      return;
    }

    const res = choosePassword('technician', chooseIdentifier, chooseNewPassword);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setSuccessMsg(res.message);
  };

  // Technician Gmail OTP Generation
  const handleSendTechGmailOtp = (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = customEmail || gmailAddress;
    const res = generateGmailOtp(targetEmail, 'technician');
    if (!res.success) {
      setError(res.message);
      return;
    }

    setGmailOtpSent(true);
    setLiveGmailOtpCode(res.otp || '954137');
    setGmailCountdown(60);
    setSuccessMsg(`Security OTP successfully dispatched to ${targetEmail}`);
  };

  // Technician Gmail OTP Verification
  const handleVerifyTechGmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!enteredGmailOtp.trim() || enteredGmailOtp.trim().length < 6) {
      setError('Please enter the full 6-digit OTP code sent to your Gmail.');
      return;
    }

    const res = verifyGmailOtp(gmailAddress, enteredGmailOtp, 'technician');
    if (!res.success) {
      setError(res.message);
      return;
    }
  };

  // Super Admin Credentials Validation & OTP Dispatch
  const handleGenerateAdminOtp = (e?: React.FormEvent, customUser?: string, customPass?: string, customMob?: string) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetUser = customUser !== undefined ? customUser : adminUsername;
    const targetPass = customPass !== undefined ? customPass : adminPassword;
    const targetMob = customMob !== undefined ? customMob : adminMobile;

    const validation = validateAdminCredentials(targetUser, targetPass, targetMob);
    if (!validation.success) {
      setError(validation.message);
      return;
    }

    if (admin2FaMode === 'gmail') {
      const res = generateGmailOtp('vishals1102@gmail.com', 'admin');
      if (!res.success) {
        setError(res.message);
        return;
      }
      setOtpGenerated(true);
      setGeneratedOtpDisplay(res.otp || '954137');
      setCountdown(60);
      setSuccessMsg(`Credentials verified! Gmail OTP sent to authorized email vishals1102@gmail.com`);
    } else {
      const res = generateAdminOtp(targetMob, targetUser, targetPass);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setOtpGenerated(true);
      setGeneratedOtpDisplay(res.otp || '954137');
      setCountdown(60);
      setSuccessMsg(`Credentials verified! SMS OTP dispatched to Super Admin Vishal Sharma (+91 ${targetMob.replace(/[^0-9]/g, '').slice(-10)})`);
    }
  };

  // Super Admin OTP Verification
  const handleVerifyAdminOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminOtp.trim() || adminOtp.trim().length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (admin2FaMode === 'gmail') {
      const res = verifyGmailOtp('vishals1102@gmail.com', adminOtp, 'admin');
      if (!res.success) {
        setError(res.message);
        return;
      }
    } else {
      const res = verifyAdminOtp(adminMobile, adminOtp);
      if (!res.success) {
        setError(res.message);
        return;
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setActiveTab('landing')}
            className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-600/30">
              <Wrench className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-xl text-white">Workshop Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Secure Operations, Parts Warranty & Accreditation Hub
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Role Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              data-testid="tab-login-technician"
              onClick={() => { 
                setRoleTab('technician'); 
                setError(''); 
                setSuccessMsg(''); 
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                roleTab === 'technician'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Technician Login
            </button>
            <button
              data-testid="tab-login-admin"
              onClick={() => { 
                setRoleTab('admin'); 
                setError(''); 
                setSuccessMsg(''); 
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                roleTab === 'admin'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Vishal Sharma</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: TECHNICIAN LOGIN (PASSWORD OR GMAIL OTP) */}
          {/* ========================================================= */}
          {roleTab === 'technician' && (
            <div className="space-y-4">
              {/* Technician Sub-mode Switcher */}
              <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl text-xs gap-1">
                <button
                  type="button"
                  data-testid="btn-switch-tech-password"
                  onClick={() => { setTechAuthMode('password'); setError(''); }}
                  className={`py-1.5 font-bold rounded-lg transition-all text-center ${
                    techAuthMode === 'password'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  data-testid="btn-switch-tech-choose-password"
                  onClick={() => { setTechAuthMode('choose_password'); setError(''); }}
                  className={`py-1.5 font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                    techAuthMode === 'choose_password'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/50'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Choose Password</span>
                </button>
                <button
                  type="button"
                  data-testid="btn-switch-tech-gmail"
                  onClick={() => { setTechAuthMode('gmail_otp'); setError(''); }}
                  className={`py-1.5 font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                    techAuthMode === 'gmail_otp'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail OTP</span>
                </button>
              </div>

              {/* Sub-mode A: Mobile ID & Password */}
              {techAuthMode === 'password' && (
                <form onSubmit={handleTechPasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number / Tech ID / Email
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-login-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. +91 98201 44521 or rajesh.fix@quickfixelectronics.in"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password or Workshop PIN
                      </label>
                      <button
                        type="button"
                        data-testid="btn-forgot-choose-password"
                        onClick={() => { setTechAuthMode('choose_password'); setError(''); }}
                        className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Choose / Set New Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Quick Choose Password Presets */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                      <span className="text-slate-400 font-medium">Quick fill:</span>
                      <button
                        type="button"
                        onClick={() => setPassword(technicianPassword || 'workshop123')}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-mono transition-colors border border-slate-200/60"
                        title="Active Workshop Password"
                      >
                        {technicianPassword ? `${technicianPassword} (Active)` : 'workshop123'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassword('123456')}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-mono transition-colors border border-slate-200/60"
                      >
                        123456
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassword('rajesh123')}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-mono transition-colors border border-slate-200/60"
                      >
                        rajesh123
                      </button>
                    </div>
                  </div>

                  <button
                    data-testid="btn-submit-login"
                    type="submit"
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-heading font-bold rounded-xl shadow-md shadow-sky-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Authenticate & Enter Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Sub-mode B: Choose / Set New Password Directly on Login Page */}
              {techAuthMode === 'choose_password' && (
                <form onSubmit={handleTechChoosePassword} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Choose / Set Your Workbench Password</span>
                      <span className="text-amber-800 text-[11px]">
                        Choose a custom password for QuickFix workshop access. You can sign in immediately with this chosen password.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Registered Mobile / Email / Tech ID
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-choose-identifier"
                        type="text"
                        required
                        value={chooseIdentifier}
                        onChange={(e) => setChooseIdentifier(e.target.value)}
                        placeholder="e.g. +91 98201 44521 or rajesh.fix@quickfixelectronics.in"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Choose New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-choose-new-password"
                        type={showChooseNewPassword ? 'text' : 'password'}
                        required
                        value={chooseNewPassword}
                        onChange={(e) => setChooseNewPassword(e.target.value)}
                        placeholder="Choose at least 4 characters (e.g. shop@2026)"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowChooseNewPassword(!showChooseNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showChooseNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showChooseNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {chooseNewPassword && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              chooseNewPassword.length < 4 
                                ? 'w-1/4 bg-rose-500' 
                                : chooseNewPassword.length < 8 
                                  ? 'w-2/4 bg-amber-500' 
                                  : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          chooseNewPassword.length < 4 
                            ? 'text-rose-600' 
                            : chooseNewPassword.length < 8 
                              ? 'text-amber-600' 
                              : 'text-emerald-600'
                        }`}>
                          {chooseNewPassword.length < 4 ? 'Too Short' : chooseNewPassword.length < 8 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Chosen Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-choose-confirm-password"
                        type={showChooseConfirmPassword ? 'text' : 'password'}
                        required
                        value={chooseConfirmPassword}
                        onChange={(e) => setChooseConfirmPassword(e.target.value)}
                        placeholder="Re-type your chosen password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowChooseConfirmPassword(!showChooseConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showChooseConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showChooseConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {chooseConfirmPassword && (
                      <span className={`text-[11px] mt-1 block font-medium ${
                        chooseNewPassword === chooseConfirmPassword ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {chooseNewPassword === chooseConfirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </span>
                    )}
                  </div>

                  <button
                    data-testid="btn-submit-choose-password"
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-heading font-bold rounded-xl shadow-md shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Chosen Password & Enter Workbench</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTechAuthMode('password'); setError(''); }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 hover:underline pt-1"
                  >
                    ← Back to Standard Password Login
                  </button>
                </form>
              )}

              {/* Sub-mode B: Universal Gmail OTP Verification */}
              {techAuthMode === 'gmail_otp' && (
                <div className="space-y-4">
                  {/* Step 1: Request Gmail Code */}
                  {!gmailOtpSent ? (
                    <form onSubmit={(e) => handleSendTechGmailOtp(e)} className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Technician Gmail Address
                          </label>
                          <span className="text-[10px] text-sky-700 font-mono bg-sky-50 px-1.5 py-0.5 rounded">
                            Universal Gmail Auth
                          </span>
                        </div>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            data-testid="input-tech-gmail"
                            type="email"
                            required
                            value={gmailAddress}
                            onChange={(e) => setGmailAddress(e.target.value)}
                            placeholder="e.g. technician@gmail.com"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Quick Gmail presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">Quick fill:</span>
                        <button
                          type="button"
                          onClick={() => setGmailAddress('rajesh.fix@quickfixelectronics.in')}
                          className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700"
                        >
                          rajesh.fix@quickfix...
                        </button>
                        <button
                          type="button"
                          onClick={() => setGmailAddress('amit.patel@quickfixelectronics.in')}
                          className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700"
                        >
                          amit.patel@quickfix...
                        </button>
                      </div>

                      <button
                        data-testid="btn-send-gmail-otp"
                        type="submit"
                        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-heading font-bold rounded-xl shadow-md shadow-sky-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send 6-Digit Gmail OTP</span>
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Live Gmail Simulator & Enter Code */
                    <div className="space-y-4">
                      {/* Live Gmail Inbox Simulator Banner */}
                      {liveGmailOtpCode && (
                        <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-sky-400">
                              <Inbox className="w-3.5 h-3.5" /> Gmail Inbox ({gmailAddress})
                            </span>
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              NEW MESSAGE
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                            <div>
                              <span className="text-[11px] text-slate-300 block">Security Verification Code:</span>
                              <span className="font-mono text-lg font-extrabold text-amber-400 tracking-widest">
                                {liveGmailOtpCode}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEnteredGmailOtp(liveGmailOtpCode)}
                              className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold rounded-md transition-colors"
                            >
                              Autofill OTP
                            </button>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleVerifyTechGmailOtp} className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Enter 6-Digit Gmail Code
                            </label>
                            {gmailCountdown > 0 ? (
                              <span className="text-[11px] text-slate-500 font-mono">
                                Resend in {gmailCountdown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendTechGmailOtp()}
                                className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Resend Code
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              data-testid="input-tech-gmail-otp"
                              type="text"
                              maxLength={6}
                              value={enteredGmailOtp}
                              onChange={(e) => setEnteredGmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="e.g. 954137"
                              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-sky-200 rounded-xl text-center text-base font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 outline-none"
                            />
                          </div>
                        </div>

                        <button
                          data-testid="btn-verify-tech-gmail-otp"
                          type="submit"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify Gmail OTP & Enter Workbench</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGmailOtpSent(false);
                            setEnteredGmailOtp('');
                          }}
                          className="w-full text-center text-xs text-slate-500 hover:text-slate-800 hover:underline pt-1"
                        >
                          ← Change Gmail Address
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SUPER ADMIN VISHAL SHARMA LOGIN */}
          {/* ========================================================= */}
          {roleTab === 'admin' && (
            <div className="space-y-4">
              {/* Identity Header */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-xs text-indigo-950">Super Admin Vishal Sharma</span>
                    <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-1.5 py-0.5 rounded font-bold uppercase">KYC Authority</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-0.5 leading-snug">
                    Exclusive national accreditation desk. Login requires username <strong className="font-mono">vishal sharma</strong> and password, followed by 2FA verification via <strong className="font-mono">+91 95413 71468</strong> or <strong className="font-mono">vishals1102@gmail.com</strong>.
                  </p>
                </div>
              </div>

              {/* Step 1: Username & Password Entry */}
              {!otpGenerated ? (
                <form onSubmit={(e) => handleGenerateAdminOtp(e)} className="space-y-3.5">
                  {/* Admin Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Admin Username
                      </label>
                      <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        Authorized: vishal sharma
                      </span>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-admin-username"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="vishal sharma"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Admin Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Admin Password
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Confidential Security Key
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        data-testid="input-admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 2FA Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select 2FA Verification Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdmin2FaMode('sms')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          admin2FaMode === 'sms'
                            ? 'bg-indigo-900 text-white border-indigo-950 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS (+91 95413 71468)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdmin2FaMode('gmail')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          admin2FaMode === 'gmail'
                            ? 'bg-indigo-900 text-white border-indigo-950 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Gmail OTP</span>
                      </button>
                    </div>
                  </div>

                  {/* Destination info */}
                  {admin2FaMode === 'sms' ? (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>SMS Gateway: <strong className="font-mono text-slate-900">+91 95413 71468</strong></span>
                      <span className="text-emerald-700 font-bold">Authorized Mobile</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>Admin Gmail: <strong className="font-mono text-slate-900">vishals1102@gmail.com</strong></span>
                      <span className="text-emerald-700 font-bold">Authorized Email</span>
                    </div>
                  )}

                  {/* Verify credentials & Dispatch OTP */}
                  <button
                    data-testid="btn-generate-admin-otp"
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-heading font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Credentials & Dispatch 2FA Code</span>
                  </button>
                </form>
              ) : (
                /* Step 2: Live Code & OTP Verification */
                <div className="space-y-4">
                  {/* Simulated Live Gateway Notification Banner */}
                  {generatedOtpDisplay && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          {admin2FaMode === 'gmail' ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                          {admin2FaMode === 'gmail' ? 'Gmail Inbox (vishals1102@gmail.com)' : `SMS Gateway (+91 ${adminMobile})`}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          LIVE 2FA CODE
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <div>
                          <span className="text-[11px] text-slate-300 block">Super Admin Passcode:</span>
                          <span className="font-mono text-lg font-extrabold text-amber-400 tracking-widest">
                            {generatedOtpDisplay}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminOtp(generatedOtpDisplay)}
                          className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold rounded-md shadow-xs transition-colors"
                        >
                          Autofill OTP
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleVerifyAdminOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Enter 6-Digit Verification OTP
                        </label>
                        {countdown > 0 ? (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Resend in {countdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateAdminOtp()}
                            className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Resend OTP
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          data-testid="input-admin-otp"
                          type="text"
                          maxLength={6}
                          value={adminOtp}
                          onChange={(e) => setAdminOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 954137"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-indigo-200 rounded-xl text-center text-base font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      data-testid="btn-verify-admin-otp"
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify OTP & Enter Super Admin Console</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpGenerated(false);
                        setAdminOtp('');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 hover:underline pt-1"
                    >
                      ← Change Credentials or Verification Channel
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUICK 1-CLICK DEMO PROFILES */}
          {/* ========================================================= */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Reviewer 1-Click Access</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                data-testid="btn-login-demo-verified"
                type="button"
                onClick={() => loginAsDemo('verified_tech')}
                className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                    Rajesh Sharma (Verified Workshop)
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    QF-TECH-4821 • rajesh.fix@quickfixelectronics.in
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                  Login
                </span>
              </button>

              <button
                data-testid="btn-login-demo-admin"
                type="button"
                onClick={() => {
                  setRoleTab('admin');
                  setAdminUsername('vishal sharma');
                  setAdminPassword('Vishals1102');
                  setAdminMobile('9541371468');
                  setAdmin2FaMode('sms');
                  handleGenerateAdminOtp(undefined, 'vishal sharma', 'Vishals1102', '9541371468');
                }}
                className="w-full text-left p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-indigo-950 flex items-center gap-1">
                    Super Admin Vishal Sharma (Secure 2FA)
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline" />
                  </div>
                  <div className="text-[11px] text-indigo-800">
                    User: vishal sharma • 2FA Mobile: +91 95413 71468
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded">
                  Admin Sign In
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an onboarded workshop? </span>
            <button
              onClick={() => setActiveTab('register')}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Start 4-Step Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

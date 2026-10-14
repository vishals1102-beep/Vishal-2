import React, { useState } from 'react';
import { 
  Wrench, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  ShieldCheck, 
  Building2, 
  Phone, 
  FileText, 
  Camera, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RegisterWizard: React.FC = () => {
  const { registerTechnician, choosePassword, setActiveTab } = useApp();

  const [step, setStep] = useState(1);
  const [createdTechId, setCreatedTechId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('workshop123');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Technician Basics
    fullName: '',
    mobileNumber: '+91 ',
    whatsappNumber: '+91 ',
    email: '',
    password: 'workshop123',
    about: '',

    // Step 2: Shop & Location
    shopName: '',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    shopAddress: '',
    completeAddress: '',
    workingHours: '10:00 AM - 08:30 PM (Mon - Sat)',

    // Step 3: Skills & Tooling
    experienceYears: 5,
    brandsWorkedOn: ['Apple iPhone', 'Samsung', 'Xiaomi / Redmi', 'OnePlus'],
    servicesProvided: ['Screen Replacement (OLED/LCD)', 'Battery Replacement', 'Motherboard Micro-Soldering'],
    availableTools: ['SMD Rework Station', 'Digital Microscope 4K', 'DC Power Supply (30V 5A)'],

    // Step 4: KYC Verification & Docs
    technicianPhoto: 'https://images.pexels.com/photos/9242280/pexels-photo-9242280.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    shopPhoto: 'https://images.pexels.com/photos/6755053/pexels-photo-6755053.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    idDocumentType: 'Aadhaar Card' as 'Aadhaar Card' | 'PAN Card' | 'Trade License' | 'GST Certificate',
    idDocumentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    termsAgreed: true,
    privacyConsent: true
  });

  const statesPreset = [
    'Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
    'Uttar Pradesh', 'West Bengal', 'Telangana', 'Kerala', 'Rajasthan', 
    'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Andhra Pradesh', 'Odisha'
  ];

  const brandOptions = [
    'Apple iPhone', 'Samsung', 'Xiaomi / Redmi', 'OnePlus', 'Vivo', 
    'Oppo', 'Realme', 'Google Pixel', 'Motorola', 'Nothing', 'Infinix / Tecno', 'Poco'
  ];

  const servicesOptions = [
    'Screen Replacement (OLED/LCD)', 'Battery Replacement', 'Motherboard Micro-Soldering', 
    'Water Damage Recovery', 'Charging Port / Flex IC', 'Face ID / Fingerprint Repair', 
    'Back Glass Laser Removal', 'Software / Flashing / FRP', 'Audio / Speaker IC', 'Network / Baseband Repair'
  ];

  const toolsOptions = [
    'SMD Rework Station', 'Digital Microscope 4K', 'Laser Back Glass Machine', 
    'OLED Screen Separator & Laminator', 'DC Power Supply (30V 5A)', 'Fluke / Precision Multimeter', 
    'Thermal Imaging Camera', 'Battery Health Activator', 'iFixit Pro Tool Kit', 'Programmer (JCID / QianLi)'
  ];

  const toggleArrayItem = (field: 'brandsWorkedOn' | 'servicesProvided' | 'availableTools', item: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Complete Registration
      const completeAddr = formData.completeAddress || `${formData.shopAddress}, ${formData.city}, ${formData.state}`;
      const newTech = registerTechnician({
        fullName: formData.fullName || 'Deepak Mehta',
        mobileNumber: formData.mobileNumber || '+91 98332 11980',
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber || '+91 98332 11980',
        email: formData.email || 'deepak.mehta@repairhub.in',
        about: formData.about || 'Specialized in micro-soldering and smartphone repairs.',
        shopName: formData.shopName || 'Mehta Electronics & Care',
        state: formData.state,
        district: formData.district || formData.city,
        city: formData.city || 'Mumbai',
        shopAddress: formData.shopAddress || 'Shop #4, Station Road',
        completeAddress: completeAddr,
        workingHours: formData.workingHours,
        experienceYears: Number(formData.experienceYears) || 5,
        brandsWorkedOn: formData.brandsWorkedOn,
        servicesProvided: formData.servicesProvided,
        availableTools: formData.availableTools,
        technicianPhoto: formData.technicianPhoto,
        shopPhoto: formData.shopPhoto,
        idDocumentType: formData.idDocumentType,
        idDocumentUrl: formData.idDocumentUrl,
        verificationNotes: 'Newly submitted registration. Pending review by national verification officer.'
      });
      if (formData.password) {
        choosePassword('technician', newTech.id, formData.password);
      }
      setCreatedTechId(newTech.id);
    }
  };

  const fillQuickDemoData = () => {
    setFormData({
      fullName: 'Vikram Joshi',
      mobileNumber: '+91 98200 66554',
      whatsappNumber: '+91 98200 66554',
      email: 'vikram.joshi@joshitech.in',
      password: 'workshop123',
      about: 'Level 4 hardware technician with 8 years bench experience in iPhone and Samsung motherboard traces.',
      shopName: 'Joshi Digital Care & Spares',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      city: 'Bengaluru',
      shopAddress: '#24, SP Road Electronics Lane, Near Town Hall',
      completeAddress: '#24, SP Road Electronics Lane, Near Town Hall, Bengaluru 560002, Karnataka',
      workingHours: '10:30 AM - 08:30 PM (Mon - Sat)',
      experienceYears: 8,
      brandsWorkedOn: ['Apple iPhone', 'Samsung', 'Google Pixel', 'OnePlus', 'Nothing'],
      servicesProvided: [
        'Motherboard Micro-Soldering',
        'Screen Replacement (OLED/LCD)',
        'Water Damage Recovery',
        'Face ID / Fingerprint Repair'
      ],
      availableTools: [
        'SMD Rework Station',
        'Digital Microscope 4K',
        'Programmer (JCID / QianLi)',
        'Thermal Imaging Camera'
      ],
      technicianPhoto: 'https://images.pexels.com/photos/9242280/pexels-photo-9242280.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      shopPhoto: 'https://images.pexels.com/photos/6755053/pexels-photo-6755053.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      idDocumentType: 'Trade License',
      idDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      termsAgreed: true,
      privacyConsent: true
    });
  };

  if (createdTechId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Registration Submitted Successfully
            </span>
            <h2 className="font-heading font-bold text-2xl text-slate-900">
              Technician ID Allocated
            </h2>
            <div className="font-mono text-xl font-extrabold text-sky-700 bg-sky-50 py-2 rounded-xl border border-sky-200 max-w-xs mx-auto">
              {createdTechId}
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your workshop account has been created in <strong>Pending Verification</strong> status with <strong>Zero Inventory</strong>. You can now access your dashboard, add your genuine spares, and manage customer tickets.
            </p>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-medium max-w-md mx-auto">
              ✓ <strong>Zero Inventory Activated:</strong> Stock starts clean at 0 units so you can add your own shop parts without clutter.
            </div>
          </div>

          <div className="pt-2">
            <button
              data-testid="btn-go-dashboard-registered"
              onClick={() => setActiveTab('dashboard')}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-sm rounded-xl shadow-lg shadow-sky-600/20 transition-transform active:scale-95"
            >
              Enter Workshop Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Technician Basics' },
    { num: 2, title: 'Shop & Location' },
    { num: 3, title: 'Skills & Tooling' },
    { num: 4, title: 'KYC & Identification' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-sky-400" />
              <span className="font-heading font-bold text-lg text-white">
                Technician Workshop Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Join India's verified electronics service and parts-sharing registry
            </p>
          </div>

          <button
            type="button"
            onClick={fillQuickDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
            title="Auto-fill sample technician data"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-fill Sample Info</span>
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${step === s.num 
                    ? 'bg-sky-600 text-white ring-2 ring-sky-600/30' 
                    : (step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700')
                  }
                `}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`hidden sm:inline text-xs font-semibold ${step === s.num ? 'text-slate-900' : 'text-slate-500'}`}>
                  {s.title}
                </span>
                {idx < stepsList.length - 1 && (
                  <div className="hidden sm:block w-8 h-[2px] bg-slate-300 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Technician Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-heading font-bold text-base text-slate-900">Step 1: Technician Basics</h3>
                <p className="text-xs text-slate-500">Enter personal identity and communication details</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name of Head Technician *
                </label>
                <input
                  data-testid="input-full_name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (Calling) *
                  </label>
                  <input
                    data-testid="input-mobile_number"
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="+91 98201 XXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number (For Parts Deals) *
                  </label>
                  <input
                    data-testid="input-whatsapp_number"
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+91 98201 XXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email Address *
                </label>
                <input
                  data-testid="input-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tech@yourworkshop.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              {/* Choose Account Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Choose Password *
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">Min 4 chars</span>
                  </div>
                  <div className="relative">
                    <input
                      data-testid="input-register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Choose account password"
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-medium"
                      required
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Chosen Password *
                  </label>
                  <input
                    data-testid="input-register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type chosen password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none font-medium"
                    required
                  />
                  {confirmPassword && (
                    <span className={`text-[10px] mt-1 block font-semibold ${
                      formData.password === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {formData.password === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  About Technician & Bench Specialization
                </label>
                <textarea
                  data-testid="input-about_technician"
                  rows={3}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Briefly state your core repair experience, micro-soldering skill level, or specialization..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Shop & Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-heading font-bold text-base text-slate-900">Step 2: Workshop & Physical Location</h3>
                <p className="text-xs text-slate-500">Provide physical store address in India for customer walk-ins & verified directory</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Workshop / Shop Commercial Name *
                </label>
                <input
                  data-testid="input-shop_name"
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="e.g. Quick Fix Micro Lab & Spares"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <select
                    data-testid="select-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  >
                    {statesPreset.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District / Region *
                  </label>
                  <input
                    data-testid="input-district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Mumbai Suburban"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    data-testid="input-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Premise Address (Market, Floor, Shop #) *
                </label>
                <input
                  data-testid="input-shop_address"
                  type="text"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                  placeholder="e.g. Shop #14, Lamington Road Tech Plaza, Grant Road"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Working Hours & Days
                </label>
                <input
                  data-testid="input-working_hours"
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="10:00 AM - 08:30 PM (Mon - Sat)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Tooling */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-heading font-bold text-base text-slate-900">Step 3: Skills, Brands & Workshop Tooling</h3>
                <p className="text-xs text-slate-500">Select chips representing your bench equipment and device expertise</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Experience in Electronics Repair: <span className="text-sky-600 font-bold">{formData.experienceYears} Years</span>
                </label>
                <input
                  data-testid="input-experience_years"
                  type="range"
                  min="1"
                  max="25"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Brands Worked On */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Brands Serviced (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2">
                  {brandOptions.map(brand => {
                    const isSelected = formData.brandsWorkedOn.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleArrayItem('brandsWorkedOn', brand)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-sky-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services Provided */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Services Provided
                </label>
                <div className="flex flex-wrap gap-2">
                  {servicesOptions.map(svc => {
                    const isSelected = formData.servicesProvided.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleArrayItem('servicesProvided', svc)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{svc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Tools */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bench Tools & Equipment Owned
                </label>
                <div className="flex flex-wrap gap-2">
                  {toolsOptions.map(tool => {
                    const isSelected = formData.availableTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleArrayItem('availableTools', tool)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5
                          ${isSelected 
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{tool}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KYC Verification & Docs */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-heading font-bold text-base text-slate-900">Step 4: KYC Verification & Identification</h3>
                <p className="text-xs text-slate-500">Upload shop storefront and identity proof for administrative compliance</p>
              </div>

              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  KYC Verification Document Type *
                </label>
                <select
                  data-testid="select-id_document_type"
                  value={formData.idDocumentType}
                  onChange={(e) => setFormData({ ...formData, idDocumentType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card (Government of India)</option>
                  <option value="Trade License">Municipal Trade / Shop & Establishment License</option>
                  <option value="GST Certificate">GST Registration Certificate (GSTIN)</option>
                  <option value="PAN Card">Permanent Account Number (PAN Card)</option>
                </select>
              </div>

              {/* Photo Upload Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/70 text-center">
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    Technician Photo
                  </div>
                  <img 
                    src={formData.technicianPhoto} 
                    alt="Technician"
                    className="w-20 h-20 rounded-xl object-cover mx-auto mb-2 border border-slate-200 shadow-sm"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Photo Attached
                  </span>
                </div>

                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/70 text-center">
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    Shop Signboard / Bench Photo
                  </div>
                  <img 
                    src={formData.shopPhoto} 
                    alt="Workshop"
                    className="w-20 h-20 rounded-xl object-cover mx-auto mb-2 border border-slate-200 shadow-sm"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Storefront Attached
                  </span>
                </div>
              </div>

              {/* Agreement checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAgreed}
                    onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                    required
                  />
                  <span>
                    I agree to the <strong>Quick Fix Electronics Workshop Charter</strong>, warranting genuine spare parts disclosure and honoring promised warranty claims to consumers.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyConsent}
                    onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                    required
                  />
                  <span>
                    I acknowledge that customer IMEI numbers and contact records are confidential and subject to privacy data protection masking.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            )}

            <button
              data-testid={step === 4 ? 'btn-submit-registration' : 'btn-wizard-next'}
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>{step === 4 ? 'Submit Application & Generate Tech ID' : 'Continue to Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

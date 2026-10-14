import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Search, 
  Cpu, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Smartphone, 
  Users, 
  Award,
  Sparkles,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setActiveTab, technicians, tickets, formatINR, loginAsDemo } = useApp();
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [hasTracked, setHasTracked] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setHasTracked(true);
    const found = tickets.find(t => 
      t.id.toLowerCase() === trackQuery.toLowerCase().trim() ||
      t.imeiSerialNumber === trackQuery.trim()
    );
    setTrackResult(found || null);
  };

  const cities = ['All', 'Mumbai', 'Ahmedabad', 'Chennai', 'Bengaluru', 'Delhi NCR'];
  const filteredTechs = selectedCity === 'All' 
    ? technicians 
    : technicians.filter(t => t.city.toLowerCase().includes(selectedCity.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white border-b border-slate-800">
        {/* Background Workshop Image with rich scrim overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transform"
          style={{ 
            backgroundImage: `url('https://images.pexels.com/photos/6755053/pexels-photo-6755053.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-sky-950/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand & Positioning */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>India's Premier Electronics Workshop Operating System</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Precision Electronics Repair, <br />
              <span className="text-sky-400">Verified Technicians</span> & B2B Spares.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Equipping independent smartphone & electronics repair shops across India with workshop-grade job tracking, Aadhaar & Trade KYC verification, P2P parts sharing, and transparent customer warranties.
            </p>

            {/* Quick Demo Access Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                data-testid="btn-hero-register"
                onClick={() => setActiveTab('register')}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-sm shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Register Workshop</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                data-testid="btn-hero-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-heading font-bold text-sm shadow-lg shadow-sky-600/20 transition-transform active:scale-95 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Launch Workshop OS</span>
              </button>

              <button
                data-testid="btn-hero-demo-login"
                onClick={() => loginAsDemo('verified_tech')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Quick Demo (Rajesh Sharma)</span>
              </button>
            </div>

            {/* Micro Stats Row */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
              <div>
                <div className="font-heading font-bold text-2xl text-white">1,400+</div>
                <div className="text-xs text-slate-400">Verified Techs</div>
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-sky-400">85,000+</div>
                <div className="text-xs text-slate-400">Repairs Tracked</div>
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-amber-400">100%</div>
                <div className="text-xs text-slate-400">P2P Spares Escrow</div>
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-emerald-400">90-Day</div>
                <div className="text-xs text-slate-400">Warranty Standard</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Track Ticket & Fast Actions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Status Lookup Box */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">Track Repair Job Status</h3>
                  <p className="text-[11px] text-slate-400">Customers: Enter your Ticket ID or 15-digit IMEI</p>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-3">
                <div className="relative">
                  <input
                    data-testid="input-track-ticket"
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="e.g. QF-REP-202609-4109 or 358941092837461"
                    className="w-full bg-slate-900 text-xs font-mono text-white placeholder:text-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none"
                    required
                  />
                </div>
                <button
                  data-testid="btn-submit-track"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Repair Status</span>
                </button>
              </form>

              {/* Sample Quick Fill to try */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span>Try sample:</span>
                <button 
                  type="button" 
                  onClick={() => setTrackQuery('QF-REP-202609-4109')} 
                  className="text-sky-400 hover:underline font-mono"
                >
                  QF-REP-202609-4109
                </button>
                <span>or</span>
                <button 
                  type="button" 
                  onClick={() => setTrackQuery('QF-REP-202609-4110')} 
                  className="text-sky-400 hover:underline font-mono"
                >
                  QF-REP-202609-4110
                </button>
              </div>

              {/* Tracking Result Card */}
              {hasTracked && (
                <div className="mt-4 pt-4 border-t border-slate-700/80 text-xs">
                  {trackResult ? (
                    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-400">{trackResult.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trackResult.repairStatus === 'completed' || trackResult.repairStatus === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {trackResult.repairStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-white font-semibold">{trackResult.deviceBrand} {trackResult.deviceModel}</div>
                      <div className="text-slate-400 text-[11px]">
                        Customer: <span className="text-slate-200">{trackResult.customerName}</span> • Est. Ready: <span className="text-slate-200">{trackResult.estimatedDelivery}</span>
                      </div>
                      <div className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                        {trackResult.problemDescription}
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-400">Total Charges: <strong className="text-white font-mono">{formatINR(trackResult.totalCharges)}</strong></span>
                        <span className="text-amber-400 font-semibold">{trackResult.warrantyPeriodDays} Days Warranty</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-center">
                      No repair ticket found matching "{trackQuery}". Please double check your ticket number.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="font-semibold text-white block">KYC Verified</span>
                <span className="text-[10px] text-slate-400">Aadhaar & Shop Audit</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <Cpu className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <span className="font-semibold text-white block">Genuine Spares</span>
                <span className="text-[10px] text-slate-400">OEM Grade Tested</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="font-semibold text-white block">Warranty Log</span>
                <span className="text-[10px] text-slate-400">Claim Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Workshops Directory Preview Section */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span>National Network Directory</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
              Find Verified Electronics Workshops Near You
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Direct access to Level 4 motherboard specialists and precision repair engineers in major Indian tech corridors.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city}
                data-testid={`btn-city-${city.toLowerCase()}`}
                onClick={() => setSelectedCity(city)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors
                  ${selectedCity === city 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Technician Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTechs.map((tech) => (
            <div
              key={tech.id}
              data-testid={`card-technician-${tech.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={tech.technicianPhoto} 
                      alt={tech.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading font-bold text-sm text-slate-900">{tech.fullName}</h4>
                        {tech.verificationStatus === 'verified' ? (
                          <span title="Verified Workshop">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-semibold">Pending</span>
                        )}
                      </div>
                      <span className="text-xs text-sky-700 font-medium">{tech.shopName}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {tech.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{tech.city}, {tech.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{tech.workingHours}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 line-clamp-2 italic mb-3 bg-slate-50 p-2 rounded-lg">
                  "{tech.about}"
                </p>

                {/* Brands Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tech.brandsWorkedOn.slice(0, 4).map((brand) => (
                    <span key={brand} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {brand}
                    </span>
                  ))}
                  {tech.brandsWorkedOn.length > 4 && (
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      +{tech.brandsWorkedOn.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Track Record</span>
                  <span className="font-bold text-slate-900">{tech.totalRepairsCompleted}+ Jobs • ⭐ {tech.rating}</span>
                </div>
                <button
                  data-testid={`btn-contact-${tech.id}`}
                  onClick={() => {
                    const clean = tech.whatsappNumber.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${clean}?text=Hello%20${tech.fullName},%20I%20found%20your%20workshop%20on%20Quick%20Fix%20Electronics%20portal`, '_blank');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            <span className="font-heading font-bold text-sm text-white">Quick Fix Electronics India</span>
            <span>• Workshop OS & Verified Tech Registry</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Standard (Customer Data Masking)</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">All India Support: +91 1800 200 4821</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

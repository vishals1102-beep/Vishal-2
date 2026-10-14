import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Smartphone, 
  Wrench, 
  IndianRupee, 
  Star, 
  Clock, 
  Printer, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { tickets, currentTech, formatINR } = useApp();

  const myTickets = tickets.filter(t => t.technicianId === currentTech.id);
  const totalRevenue = myTickets.reduce((sum, t) => sum + (t.paymentStatus === 'paid' ? t.totalCharges : 0), 0);
  const avgTicket = myTickets.length ? Math.round(totalRevenue / myTickets.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Workshop Analytics & Performance Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Realized margins, brand breakdowns, turnaround benchmarks & customer satisfaction KPIs
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Monthly Report</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Revenue
          </span>
          <span className="font-heading text-2xl font-bold text-slate-900 mt-1 block font-mono">
            {formatINR(totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from last month</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Ticket Size
          </span>
          <span className="font-heading text-2xl font-bold text-slate-900 mt-1 block font-mono">
            {formatINR(avgTicket || 4500)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            Labor + Parts included
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Turnaround Time
          </span>
          <span className="font-heading text-2xl font-bold text-slate-900 mt-1 block">
            1.8 Days
          </span>
          <span className="text-[11px] text-sky-600 font-medium mt-0.5 block">
            Benchmark: 2.5 Days
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Workshop Satisfaction
          </span>
          <span className="font-heading text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
            4.9 <Star className="w-5 h-5 fill-amber-500" />
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            Based on 52 verified customer jobs
          </span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Volume Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>Top Serviced Device Brands</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { brand: 'Apple iPhone', share: '42%', count: '24 Jobs', color: 'bg-sky-600' },
              { brand: 'Samsung Galaxy', share: '28%', count: '16 Jobs', color: 'bg-indigo-600' },
              { brand: 'Xiaomi / Redmi / Poco', share: '15%', count: '9 Jobs', color: 'bg-amber-500' },
              { brand: 'OnePlus & Nothing', share: '10%', count: '6 Jobs', color: 'bg-rose-500' },
              { brand: 'Vivo & Oppo', share: '5%', count: '3 Jobs', color: 'bg-emerald-500' }
            ].map(b => (
              <div key={b.brand} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>{b.brand}</span>
                  <span className="font-bold text-slate-900">{b.share} ({b.count})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full`} style={{ width: b.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repair Fault Category Frequency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Repair Category Frequency</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { cat: 'Screen & OLED Replacement', share: '48%', color: 'bg-sky-600' },
              { cat: 'Battery Replacement & BMS', share: '22%', color: 'bg-emerald-600' },
              { cat: 'Motherboard Micro-Soldering', share: '18%', color: 'bg-purple-600' },
              { cat: 'Water Damage Ultrasonic Clean', share: '8%', color: 'bg-blue-500' },
              { cat: 'Camera & Flex Cable Repairs', share: '4%', color: 'bg-slate-500' }
            ].map(c => (
              <div key={c.cat} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>{c.cat}</span>
                  <span className="font-bold text-slate-900">{c.share}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: c.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

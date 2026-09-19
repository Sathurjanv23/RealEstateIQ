import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Brain,
  TrendingUp,
  ShieldCheck,
  FileText,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';
import { SL_LOCATIONS } from '../utils/sriLankaLocations';

const coreFeatures = [
  {
    icon: <Brain size={22} className="text-indigo-400" />,
    title: '23-District ML Valuation Engine',
    desc: 'Ensemble Random Forest model trained on authentic Sri Lankan property transactions with district-specific price calibration.',
  },
  {
    icon: <Building2 size={22} className="text-sky-400" />,
    title: '14,833+ Verified Market Records',
    desc: 'Grounded in real property listings and sales across Western, Central, Southern, Northern, and Eastern provinces.',
  },
  {
    icon: <TrendingUp size={22} className="text-emerald-400" />,
    title: 'Explainable AI & Confidence Range',
    desc: 'Provides transparent 95% valuation confidence intervals and feature-by-feature importance breakdown.',
  },
  {
    icon: <FileText size={22} className="text-purple-400" />,
    title: 'Bank-Grade PDF Valuation Reports',
    desc: 'Generate and download official PDF valuation certificates with unique audit IDs for buyers, sellers, and financial institutions.',
  },
];

const keyStats = [
  { value: '14,833+', label: 'Market Records Analyzed' },
  { value: '23', label: 'Sri Lanka Districts Covered' },
  { value: '95%', label: 'Valuation Confidence Interval' },
  { value: '< 50ms', label: 'Instant AI Estimation Speed' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Quick estimator widget states
  const [quickLocation, setQuickLocation] = useState('Colombo');
  const [quickArea, setQuickArea] = useState('2000');
  const [quickBedrooms, setQuickBedrooms] = useState('3');
  const [quickBathrooms, setQuickBathrooms] = useState('2');

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/predict?location=${encodeURIComponent(quickLocation)}&area=${quickArea}&bedrooms=${quickBedrooms}&bathrooms=${quickBathrooms}`
    );
  };

  return (
    <>
      <Head>
        <title>RealEstateIQ — Sri Lanka AI Property Valuation & Real Estate Intelligence</title>
        <meta
          name="description"
          content="Accurate, data-driven real estate valuations across all 23 Sri Lankan districts. Powered by Machine Learning trained on 14,833+ authentic property records."
        />
      </Head>

      <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
        {/* Top Navbar */}
        <header className="border-b border-white/[0.06] sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <BrandLogo size="md" showText={true} />

            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
              <Link href="/predict" className="hover:text-white transition-colors">AI Valuation</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market Intelligence</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
                >
                  Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
          {/* Subtle Ambient Radial Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[280px] h-[280px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Trained on 14,833 Authentic Sri Lanka Market Transactions</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
              Precision Real Estate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                Valuations with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Instant, unbiased property market estimates across all 23 Sri Lankan districts.
              Backed by verified transaction records and ensemble machine learning.
            </p>

            {/* Interactive Quick Valuation Card */}
            <div className="glass-card max-w-2xl mx-auto p-5 sm:p-6 text-left border-indigo-500/20 shadow-2xl shadow-black/60 mb-10">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <SlidersHorizontal size={15} />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Quick Property Estimate</h2>
                </div>
                <span className="text-[11px] text-slate-400">23 Districts Supported</span>
              </div>

              <form onSubmit={handleQuickEstimate} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">District</label>
                  <select
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/10 rounded-xl px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {SL_LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    value={quickArea}
                    onChange={(e) => setQuickArea(e.target.value)}
                    min="500"
                    max="50000"
                    className="w-full bg-[#0a0e1c] border border-white/10 rounded-xl px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="2000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Bedrooms</label>
                  <select
                    value={quickBedrooms}
                    onChange={(e) => setQuickBedrooms(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/10 rounded-xl px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} Beds</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Bathrooms</label>
                  <select
                    value={quickBathrooms}
                    onChange={(e) => setQuickBathrooms(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/10 rounded-xl px-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} Baths</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-4 mt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <Brain size={16} /> Get Instant AI Valuation <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            </div>

            {/* Actions Links */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Free instant access
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> No broker commissions
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Official PDF certificate
              </span>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-white/[0.06] bg-[#090e1a]/60 py-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {keyStats.map((stat, i) => (
              <div key={i} className="p-2">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">Institutional-Grade Intelligence</h2>
            <p className="text-slate-400 text-sm mt-2">
              Everything required to evaluate, benchmark, and verify Sri Lankan real estate investments.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {coreFeatures.map((feat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0b1020]/70 border border-white/[0.06] hover:border-indigo-500/30 transition-all duration-200 group shadow-lg shadow-black/40"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="glass-card p-8 sm:p-10 text-center relative overflow-hidden border-indigo-500/25 bg-gradient-to-b from-[#0d1428] to-[#090e1c]">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Start Valuing Sri Lankan Real Estate Today
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
              Join property investors, buyers, and sellers utilizing AI precision for authentic fair-market decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs mx-auto">
              <Link
                href="/predict"
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Estimate Now <ArrowRight size={15} />
              </Link>
              <Link
                href="/market"
                className="w-full py-3 px-6 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-sm inline-flex items-center justify-center transition-colors"
              >
                Market Intel
              </Link>
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6 bg-[#050810]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <BrandLogo size="sm" showText={true} />
            <p>© {new Date().getFullYear()} RealEstateIQ Sri Lanka. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/predict" className="hover:text-white transition-colors">AI Valuation</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market Intel</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
        </footer>

        {/* PWA Install Prompt Banner */}
        <PwaInstallPrompt />
      </div>
    </>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Brain,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';
import { SL_LOCATIONS } from '../utils/sriLankaLocations';

const coreFeatures = [
  {
    icon: <Brain size={20} className="text-indigo-400" />,
    title: '23-District ML Valuation Engine',
    desc: 'Ensemble Random Forest model trained on authentic Sri Lankan property transactions with district-specific benchmark rate calibration.',
    tag: 'ML Core',
  },
  {
    icon: <Building2 size={20} className="text-sky-400" />,
    title: '14,833+ Verified Market Records',
    desc: 'Grounded in real property listings and sales across Western, Central, Southern, Northern, and Eastern provinces.',
    tag: 'Kaggle Verified',
  },
  {
    icon: <TrendingUp size={20} className="text-emerald-400" />,
    title: 'Explainable AI & Confidence Range',
    desc: 'Provides transparent 95% valuation confidence intervals, feature-by-feature importance breakdown, and square-foot pricing metrics.',
    tag: 'Explainable AI',
  },
  {
    icon: <FileText size={20} className="text-purple-400" />,
    title: 'Bank-Grade PDF Valuation Reports',
    desc: 'Generate and download official PDF valuation certificates with unique audit IDs for buyers, sellers, and financial institutions.',
    tag: 'Instant Export',
  },
];

const keyStats = [
  { value: '14,833+', label: 'Market Records Analyzed' },
  { value: '23', label: 'Districts Supported' },
  { value: '95%', label: 'Valuation Confidence Interval' },
  { value: '< 50ms', label: 'Instant Inference Speed' },
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
        <title>RealEstateIQ — Sri Lanka AI Property Valuation Platform</title>
        <meta
          name="description"
          content="Institutional-grade AI property valuations and real estate market intelligence across all 23 Sri Lankan districts. Powered by Machine Learning trained on 14,833+ authentic market records."
        />
      </Head>

      <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-[450px] right-[-10%] w-[500px] h-[400px] bg-sky-500/[0.04] rounded-full blur-[100px]" />
          <div className="absolute top-[800px] left-[-10%] w-[450px] h-[450px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
        </div>

        {/* Top Navbar */}
        <header className="border-b border-white/[0.07] sticky top-0 z-50 backdrop-blur-2xl bg-[#060a14]/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <BrandLogo size="md" showText={true} />

            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
              <Link href="/predict" className="hover:text-white transition-colors">AI Valuation</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market Intelligence</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
              <Link href="#features" className="hover:text-white transition-colors">Platform Features</Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all"
                >
                  Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Announcement Pill with subtle glass shine */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d1428]/80 border border-indigo-400/25 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Trained on 14,833 Authentic Sri Lanka Market Transactions</span>
            </div>

            {/* Headline with controlled, sophisticated gradient */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12] mb-5">
              Precision Real Estate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
                Valuations with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Instant, unbiased property market estimates across all 23 Sri Lankan districts.
              Backed by verified transaction data, log-scale regression, and ensemble machine learning.
            </p>

            {/* Premium Focal Glass Card: Quick Property Estimate Terminal */}
            <div className="pro-terminal-glass max-w-2xl mx-auto p-5 sm:p-7 rounded-2xl text-left relative overflow-hidden mb-10">
              {/* Subtle top specular highlight sweep */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 60%, transparent 80%)',
                }}
              />

              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-white/[0.08] relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                    <SlidersHorizontal size={14} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">Quick Property Estimate</h2>
                    <p className="text-[11px] text-slate-400">Calibrated for Sri Lankan Real Estate Markets</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  23 Districts Ready
                </span>
              </div>

              <form onSubmit={handleQuickEstimate} className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                    District / Location
                  </label>
                  <select
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    className="w-full bg-[#080d1a]/90 border border-white/[0.12] hover:border-white/20 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-all"
                  >
                    {SL_LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value} className="bg-[#0b1020] text-white">
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                    Area (sqft)
                  </label>
                  <input
                    type="number"
                    value={quickArea}
                    onChange={(e) => setQuickArea(e.target.value)}
                    min="200"
                    max="50000"
                    className="w-full bg-[#080d1a]/90 border border-white/[0.12] hover:border-white/20 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-all"
                    placeholder="2000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                    Bedrooms
                  </label>
                  <select
                    value={quickBedrooms}
                    onChange={(e) => setQuickBedrooms(e.target.value)}
                    className="w-full bg-[#080d1a]/90 border border-white/[0.12] hover:border-white/20 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num} className="bg-[#0b1020] text-white">
                        {num} {num === 1 ? 'Bed' : 'Beds'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                    Bathrooms
                  </label>
                  <select
                    value={quickBathrooms}
                    onChange={(e) => setQuickBathrooms(e.target.value)}
                    className="w-full bg-[#080d1a]/90 border border-white/[0.12] hover:border-white/20 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-all"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="bg-[#0b1020] text-white">
                        {num} {num === 1 ? 'Bath' : 'Baths'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-4 mt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_32px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-[0.99]"
                  >
                    <Brain size={16} /> Get Instant AI Valuation <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            </div>

            {/* Institutional Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Real Market Transaction Data
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> 95% Confidence Interval
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Exportable PDF Valuation Certificate
              </span>
            </div>
          </div>
        </section>

        {/* Stats Strip with Glass Panels */}
        <section className="border-y border-white/[0.07] bg-[#070b16]/70 backdrop-blur-xl py-10 px-4 sm:px-6 relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {keyStats.map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#0a0f1e]/60 border border-white/[0.06] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Capabilities Section (4 Premium Glass Information Panels) */}
        <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">Institutional-Grade Intelligence</h2>
            <p className="text-slate-400 text-sm mt-2">
              Engineered for property investors, buyers, sellers, and valuation professionals in Sri Lanka.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {coreFeatures.map((feat, i) => (
              <div
                key={i}
                className="pro-panel-glass p-6 sm:p-7 rounded-2xl relative overflow-hidden group"
              >
                {/* Subtle top-corner tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-indigo-200 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Luxury CTA Banner */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
          <div className="pro-terminal-glass p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                Start Valuing Sri Lankan Real Estate Today
              </h2>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                Join property investors, buyers, and sellers utilizing AI precision for authentic fair-market valuations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/predict"
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(99,102,241,0.35)] transition-all"
                >
                  Estimate Now <ArrowRight size={15} />
                </Link>
                <Link
                  href="/market"
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white font-medium text-sm inline-flex items-center justify-center transition-colors"
                >
                  Market Intel
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Minimal Luxury Footer */}
        <footer className="border-t border-white/[0.07] py-10 px-4 sm:px-6 bg-[#04060d] relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <BrandLogo size="sm" showText={true} />
            <p>© {new Date().getFullYear()} RealEstateIQ Sri Lanka. All rights reserved.</p>
            <div className="flex items-center gap-5 font-medium">
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

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Brain,
  Home,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Zap,
  ChevronRight,
  Star,
  ArrowRight,
  MapPin,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: <Brain size={24} className="text-indigo-400" />,
    title: 'AI Valuation Engine',
    desc: 'Gradient Boosting ML pipeline trained on 1,200+ real Sri Lanka market records across Colombo, Gampaha, Kandy & Galle.',
  },
  {
    icon: <BarChart3 size={24} className="text-sky-400" />,
    title: 'Live Market Intelligence',
    desc: 'Real-time price-per-perch, sq.ft benchmarks, growth heatmaps, and price distribution across 24 key zones.',
  },
  {
    icon: <TrendingUp size={24} className="text-emerald-400" />,
    title: 'Fair Value Comparison',
    desc: 'Cross-evaluate seller asking prices against neutral algorithmic estimations to spot undervalued deals instantly.',
  },
  {
    icon: <Building size={24} className="text-amber-400" />,
    title: 'Verified Property Inventory',
    desc: 'Curated luxury villas, prime residential land, and modern apartments with high-res photo galleries and Leaflet maps.',
  },
  {
    icon: <Star size={24} className="text-purple-400" />,
    title: 'Smart Yield Recommendations',
    desc: 'Discover high-yield investment properties tailored to your budget and preferred Sri Lankan districts.',
  },
  {
    icon: <ShieldCheck size={24} className="text-rose-400" />,
    title: 'Enterprise Security',
    desc: 'Secure email OTP verification, Google OAuth 2.0 single sign-on, JWT sessions, and full audit logging.',
  },
];

const stats = [
  { value: '1,200+', label: 'Sri Lanka Market Records' },
  { value: '94.2%', label: 'Valuation Precision (R² 0.88)' },
  { value: '24', label: 'Western & Island Locations' },
  { value: '< 2s', label: 'Instant AI Evaluation Speed' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>RealEstateIQ — Sri Lanka Real Estate Intelligence & AI Valuation</title>
        <meta
          name="description"
          content="Estimate property values with Gradient Boosting AI, inspect Colombo market benchmarks, and make data-driven real estate decisions."
        />
      </Head>

      <div className="min-h-screen bg-[#070a13] text-slate-100 selection:bg-indigo-500 selection:text-white">
        {/* Live Sri Lanka Property Ticker */}
        <div className="bg-[#0b1021] border-b border-indigo-500/15 py-1.5 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">LK Market Pulse:</span>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono text-[11px] whitespace-nowrap pl-4">
              <span>Colombo 03: <strong className="text-emerald-400">LKR 115,000/sqft</strong></span>
              <span>•</span>
              <span>Rajagiriya: <strong className="text-sky-400">+11.8% YoY</strong></span>
              <span>•</span>
              <span>Galle Fort: <strong className="text-amber-400">LKR 4.2M/perch</strong></span>
              <span>•</span>
              <span>Kandy Central: <strong className="text-purple-400">LKR 2.1M/perch</strong></span>
              <span>•</span>
              <span>Negombo Beach: <strong className="text-emerald-400">7.9% Yield</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-[#070a13]/85">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <BrandLogo size="md" showText={true} />

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market Intel</Link>
              <Link href="/predict" className="hover:text-white transition-colors">AI Valuation</Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold text-sm inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 py-20 md:py-32">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Sri Lanka&apos;s #1 AI Property Valuation Network</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Precision Real Estate <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Valuations with AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Calculate instant fair-market estimates across Colombo, Kandy, Galle and suburbs. Backed by verified transaction data and Gradient Boosting intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/predict"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 hover:opacity-95 text-white font-bold text-base inline-flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                Estimate Property Value <ChevronRight size={18} />
              </Link>

              <Link
                href="/properties"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors"
              >
                Browse Inventory
              </Link>
            </div>

            {/* Stats Ticker Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 p-6 rounded-2xl bg-[#0b1021]/80 border border-indigo-500/15 backdrop-blur-xl shadow-2xl">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-2">
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Designed for Investors & Agents</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Institutional-Grade Intelligence</h2>
            <p className="text-slate-400 text-sm mt-3">
              Comprehensive analytics, transparent valuation models, and automated client inquiry workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0c1222]/80 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg shadow-black/40"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-4 sm:px-6 bg-[#05070e]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
            <BrandLogo size="sm" showText={true} />
            <p>© {new Date().getFullYear()} RealEstateIQ Sri Lanka. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market</Link>
              <Link href="/predict" className="hover:text-white transition-colors">Valuation</Link>
              <Link href="/login" className="hover:text-white transition-colors">Portal</Link>
            </div>
          </div>
        </footer>

        {/* PWA Install Prompt Banner */}
        <PwaInstallPrompt />
      </div>
    </>
  );
}

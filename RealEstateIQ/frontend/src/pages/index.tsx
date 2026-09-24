import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Brain,
  Building2,
  TrendingUp,
  FileText,
  ArrowRight,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Home,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Compass,
  Palette,
  Hammer,
  DollarSign,
  UserCheck,
  Users,
  Briefcase,
  Search,
} from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';
import { SL_LOCATIONS } from '../utils/sriLankaLocations';

const roles = [
  {
    role: 'Investor',
    dotColor: '#00DC82',
    desc: 'Analyze district rental yields, price-per-sqft trends, and REIT-grade valuation metrics.',
  },
  {
    role: 'Builder / Developer',
    dotColor: '#F97316',
    desc: 'Benchmark project feasibility, land parcel valuation, and construction square-foot rates.',
  },
  {
    role: 'Interior Designer',
    dotColor: '#EC4899',
    desc: 'Access verified floor plans, square-foot dimensions, and collaborate seamlessly on assets.',
  },
  {
    role: 'Seller & Owner',
    dotColor: '#38BDF8',
    desc: 'List properties, benchmark against 14,833 authentic transactions, and review buyer inquiries.',
  },
  {
    role: 'Buyer',
    dotColor: '#A855F7',
    desc: 'Discover authentic listings across 23 districts, save favorites, and audit fair-market value.',
  },
  {
    role: 'Admin & Institution',
    dotColor: '#EF4444',
    desc: 'Moderate listings, monitor model calibration (R² 0.996), and inspect institutional audit logs.',
  },
];

const modules = [
  {
    icon: <Brain size={22} className="text-[#061017]" />,
    title: '23-District ML Valuation Engine',
    desc: 'Trained on 14,833 authentic market records with 95% confidence intervals and feature-by-feature weight breakdowns.',
  },
  {
    icon: <Compass size={22} className="text-[#061017]" />,
    title: 'Interactive District Cartography',
    desc: 'Visualize properties geographically across Colombo, Kandy, Galle, and Negombo with live cluster mapping.',
  },
  {
    icon: <FileText size={22} className="text-[#061017]" />,
    title: 'Bank-Grade PDF Valuation Reports',
    desc: 'Generate official valuation certificates with unique audit IDs for buyers, sellers, and financial lenders.',
  },
  {
    icon: <TrendingUp size={22} className="text-[#061017]" />,
    title: 'REIT & Market Intelligence',
    desc: 'Examine median square-foot rates, district price breakdowns, and comparative asset benchmarking metrics.',
  },
  {
    icon: <Home size={22} className="text-[#061017]" />,
    title: 'Marketplace Listings & Inquiries',
    desc: 'Browse residential, villa, commercial, and land listings with direct viewing schedule dispatch.',
  },
  {
    icon: <ShieldCheck size={22} className="text-[#061017]" />,
    title: 'Admin Governance & Audit Trail',
    desc: 'Track system access, manage client permissions, register AI model versions, and audit all platform events.',
  },
];

const stakeholderPills = [
  'Teams', 'Funds', 'Investors', 'Builders', 'Designers', 'Owners', 'Analysts', 'Brokers'
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
        <title>RealEstateIQ — Sri Lanka Real Estate Intelligence Platform</title>
        <meta
          name="description"
          content="Plan. Build. Design. List & invest. RealEstateIQ unifies 23-district AI valuation, 14,833 authentic market records, and marketplace listings."
        />
      </Head>

      <div className="min-h-screen bg-[#061017] text-[#F8FAFC] font-sans antialiased overflow-x-hidden selection:bg-[#00DC82] selection:text-[#061017]">
        {/* Navbar matching Sample Screenshot 1 */}
        <header className="border-b border-[#142938] sticky top-0 z-50 bg-[#061017]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-3.5">
            <BrandLogo size="md" showText={true} />

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#94A3B8]">
              <Link href="/" className="text-white hover:text-[#00DC82] transition-colors">Home</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Listings</Link>
              <Link href="/predict" className="hover:text-white transition-colors">Valuation</Link>
              <Link href="/market" className="hover:text-white transition-colors">Market</Link>
              <Link href="#modules" className="hover:text-white transition-colors">Modules</Link>
            </nav>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-full bg-[#00DC82] hover:bg-[#00C373] text-[#061017] font-bold text-sm inline-flex items-center gap-1.5 shadow-btn-emerald transition-all"
                >
                  Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors px-2 py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-full bg-[#00DC82] hover:bg-[#00C373] text-[#061017] font-extrabold text-sm inline-flex items-center gap-1.5 shadow-btn-emerald transition-all"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section with Grid Backdrop matching Sample Screenshot 1 */}
        <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 hero-grid-pattern relative overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-b from-[#00DC82]/12 via-[#00DC82]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 left-[-100px] w-[500px] h-[400px] bg-gradient-to-r from-[#00DC82]/8 to-transparent rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-left sm:text-left relative z-10">
            {/* Announcement Pill matching Sample */}
            <div className="tech-pill mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse" />
              <span>Real-Estate IQ for the entire Sri Lanka property lifecycle</span>
            </div>

            {/* Main Headline from Sample */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Plan. Build. Design. <br />
              List & <span className="text-[#00DC82]">invest.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[#94A3B8] max-w-2xl mb-10 leading-relaxed font-normal">
              RealEstateIQ unifies 23-district AI valuation, 14,833 verified market transactions,
              construction tracking, marketplace listings and REIT-grade investing — for every
              professional in the property value chain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-14">
              <Link
                href="/predict"
                className="btn-primary text-sm py-3.5 px-6 rounded-xl font-bold"
              >
                Create your workspace <ArrowRight size={16} />
              </Link>
              <Link
                href="/properties"
                className="btn-secondary text-sm py-3.5 px-6 rounded-xl font-semibold"
              >
                Explore listings
              </Link>
            </div>
          </div>
        </section>

        {/* Stakeholder Strip matching Sample Screenshot 1 */}
        <section className="border-y border-[#142938] bg-[#040B10] py-6 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-[#64748B] mb-4">
              BUILT FOR EVERY PROFESSIONAL IN REAL-ESTATE
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-[#94A3B8]">
              {stakeholderPills.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FOR EVERY ROLE Section matching Sample Screenshot 2 */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00DC82]">
              FOR EVERY ROLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              A workspace tuned to how you work
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {roles.map((item, i) => (
              <div key={i} className="role-card">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.dotColor }}
                  />
                  <h3 className="font-bold text-white text-base">{item.role}</h3>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MODULES Section matching Sample Screenshot 3 */}
        <section id="modules" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#142938]">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00DC82]">
              MODULES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              Six modules. One source of truth.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {modules.map((mod, i) => (
              <div key={i} className="module-card">
                <div className="w-11 h-11 rounded-xl bg-[#00DC82] flex items-center justify-center mb-5 shadow-btn-emerald">
                  {mod.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2">
                  {mod.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Major CTA Banner matching Sample Screenshot 4 */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
          <div
            className="p-10 sm:p-16 rounded-3xl text-center relative overflow-hidden border border-[#00DC82]/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #061D15 0%, #0A3324 50%, #061811 100%)',
            }}
          >
            {/* Subtle glow circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#00DC82]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Build the future of real estate from one workspace.
              </h2>
              <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
                Spin up a RealEstateIQ workspace in seconds. Calibrated with 14,833 verified Sri Lanka transaction records.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/predict"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#00DC82] hover:bg-[#00C373] text-[#061017] font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-btn-emerald transition-all"
                >
                  Get started <ArrowRight size={15} />
                </Link>
                <Link
                  href="/properties"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0E1F2E] hover:bg-[#142B3E] text-white border border-[#1E3A4E] text-sm font-semibold inline-flex items-center justify-center transition-colors"
                >
                  Browse listings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer matching Sample Screenshot 4 */}
        <footer className="border-t border-[#142938] bg-[#040B10] py-14 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 text-xs text-[#94A3B8]">
            <div className="md:col-span-2">
              <BrandLogo size="md" showText={true} />
              <p className="mt-4 text-xs leading-relaxed max-w-sm text-[#64748B]">
                Real-Estate IQ — one professional workspace for AI valuation analysis,
                interactive cartography, verified transaction data, and REIT-grade investing in Sri Lanka.
              </p>
              <div className="flex items-center gap-3 mt-5 text-[#64748B]">
                <span className="p-2 rounded-lg bg-[#0B1722] border border-[#142938] hover:text-white transition-colors cursor-pointer">𝕏</span>
                <span className="p-2 rounded-lg bg-[#0B1722] border border-[#142938] hover:text-white transition-colors cursor-pointer">in</span>
                <span className="p-2 rounded-lg bg-[#0B1722] border border-[#142938] hover:text-white transition-colors cursor-pointer">⌥</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Product</p>
              <ul className="space-y-2">
                <li><Link href="/properties" className="hover:text-white transition-colors">Listings</Link></li>
                <li><Link href="/predict" className="hover:text-white transition-colors">Valuation Engine</Link></li>
                <li><Link href="/market" className="hover:text-white transition-colors">Market Analytics</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Company</p>
              <ul className="space-y-2">
                <li><Link href="#modules" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/market" className="hover:text-white transition-colors">Thesis & Data</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Governance</p>
              <ul className="space-y-2">
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Suite</Link></li>
                <li><span className="text-[#64748B]">23 Districts Calibrated</span></li>
                <li><span className="text-[#00DC82]">Model R² 0.996</span></li>
              </ul>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-[#142938] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-3">
            <p>© {new Date().getFullYear()} RealEstateIQ Sri Lanka. All rights reserved.</p>
            <p>Institutional PropTech Infrastructure</p>
          </div>
        </footer>

        {/* PWA Prompt */}
        <PwaInstallPrompt />
      </div>
    </>
  );
}

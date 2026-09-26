import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, Sparkles, Shield, ChevronDown } from 'lucide-react';
import { LuxuryNavbar } from '../components/layout/LuxuryNavbar';
import { LuxuryFooter } from '../components/layout/LuxuryFooter';
import { PropertyIntelligenceSearch } from '../components/home/PropertyIntelligenceSearch';
import { FeaturedPropertiesSection } from '../components/home/FeaturedPropertiesSection';
import { AiValuationSection } from '../components/home/AiValuationSection';
import { MarketIntelligenceSection } from '../components/home/MarketIntelligenceSection';
import { WhyRealEstateIqSection } from '../components/home/WhyRealEstateIqSection';
import { FinalCtaSection } from '../components/home/FinalCtaSection';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';

const stakeholderPills = [
  'Institutional Investors',
  'Private Equity',
  'Luxury Homebuyers',
  'Property Developers',
  'Valuation Surveyors',
  'Estate Brokers',
];

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>RealEstateIQ — AI-Powered Real Estate Valuation & Market Intelligence Platform</title>
        <meta
          name="description"
          content="Discover the true value of Sri Lankan property. AI-powered property valuation and market intelligence built from 14,833 authentic market records across 23 districts."
        />
        <meta property="og:title" content="RealEstateIQ — Sri Lanka Real Estate Intelligence" />
        <meta
          property="og:description"
          content="AI-Powered Real Estate Valuation & Market Intelligence Platform built from real Sri Lankan market data."
        />
        <meta property="og:image" content="/images/luxury_hero.jpg" />
      </Head>

      <div className="min-h-screen bg-[#080A0E] text-[#F8FAFC] font-sans antialiased overflow-x-hidden selection:bg-[#DFBA73] selection:text-[#080A0E]">
        {/* Floating Glass Navbar */}
        <LuxuryNavbar />

        {/* HERO SECTION matching Reference Design */}
        <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
          {/* Cinematic Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/luxury_hero.jpg"
              alt="Luxury modern architectural residence at twilight"
              className="w-full h-full object-cover object-center lg:object-center transform scale-100 lg:scale-105 transition-transform duration-1000"
            />
            {/* Dark Luxury Vignette & Gradients blending into #080A0E */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-[#080A0E]/70 to-[#080A0E]/80" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#080A0E]/40 to-[#080A0E]/90" />
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080A0E] to-transparent" />
          </div>

          {/* Hero Content Container */}
          <div className="max-w-5xl mx-auto w-full relative z-10 my-auto text-center lg:text-left pt-6 sm:pt-10">
            {/* High-End Sub-Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#DFBA73]/30 backdrop-blur-xl mb-6 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#DFBA73] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#DFBA73]">
                AI-Powered Valuation & Market Intelligence
              </span>
            </div>

            {/* Editorial Luxury Serif Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-white tracking-tight leading-[1.08] sm:leading-[1.05] mb-6 max-w-4xl">
              Discover the <span className="italic font-light">True Value</span> of Sri Lankan Property
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg md:text-xl text-neutral-300 max-w-2xl mb-8 sm:mb-10 font-normal leading-relaxed">
              AI-powered property valuation and market intelligence built from real Sri Lankan market data across 23 districts.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 sm:mb-12">
              <Link
                href="/predict"
                id="hero-get-valuation-cta"
                className="w-full sm:w-auto btn-luxury-gold text-xs sm:text-sm py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-btn-gold"
              >
                <span>Get Property Valuation</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/market"
                className="w-full sm:w-auto btn-luxury-outline text-xs sm:text-sm py-4 px-8 rounded-xl font-semibold flex items-center justify-center transition-all"
              >
                <span>Explore Market Insights</span>
              </Link>
            </div>
          </div>

          {/* Floating Search Panel positioned elegantly below hero content */}
          <div className="relative z-20 w-full mt-4 sm:mt-8">
            <PropertyIntelligenceSearch />
          </div>
        </section>

        {/* Stakeholder Trust Bar */}
        <section className="border-y border-white/[0.08] bg-[#05070B] py-5 px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] uppercase font-bold tracking-[0.22em] text-[#DFBA73] shrink-0">
              TRUSTED INSTITUTIONAL PROPTECH
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs font-medium text-neutral-400">
              {stakeholderPills.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES SECTION */}
        <FeaturedPropertiesSection />

        {/* AI-POWERED VALUATION SECTION */}
        <AiValuationSection />

        {/* MARKET INTELLIGENCE SECTION */}
        <MarketIntelligenceSection />

        {/* WHY REALESTATEIQ SECTION */}
        <WhyRealEstateIqSection />

        {/* FINAL CALL TO ACTION */}
        <FinalCtaSection />

        {/* LUXURY FOOTER */}
        <LuxuryFooter />

        {/* PWA Prompt */}
        <PwaInstallPrompt />
      </div>
    </>
  );
}

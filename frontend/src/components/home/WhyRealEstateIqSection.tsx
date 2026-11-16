import React from 'react';
import { Sparkles, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

export function WhyRealEstateIqSection() {
  const features = [
    {
      icon: <Sparkles size={24} className="text-[#DFBA73]" />,
      title: 'AI-Powered Valuation',
      desc: 'Machine learning calibrated on authentic transactions with 95% confidence intervals and instant fair-market estimates.',
    },
    {
      icon: <MapPin size={24} className="text-[#DFBA73]" />,
      title: 'Sri Lankan Market Data',
      desc: 'Hyper-local intelligence spanning 23 districts from Western commercial corridors to scenic Central and Southern coastlines.',
    },
    {
      icon: <TrendingUp size={24} className="text-[#DFBA73]" />,
      title: 'Market Intelligence',
      desc: 'Institutional REIT-grade price-per-sqft benchmarks, annual appreciation indexes, and district liquidity metrics.',
    },
    {
      icon: <ShieldCheck size={24} className="text-[#DFBA73]" />,
      title: 'Data-Driven Decisions',
      desc: 'Official bank-ready PDF valuation certificates with tamper-proof audit trails for buyers, developers, and lenders.',
    },
  ];

  return (
    <section id="why-realestateiq" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
      {/* Section Heading */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[#DFBA73] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
          <span>The RealEstateIQ Advantage</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
          Why RealEstateIQ
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
          The premier intelligence platform unifying machine learning, authentic transaction records, and institutional market analytics.
        </p>
      </div>

      {/* 4 Feature Blocks: Desktop 4-col, Tablet 2x2, Mobile 1-col */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="luxury-glass-card p-6 sm:p-7 rounded-2xl border border-white/[0.08] hover:border-[#DFBA73]/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Minimal Luxury Icon Frame */}
              <div className="w-12 h-12 rounded-xl bg-[#DFBA73]/10 border border-[#DFBA73]/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#DFBA73]/15 transition-all duration-300">
                {feat.icon}
              </div>

              <h3 className="font-serif text-lg font-normal text-white mb-2 group-hover:text-[#DFBA73] transition-colors">
                {feat.title}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-semibold text-[#DFBA73]">
              <span>Verified Standard</span>
              <span className="text-[10px]">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

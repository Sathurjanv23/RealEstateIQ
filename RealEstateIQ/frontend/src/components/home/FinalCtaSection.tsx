import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="relative rounded-3xl p-8 sm:p-14 md:p-18 text-center overflow-hidden border border-[#DFBA73]/30 shadow-2xl luxury-glass-card bg-gradient-to-b from-[#141A26]/90 via-[#0E131C]/95 to-[#080A0E]">
        {/* Ambient Gold Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#DFBA73]/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#DFBA73]/60 to-transparent" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[#DFBA73] text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
            <Sparkles size={12} />
            <span>Sri Lanka Market Intelligence</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight mb-5 leading-tight">
            Know the True Value of Your Property
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-neutral-300 mb-9 leading-relaxed font-normal max-w-xl mx-auto">
            Make smarter property decisions with AI-powered valuation and market intelligence built on verified Sri Lankan market records.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/predict"
              id="final-cta-get-valuation"
              className="w-full sm:w-auto btn-luxury-gold py-4 px-8 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-btn-gold"
            >
              <span>Get Your Valuation</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/market"
              className="w-full sm:w-auto btn-luxury-outline py-4 px-8 rounded-xl text-sm font-semibold flex items-center justify-center transition-all"
            >
              Explore Market Insights
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

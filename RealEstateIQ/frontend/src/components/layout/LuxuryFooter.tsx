import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, MapPin, Shield } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export function LuxuryFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05070B] py-14 sm:py-18 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#DFBA73]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2">
            <BrandLogo size="md" variant="luxury" />
            <p className="mt-4 text-xs sm:text-sm leading-relaxed max-w-sm text-neutral-400 font-normal">
              AI-Powered Real Estate Valuation & Market Intelligence Platform built from real Sri Lankan market data. Calibrated across 23 districts for institutional and private investors.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com/Sathurjanv23/RealEstateIQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                title="GitHub Repository"
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-neutral-400 hover:text-[#DFBA73] hover:border-[#DFBA73]/40 hover:bg-[#DFBA73]/10 transition-all duration-300"
              >
                <Github size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-neutral-400 hover:text-[#DFBA73] hover:border-[#DFBA73]/40 hover:bg-[#DFBA73]/10 transition-all duration-300"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                title="Twitter / X"
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-neutral-400 hover:text-[#DFBA73] hover:border-[#DFBA73]/40 hover:bg-[#DFBA73]/10 transition-all duration-300"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Platform</p>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/" className="hover:text-[#DFBA73] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-[#DFBA73] transition-colors">Properties</Link>
              </li>
              <li>
                <Link href="/predict" className="hover:text-[#DFBA73] transition-colors">Valuation</Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-[#DFBA73] transition-colors">Market Intelligence</Link>
              </li>
              <li>
                <Link href="/#why-realestateiq" className="hover:text-[#DFBA73] transition-colors">About</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Intelligence & Solutions */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Intelligence</p>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/predict" className="hover:text-[#DFBA73] transition-colors">23-District ML Engine</Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-[#DFBA73] transition-colors">REIT & Median Yields</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#DFBA73] transition-colors">Institutional Dashboard</Link>
              </li>
              <li>
                <span className="text-neutral-500 cursor-default">14,833 Verified Records</span>
              </li>
              <li>
                <span className="text-[#DFBA73] cursor-default">Model R² 0.996</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Governance */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Contact & Access</p>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <MapPin size={12} className="text-[#DFBA73] shrink-0" />
                <span>Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-[#DFBA73] shrink-0" />
                <span>intel@realestateiq.lk</span>
              </li>
              <li className="pt-2">
                <Link href="/login" className="hover:text-[#DFBA73] transition-colors">Portal Login</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#DFBA73] transition-colors">Register Account</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
          <p>© {new Date().getFullYear()} RealEstateIQ Sri Lanka. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Institutional Real Estate Infrastructure</span>
            <span>•</span>
            <span className="text-neutral-400">Sri Lankan Market Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

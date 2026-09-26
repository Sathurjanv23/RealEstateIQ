import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export function LuxuryNavbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'Valuation', href: '/predict' },
    { name: 'Market Intelligence', href: '/market' },
    { name: 'About', href: '/#why-realestateiq' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 md:px-8 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div
          className={`luxury-glass-nav rounded-2xl md:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 flex items-center justify-between ${
            scrolled ? 'shadow-2xl border-white/[0.15]' : 'border-white/[0.1]'
          }`}
        >
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <BrandLogo size="md" variant="luxury" />
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-medium tracking-wide transition-all duration-200 ${
                    active
                      ? 'text-[#DFBA73] bg-[#DFBA73]/10 font-semibold shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA & Auth Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/predict"
              id="desktop-valuation-cta"
              className="btn-luxury-gold text-xs font-bold py-2 px-4 sm:px-5 rounded-full shadow-btn-gold"
            >
              <span>Get Property Valuation</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>

          {/* Mobile & Tablet Controls (< lg) */}
          <div className="flex items-center lg:hidden gap-2">
            <Link
              href="/predict"
              className="text-[11px] font-bold text-[#0A0D12] bg-gradient-to-r from-[#DFBA73] to-[#C5A880] px-3.5 py-1.5 rounded-full shadow-sm"
            >
              Valuation
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-neutral-300 hover:text-white bg-white/[0.05] border border-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]/50"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Glass Menu Drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[70px] bottom-0 z-40 bg-[#080A0E]/95 backdrop-blur-2xl px-5 py-6 transition-all duration-300 pointer-events-auto flex flex-col justify-between overflow-y-auto border-t border-white/[0.08] ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="space-y-2 pt-2">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#DFBA73] px-3 mb-2">
            Navigation
          </p>
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  active
                    ? 'text-[#DFBA73] bg-[#DFBA73]/10 font-bold border border-[#DFBA73]/20'
                    : 'text-neutral-200 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span>{link.name}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]" />}
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-white/[0.08] space-y-3 pb-8">
          <Link
            href="/predict"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full btn-luxury-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-btn-gold"
          >
            <span>Get Property Valuation</span>
            <ArrowRight size={16} />
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-luxury-outline py-3 rounded-xl text-xs font-semibold flex items-center justify-center"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-luxury-outline py-2.5 rounded-xl text-xs font-semibold text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl text-xs font-semibold text-center text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1]"
              >
                Register
              </Link>
            </div>
          )}

          <div className="text-center pt-2">
            <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">
              RealEstateIQ • Sri Lanka PropTech
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

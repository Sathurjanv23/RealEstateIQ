import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 60,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const currentSize = iconSizes[size];

  const logoSvg = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Bespoke Architectural Geometric Monogram */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
        style={{
          width: currentSize,
          height: currentSize,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          <defs>
            {/* Primary Gradient */}
            <linearGradient id="primaryArchGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#818cf8" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>

            {/* Accent Gold/Emerald Node */}
            <linearGradient id="iqNodeGrad" x1="28" y1="8" x2="38" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Tower / Pillar (representing Foundation) */}
          <path
            d="M10 40V18L20 10V40H10Z"
            fill="url(#primaryArchGrad)"
            opacity="0.9"
          />

          {/* Central Highrise Ascent (representing Growth) */}
          <path
            d="M20 40V10L30 4V40H20Z"
            fill="#ffffff"
            opacity="0.95"
          />

          {/* Dynamic Modern Glass Facade Slant (interlocking 'R' & 'IQ') */}
          <path
            d="M20 18L36 28V40H28V33L20 28V18Z"
            fill="url(#primaryArchGrad)"
          />

          {/* Architectural Window Slits */}
          <line x1="14" y1="22" x2="16" y2="22" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="27" x2="16" y2="27" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="32" x2="16" y2="32" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          
          <line x1="24" y1="14" x2="26" y2="14" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="20" x2="26" y2="20" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="26" x2="26" y2="26" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

          {/* The AI Intelligence Orbiting Beacon / Node ('IQ') */}
          <circle
            cx="36"
            cy="11"
            r="4.5"
            fill="url(#iqNodeGrad)"
            filter="url(#logoGlow)"
          />
          <circle cx="36" cy="11" r="2" fill="#ffffff" />
        </svg>

        {/* Ambient Ring */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-40 blur-sm pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(56,189,248,0.3))' }}
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
              RealEstate
            </span>
            <span
              className={`font-black tracking-tight ${textSizes[size]}`}
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              IQ
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
              LK
            </span>
          </div>
          {size !== 'sm' && (
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
              Sri Lanka Valuation & Intel
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {logoSvg}
      </Link>
    );
  }

  return logoSvg;
}

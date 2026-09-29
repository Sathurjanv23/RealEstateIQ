import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  href?: string;
  className?: string;
  inverted?: boolean;
  variant?: 'luxury' | 'emerald';
  mode?: 'emblem' | 'full';
}

export function BrandLogo({
  size = 'md',
  showText = true,
  showSubtitle = false,
  href = '/',
  className = '',
  inverted = false,
  variant = 'luxury',
  mode = 'emblem',
}: BrandLogoProps) {
  const iconSizes = {
    xs: 26,
    sm: 34,
    md: 42,
    lg: 54,
    xl: 70,
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const currentSize = iconSizes[size];
  const textColor = inverted ? 'text-[#17231C]' : 'text-white';
  const isLuxury = variant === 'luxury';
  const accentColor = isLuxury ? '#DFBA73' : '#00DC82';
  const accentBorder = isLuxury ? 'rgba(223, 186, 115, 0.4)' : 'rgba(0, 220, 130, 0.4)';
  const accentGlow = isLuxury
    ? '0 0 20px -2px rgba(223, 186, 115, 0.35)'
    : '0 0 18px -2px rgba(0, 220, 130, 0.3)';

  // Full Badge Mode (Displays full official branded emblem)
  if (mode === 'full') {
    const fullBadgeContent = (
      <div
        className={`flex flex-col items-center text-center p-3 rounded-2xl bg-[#090D14]/90 border border-[#DFBA73]/30 shadow-2xl transition-all duration-300 hover:border-[#DFBA73]/60 group ${className}`}
      >
        <div
          className="relative rounded-2xl overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-105"
          style={{
            width: currentSize * 2,
            height: currentSize * 2,
            boxShadow: accentGlow,
            border: `1.5px solid ${accentBorder}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="RealEstateIQ Brand Emblem"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center tracking-tight leading-none font-bold">
          <span className={`${textColor} ${textSizes[size]} font-extrabold tracking-tight`}>
            RealEstate
          </span>
          <span className={`${textSizes[size]} font-black ml-0.5`} style={{ color: accentColor }}>
            IQ
          </span>
          <span
            className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border backdrop-blur-md"
            style={{
              color: accentColor,
              backgroundColor: 'rgba(223, 186, 115, 0.12)',
              borderColor: 'rgba(223, 186, 115, 0.35)',
            }}
          >
            LK
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-neutral-400 mt-1 max-w-xs font-medium">
            Sri Lanka&apos;s AI-Powered Real Estate Valuation &amp; Market Intelligence Platform
          </p>
        )}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-flex focus:outline-none">
          {fullBadgeContent}
        </Link>
      );
    }
    return fullBadgeContent;
  }

  // Emblem Mode (Compact gold monogram emblem icon + typography)
  const emblemContent = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Golden 3D Monogram Emblem Icon */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(223,186,115,0.5)]"
        style={{
          width: currentSize,
          height: currentSize,
          backgroundColor: '#070A0F',
          border: `1.5px solid ${accentBorder}`,
          boxShadow: accentGlow,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="RealEstateIQ Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <div className="flex items-center tracking-tight font-bold">
            <span className={`${textColor} ${textSizes[size]} font-extrabold tracking-tight`}>
              RealEstate
            </span>
            <span
              className={`${textSizes[size]} font-black ml-0.5`}
              style={{ color: accentColor }}
            >
              IQ
            </span>
            <span
              className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border backdrop-blur-md"
              style={{
                color: accentColor,
                backgroundColor: isLuxury ? 'rgba(223, 186, 115, 0.12)' : 'rgba(0, 220, 130, 0.12)',
                borderColor: isLuxury ? 'rgba(223, 186, 115, 0.35)' : 'rgba(0, 220, 130, 0.35)',
              }}
            >
              LK
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[10px] text-neutral-400 font-medium tracking-wide mt-1">
              Sri Lanka Real Estate Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {emblemContent}
      </Link>
    );
  }

  return emblemContent;
}
export default BrandLogo;

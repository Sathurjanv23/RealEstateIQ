import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
  inverted?: boolean;
  variant?: 'luxury' | 'emerald';
}

export function BrandLogo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
  inverted = false,
  variant = 'luxury',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 46,
    xl: 58,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const currentSize = iconSizes[size];
  const textColor = inverted ? 'text-[#17231C]' : 'text-white';
  const isLuxury = variant === 'luxury';
  const accentColor = isLuxury ? '#DFBA73' : '#00DC82';
  const accentBorder = isLuxury ? 'rgba(223, 186, 115, 0.45)' : 'rgba(0, 220, 130, 0.4)';
  const accentGlow = isLuxury ? '0 0 18px -2px rgba(223, 186, 115, 0.3)' : '0 0 16px -2px rgba(0, 220, 130, 0.25)';
  const bgColor = isLuxury ? '#0E131C' : '#09211A';

  const logoSvg = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek IQ Monogram Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-300"
        style={{
          width: currentSize,
          height: currentSize,
          backgroundColor: bgColor,
          border: `1px solid ${accentBorder}`,
          boxShadow: accentGlow,
        }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Letter I / Pillar */}
          <rect x="7" y="9" width="4.5" height="18" rx="2.25" fill={accentColor} />
          
          {/* Letter Q / Orbiting Architectural Ring */}
          <path
            d="M20 9C15.58 9 12 12.58 12 17C12 21.42 15.58 25 20 25C24.42 25 28 21.42 28 17C28 12.58 24.42 9 20 9ZM20 21.5C17.51 21.5 15.5 19.49 15.5 17C15.5 14.51 17.51 12.5 20 12.5C22.49 12.5 24.5 14.51 24.5 17C24.5 19.49 22.49 21.5 20 21.5Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
          <path
            d="M23 21L27.5 26"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center tracking-tight leading-none font-bold">
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
              backgroundColor: isLuxury ? 'rgba(223, 186, 115, 0.1)' : 'rgba(0, 220, 130, 0.1)',
              borderColor: isLuxury ? 'rgba(223, 186, 115, 0.3)' : 'rgba(0, 220, 130, 0.3)',
            }}
          >
            LK
          </span>
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

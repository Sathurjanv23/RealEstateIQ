import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  href: string;
  label?: string;
  variant?: 'primary' | 'card' | 'compact' | 'outline';
  className?: string;
  sublabel?: string;
}

export function WhatsAppIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.61 20.16 9.21 19.78 7.99 19.06L7.7 18.89L4.62 19.7L5.45 16.69L5.26 16.39C4.46 15.11 4.04 13.53 4.04 11.92C4.04 7.37 7.74 3.67 12.04 3.67ZM8.73 7.34C8.54 7.34 8.23 7.41 7.97 7.69C7.72 7.97 7 8.65 7 10.02C7 11.39 8 12.71 8.14 12.9C8.28 13.09 10.1 15.9 12.89 17.1C13.56 17.39 14.07 17.56 14.48 17.69C15.15 17.9 15.76 17.87 16.24 17.8C16.78 17.72 17.9 17.12 18.13 16.47C18.36 15.82 18.36 15.26 18.29 15.15C18.22 15.03 18.03 14.96 17.75 14.82C17.47 14.68 16.1 14 15.84 13.91C15.58 13.82 15.4 13.77 15.21 14.05C15.02 14.33 14.5 14.96 14.34 15.15C14.18 15.34 14.02 15.36 13.74 15.22C13.46 15.08 12.56 14.79 11.49 13.84C10.66 13.1 10.1 12.19 9.94 11.91C9.78 11.63 9.92 11.48 10.06 11.34C10.19 11.21 10.35 11 10.49 10.84C10.63 10.68 10.68 10.56 10.77 10.38C10.86 10.19 10.82 10.03 10.75 9.89C10.68 9.75 10.12 8.38 9.88 7.82C9.65 7.27 9.42 7.35 9.25 7.34C9.09 7.34 8.9 7.34 8.73 7.34Z" />
    </svg>
  );
}

export function WhatsAppButton({
  href,
  label = '1-Click WhatsApp Inquiry',
  variant = 'primary',
  className = '',
  sublabel,
}: WhatsAppButtonProps) {
  if (variant === 'compact') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BD5A] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] ${className}`}
        title="Open 1-Click WhatsApp Chat"
      >
        <WhatsAppIcon size={14} />
        <span>WhatsApp</span>
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] hover:text-black transition-all ${className}`}
        title="1-Click WhatsApp Inquiry"
      >
        <WhatsAppIcon size={12} />
        <span>WhatsApp</span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/40 hover:bg-[#25D366] hover:text-black transition-all shadow-sm ${className}`}
      >
        <WhatsAppIcon size={16} />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#25D366] to-[#20BA56] hover:from-[#20BD5A] hover:to-[#1DA850] shadow-lg shadow-[#25D366]/25 hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 group ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
        <WhatsAppIcon size={15} className="text-black group-hover:scale-110 transition-transform" />
      </div>
      <div className="text-left">
        <div className="leading-tight">{label}</div>
        {sublabel && (
          <div className="text-[10px] font-medium text-black/75 tracking-tight">{sublabel}</div>
        )}
      </div>
    </a>
  );
}

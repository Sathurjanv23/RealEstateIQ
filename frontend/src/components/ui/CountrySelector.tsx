import React, { useState, useRef, useEffect } from 'react';
import { Globe2, ChevronDown, Check } from 'lucide-react';
import { useCountry } from '../../context/CountryContext';

interface CountrySelectorProps {
  variant?: 'pill' | 'compact';
}

export function CountrySelector({ variant = 'pill' }: CountrySelectorProps) {
  const { country, setCountry, currentCountry, allCountries } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Country & Jurisdiction"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          isOpen
            ? 'bg-[#DFBA73]/20 border-[#DFBA73] text-[#DFBA73]'
            : 'bg-[#0B1522]/80 hover:bg-[#122338] border-white/[0.1] hover:border-[#DFBA73]/40 text-neutral-300'
        }`}
        title={`Current Region: ${currentCountry.name} (${currentCountry.tamilName})`}
      >
        <span className="text-sm">{currentCountry.flag}</span>
        <span className="hidden sm:inline font-semibold">{currentCountry.name}</span>
        <span className="sm:hidden font-semibold">{currentCountry.code}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-180 text-[#DFBA73]' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B1522]/95 border border-[#DFBA73]/30 backdrop-blur-xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-white/[0.08] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#DFBA73]">
              Country & Jurisdiction
            </p>
            <p className="text-[11px] text-neutral-400">நாடு & சட்ட ஒழுங்குமுறை</p>
          </div>
          <div className="space-y-1">
            {allCountries.map((c) => {
              const isActive = c.code === country;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountry(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isActive
                      ? 'bg-[#DFBA73]/15 text-[#DFBA73] font-bold border border-[#DFBA73]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{c.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-[10px] text-neutral-400">
                        {c.defaultCurrency} · {c.defaultUnit}
                      </span>
                    </div>
                  </div>
                  {isActive && <Check size={14} className="text-[#DFBA73] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

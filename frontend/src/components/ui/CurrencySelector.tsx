import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';

export function CurrencySelector() {
  const { currency, setCurrency, currentConfig, allCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-[#DFBA73]/50 text-neutral-200 hover:text-white text-xs font-semibold transition-all group"
        title="Change Global Currency (LKR, USD, GBP, AUD, AED...)"
      >
        <span className="text-sm leading-none">{currentConfig.flag}</span>
        <span className="font-bold text-white group-hover:text-[#DFBA73] transition-colors">
          {currentConfig.code}
        </span>
        <ChevronDown
          size={13}
          className={`text-neutral-400 group-hover:text-[#DFBA73] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#DFBA73]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B101B]/95 border border-[#DFBA73]/30 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DFBA73] uppercase tracking-wider">
              <Globe size={13} /> Global Currency
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Live valuation rates for expats & investors
            </p>
          </div>

          <div className="p-1.5 max-h-64 overflow-y-auto space-y-0.5">
            {allCurrencies.map((c) => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-[#DFBA73]/15 text-[#DFBA73] font-bold border border-[#DFBA73]/30'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{c.flag}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{c.code}</span>
                        <span className="text-[10px] text-neutral-400">({c.symbol})</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block leading-tight">
                        {c.name}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="text-[#DFBA73] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-white/[0.08] bg-black/40 text-[9px] text-neutral-500 text-center">
            Rates approximate against Central Bank LKR
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, currentLanguage, allLanguages } = useLanguage();
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
        aria-label="Select Language"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          isOpen
            ? 'bg-[#DFBA73]/20 border-[#DFBA73] text-[#DFBA73]'
            : 'bg-[#0B1522]/80 hover:bg-[#122338] border-white/[0.1] hover:border-[#DFBA73]/40 text-neutral-300'
        }`}
        title={`Language: ${currentLanguage.nativeLabel}`}
      >
        <Languages size={13} className="text-[#DFBA73]" />
        <span className="font-semibold">{currentLanguage.nativeLabel}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-180 text-[#DFBA73]' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0B1522]/95 border border-[#DFBA73]/30 backdrop-blur-xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-white/[0.08] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#DFBA73]">
              Interface Language
            </p>
            <p className="text-[10px] text-neutral-400">மொழி தேர்வு</p>
          </div>
          <div className="space-y-1">
            {allLanguages.map((l) => {
              const isActive = l.code === language;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isActive
                      ? 'bg-[#DFBA73]/15 text-[#DFBA73] font-bold border border-[#DFBA73]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{l.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{l.nativeLabel}</span>
                      <span className="text-[10px] text-neutral-400">{l.label}</span>
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

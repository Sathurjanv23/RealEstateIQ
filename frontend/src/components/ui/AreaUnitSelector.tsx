import React, { useState, useRef, useEffect } from 'react';
import { Ruler, ChevronDown, Check } from 'lucide-react';
import { useAreaUnit, AreaUnit, AREA_UNITS } from '../../context/UnitContext';

interface AreaUnitSelectorProps {
  variant?: 'pill' | 'compact' | 'inline';
}

export function AreaUnitSelector({ variant = 'pill' }: AreaUnitSelectorProps) {
  const { unit, setUnit, allUnits, currentConfig } = useAreaUnit();
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

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center rounded-xl bg-[#090D14] border border-white/[0.08] p-1 gap-1">
        {allUnits.map((u) => {
          const isActive = u.code === unit;
          return (
            <button
              key={u.code}
              type="button"
              onClick={() => setUnit(u.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#050B10] shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title={`${u.label} (${u.tamilLabel})`}
            >
              {u.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Area Measurement Unit"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold ${
          isOpen
            ? 'bg-[#DFBA73]/20 border-[#DFBA73] text-[#DFBA73]'
            : 'bg-[#0B1522]/80 hover:bg-[#122338] border-white/[0.1] hover:border-[#DFBA73]/40 text-neutral-300'
        }`}
      >
        <Ruler size={13} className="text-[#DFBA73]" />
        <span className="font-semibold uppercase tracking-wider">{currentConfig.shortLabel}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-180 text-[#DFBA73]' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0B1522]/95 border border-[#DFBA73]/30 backdrop-blur-xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-white/[0.08] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#DFBA73]">
              Measurement Unit
            </p>
            <p className="text-[11px] text-neutral-400">நில அளவீட்டு அலகு</p>
          </div>
          <div className="space-y-1">
            {allUnits.map((u) => {
              const isActive = u.code === unit;
              return (
                <button
                  key={u.code}
                  type="button"
                  onClick={() => {
                    setUnit(u.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isActive
                      ? 'bg-[#DFBA73]/15 text-[#DFBA73] font-bold border border-[#DFBA73]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{u.label}</span>
                    <span className="text-[10px] text-neutral-400">{u.tamilLabel}</span>
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

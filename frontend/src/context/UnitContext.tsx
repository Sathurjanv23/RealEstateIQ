import React, { createContext, useContext, useState, useEffect } from 'react';

export type AreaUnit = 'sqft' | 'perch' | 'acre' | 'sqm';

export interface AreaUnitConfig {
  code: AreaUnit;
  label: string;
  shortLabel: string;
  tamilLabel: string;
  ratioFromSqft: number; // 1 unit = ratioFromSqft sqft
  precision: number;
}

export const AREA_UNITS: Record<AreaUnit, AreaUnitConfig> = {
  sqft: {
    code: 'sqft',
    label: 'Square Feet',
    shortLabel: 'sqft',
    tamilLabel: 'சதுர அடி',
    ratioFromSqft: 1,
    precision: 0,
  },
  perch: {
    code: 'perch',
    label: 'Perches (பேர்ச்)',
    shortLabel: 'perches',
    tamilLabel: 'பேர்ச்',
    ratioFromSqft: 272.25,
    precision: 2,
  },
  acre: {
    code: 'acre',
    label: 'Acres (ஏக்கர்)',
    shortLabel: 'acres',
    tamilLabel: 'ஏக்கர்',
    ratioFromSqft: 43560,
    precision: 3,
  },
  sqm: {
    code: 'sqm',
    label: 'Square Meters',
    shortLabel: 'sq.m',
    tamilLabel: 'சதுர மீ',
    ratioFromSqft: 10.7639,
    precision: 1,
  },
};

interface UnitContextType {
  unit: AreaUnit;
  setUnit: (u: AreaUnit) => void;
  convertArea: (areaSqft: number, targetUnit?: AreaUnit) => number;
  formatArea: (areaSqft: number | undefined | null, options?: { targetUnit?: AreaUnit; showUnit?: boolean }) => string;
  currentConfig: AreaUnitConfig;
  allUnits: AreaUnitConfig[];
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<AreaUnit>('sqft');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realestateiq_area_unit') as AreaUnit;
      if (saved && AREA_UNITS[saved]) {
        setUnitState(saved);
      }
    }
  }, []);

  const setUnit = (newUnit: AreaUnit) => {
    if (AREA_UNITS[newUnit]) {
      setUnitState(newUnit);
      if (typeof window !== 'undefined') {
        localStorage.setItem('realestateiq_area_unit', newUnit);
      }
    }
  };

  const convertArea = (areaSqft: number, targetUnit?: AreaUnit): number => {
    if (!areaSqft || isNaN(areaSqft)) return 0;
    const u = targetUnit || unit;
    const config = AREA_UNITS[u];
    const converted = areaSqft / config.ratioFromSqft;
    return Number(converted.toFixed(config.precision));
  };

  const formatArea = (
    areaSqft: number | undefined | null,
    options?: { targetUnit?: AreaUnit; showUnit?: boolean }
  ): string => {
    if (areaSqft === undefined || areaSqft === null || isNaN(areaSqft) || areaSqft <= 0) {
      return 'N/A';
    }
    const u = options?.targetUnit || unit;
    const config = AREA_UNITS[u];
    const converted = areaSqft / config.ratioFromSqft;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: config.precision > 0 ? (converted < 10 ? config.precision : 1) : 0,
      maximumFractionDigits: config.precision,
    });

    if (options?.showUnit === false) return formatted;
    return `${formatted} ${config.shortLabel}`;
  };

  const currentConfig = AREA_UNITS[unit];
  const allUnits = Object.values(AREA_UNITS);

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        convertArea,
        formatArea,
        currentConfig,
        allUnits,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useAreaUnit(): UnitContextType {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useAreaUnit must be used within a UnitProvider');
  }
  return context;
}

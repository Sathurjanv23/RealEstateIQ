import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'LKR' | 'USD' | 'GBP' | 'AUD' | 'CAD' | 'AED' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateToLkr: number; // 1 Unit of this currency = X LKR
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', flag: '🇱🇰', rateToLkr: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToLkr: 305 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToLkr: 395 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToLkr: 330 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateToLkr: 200 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', rateToLkr: 222 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToLkr: 83 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountLkr: number | undefined | null, options?: { compact?: boolean }) => string;
  convertPrice: (amountLkr: number) => number;
  currentConfig: CurrencyConfig;
  allCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('LKR');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realestateiq_currency') as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('realestateiq_currency', code);
      }
    }
  };

  const convertPrice = (amountLkr: number): number => {
    if (!amountLkr || isNaN(amountLkr)) return 0;
    const config = CURRENCIES[currency];
    return Math.round(amountLkr / config.rateToLkr);
  };

  const formatPrice = (
    amountLkr: number | undefined | null,
    options?: { compact?: boolean }
  ): string => {
    if (amountLkr === undefined || amountLkr === null || isNaN(amountLkr)) {
      return 'Price on Inquiry';
    }

    const config = CURRENCIES[currency];
    const converted = amountLkr / config.rateToLkr;

    if (options?.compact) {
      if (currency === 'LKR') {
        if (converted >= 10000000) return `Rs. ${(converted / 10000000).toFixed(2)} Cr`;
        if (converted >= 1000000) return `Rs. ${(converted / 1000000).toFixed(1)}M`;
        if (converted >= 1000) return `Rs. ${(converted / 1000).toFixed(0)}K`;
      } else {
        if (converted >= 1000000) return `${config.symbol}${(converted / 1000000).toFixed(2)}M`;
        if (converted >= 1000) return `${config.symbol}${(converted / 1000).toFixed(0)}K`;
      }
    }

    const formattedNumber = Math.round(converted).toLocaleString();
    if (currency === 'LKR') {
      return `Rs. ${formattedNumber}`;
    }
    if (currency === 'AED') {
      return `AED ${formattedNumber}`;
    }
    return `${config.symbol}${formattedNumber}`;
  };

  const currentConfig = CURRENCIES[currency];
  const allCurrencies = Object.values(CURRENCIES);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentConfig,
        allCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

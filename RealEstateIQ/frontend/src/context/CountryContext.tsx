import React, { createContext, useContext, useState, useEffect } from 'react';
import { CountryCode, CountryConfig, COUNTRIES } from '../utils/countryConfig';
import { useCurrency } from './CurrencyContext';
import { useAreaUnit } from './UnitContext';

interface CountryContextType {
  country: CountryCode;
  setCountry: (code: CountryCode) => void;
  currentCountry: CountryConfig;
  allCountries: CountryConfig[];
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>('LK');
  const { setCurrency } = useCurrency();
  const { setUnit } = useAreaUnit();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realestateiq_country') as CountryCode;
      if (saved && COUNTRIES[saved]) {
        setCountryState(saved);
      }
    }
  }, []);

  const setCountry = (code: CountryCode) => {
    if (COUNTRIES[code]) {
      setCountryState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('realestateiq_country', code);
      }
      // Automatically synchronize currency & land measurement unit for the selected country
      const config = COUNTRIES[code];
      try {
        setCurrency(config.defaultCurrency);
        setUnit(config.defaultUnit);
      } catch (err) {
        console.warn('Sync currency/unit error:', err);
      }
    }
  };

  const currentCountry = COUNTRIES[country] || COUNTRIES.LK;
  const allCountries = Object.values(COUNTRIES);

  return (
    <CountryContext.Provider
      value={{
        country,
        setCountry,
        currentCountry,
        allCountries,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): CountryContextType {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}

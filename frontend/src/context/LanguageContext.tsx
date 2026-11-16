import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, LanguageConfig, LANGUAGES, TRANSLATIONS } from '../utils/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguage: LanguageConfig;
  allLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realestateiq_lang') as LanguageCode;
      if (saved && LANGUAGES[saved]) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (LANGUAGES[lang]) {
      setLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('realestateiq_lang', lang);
      }
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    const enDict = TRANSLATIONS.en;
    if (enDict[key]) return enDict[key];
    return fallback || key;
  };

  const currentLanguage = LANGUAGES[language] || LANGUAGES.en;
  const allLanguages = Object.values(LANGUAGES);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguage,
        allLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

import { CurrencyCode } from '../context/CurrencyContext';
import { AreaUnit } from '../context/UnitContext';

export type CountryCode = 'LK' | 'US' | 'GB' | 'AE' | 'AU';

export interface CountryTaxConfig {
  transferTaxName: string;
  transferTaxTamil: string;
  transferTaxRate: number; // e.g. 0.04 = 4%
  isTieredStampDuty?: boolean;
  legalFeeRate: number; // e.g. 0.012 = 1.2%
  fixedTitleSearchFeeLkr: number;
  municipalRateTaxRate: number; // e.g. 0.005
  capitalGainsRate: string;
  summary: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  tamilName: string;
  sinhalaName: string;
  flag: string;
  defaultCurrency: CurrencyCode;
  defaultUnit: AreaUnit;
  supportedUnits: AreaUnit[];
  legalSystem: string;
  registryAuthority: string;
  tax: CountryTaxConfig;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  LK: {
    code: 'LK',
    name: 'Sri Lanka',
    tamilName: 'இலங்கை',
    sinhalaName: 'ශ්‍රී ලංකාව',
    flag: '🇱🇰',
    defaultCurrency: 'LKR',
    defaultUnit: 'perch',
    supportedUnits: ['perch', 'sqft', 'acre'],
    legalSystem: 'Roman-Dutch & English Common Law with Bim Saviya Title Registration',
    registryAuthority: 'Land Registry / Registrar General Department',
    tax: {
      transferTaxName: 'Provincial Stamp Duty (மாகாண முத்திரை வரி)',
      transferTaxTamil: 'மாகாண முத்திரை வரி (3% முதல் ரூ. 100K + 4% மீதி)',
      transferTaxRate: 0.04,
      isTieredStampDuty: true,
      legalFeeRate: 0.012,
      fixedTitleSearchFeeLkr: 25000,
      municipalRateTaxRate: 0.005,
      capitalGainsRate: '10% Investment Asset Tax',
      summary: '3% on first Rs. 100,000 + 4% on balance to Provincial Council. 1.2% Notary conveyancing.',
    },
  },
  US: {
    code: 'US',
    name: 'United States',
    tamilName: 'அமெரிக்கா',
    sinhalaName: 'ඇමරිකා එක්සත් ජනපදය',
    flag: '🇺🇸',
    defaultCurrency: 'USD',
    defaultUnit: 'sqft',
    supportedUnits: ['sqft', 'acre', 'sqm'],
    legalSystem: 'Common Law with Title Insurance & Escrow Settlement',
    registryAuthority: 'County Recorder of Deeds / Title Companies',
    tax: {
      transferTaxName: 'State & County Real Estate Transfer Tax',
      transferTaxTamil: 'மாநில & கவுண்டி பரிமாற்ற வரி (1.5%)',
      transferTaxRate: 0.015,
      legalFeeRate: 0.008, // Attorney/Escrow fee
      fixedTitleSearchFeeLkr: 45000, // Title insurance & search (~$150)
      municipalRateTaxRate: 0.012, // Property tax escrow
      capitalGainsRate: '15%–20% Long-term Capital Gains',
      summary: '1.5% State/County Transfer Tax + 0.8% Escrow & Title insurance closing fees.',
    },
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    tamilName: 'ஐக்கிய இராச்சியம்',
    sinhalaName: 'එක්සත් රාජධානිය',
    flag: '🇬🇧',
    defaultCurrency: 'GBP',
    defaultUnit: 'sqft',
    supportedUnits: ['sqft', 'sqm', 'acre'],
    legalSystem: 'English Common Law with HM Land Registry Title Guarantee',
    registryAuthority: 'HM Land Registry (HMLR)',
    tax: {
      transferTaxName: 'Stamp Duty Land Tax (SDLT)',
      transferTaxTamil: 'பிரிட்டிஷ் நில முத்திரை வரி (SDLT 3-5%)',
      transferTaxRate: 0.035,
      legalFeeRate: 0.01, // Solicitor conveyancing
      fixedTitleSearchFeeLkr: 60000, // Local authority & drainage searches (~£150)
      municipalRateTaxRate: 0.004,
      capitalGainsRate: '18%–24% Residential CGT',
      summary: 'Tiered Stamp Duty Land Tax (SDLT 2% to 12% by threshold) + Solicitor conveyancing.',
    },
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates (Dubai)',
    tamilName: 'ஐக்கிய அரபு அமீரகம்',
    sinhalaName: 'එක්සත් අරාබි එමීර් රාජ්‍යය',
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    defaultUnit: 'sqft',
    supportedUnits: ['sqft', 'sqm'],
    legalSystem: 'Civil Code & DIFC Common Law with DLD Blockchain Title Deed',
    registryAuthority: 'Dubai Land Department (DLD) & Oqood',
    tax: {
      transferTaxName: 'Dubai Land Department (DLD) Transfer Fee',
      transferTaxTamil: 'துபாய் நிலத்துறை DLD பரிமாற்ற கட்டணம் (4%)',
      transferTaxRate: 0.04,
      legalFeeRate: 0.005,
      fixedTitleSearchFeeLkr: 120000, // Registration trustee fee (~AED 4,000)
      municipalRateTaxRate: 0.005, // Dubai Municipality housing fee
      capitalGainsRate: '0% Tax-Free Investment Corridor',
      summary: '4% DLD Transfer Fee + AED 4,000 Trustee registration fee. 0% Personal Capital Gains Tax.',
    },
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    tamilName: 'ஆஸ்திரேலியா',
    sinhalaName: 'ඕස්ට්‍රේලියාව',
    flag: '🇦🇺',
    defaultCurrency: 'AUD',
    defaultUnit: 'sqm',
    supportedUnits: ['sqm', 'sqft', 'acre'],
    legalSystem: 'Torrens Title System with State Land Titles Office Guarantee',
    registryAuthority: 'State Land Titles Office (NSW / VIC / QLD LTO)',
    tax: {
      transferTaxName: 'State Stamp Duty & Transfer Registration',
      transferTaxTamil: 'மாநில முத்திரை வரி & பதிவு கட்டணம் (4%)',
      transferTaxRate: 0.042,
      legalFeeRate: 0.009, // Conveyancer fees
      fixedTitleSearchFeeLkr: 50000, // Title search & council certs (~A$250)
      municipalRateTaxRate: 0.006, // Council rates
      capitalGainsRate: '50% CGT Discount for Resident Owners',
      summary: 'State Transfer Duty (approx 4.2% average) + Licensed Conveyancer protocol fees.',
    },
  },
};

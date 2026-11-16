export type LanguageCode = 'en' | 'ta' | 'si';

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  ta: { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇱🇰' },
  si: { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', flag: '🇱🇰' },
};

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    navHome: 'Home',
    navProperties: 'Properties',
    navValuation: 'AI Valuation',
    navMarket: 'Market Intelligence',
    navAbout: 'About',
    navDashboard: 'Dashboard',
    navSignIn: 'Sign In',
    navRegister: 'Register',
    btnValuation: 'Get Property Valuation',
    btnBrowse: 'Browse Properties',

    // Marketplace & Tabs
    tabAllInventory: 'All Inventory',
    tabBuy: 'Buy / For Sale',
    tabRent: 'Rent / For Lease 🔑',
    lblAskingPrice: 'Asking Price',
    lblMonthlyRent: 'Monthly Rental',
    lblPerMonth: '/ mo',
    badgeRent: 'For Rent',
    badgeSale: 'For Sale',

    // Property Actions
    btnMakeOffer: 'Make an Offer',
    btnApplyRent: 'Apply for Tenancy',
    btnScheduleViewing: 'Schedule Viewing',
    btnCompare: 'Compare',
    btnSave: 'Save',
    btnSaved: 'Saved',
    btnShare: 'Share',
    btnDownloadCert: 'Valuation Certificate',

    // Tools
    toolHiddenCostTitle: 'Hidden Cost Detector™',
    toolHiddenCostSubtitle: 'Calculate mandatory legal taxes, stamp duty and closing fees.',
    toolNeighborhoodScoreTitle: 'AI Neighborhood Quality Score™',
    toolPriceWatch: 'Price Watch',
    toolMortgageCalc: 'Mortgage & Home Loan EMI Calculator',

    // Selectors
    lblLanguage: 'Language',
    lblCountry: 'Country / Jurisdiction',
    lblCurrency: 'Currency',
    lblUnits: 'Measurement Unit',
  },
  ta: {
    // Navigation
    navHome: 'முகப்பு',
    navProperties: 'சொத்துக்கள்',
    navValuation: 'AI மதிப்பீடு',
    navMarket: 'சந்தை நுண்ணறிவு',
    navAbout: 'எங்களை பற்றி',
    navDashboard: 'கட்டுப்பாட்டகம்',
    navSignIn: 'உள்நுழைக',
    navRegister: 'பதிவு செய்க',
    btnValuation: 'சொத்து மதிப்பீடு பெறுக',
    btnBrowse: 'சொத்துக்களைக் காண்க',

    // Marketplace & Tabs
    tabAllInventory: 'அனைத்து சொத்துக்கள்',
    tabBuy: 'வாங்க / விற்பனைக்கு',
    tabRent: 'வாடகைக்கு / குத்தகைக்கு 🔑',
    lblAskingPrice: 'கேட்கப்படும் விலை',
    lblMonthlyRent: 'மாத வாடகை',
    lblPerMonth: '/ மாதம்',
    badgeRent: 'வாடகைக்கு',
    badgeSale: 'விற்பனைக்கு',

    // Property Actions
    btnMakeOffer: 'விலை ஆஃபர் தருக',
    btnApplyRent: 'வாடகைக்கு விண்ணப்பிக்க',
    btnScheduleViewing: 'நேரில் பார்க்க முன்பதிவு',
    btnCompare: 'ஒப்பிடுக',
    btnSave: 'சேமிக்க',
    btnSaved: 'சேமிக்கப்பட்டது',
    btnShare: 'பகிர்க',
    btnDownloadCert: 'மதிப்பீட்டு சான்றிதழ்',

    // Tools
    toolHiddenCostTitle: 'மறைமுகச் செலவு கால்குலேட்டர்™',
    toolHiddenCostSubtitle: 'முத்திரை வரி, நோட்டரி கட்டணம், சட்டச் செலவுகளைத் துல்லியமாகக் கணக்கிடுக.',
    toolNeighborhoodScoreTitle: 'AI பகுதி வாழ்க்கைத்தர மதிப்பீடு™',
    toolPriceWatch: 'விலை மாற்ற எச்சரிக்கை',
    toolMortgageCalc: 'வங்கி வீட்டுக் கடன் EMI கால்குலேட்டர்',

    // Selectors
    lblLanguage: 'மொழி',
    lblCountry: 'நாடு / பிராந்தியம்',
    lblCurrency: 'நாணயம்',
    lblUnits: 'நில அளவீட்டு அலகு',
  },
  si: {
    // Navigation
    navHome: 'මුල් පිටුව',
    navProperties: 'දේපළ',
    navValuation: 'AI තක්සේරුව',
    navMarket: 'වෙළඳපල බුද්ධිය',
    navAbout: 'අප ගැන',
    navDashboard: 'පාලක පුවරුව',
    navSignIn: 'ඇතුල් වන්න',
    navRegister: 'ලියාපදිංචි වන්න',
    btnValuation: 'දේපළ තක්සේරුව ලබාගන්න',
    btnBrowse: 'දේපළ සොයන්න',

    // Marketplace & Tabs
    tabAllInventory: 'සියලු දේපළ',
    tabBuy: 'මිලදී ගැනීමට',
    tabRent: 'කුලියට දීමට 🔑',
    lblAskingPrice: 'අපේක්ෂිත මිල',
    lblMonthlyRent: 'මාසික කුලිය',
    lblPerMonth: '/ මසකට',
    badgeRent: 'කුලියට',
    badgeSale: 'විකිණීමට',

    // Property Actions
    btnMakeOffer: 'මිල යෝජනාවක් ඉදිරිපත් කරන්න',
    btnApplyRent: 'කුලියට අයදුම් කරන්න',
    btnScheduleViewing: 'නැරඹීමට දිනයක් වෙන්කරන්න',
    btnCompare: 'සංසන්දනය',
    btnSave: 'සුරකින්න',
    btnSaved: 'සුරකින ලදි',
    btnShare: 'බෙදාහරින්න',
    btnDownloadCert: 'තක්සේරු සහතිකය',

    // Tools
    toolHiddenCostTitle: 'සැඟවුණු පිරිවැය අනාවරකය™',
    toolHiddenCostSubtitle: 'මුද්දර ගාස්තු, නොතාරිස් ගාස්තු සහ නීතිමය වියදම් ගණනය කරන්න.',
    toolNeighborhoodScoreTitle: 'AI ප්‍රදේශ ජීවන තත්ත්ව ලකුණු™',
    toolPriceWatch: 'මිල නිරීක්ෂණය',
    toolMortgageCalc: 'නිවාස ණය මාසික වාරික කැල්කියුලේටරය',

    // Selectors
    lblLanguage: 'භාෂාව',
    lblCountry: 'රට / කලාපය',
    lblCurrency: 'මුදල් වර්ගය',
    lblUnits: 'ඉඩම් මිනුම් ඒකකය',
  },
};

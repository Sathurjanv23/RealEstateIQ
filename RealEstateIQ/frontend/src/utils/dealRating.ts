/**
 * RealEstateIQ Deal Rating & Fair-Value Evaluator
 * Compares Seller's Asking Price against ML Model Estimated Fair Market Value
 * to empower buyers and investors with transparent deal intelligence.
 */

export type DealRatingType =
  | 'GREAT_DEAL'
  | 'GOOD_VALUE'
  | 'FAIR_MARKET'
  | 'PREMIUM'
  | 'OVERPRICED';

export interface DealRatingResult {
  rating: DealRatingType;
  label: string;
  shortLabel: string;
  badgeClass: string;
  borderClass: string;
  iconType: 'flame' | 'trendingDown' | 'scale' | 'alertCircle' | 'alertTriangle';
  percentageDiff: number; // e.g. -12.5 means 12.5% below market
  differenceLkr: number; // asking - estimated
  explanation: string;
  recommendation: string;
}

// Approximate baseline price per sqft by district if ML estimate not yet fetched
const DISTRICT_RATES: Record<string, number> = {
  Colombo: 42000,
  Gampaha: 21000,
  Kalutara: 17500,
  Kandy: 23000,
  Matale: 14000,
  'Nuwara Eliya': 19000,
  Galle: 25000,
  Matara: 17000,
  Hambantota: 12500,
  Jaffna: 18500,
  Kilinochchi: 9500,
  Mannar: 9000,
  Vavuniya: 11000,
  Mullativu: 8500,
  Trincomalee: 14500,
  Batticaloa: 13500,
  Ampara: 10500,
  Kurunegala: 15500,
  Puttalam: 12000,
  Anuradhapura: 13000,
  Polonnaruwa: 11500,
  Badulla: 14000,
  Monaragala: 9000,
  Ratnapura: 13500,
  Kegalle: 14500,
  Negombo: 22500,
};

/**
 * Fast local heuristic estimator when ML API estimate is still loading
 */
export function estimatePropertyFairValue(property: {
  area: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  houseAge?: number;
}): number {
  const rate = DISTRICT_RATES[property.location] || 18000;
  let val = property.area * rate;

  // Small adjustments for beds/baths/age
  if (property.bedrooms) val += (property.bedrooms - 3) * 600000;
  if (property.bathrooms) val += (property.bathrooms - 2) * 800000;
  if (property.houseAge) val -= Math.min(25, property.houseAge) * 150000;

  return Math.max(2500000, Math.round(val));
}

/**
 * Evaluate Deal Quality by comparing Asking Price with Estimated Fair Value
 */
export function calculateDealRating(
  askingPrice: number,
  estimatedPrice: number
): DealRatingResult {
  if (!askingPrice || !estimatedPrice || estimatedPrice <= 0) {
    return {
      rating: 'FAIR_MARKET',
      label: 'Fair Market Price',
      shortLabel: 'Market Rate',
      badgeClass: 'bg-[#DFBA73]/15 text-[#DFBA73] border-[#DFBA73]/30',
      borderClass: 'border-[#DFBA73]/30',
      iconType: 'scale',
      percentageDiff: 0,
      differenceLkr: 0,
      explanation: 'Price aligns with prevailing Sri Lankan market benchmark rates.',
      recommendation: 'Standard market transaction terms apply.',
    };
  }

  const diffLkr = askingPrice - estimatedPrice;
  const pct = Math.round((diffLkr / estimatedPrice) * 1000) / 10; // 1 decimal place

  // Case 1: Great Deal (Asking is 10%+ below ML value)
  if (pct <= -10) {
    return {
      rating: 'GREAT_DEAL',
      label: `Great Deal — ${Math.abs(pct)}% Under Market`,
      shortLabel: `🔥 ${Math.abs(pct)}% Below Market`,
      badgeClass: 'bg-[#00DC82]/15 text-[#00DC82] border-[#00DC82]/40',
      borderClass: 'border-[#00DC82]/50',
      iconType: 'flame',
      percentageDiff: pct,
      differenceLkr: diffLkr,
      explanation: `Asking price is Rs. ${Math.abs(Math.round(diffLkr)).toLocaleString()} below ML fair market appraisal. Strong equity upside upon acquisition.`,
      recommendation: 'High-conviction acquisition opportunity. Quick viewing recommended before seller revises pricing.',
    };
  }

  // Case 2: Good Value (Asking is 3% to 10% below ML value)
  if (pct <= -3) {
    return {
      rating: 'GOOD_VALUE',
      label: `Good Value — ${Math.abs(pct)}% Below Market`,
      shortLabel: `✨ ${Math.abs(pct)}% Below`,
      badgeClass: 'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/40',
      borderClass: 'border-[#14B8A6]/40',
      iconType: 'trendingDown',
      percentageDiff: pct,
      differenceLkr: diffLkr,
      explanation: `Asking price is attractive, sitting Rs. ${Math.abs(Math.round(diffLkr)).toLocaleString()} below expected district median.`,
      recommendation: 'Competitive price point. Offers solid purchasing value with minimal downside risk.',
    };
  }

  // Case 3: Fair Market Price (Within -3% to +5%)
  if (pct <= 5) {
    return {
      rating: 'FAIR_MARKET',
      label: 'Fair Market Valuation',
      shortLabel: '⚖️ Fair Price',
      badgeClass: 'bg-[#DFBA73]/15 text-[#DFBA73] border-[#DFBA73]/40',
      borderClass: 'border-[#DFBA73]/40',
      iconType: 'scale',
      percentageDiff: pct,
      differenceLkr: diffLkr,
      explanation: `Asking price closely matches the ML valuation of Rs. ${Math.round(estimatedPrice).toLocaleString()} (deviation of ${pct >= 0 ? '+' : ''}${pct}%).`,
      recommendation: 'Fairly priced relative to comparable asset specs. Standard negotiation of 2-5% recommended.',
    };
  }

  // Case 4: Premium Asking (+5% to +15%)
  if (pct <= 15) {
    return {
      rating: 'PREMIUM',
      label: `Premium Asking — +${pct}% Above Valuation`,
      shortLabel: `⚠️ +${pct}% Premium`,
      badgeClass: 'bg-[#FB923C]/15 text-[#FB923C] border-[#FB923C]/40',
      borderClass: 'border-[#FB923C]/40',
      iconType: 'alertCircle',
      percentageDiff: pct,
      differenceLkr: diffLkr,
      explanation: `Seller is asking Rs. ${Math.round(diffLkr).toLocaleString()} (+${pct}%) above algorithmic fair valuation. May reflect architectural finishes or aspirational seller pricing.`,
      recommendation: 'Buyers should leverage the ML Valuation Certificate to negotiate down towards the fair market baseline.',
    };
  }

  // Case 5: Significantly Overpriced (> +15%)
  return {
    rating: 'OVERPRICED',
    label: `Overpriced — +${pct}% Above Market`,
    shortLabel: `🚨 +${pct}% High`,
    badgeClass: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/40',
    borderClass: 'border-[#F87171]/50',
    iconType: 'alertTriangle',
    percentageDiff: pct,
    differenceLkr: diffLkr,
    explanation: `Asking price significantly exceeds estimated fair market value by Rs. ${Math.round(diffLkr).toLocaleString()} (+${pct}%). High premium over comparable transactions.`,
    recommendation: 'Substantial counter-offer strongly recommended. Present the RealEstateIQ certificate to justify lower bid.',
  };
}

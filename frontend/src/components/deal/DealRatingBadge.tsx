import React from 'react';
import { Flame, TrendingDown, Scale, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { calculateDealRating, DealRatingResult } from '../../utils/dealRating';

interface DealRatingBadgeProps {
  askingPrice?: number | null;
  estimatedPrice?: number | null;
  variant?: 'badge' | 'card' | 'banner';
  className?: string;
}

function getIcon(type: DealRatingResult['iconType'], size = 14) {
  switch (type) {
    case 'flame':
      return <Flame size={size} className="text-[#00DC82] animate-bounce" />;
    case 'trendingDown':
      return <TrendingDown size={size} className="text-[#14B8A6]" />;
    case 'scale':
      return <Scale size={size} className="text-[#DFBA73]" />;
    case 'alertCircle':
      return <AlertCircle size={size} className="text-[#FB923C]" />;
    case 'alertTriangle':
      return <AlertTriangle size={size} className="text-[#F87171]" />;
  }
}

export function DealRatingBadge({
  askingPrice,
  estimatedPrice,
  variant = 'badge',
  className = '',
}: DealRatingBadgeProps) {
  if (!askingPrice || !estimatedPrice) return null;

  const deal = calculateDealRating(askingPrice, estimatedPrice);

  if (variant === 'badge' || variant === 'card') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${deal.badgeClass} ${className}`}
        title={deal.explanation}
      >
        {getIcon(deal.iconType, 11)}
        <span>{variant === 'card' ? deal.shortLabel : deal.label}</span>
      </span>
    );
  }

  // Variant: 'banner' (Used in Property Detail view)
  return (
    <div
      className={`p-4 rounded-2xl bg-[#090D14] border ${deal.borderClass} space-y-3 relative overflow-hidden shadow-xl ${className}`}
    >
      {/* Background glow matching deal type */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
          deal.rating === 'GREAT_DEAL' || deal.rating === 'GOOD_VALUE'
            ? 'bg-[#00DC82]'
            : deal.rating === 'FAIR_MARKET'
            ? 'bg-[#DFBA73]'
            : 'bg-[#F87171]'
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            {getIcon(deal.iconType, 16)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                AI Valuation Deal Rating
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${deal.badgeClass}`}
              >
                {deal.label}
              </span>
            </div>
            <p className="text-sm font-serif font-black text-white mt-0.5">
              {deal.percentageDiff < 0
                ? `Rs. ${Math.abs(Math.round(deal.differenceLkr)).toLocaleString()} Below Valuation`
                : deal.percentageDiff === 0
                ? 'Priced at Fair Valuation'
                : `Rs. ${Math.round(deal.differenceLkr).toLocaleString()} Above Valuation`}
            </p>
          </div>
        </div>

        {/* Asking vs ML Comparison pill */}
        <div className="flex items-center gap-3 text-xs bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06] self-start sm:self-auto">
          <div>
            <span className="text-neutral-400 text-[10px] block">Asking Price</span>
            <strong className="text-white font-serif">Rs. {askingPrice.toLocaleString()}</strong>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.1]" />
          <div>
            <span className="text-neutral-400 text-[10px] block">ML Fair Value</span>
            <strong className="text-[#DFBA73] font-serif">Rs. {Math.round(estimatedPrice).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Rationale and buyer negotiation advice */}
      <div className="space-y-1.5 text-xs">
        <p className="text-neutral-300 leading-relaxed">{deal.explanation}</p>
        <p className="text-[11px] text-[#CBD5E1] flex items-center gap-1.5 font-medium">
          <ShieldCheck size={13} className="text-[#DFBA73] shrink-0" />
          <span><strong className="text-white">Negotiation Tip:</strong> {deal.recommendation}</span>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Building,
  Scale,
  Wrench,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCountry } from '../../context/CountryContext';

interface HiddenCostDetectorProps {
  propertyPrice: number;
  propertyTitle?: string;
  location?: string;
}

export function HiddenCostDetector({
  propertyPrice,
  propertyTitle = 'Property',
  location = 'Sri Lanka',
}: HiddenCostDetectorProps) {
  const { formatPrice, currency } = useCurrency();
  const { currentCountry } = useCountry();

  // Interactive Options
  const [isFinanced, setIsFinanced] = useState(false);
  const [loanPercentage, setLoanPercentage] = useState(70);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [renovationRate, setRenovationRate] = useState(2); // 2% reserve
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic Country-based Tax Rules
  const calculateTransferTax = (price: number, firstTime: boolean) => {
    if (price <= 0) return 0;
    let duty = 0;
    if (currentCountry.tax.isTieredStampDuty) {
      if (price <= 100000) {
        duty = price * 0.03;
      } else {
        duty = 100000 * 0.03 + (price - 100000) * 0.04;
      }
    } else {
      duty = price * currentCountry.tax.transferTaxRate;
    }
    // First time buyer relief (10% discount on duty)
    if (firstTime) {
      duty = duty * 0.9;
    }
    return Math.round(duty);
  };

  const stampDuty = calculateTransferTax(propertyPrice, isFirstTimeBuyer);

  // 2. Legal & Conveyancing Fees by country rate
  const legalFees = Math.round(propertyPrice * currentCountry.tax.legalFeeRate);

  // 3. Title Registry / Title Insurance fee
  const titleSearchFee = currentCountry.tax.fixedTitleSearchFeeLkr;

  // 4. Municipal Rates & Local Assessment Transfer
  const municipalTransferTax = Math.round(propertyPrice * currentCountry.tax.municipalRateTaxRate);

  // 5. Bank Valuation & Loan Processing (if mortgage)
  const loanAmount = isFinanced ? (propertyPrice * loanPercentage) / 100 : 0;
  const loanProcessingFee = isFinanced ? Math.round(loanAmount * 0.005) : 0;

  // 6. Maintenance & Move-in Contingency Reserve
  const maintenanceReserve = Math.round((propertyPrice * renovationRate) / 100);

  // Total Hidden Closing Costs
  const totalClosingCosts =
    stampDuty +
    legalFees +
    titleSearchFee +
    municipalTransferTax +
    loanProcessingFee +
    maintenanceReserve;

  const totalAcquisitionCost = propertyPrice + totalClosingCosts;
  const closingCostRatio = propertyPrice > 0 ? ((totalClosingCosts / propertyPrice) * 100).toFixed(1) : '0';

  const costItems = [
    {
      id: 'stamp_duty',
      title: `${currentCountry.tax.transferTaxName}`,
      description: currentCountry.tax.summary,
      amount: stampDuty,
      icon: <Scale size={16} className="text-[#DFBA73]" />,
      badge: isFirstTimeBuyer ? '10% Rebate Applied' : `${currentCountry.flag} Statutory Duty`,
    },
    {
      id: 'legal_fees',
      title: `Legal & Conveyancing (${(currentCountry.tax.legalFeeRate * 100).toFixed(1)}%)`,
      description: `Professional legal representation under ${currentCountry.legalSystem}.`,
      amount: legalFees,
      icon: <FileText size={16} className="text-[#DFBA73]" />,
      badge: 'Mandatory Closing',
    },
    {
      id: 'title_search',
      title: `Title Search & Verification (${currentCountry.registryAuthority})`,
      description: 'Public records search, deed authenticity check, and encumbrance certificate.',
      amount: titleSearchFee,
      icon: <Building size={16} className="text-[#DFBA73]" />,
      badge: 'Due Diligence',
    },
    {
      id: 'municipal_tax',
      title: `Municipal & Local Authority Assessment (${(currentCountry.tax.municipalRateTaxRate * 100).toFixed(1)}%)`,
      description: 'Transfer of assessment register and local council municipal clearance.',
      amount: municipalTransferTax,
      icon: <Building size={16} className="text-[#DFBA73]" />,
      badge: 'Local Authority',
    },
    ...(isFinanced
      ? [
          {
            id: 'loan_fee',
            title: `Bank Loan Processing & Valuation (${loanPercentage}% LTV)`,
            description: 'Chartered valuer inspection and mortgage bond registration fees.',
            amount: loanProcessingFee,
            icon: <CreditCard size={16} className="text-[#DFBA73]" />,
            badge: 'Financing Cost',
          },
        ]
      : []),
    {
      id: 'maintenance',
      title: `Move-in & Renovation Reserve (${renovationRate}%)`,
      description: 'Prudent reserve for repainting, deep cleaning, minor plumbing, and lock changes.',
      amount: maintenanceReserve,
      icon: <Wrench size={16} className="text-[#DFBA73]" />,
      badge: 'Recommended Buffer',
    },
  ];

  return (
    <div className="luxury-glass-card p-6 sm:p-7 border border-[#DFBA73]/30 bg-gradient-to-br from-[#0B1522] via-[#0D1B2A] to-[#071018] shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#DFBA73]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
              <ShieldAlert size={18} />
            </span>
            <h3 className="font-serif font-black text-white text-lg sm:text-xl">
              Hidden Cost Detector™
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <span>{currentCountry.flag}</span>
              <span>{currentCountry.name} Rules</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            RealEstateIQ dynamically models closing costs under {currentCountry.name} law ({currentCountry.registryAuthority}). Capital gains rate: {currentCountry.tax.capitalGainsRate}.
          </p>
        </div>

        {/* Total Cost Badge */}
        <div className="bg-[#050B10]/80 border border-[#DFBA73]/40 rounded-2xl p-3 sm:text-right shrink-0">
          <p className="text-[11px] uppercase font-bold text-neutral-400">Total True Cost</p>
          <p className="text-xl sm:text-2xl font-serif font-black text-[#DFBA73]">
            {formatPrice(totalAcquisitionCost)}
          </p>
          <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
            +{closingCostRatio}% above list price (+{formatPrice(totalClosingCosts)})
          </p>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5 p-3.5 rounded-2xl bg-[#070E17]/80 border border-white/[0.06]">
        {/* Financing Toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
          <div>
            <p className="text-xs font-bold text-white">Bank Mortgage Financing</p>
            <p className="text-[10px] text-neutral-400">Include loan & valuation fees</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFinanced(!isFinanced)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isFinanced ? 'bg-[#DFBA73]' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`bg-[#050B10] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isFinanced ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* First Time Homebuyer Toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
          <div>
            <p className="text-xs font-bold text-white">First-Time Buyer Relief</p>
            <p className="text-[10px] text-neutral-400">10% stamp duty rebate</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFirstTimeBuyer(!isFirstTimeBuyer)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isFirstTimeBuyer ? 'bg-[#DFBA73]' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`bg-[#050B10] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isFirstTimeBuyer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Renovation Buffer Slider */}
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-white">Move-in Buffer</p>
            <span className="text-xs font-mono font-bold text-[#DFBA73]">{renovationRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={renovationRate}
            onChange={(e) => setRenovationRate(Number(e.target.value))}
            className="w-full accent-[#DFBA73] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Itemized Cost Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-400 px-1 uppercase tracking-wider">
          <span>Cost Component (செலவு விவரம்)</span>
          <span>Estimated Fee</span>
        </div>

        {costItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#09111C] border border-white/[0.06] hover:border-[#DFBA73]/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-[#DFBA73]/40 transition-colors shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#DFBA73] transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-neutral-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 ml-3">
              <span className="font-mono text-sm font-black text-white group-hover:text-[#DFBA73] transition-colors">
                {formatPrice(item.amount)}
              </span>
              <p className="text-[10px] text-neutral-500 font-mono">
                {propertyPrice > 0 ? `~${((item.amount / propertyPrice) * 100).toFixed(2)}%` : '0%'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Acquisition Summary Footprint */}
      <div className="mt-5 p-4 rounded-2xl bg-[#04080D] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-neutral-300 text-xs">
          <Info size={15} className="text-[#DFBA73] shrink-0" />
          <span>
            Listed Base Price: <strong className="text-white font-mono">{formatPrice(propertyPrice)}</strong> + Closing Outlays: <strong className="text-amber-400 font-mono">{formatPrice(totalClosingCosts)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Total Capital Required:</span>
          <span className="text-base sm:text-lg font-serif font-black text-[#DFBA73] font-mono">
            {formatPrice(totalAcquisitionCost)}
          </span>
        </div>
      </div>
    </div>
  );
}

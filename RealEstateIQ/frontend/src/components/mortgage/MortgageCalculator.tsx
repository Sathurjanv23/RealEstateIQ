import React, { useState, useId } from 'react';
import { Calculator, Landmark, ShieldCheck, DollarSign, ChevronRight, Info } from 'lucide-react';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { sanitizeWhatsAppPhone } from '../../utils/whatsapp';

interface MortgageCalculatorProps {
  initialPrice?: number;
  propertyTitle?: string;
  location?: string;
  className?: string;
}

// Sri Lankan Bank Benchmark Rates
const SL_BANK_PRESETS = [
  { name: 'Bank of Ceylon (BOC)', rate: 11.5, tag: 'State Bank' },
  { name: 'Commercial Bank', rate: 12.0, tag: 'Popular' },
  { name: 'Hatton National Bank (HNB)', rate: 12.25, tag: 'Commercial' },
  { name: 'Sampath Bank', rate: 12.5, tag: 'Commercial' },
];

export function MortgageCalculator({
  initialPrice = 30000000,
  propertyTitle,
  location = 'Sri Lanka',
  className = '',
}: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice || 30000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(12.0);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [selectedBank, setSelectedBank] = useState<string>('Commercial Bank');

  // Input element IDs for accessibility
  const priceInputId = useId();
  const downPaymentInputId = useId();
  const downPaymentSliderId = useId();
  const interestInputId = useId();
  const interestSliderId = useId();
  const tenureInputId = useId();
  const tenureSliderId = useId();

  // Financial Computations
  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const principal = Math.max(0, propertyPrice - downPaymentAmount);

  // EMI Equation: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  let monthlyEmi = 0;
  if (principal > 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      monthlyEmi = Math.round(principal / totalMonths);
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
    }
  }

  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  const principalRatio = totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 50;
  const interestRatio = 100 - principalRatio;

  // Central Bank of Sri Lanka 40% Debt-to-Income (DTI) Guideline
  const minHouseholdIncome = Math.round(monthlyEmi / 0.4);

  // WhatsApp Loan Inquiry Message
  const phone = sanitizeWhatsAppPhone();
  const whatsappLoanText =
    `👋 *Hello RealEstateIQ Home Loan Advisory!*\n\n` +
    `I would like to inquire about home loan pre-approval for this property:\n\n` +
    (propertyTitle ? `🏡 *Property:* ${propertyTitle}\n` : '') +
    `📍 *Location:* ${location}\n` +
    `💰 *Property Price:* Rs. ${propertyPrice.toLocaleString()} LKR\n` +
    `💵 *Down Payment:* ${downPaymentPercent}% (Rs. ${downPaymentAmount.toLocaleString()} LKR)\n` +
    `🏦 *Estimated Loan:* Rs. ${principal.toLocaleString()} LKR (${tenureYears} Yrs @ ${interestRate}%)\n` +
    `📊 *Estimated Monthly EMI:* *Rs. ${monthlyEmi.toLocaleString()} LKR / month*\n\n` +
    `Please connect me with accredited banking partners (BOC, COMBANK, HNB, Sampath) for fast-track loan approval. Thank you!`;

  const whatsappLoanUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappLoanText)}`;

  return (
    <div
      className={`luxury-glass-card p-6 sm:p-8 space-y-6 border border-[#DFBA73]/30 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#DFBA73]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#DFBA73]/15 border border-[#DFBA73]/40 text-[#DFBA73] shrink-0 mt-0.5">
            <Calculator size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                Sri Lanka Home Loan & Mortgage Calculator
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFBA73]/20 text-[#DFBA73] border border-[#DFBA73]/40">
                CBSL Standard
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Accurate monthly EMI amortization calibrated on Sri Lankan commercial bank lending rates
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Property Price Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor={priceInputId} className="text-xs font-semibold text-neutral-300">
                Property Valuation / Asking Price (LKR)
              </label>
              <div className="flex gap-1.5">
                {[1000000, 5000000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setPropertyPrice((p) => Math.max(1000000, p + step))}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] hover:bg-[#DFBA73]/20 hover:text-[#DFBA73] text-neutral-300 transition-colors"
                  >
                    +{step / 1000000}M
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                Rs.
              </span>
              <input
                id={priceInputId}
                type="number"
                min={1000000}
                step={500000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                className="input-field pl-10 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor={downPaymentInputId} className="text-xs font-semibold text-neutral-300">
                Down Payment ({downPaymentPercent}%)
              </label>
              <span className="text-xs font-bold text-[#DFBA73]">
                Rs. {downPaymentAmount.toLocaleString()} LKR
              </span>
            </div>
            <input
              id={downPaymentSliderId}
              aria-label="Down Payment Percentage Slider"
              type="range"
              min={10}
              max={60}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#DFBA73] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>Min 10% (Rs. {Math.round(propertyPrice * 0.1).toLocaleString()})</span>
              <span>Standard 20%</span>
              <span>Max 60%</span>
            </div>
          </div>

          {/* Bank Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Select Sri Lankan Bank Lending Rate Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SL_BANK_PRESETS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => {
                    setSelectedBank(bank.name);
                    setInterestRate(bank.rate);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedBank === bank.name
                      ? 'bg-[#DFBA73]/15 border-[#DFBA73] text-white shadow-sm'
                      : 'bg-[#090D14] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <p className="text-[11px] font-bold truncate">{bank.name.split(' (')[0]}</p>
                  <p className="text-xs font-serif font-black text-[#DFBA73] mt-0.5">{bank.rate}%</p>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400">{bank.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Loan Tenure Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={interestInputId} className="text-xs font-semibold text-neutral-300">
                  Annual Interest Rate
                </label>
                <span className="text-xs font-bold text-white">{interestRate}%</span>
              </div>
              <input
                id={interestSliderId}
                aria-label="Annual Interest Rate Slider"
                type="range"
                min={8}
                max={18}
                step={0.25}
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(Number(e.target.value));
                  setSelectedBank('Custom');
                }}
                className="w-full accent-[#DFBA73] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={tenureInputId} className="text-xs font-semibold text-neutral-300">
                  Loan Tenure
                </label>
                <span className="text-xs font-bold text-white">{tenureYears} Years</span>
              </div>
              <input
                id={tenureSliderId}
                aria-label="Loan Tenure Slider"
                type="range"
                min={5}
                max={30}
                step={5}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-[#DFBA73] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Financial Output Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#090D14] border border-white/[0.1] space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Estimated Monthly EMI
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
                {tenureYears} Yrs @ {interestRate}%
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-serif font-black text-[#DFBA73] tracking-tight">
              Rs. {monthlyEmi.toLocaleString()}
              <span className="text-xs font-sans font-medium text-neutral-400"> / month</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Principal: Rs. {principal.toLocaleString()} LKR
            </p>
          </div>

          {/* Two-tone Amortization Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-neutral-300">
              <span>Principal ({principalRatio}%)</span>
              <span>Interest ({interestRatio}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/[0.08] overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#DFBA73] to-[#F3D59B] transition-all duration-500"
                style={{ width: `${principalRatio}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#818CF8] to-[#6366F1] transition-all duration-500"
                style={{ width: `${interestRatio}%` }}
              />
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2 text-xs pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Interest Payable:</span>
              <span className="font-bold text-white font-serif">Rs. {totalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Loan Repayment:</span>
              <span className="font-bold text-white font-serif">Rs. {totalPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-neutral-400 flex items-center gap-1">
                <Info size={12} className="text-[#DFBA73]" /> Recommended Household Income:
              </span>
              <span className="font-bold text-[#00DC82] font-serif">
                Rs. {minHouseholdIncome.toLocaleString()} / mo
              </span>
            </div>
          </div>

          {/* 1-Click WhatsApp Mortgage Button */}
          <div className="pt-2">
            <WhatsAppButton
              href={whatsappLoanUrl}
              label="Inquire Loan Pre-Approval on WhatsApp"
              sublabel="Fast-track Partner Banking Connect"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

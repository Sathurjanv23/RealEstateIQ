import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, PieChart, ShieldCheck, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCountry } from '../../context/CountryContext';

export function AffordabilityCalculator() {
  const { formatPrice, currency } = useCurrency();
  const { currentCountry } = useCountry();

  // Dynamic initial values based on currency/country
  const defaultIncome = currency === 'LKR' ? 350000 : currency === 'USD' ? 8000 : currency === 'GBP' ? 6000 : currency === 'AED' ? 30000 : 10000;
  const defaultDownPayment = currency === 'LKR' ? 5000000 : currency === 'USD' ? 60000 : currency === 'GBP' ? 50000 : currency === 'AED' ? 200000 : 80000;
  const defaultDebt = currency === 'LKR' ? 40000 : currency === 'USD' ? 600 : currency === 'GBP' ? 400 : currency === 'AED' ? 2500 : 800;
  const defaultRate = currency === 'LKR' ? 12.0 : currency === 'AED' ? 4.5 : 6.5;

  const [grossIncome, setGrossIncome] = useState<number>(defaultIncome);
  const [monthlyDebt, setMonthlyDebt] = useState<number>(defaultDebt);
  const [downPayment, setDownPayment] = useState<number>(defaultDownPayment);
  const [interestRate, setInterestRate] = useState<number>(defaultRate);
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [maxDti, setMaxDti] = useState<number>(36); // 36% conservative standard

  const calculation = useMemo(() => {
    // Maximum allowable total debt payments per month under DTI rule
    const maxTotalMonthlyDebtPayment = (grossIncome * (maxDti / 100));
    // Maximum allowable mortgage payment after existing recurring debt
    const maxMortgagePayment = Math.max(0, maxTotalMonthlyDebtPayment - monthlyDebt);

    // Monthly interest rate
    const r = (interestRate / 100) / 12;
    const n = loanTermYears * 12;

    // Loan amount supported by max mortgage payment: P = M * [ (1 - (1+r)^-n) / r ]
    let maxLoan = 0;
    if (r > 0 && n > 0 && maxMortgagePayment > 0) {
      maxLoan = maxMortgagePayment * ((1 - Math.pow(1 + r, -n)) / r);
    }

    const maxPropertyPrice = Math.round(maxLoan + downPayment);
    const comfortablePrice = Math.round(maxPropertyPrice * 0.85); // 85% conservative comfortable band
    const downPaymentRatio = maxPropertyPrice > 0 ? (downPayment / maxPropertyPrice) * 100 : 0;

    return {
      maxPropertyPrice,
      comfortablePrice,
      maxMortgagePayment: Math.round(maxMortgagePayment),
      maxLoan: Math.round(maxLoan),
      downPaymentRatio: Math.min(100, Math.round(downPaymentRatio)),
      isDebtHeavy: monthlyDebt > grossIncome * 0.3,
    };
  }, [grossIncome, monthlyDebt, downPayment, interestRate, loanTermYears, maxDti]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 shadow-sm">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Home Affordability Calculator
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              Purchasing Power
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compute your maximum borrowing capacity and safe property price based on banking debt-to-income (DTI) criteria for {currentCountry.name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Gross Monthly Income */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Gross Monthly Household Income</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatPrice(grossIncome)} /mo</span>
            </div>
            <input
              type="range"
              min={currency === 'LKR' ? 50000 : 1500}
              max={currency === 'LKR' ? 3000000 : 50000}
              step={currency === 'LKR' ? 25000 : 500}
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Cash Down Payment */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Available Cash Savings (Down Payment)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(downPayment)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={currency === 'LKR' ? 50000000 : 500000}
              step={currency === 'LKR' ? 500000 : 5000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Monthly Debt Obligations */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Monthly Debt Payments (Car loans, cards, personal loans)</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{formatPrice(monthlyDebt)} /mo</span>
            </div>
            <input
              type="range"
              min={0}
              max={currency === 'LKR' ? 1000000 : 15000}
              step={currency === 'LKR' ? 10000 : 100}
              value={monthlyDebt}
              onChange={(e) => setMonthlyDebt(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Loan Term & Interest Rate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Loan Term
              </label>
              <select
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 Years</option>
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={25}>25 Years</option>
                <option value={30}>30 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Interest Rate ({interestRate}%)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="30"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Banking DTI Ratio
              </label>
              <select
                value={maxDti}
                onChange={(e) => setMaxDti(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={30}>30% (Strict)</option>
                <option value={36}>36% (Standard)</option>
                <option value={43}>43% (Maximum)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Intelligence Column */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Maximum Purchasing Power
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white">
                DTI {maxDti}%
              </span>
            </div>

            <div className="mb-6">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-indigo-200">
                {formatPrice(calculation.maxPropertyPrice)}
              </div>
              <p className="text-xs text-indigo-200/80 mt-1">
                Total property value you can purchase with current down payment & borrowing capacity.
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Comfortable Target (85%):</span>
                <span className="font-bold text-emerald-400">{formatPrice(calculation.comfortablePrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Max Monthly Mortgage:</span>
                <span className="font-bold text-white">{formatPrice(calculation.maxMortgagePayment)} /mo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Max Bank Loan:</span>
                <span className="font-bold text-indigo-300">{formatPrice(calculation.maxLoan)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Cash Equity Contribution:</span>
                <span className="font-bold text-amber-300">{calculation.downPaymentRatio}% ({formatPrice(downPayment)})</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            {calculation.isDebtHeavy ? (
              <div className="flex items-start gap-2 bg-rose-500/20 border border-rose-500/30 rounded-xl p-3 text-[11px] text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>
                  High existing debt ratio ({Math.round((monthlyDebt / grossIncome) * 100)}% of income). Consider paying off high-interest cards before applying for a mortgage.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-200">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  Healthy borrowing profile. Underwriters typically approve loans within this range within 48 to 72 hours.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

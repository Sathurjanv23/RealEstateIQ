import React, { useState } from 'react';
import {
  Handshake,
  DollarSign,
  Calendar,
  ShieldCheck,
  CreditCard,
  FileText,
  X,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';
import { offerService } from '../../services/services';

interface MakeOfferModalProps {
  propertyId: string;
  propertyTitle: string;
  askingPrice: number;
  location?: string;
  isOpen: boolean;
  onClose: () => void;
  onOfferSubmitted?: () => void;
}

export function MakeOfferModal({
  propertyId,
  propertyTitle,
  askingPrice,
  location,
  isOpen,
  onClose,
  onOfferSubmitted,
}: MakeOfferModalProps) {
  const { formatPrice, currency } = useCurrency();

  const [offerAmount, setOfferAmount] = useState<number>(askingPrice);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [financingType, setFinancingType] = useState<'CASH' | 'PRE_APPROVED_MORTGAGE' | 'CONTINGENT'>('CASH');
  const [targetClosingDays, setTargetClosingDays] = useState<number>(30);
  const [termsMessage, setTermsMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const diffPercent = askingPrice > 0
    ? Number((((offerAmount - askingPrice) / askingPrice) * 100).toFixed(1))
    : 0;

  const handlePresetClick = (percentage: number) => {
    const newPrice = Math.round(askingPrice * (1 + percentage / 100));
    setOfferAmount(newPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || offerAmount <= 0) {
      toast.error('Please enter a valid offer amount.');
      return;
    }
    if (!buyerName || !buyerEmail || !buyerPhone) {
      toast.error('Please provide your name, email, and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await offerService.create({
        propertyId,
        offerAmount,
        buyerName,
        buyerEmail,
        buyerPhone,
        financingType,
        targetClosingDays,
        termsMessage: termsMessage || undefined,
      });

      toast.success('Offer submitted successfully! Seller has been notified.');
      if (onOfferSubmitted) onOfferSubmitted();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="luxury-glass-card max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-[#DFBA73]/40 bg-[#0B1522] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
              <Handshake size={20} />
            </span>
            <div>
              <h3 className="font-serif font-bold text-white text-lg">
                Make a Formal Offer
              </h3>
              <p className="text-xs text-neutral-400">
                விலை ஆஃபர் சமர்ப்பித்தல் • {propertyTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Reference & Asking Price Card */}
          <div className="p-3.5 rounded-xl bg-[#070E17] border border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <p className="text-neutral-400">Official Asking Price:</p>
              <p className="font-serif font-black text-[#DFBA73] text-base mt-0.5">
                {formatPrice(askingPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-neutral-400">Current Offer Gap:</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                {diffPercent < 0 ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <TrendingDown size={14} /> {diffPercent}% under asking
                  </span>
                ) : diffPercent > 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp size={14} /> +{diffPercent}% above asking
                  </span>
                ) : (
                  <span className="text-[#DFBA73] font-bold">100% Full Asking Price</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Adjustment Presets */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Quick Price Anchors (விலை முன்மாதிரிகள்):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '-10%', val: -10 },
                { label: '-5%', val: -5 },
                { label: 'Full Price', val: 0 },
                { label: '+3% Competitive', val: 3 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetClick(p.val)}
                  className="py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#DFBA73]/40 text-xs font-semibold text-neutral-300 transition-all text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offer Amount Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Your Offer Amount (LKR) <span className="text-[#DFBA73]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min="100000"
                step="10000"
                className="input-field text-base font-serif font-bold text-[#DFBA73] pl-3"
                required
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Display Currency: <strong className="text-white">{formatPrice(offerAmount)}</strong>
            </p>
          </div>

          {/* Financing Type */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Proof of Funds / Financing Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', label: 'Cash Buyer (பணம்)', note: 'Fastest Closing' },
                { id: 'PRE_APPROVED_MORTGAGE', label: 'Pre-Approved Loan (வங்கி)', note: 'BOC/HNB/ComBank' },
                { id: 'CONTINGENT', label: 'Contingent (நிபந்தனை)', note: 'Subject to Sale' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFinancingType(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    financingType === opt.id
                      ? 'bg-[#DFBA73]/15 border-[#DFBA73] text-[#DFBA73]'
                      : 'bg-[#070E17] border-white/[0.08] text-neutral-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{opt.label}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{opt.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Kamal Perera"
                className="input-field text-xs py-2"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="input-field text-xs py-2"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="buyer@example.com"
                className="input-field text-xs py-2"
                required
              />
            </div>
          </div>

          {/* Target Closing Days */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Target Closing Timeframe:
            </label>
            <div className="flex items-center gap-2">
              {[15, 30, 45, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTargetClosingDays(days)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    targetClosingDays === days
                      ? 'bg-[#DFBA73] text-[#050B10] font-bold border-[#DFBA73]'
                      : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Terms / Message */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Terms & Special Conditions (Optional):
            </label>
            <textarea
              rows={2}
              value={termsMessage}
              onChange={(e) => setTermsMessage(e.target.value)}
              placeholder="e.g. Offer valid for 5 days. Subject to chartered structural inspection."
              className="input-field text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary text-xs flex-1 py-2.5 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs flex-1 py-2.5 font-bold"
            >
              {isSubmitting ? 'Transmitting Offer...' : 'Submit Binding Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

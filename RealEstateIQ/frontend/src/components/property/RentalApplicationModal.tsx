import React, { useState } from 'react';
import {
  KeyRound,
  FileCheck,
  Building,
  User,
  Calendar,
  DollarSign,
  ShieldAlert,
  X,
  CheckCircle2,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';
import { rentalService } from '../../services/services';

interface RentalApplicationModalProps {
  propertyId: string;
  propertyTitle: string;
  monthlyRent: number;
  rentalPeriod?: string;
  location?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted?: () => void;
}

export function RentalApplicationModal({
  propertyId,
  propertyTitle,
  monthlyRent,
  rentalPeriod = 'monthly',
  location,
  isOpen,
  onClose,
  onApplicationSubmitted,
}: RentalApplicationModalProps) {
  const { formatPrice } = useCurrency();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');
  const [employmentStatus, setEmploymentStatus] = useState<string>('EMPLOYED');
  const [employerOrBusinessName, setEmployerOrBusinessName] = useState('');
  const [occupantsCount, setOccupantsCount] = useState<number>(2);
  const [hasPets, setHasPets] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseDurationMonths, setLeaseDurationMonths] = useState<number>(12);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !monthlyIncome || !moveInDate) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (!consentChecked) {
      toast.error('Identity verification declaration consent is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rentalService.apply({
        propertyId,
        fullName,
        email,
        phone,
        monthlyIncome: Number(monthlyIncome),
        employmentStatus,
        employerOrBusinessName: employerOrBusinessName || undefined,
        occupantsCount,
        hasPets,
        moveInDate,
        leaseDurationMonths,
        additionalNotes: additionalNotes || undefined,
        identityVerificationConsent: consentChecked,
      });

      toast.success('Rental application submitted to landlord! You can track status in your dashboard.');
      if (onApplicationSubmitted) onApplicationSubmitted();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="luxury-glass-card max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-emerald-500/40 bg-[#0B1522] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <KeyRound size={20} />
            </span>
            <div>
              <h3 className="font-serif font-bold text-white text-lg">
                Online Tenancy Application
              </h3>
              <p className="text-xs text-neutral-400">
                வாடகை விண்ணப்பப் படிவம் • {propertyTitle}
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
          {/* Rent Badge */}
          <div className="p-3.5 rounded-xl bg-[#070E17] border border-white/[0.06] flex items-center justify-between text-xs">
            <div>
              <p className="text-neutral-400">Listed Rental Rate:</p>
              <p className="font-serif font-black text-emerald-400 text-lg mt-0.5">
                {formatPrice(monthlyRent)} <span className="text-xs font-sans text-neutral-400 font-normal">/ {rentalPeriod}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                Direct Landlord Screening
              </span>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Legal Name"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 000 0000"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="applicant@domain.com"
                className="input-field text-xs py-2"
                required
              />
            </div>
          </div>

          {/* Financials & Employment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Monthly Net Income (LKR) *
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 250000"
                className="input-field text-xs py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Employment Status *
              </label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="input-field text-xs py-2 bg-[#090D14]"
              >
                <option value="EMPLOYED">Full-time Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed / Freelance</option>
                <option value="BUSINESS">Business Owner</option>
                <option value="RETIRED">Retired</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
              Employer or Organization Name:
            </label>
            <input
              type="text"
              value={employerOrBusinessName}
              onChange={(e) => setEmployerOrBusinessName(e.target.value)}
              placeholder="e.g. Dialog Axiata / IFS Sri Lanka"
              className="input-field text-xs py-2"
            />
          </div>

          {/* Tenancy Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Target Move-In Date *
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="input-field text-xs py-2 bg-[#090D14]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Total Occupants:
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={occupantsCount}
                onChange={(e) => setOccupantsCount(Number(e.target.value))}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Lease Duration:
              </label>
              <select
                value={leaseDurationMonths}
                onChange={(e) => setLeaseDurationMonths(Number(e.target.value))}
                className="input-field text-xs py-2 bg-[#090D14]"
              >
                <option value={6}>6 Months</option>
                <option value={12}>1 Year (12 mo)</option>
                <option value={24}>2 Years (24 mo)</option>
              </select>
            </div>
          </div>

          {/* Pets Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-xs font-bold text-white">Do you have pets?</p>
              <p className="text-[10px] text-neutral-400">Dogs, cats, or other indoor pets</p>
            </div>
            <button
              type="button"
              onClick={() => setHasPets(!hasPets)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                hasPets ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`bg-[#050B10] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  hasPets ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="consent"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1 accent-emerald-500 rounded"
              required
            />
            <label htmlFor="consent" className="text-[11px] text-neutral-300 leading-snug cursor-pointer">
              I consent to identity verification and confirm all income and occupancy declarations are accurate under Sri Lankan Tenancy regulations.
            </label>
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
              className="btn-primary text-xs flex-1 py-2.5 font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-none text-white shadow-lg"
            >
              {isSubmitting ? 'Transmitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

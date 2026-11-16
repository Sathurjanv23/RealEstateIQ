import React, { useState } from 'react';
import { Flag, X, ShieldAlert, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

const REPORT_REASONS = [
  { id: 'incorrect_info', label: 'Incorrect price, location or details' },
  { id: 'duplicate', label: 'Duplicate listing' },
  { id: 'already_sold', label: 'Property is already sold or no longer available' },
  { id: 'scam_fraud', label: 'Suspected scam, fake owner or fraudulent listing' },
  { id: 'inappropriate_media', label: 'Inappropriate or copyrighted photos/content' },
  { id: 'unreachable_contact', label: 'Lister cannot be reached or refuses viewing' },
];

export function ReportListingModal({ isOpen, onClose, propertyId, propertyTitle }: ReportListingModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save report in local trust & safety store or simulate backend ingestion
    try {
      const reports = JSON.parse(localStorage.getItem('realestateiq_listing_reports') || '[]');
      reports.push({
        propertyId,
        propertyTitle,
        reason: selectedReason,
        description,
        contactEmail,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('realestateiq_listing_reports', JSON.stringify(reports));

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        toast.success('Report submitted to Trust & Safety team. Thank you for keeping the marketplace safe.');
      }, 700);
    } catch {
      setIsSubmitting(false);
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Report Submitted
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Our AI trust scoring engine and compliance moderators have been alerted. We will review this listing within 2 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Report This Listing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {propertyTitle}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                What is the issue with this listing?
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === r.id
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional evidence, links or context..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Email (Optional, for case resolution updates)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

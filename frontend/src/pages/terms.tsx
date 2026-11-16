import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, Scale, ArrowLeft, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { LuxuryNavbar } from '../components/layout/LuxuryNavbar';
import { LuxuryFooter } from '../components/layout/LuxuryFooter';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service & Refund Policy — RealEstateIQ</title>
        <meta
          name="description"
          content="Official Terms of Service, Valuation Disclaimers, and Refund Guidelines for RealEstateIQ Sri Lanka."
        />
      </Head>

      <div className="min-h-screen bg-[#080A0E] text-[#F8FAFC] font-sans antialiased selection:bg-[#DFBA73] selection:text-[#080A0E]">
        <LuxuryNavbar />

        <main className="max-w-4xl mx-auto pt-32 pb-20 px-4 sm:px-6 space-y-10">
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left border-b border-white/[0.08] pb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-[#DFBA73] transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DFBA73] uppercase tracking-wider">
              <Scale size={16} /> Legal & Commercial Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
              Terms of Service & Refund Policy
            </h1>
            <p className="text-neutral-400 text-xs">
              Last Updated: November 2026 · Compliant with the Democratic Socialist Republic of Sri Lanka Laws
            </p>
          </div>

          {/* Section 1: Introduction */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-[#DFBA73]" /> 1. Acceptance of Terms
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              By accessing, browsing, registering, or conducting transactions on the RealEstateIQ platform
              (&quot;RealEstateIQ&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service. If you do not agree to these terms, you must
              refrain from using our services and digital tools.
            </p>
          </section>

          {/* Section 2: AI Valuation Disclaimer (CRITICAL) */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4 border border-[#DFBA73]/30 bg-[#0B101C]">
            <h2 className="text-lg font-serif font-bold text-[#DFBA73] flex items-center gap-2">
              <AlertTriangle size={18} /> 2. Machine Learning Valuation Disclaimer
            </h2>
            <p className="text-xs text-neutral-200 leading-relaxed">
              RealEstateIQ leverages algorithmic machine learning pipelines (Gradient Boosting Regressors)
              calibrated across 14,800+ authentic transactions across 23 administrative districts in Sri Lanka
              to generate fair-market estimates and statistical confidence intervals.
            </p>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-neutral-300 text-[11px] leading-relaxed">
              <strong className="text-amber-400 font-bold block mb-1">STATUTORY LEGAL NOTICE:</strong>
              The valuations, deal ratings, and PDF certificates produced by RealEstateIQ are algorithmic
              estimations provided solely for informational and market benchmarking purposes. They do not
              constitute a statutory, certified physical survey under the Institute of Quantity Surveyors Sri Lanka
              (IQSSL) or the Government Valuation Department. Users should conduct independent due diligence prior
              to executing legally binding deed transfers.
            </div>
          </section>

          {/* Section 3: Commercial Services & PayHere Payments */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#DFBA73]" /> 3. Payments, Boosts & Commercial Transactions
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              All digital payment transactions for Featured Listings, Platinum Boosts, and Agent Pro Subscriptions
              are processed securely via **PayHere (Private) Limited**, an authorized payment service provider
              regulated by the **Central Bank of Sri Lanka (CBSL)**.
            </p>
            <ul className="space-y-2 text-xs text-neutral-300 list-disc pl-5">
              <li>Prices are listed in Sri Lankan Rupees (LKR) with real-time multi-currency estimates.</li>
              <li>Featured boosts are activated immediately upon successful receipt of the PayHere digital IPN notification.</li>
              <li>Users are responsible for ensuring that all property information provided in boosted advertisements is truthful and accurate.</li>
            </ul>
          </section>

          {/* Section 4: Refund Policy (MANDATORY FOR PAYHERE) */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Scale size={18} className="text-[#DFBA73]" /> 4. Refund & Cancellation Policy
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Because RealEstateIQ provides immediate digital services (instant search priority and cloud advertising),
              the following refund terms apply:
            </p>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>
                • <strong>Technical Failure</strong>: If your payment was deducted but the listing boost failed to
                activate due to a technical error, our system will either auto-reconcile within 24 hours or issue a full refund
                to the original payment method upon receipt of your transaction order ID at support@realestateiq.lk.
              </p>
              <p>
                • <strong>Activated Advertising</strong>: Once a Gold or Platinum Boost is activated and has been
                displayed to the public, fees for that promotional cycle are non-refundable.
              </p>
              <p>
                • <strong>Agent Pro Memberships</strong>: Monthly subscriptions can be cancelled at any time to prevent
                renewal for subsequent billing cycles.
              </p>
            </div>
          </section>

          {/* Section 5: Governing Law */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#DFBA73]" /> 5. Governing Law & Jurisdiction
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Sri Lanka. Any dispute
              arising out of or relating to these terms or use of the service shall be subject to the exclusive
              jurisdiction of the courts of Colombo, Sri Lanka.
            </p>
          </section>
        </main>

        <LuxuryFooter />
      </div>
    </>
  );
}

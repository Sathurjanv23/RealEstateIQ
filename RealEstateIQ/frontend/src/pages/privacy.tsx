import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Eye, Database, CheckCircle2 } from 'lucide-react';
import { LuxuryNavbar } from '../components/layout/LuxuryNavbar';
import { LuxuryFooter } from '../components/layout/LuxuryFooter';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy & Data Protection — RealEstateIQ</title>
        <meta
          name="description"
          content="Privacy Policy and Personal Data Protection Guidelines (PDPA Sri Lanka) for RealEstateIQ."
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
              <ShieldCheck size={16} /> Privacy & Information Security
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
              Privacy Policy
            </h1>
            <p className="text-neutral-400 text-xs">
              Compliant with the Personal Data Protection Act (PDPA No. 9 of 2022) of Sri Lanka
            </p>
          </div>

          {/* Section 1: Overview */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Eye size={18} className="text-[#DFBA73]" /> 1. Commitment to Privacy
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              At RealEstateIQ, we respect your privacy and are committed to protecting the personal information
              entrusted to us by property owners, buyers, real estate brokers, and institutional investors. This Privacy
              Policy outlines the collection, use, disclosure, and safeguarding of your data.
            </p>
          </section>

          {/* Section 2: Data Collected */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-[#DFBA73]" /> 2. Information We Collect
            </h2>
            <div className="space-y-3 text-xs text-neutral-300">
              <p>
                • <strong>Account Identifiers</strong>: Name, email address, password hash, and OAuth tokens
                when registering via email or Google Sign-In.
              </p>
              <p>
                • <strong>Property Information</strong>: Listing specifications (area, floor plan, location,
                district, asking price, images, and property features).
              </p>
              <p>
                • <strong>Inquiry Data</strong>: Phone numbers and scheduling dates provided voluntarily when
                connecting with property owners or via 1-click WhatsApp messaging.
              </p>
              <p>
                • <strong>Payment Information</strong>: Transaction Order IDs, amounts, and completion statuses.
                <strong> Note: We never store your credit or debit card numbers on our servers.</strong> All payment
                credential handling is conducted directly through PayHere&apos;s PCI-DSS compliant infrastructure.
              </p>
            </div>
          </section>

          {/* Section 3: Data Usage */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#DFBA73]" /> 3. How We Use Your Data
            </h2>
            <ul className="space-y-2 text-xs text-neutral-300 list-disc pl-5">
              <li>To calibrate algorithmic price estimates and market intelligence benchmarks.</li>
              <li>To facilitate direct buyer-to-seller communication and verified WhatsApp inquiries.</li>
              <li>To prevent fraudulent property postings and maintain platform security.</li>
              <li>To issue verifiable PDF valuation certificates registered on our tamper-evident ledger.</li>
            </ul>
          </section>

          {/* Section 4: Security Standards */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-4 border border-emerald-500/20 bg-[#0A121A]">
            <h2 className="text-lg font-serif font-bold text-emerald-400 flex items-center gap-2">
              <Lock size={18} /> 4. Security & Encryption Safeguards
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              We apply industry-standard security protocols to defend your data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-white block mb-0.5">256-Bit TLS Encryption</span>
                <span className="text-[11px] text-neutral-400">All browser-to-server REST traffic is encrypted in transit.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-white block mb-0.5">Bcrypt Password Salting</span>
                <span className="text-[11px] text-neutral-400">Passwords are cryptographically salted and hashed.</span>
              </div>
            </div>
          </section>

          {/* Section 5: Contact */}
          <section className="luxury-glass-card p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-serif font-bold text-white">5. Privacy Inquiries & Data Rights</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Under Sri Lankan PDPA provisions, you have the right to request access to or deletion of your personal
              data stored in our database. Contact our data compliance officer at:
            </p>
            <p className="text-xs font-mono text-[#DFBA73] pt-1">
              privacy@realestateiq.lk · Colombo, Sri Lanka
            </p>
          </section>
        </main>

        <LuxuryFooter />
      </div>
    </>
  );
}

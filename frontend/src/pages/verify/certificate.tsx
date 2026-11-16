import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Home,
  Bed,
  Bath,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
import { getValuationWhatsAppUrl } from '../../utils/whatsapp';
import { BrandLogo } from '../../components/ui/BrandLogo';

export default function CertificateVerificationPage() {
  const router = useRouter();
  const {
    id = 'RIQ-OFFICIAL',
    loc = 'Colombo',
    val = '25000000',
    area = '2000',
    beds = '3',
    baths = '2',
    date,
  } = router.query;

  const certId = String(id);
  const location = String(loc);
  const valuationPrice = Number(val) || 25000000;
  const propertyArea = Number(area) || 2000;
  const bedrooms = Number(beds) || 3;
  const bathrooms = Number(baths) || 2;
  const issueDate = date ? String(date) : new Date().toLocaleDateString();

  const whatsappUrl = getValuationWhatsAppUrl({
    certificateId: certId,
    location,
    area: propertyArea,
    bedrooms,
    predictedPrice: valuationPrice,
  });

  return (
    <>
      <Head>
        <title>Digital Certificate Verification — RealEstateIQ</title>
        <meta
          name="description"
          content="Authentic real estate valuation verification registry powered by machine learning algorithms calibrated across Sri Lanka."
        />
      </Head>

      <div className="min-h-screen bg-[#06080C] text-neutral-100 flex flex-col justify-between selection:bg-[#DFBA73] selection:text-black">
        {/* Top Navbar */}
        <header className="border-b border-white/[0.08] bg-[#0A0D14]/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <BrandLogo size="md" variant="luxury" />

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00DC82]/15 text-[#00DC82] border border-[#00DC82]/30">
              <CheckCircle2 size={13} /> Registry Live
            </span>
          </div>
        </header>

        {/* Main Verification Card */}
        <main className="max-w-2xl w-full mx-auto px-4 py-10 space-y-6">
          {/* Certificate Verified Banner */}
          <div className="luxury-glass-card p-8 sm:p-10 text-center relative overflow-hidden border border-[#00DC82]/40 shadow-2xl">
            {/* Ambient background glow */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#00DC82]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#DFBA73]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-[#00DC82]/15 border border-[#00DC82]/40 text-[#00DC82] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00DC82]/10">
              <ShieldCheck size={32} />
            </div>

            <span className="inline-block text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[#00DC82]/20 text-[#00DC82] border border-[#00DC82]/40 mb-2">
              Official Certificate Verified ✓
            </span>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
              Valuation Authenticity Certified
            </h1>
            <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
              This digital document has been verified against the RealEstateIQ machine learning appraisal ledger.
            </p>

            {/* Reference ID Pill */}
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#090D14] border border-white/[0.1] font-mono text-xs">
              <span className="text-neutral-400">Certificate ID:</span>
              <strong className="text-[#DFBA73] font-bold">{certId}</strong>
            </div>

            {/* Valuation Price Highlight */}
            <div className="mt-7 pt-6 border-t border-white/[0.08]">
              <p className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider mb-1">
                Certified Fair Market Valuation
              </p>
              <div className="text-4xl sm:text-5xl font-serif font-black text-[#DFBA73] tracking-tight">
                Rs. {valuationPrice.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                Sri Lankan Rupees (LKR)
              </p>
            </div>
          </div>

          {/* Evaluated Asset Specifications */}
          <div className="luxury-glass-card p-6 space-y-4">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award size={15} className="text-[#DFBA73]" /> Appraised Asset Profile
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <MapPin size={13} className="text-[#DFBA73]" /> District
                </p>
                <p className="font-bold text-white text-sm">{location}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <Home size={13} className="text-[#DFBA73]" /> Floor Area
                </p>
                <p className="font-bold text-white text-sm">{propertyArea.toLocaleString()} sqft</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <Bed size={13} className="text-[#DFBA73]" /> Bedrooms
                </p>
                <p className="font-bold text-white text-sm">{bedrooms} Beds</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <Bath size={13} className="text-[#DFBA73]" /> Bathrooms
                </p>
                <p className="font-bold text-white text-sm">{bathrooms} Baths</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <Calendar size={13} className="text-[#DFBA73]" /> Issue Date
                </p>
                <p className="font-bold text-white text-sm">{issueDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                <p className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={13} className="text-[#00DC82]" /> Audit Status
                </p>
                <p className="font-bold text-[#00DC82] text-sm">Verified 100%</p>
              </div>
            </div>
          </div>

          {/* Action CTAs: WhatsApp Inquiry & New Appraisal */}
          <div className="p-6 rounded-2xl bg-[#090D14] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-white">Have questions about this certificate?</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Connect directly with our chartered appraisal team on WhatsApp.
              </p>
            </div>
            <WhatsAppButton
              href={whatsappUrl}
              label="1-Click WhatsApp Advisory"
              sublabel="Instant Broker Chat"
              className="w-full sm:w-auto shrink-0"
            />
          </div>

          {/* Back links */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
            <Link href="/predict" className="hover:text-[#DFBA73] transition-colors flex items-center gap-1">
              ← Value another property
            </Link>
            <Link href="/properties" className="hover:text-[#DFBA73] transition-colors flex items-center gap-1">
              Browse Sri Lanka properties <ArrowRight size={13} />
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} RealEstateIQ — Institutional Real Estate Machine Learning Platform. Sri Lanka.</p>
        </footer>
      </div>
    </>
  );
}

import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { order_id } = router.query;

  return (
    <>
      <Head>
        <title>Payment Successful — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Payment Confirmed">
        <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in text-center">
          <div className="luxury-glass-card p-8 sm:p-10 space-y-6 border border-[#DFBA73]/40 bg-[#0B101B]">
            <div className="w-16 h-16 rounded-full bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="badge-gold text-[10px] uppercase font-bold tracking-wider">
                Transaction Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Payment Completed!
              </h1>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Thank you! Your payment via PayHere has been confirmed. Your listing boost has been automatically activated across RealEstateIQ.
              </p>
              {order_id && (
                <p className="text-[11px] font-mono text-neutral-400 bg-white/5 py-1.5 px-3 rounded-lg inline-block mt-2">
                  Order ID: {order_id}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/properties"
                className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center justify-center gap-2"
              >
                <Home size={14} /> View Live Properties
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary text-xs py-2.5 px-5 font-semibold flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

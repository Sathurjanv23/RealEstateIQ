import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function PaymentCancelPage() {
  const router = useRouter();
  const { order_id } = router.query;

  return (
    <>
      <Head>
        <title>Payment Cancelled — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Payment Incomplete">
        <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in text-center">
          <div className="luxury-glass-card p-8 sm:p-10 space-y-6 border border-white/10 bg-[#0B101B]">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <XCircle size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                Payment Not Completed
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Checkout Cancelled
              </h1>
              <p className="text-neutral-400 text-xs leading-relaxed">
                The payment transaction was cancelled. No funds were debited from your account. You can retry anytime.
              </p>
              {order_id && (
                <p className="text-[11px] font-mono text-neutral-400 bg-white/5 py-1.5 px-3 rounded-lg inline-block mt-2">
                  Order ID: {order_id}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Try Again
              </Link>
              <Link
                href="/properties"
                className="btn-secondary text-xs py-2.5 px-5 font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Properties
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

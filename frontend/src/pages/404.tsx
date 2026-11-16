import Head from 'next/head';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | RealEstateIQ</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#080A0E] hero-grid-pattern relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#DFBA73]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center max-w-md p-8 sm:p-10 luxury-glass-card shadow-2xl rounded-2xl relative z-10">
          <p className="text-8xl font-serif font-black text-[#DFBA73] mb-3">404</p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-neutral-400 text-xs mb-6">The luxury real estate page or resource you are looking for does not exist or has been relocated.</p>
          <Link href="/" className="btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2">
            <Home size={15} /> Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}

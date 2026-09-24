import Head from 'next/head';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | RealEstateIQ</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#061017] hero-grid-pattern relative overflow-hidden">
        <div className="text-center max-w-md p-8 card-premium bg-[#0B1722] border border-[#162E40] shadow-2xl rounded-2xl relative z-10">
          <p className="text-8xl font-black text-[#00DC82] mb-3">404</p>
          <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
          <p className="text-[#94A3B8] text-xs mb-6">The real estate page or resource you are looking for does not exist or has been relocated.</p>
          <Link href="/" className="btn-primary text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2">
            <Home size={15} /> Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}

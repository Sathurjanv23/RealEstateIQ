import Head from 'next/head';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | RealEstateIQ</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#F7F5F0]">
        <div className="text-center max-w-md p-8 card-premium bg-white border border-[#E7E3DA]">
          <p className="text-8xl font-black text-[#123B2A] mb-3">404</p>
          <h1 className="text-2xl font-black text-[#17231C] mb-2">Page Not Found</h1>
          <p className="text-[#718078] text-xs mb-6">The real estate page or resource you are looking for does not exist or has been relocated.</p>
          <Link href="/" className="btn-primary text-xs py-2.5 px-4">
            <Home size={15} /> Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}

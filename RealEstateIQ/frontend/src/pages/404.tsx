import Head from 'next/head';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | RealEstateIQ</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-9xl font-black text-gradient mb-4">404</p>
          <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-white/50 mb-8">The page you are looking for does not exist.</p>
          <Link href="/" className="btn-primary">
            <Home size={18} /> Go Home
          </Link>
        </div>
      </div>
    </>
  );
}

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, Home, MapPin, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/services';
import { Property } from '../types';

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: () => propertyService.getSaved(),
    enabled: isAuthenticated,
  });

  const properties: Property[] = data?.data?.data?.savedProperties?.filter(Boolean) || [];

  return (
    <>
      <Head><title>Saved Portfolio — RealEstateIQ</title></Head>
      <DashboardLayout title="Saved Portfolio">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif text-white">Saved Portfolio Assets</h2>
            <p className="text-neutral-400 text-xs mt-1">{properties.length} luxury assets bookmarked</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="luxury-glass-card p-16 text-center">
              <BookmarkCheck size={48} className="text-neutral-600 mx-auto mb-4" />
              <p className="text-white font-serif text-lg">No saved properties yet</p>
              <p className="text-neutral-400 text-xs mt-1">Browse properties and click the bookmark icon to save them to your portfolio.</p>
              <Link href="/properties" className="btn-primary mt-6 inline-flex text-xs py-2.5 px-4 font-bold">
                <Home size={15} /> Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((property) => (
                <div key={property._id} className="luxury-glass-card p-5 flex flex-col justify-between hover:border-[#DFBA73]/40 transition-all">
                  <div>
                    <div className="h-1.5 -mx-5 -mt-5 mb-4 rounded-t-xl bg-gradient-to-r from-[#DFBA73] to-[#C5A880]" />
                    <span className="text-[10px] uppercase font-bold mb-2.5 inline-flex px-2 py-0.5 rounded bg-[#DFBA73]/10 text-[#DFBA73] border border-[#DFBA73]/30">
                      {property.propertyType}
                    </span>
                    <h3 className="font-serif font-bold text-white mb-1 truncate text-base">{property.title}</h3>
                    <p className="text-neutral-400 text-xs mb-3 flex items-center gap-1">
                      <MapPin size={12} className="text-[#DFBA73]" /> {property.location}
                    </p>
                    <p className="text-neutral-400 text-xs mb-4 py-2 border-y border-white/[0.08]">
                      {property.area.toLocaleString()} sqft · {property.bedrooms} Bed · {property.bathrooms} Bath
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {property.askingPrice ? (
                      <p className="text-[#DFBA73] font-bold text-base">Rs. {property.askingPrice.toLocaleString()}</p>
                    ) : (
                      <p className="text-neutral-400 text-xs">Price on Inquiry</p>
                    )}
                    <Link
                      href={`/properties/${property._id}`}
                      className="text-xs font-bold text-[#DFBA73] hover:underline inline-flex items-center gap-1"
                    >
                      View <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

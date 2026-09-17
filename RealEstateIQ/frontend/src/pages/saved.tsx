import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, Home, Brain } from 'lucide-react';
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
      <Head><title>Saved Properties — RealEstateIQ</title></Head>
      <DashboardLayout title="Saved Properties">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Saved Properties</h2>
            <p className="text-white/50 text-sm mt-1">{properties.length} saved</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <BookmarkCheck size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-lg">No saved properties yet</p>
              <p className="text-white/30 text-sm mt-2">Browse properties and click the bookmark icon to save them.</p>
              <Link href="/properties" className="btn-primary mt-6 inline-flex">
                <Home size={16} /> Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <div key={property._id} className="glass-card-hover p-5">
                  <div className="h-1 -mx-5 -mt-5 mb-5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                  <span className="badge-indigo text-xs capitalize mb-3 inline-flex">{property.propertyType}</span>
                  <h3 className="font-semibold text-white mb-1 truncate">{property.title}</h3>
                  <p className="text-white/50 text-xs mb-3">{property.location}</p>
                  <p className="text-white/60 text-xs mb-4">{property.area.toLocaleString()} sqft · {property.bedrooms}BR · {property.bathrooms}BA</p>
                  {property.askingPrice && (
                    <p className="text-brand-400 font-bold mb-4">Rs. {property.askingPrice.toLocaleString()}</p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/properties/${property._id}`} className="btn-secondary text-xs py-2 flex-1 justify-center">View</Link>
                    <Link href={`/predict?area=${property.area}&bedrooms=${property.bedrooms}&bathrooms=${property.bathrooms}&location=${property.location}&house_age=${property.houseAge}&parking=${property.parking}&propertyId=${property._id}`}
                      className="btn-primary text-xs py-2 flex-1 justify-center">
                      <Brain size={12} /> Predict
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

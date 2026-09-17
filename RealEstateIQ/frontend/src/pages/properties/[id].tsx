import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Home, MapPin, Bed, Bath, Car, Calendar, Brain, BookmarkPlus, BookmarkCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService, predictionService } from '../../services/services';
import { Property } from '../../types';
import { useState } from 'react';

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getOne(id as string),
    enabled: !!id,
  });

  const property: Property | undefined = data?.data?.data?.property;

  const saveMutation = useMutation({
    mutationFn: () => saved ? propertyService.unsave(id as string) : propertyService.save(id as string),
    onSuccess: () => {
      setSaved(!saved);
      toast.success(saved ? 'Removed from saved.' : 'Property saved!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Action failed.');
    },
  });

  if (isLoading) return (
    <DashboardLayout title="Property">
      <div className="space-y-4 max-w-3xl mx-auto">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    </DashboardLayout>
  );

  if (error || !property) return (
    <DashboardLayout title="Property">
      <div className="glass-card p-16 text-center max-w-xl mx-auto">
        <Home size={48} className="text-white/20 mx-auto mb-4" />
        <p className="text-white/40">Property not found.</p>
        <Link href="/properties" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={16} /> Back to Properties
        </Link>
      </div>
    </DashboardLayout>
  );

  const pricePerSqft = property.askingPrice && property.area > 0
    ? Math.round(property.askingPrice / property.area)
    : null;

  return (
    <>
      <Head>
        <title>{property.title} — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Property Details">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <Link href="/properties" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Properties
          </Link>

          {/* Header card */}
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <span className="badge-indigo text-xs capitalize mb-3 inline-flex">{property.propertyType}</span>
                <h1 className="text-2xl font-bold text-white mb-2">{property.title}</h1>
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <MapPin size={14} /> {property.location}{property.district ? `, ${property.district}` : ''}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {property.askingPrice && (
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Asking Price</p>
                    <p className="text-3xl font-black text-brand-400">Rs. {property.askingPrice.toLocaleString()}</p>
                    {pricePerSqft && <p className="text-xs text-white/40 mt-1">Rs. {pricePerSqft.toLocaleString()}/sqft</p>}
                  </div>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className={`btn-secondary text-sm py-2 ${saved ? 'border-brand-500/50' : ''}`}
                  >
                    {saved ? <><BookmarkCheck size={16} /> Saved</> : <><BookmarkPlus size={16} /> Save</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property specs */}
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4">Property Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Home size={16} className="text-brand-400" />, label: 'Area', value: `${property.area.toLocaleString()} sqft` },
                  { icon: <Bed size={16} className="text-brand-400" />, label: 'Bedrooms', value: property.bedrooms },
                  { icon: <Bath size={16} className="text-brand-400" />, label: 'Bathrooms', value: property.bathrooms },
                  { icon: <Car size={16} className="text-brand-400" />, label: 'Parking', value: property.parking },
                  { icon: <Calendar size={16} className="text-brand-400" />, label: 'House Age', value: `${property.houseAge} years` },
                  ...(property.landSize ? [{ icon: <MapPin size={16} className="text-brand-400" />, label: 'Land Size', value: `${property.landSize} perches` }] : []),
                ].map((spec) => (
                  <div key={spec.label} className="p-3 rounded-xl bg-surface-700">
                    <div className="flex items-center gap-2 mb-1">{spec.icon}<p className="text-xs text-white/40">{spec.label}</p></div>
                    <p className="text-sm font-medium text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4">Amenities</h2>
              {property.amenities.length === 0 ? (
                <p className="text-white/30 text-sm">No amenities listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="badge-indigo text-xs">{a}</span>
                  ))}
                </div>
              )}

              {property.description && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-2 text-sm">Description</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* ML Predict CTA */}
          {isAuthenticated && (
            <div className="glass-card p-6 border-brand-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <Brain size={18} className="text-brand-400" /> Get ML Value Estimate
                  </h3>
                  <p className="text-white/50 text-sm">
                    Run the AI model on this property&apos;s specifications to get an estimated market value.
                  </p>
                </div>
                <Link
                  href={`/predict?area=${property.area}&bedrooms=${property.bedrooms}&bathrooms=${property.bathrooms}&location=${property.location}&house_age=${property.houseAge}&parking=${property.parking}&propertyId=${property._id}`}
                  className="btn-primary text-sm"
                >
                  <Brain size={16} /> Predict This Property
                </Link>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

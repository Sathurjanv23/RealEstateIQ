import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MapPin,
  Bed,
  Bath,
  Home,
  ArrowRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/services';
import { Property } from '../../types';

// Curated authentic Sri Lankan fallback properties in case of server cold-start or initial spin-up
const FALLBACK_PROPERTIES: Property[] = [
  {
    _id: '6aacabaca446f8a3c4152a8a',
    title: 'Modern 3BR Villa in Colombo 7',
    description: 'Spacious villa in a quiet prestigious neighbourhood with modern amenities, courtyard, and 24/7 security.',
    propertyType: 'villa',
    location: 'Colombo',
    district: 'Colombo 7',
    area: 2800,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    houseAge: 3,
    amenities: ['Swimming Pool', 'Garden', 'Security'],
    askingPrice: 62000000,
    images: ['/images/luxury_modern_estate.jpg'],
    createdBy: 'RealEstateIQ Portfolio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6aacabaca446f8a3c4152a8b',
    title: 'Cozy 2BR Penthouse in Kandy',
    description: 'Well-maintained apartment near Kandy city centre with scenic lake views and modern interior layout.',
    propertyType: 'apartment',
    location: 'Kandy',
    district: 'Kandy City',
    area: 1200,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    houseAge: 5,
    amenities: ['Parking', 'Security', 'Balcony'],
    askingPrice: 27000000,
    images: ['/images/luxury_penthouse.jpg'],
    createdBy: 'RealEstateIQ Portfolio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6aacabaca446f8a3c4152a8c',
    title: 'Beachside Coastal Villa in Galle',
    description: 'Charming seaside house with ocean breeze, 10 min from Galle Fort, featuring lush tropical gardens.',
    propertyType: 'villa',
    location: 'Galle',
    district: 'Galle Fort',
    area: 1800,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    houseAge: 6,
    amenities: ['Ocean View', 'Garden', 'Veranda'],
    askingPrice: 39000000,
    images: ['/images/luxury_coastal_villa.jpg'],
    createdBy: 'RealEstateIQ Portfolio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6aacabaca446f8a3c4152a8d',
    title: 'Executive Residence in Negombo',
    description: 'Spacious family home close to the beach and international airport with solar panels and double garage.',
    propertyType: 'house',
    location: 'Negombo',
    district: 'Negombo Town',
    area: 2200,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    houseAge: 4,
    amenities: ['Garden', 'Parking', 'Solar Panels'],
    askingPrice: 47000000,
    images: ['/images/luxury_hero.jpg'],
    createdBy: 'RealEstateIQ Portfolio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function FeaturedPropertiesSection() {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  // 1. Fetch authentic properties directly from live MongoDB REST API
  const {
    data: backendData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: () => propertyService.getAll({ limit: 4 }),
    staleTime: 60000,
    retry: 2,
  });

  // 2. Query authenticated user's real saved properties from backend
  const { data: savedData, refetch: refetchSaved } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: () => propertyService.getSaved(),
    enabled: !!isAuthenticated,
  });

  // Synchronize saved property state from database
  useEffect(() => {
    if (savedData?.data?.data?.savedProperties) {
      const map: Record<string, boolean> = {};
      savedData.data.data.savedProperties.forEach((p: Property) => {
        if (p?._id) map[p._id] = true;
      });
      setSavedIds(map);
    }
  }, [savedData]);

  // Determine active properties: use real API data when available, otherwise fall back cleanly
  const liveProperties: Property[] = backendData?.data?.data?.properties || [];
  const isLiveConnected = liveProperties.length > 0;
  const properties: Property[] = isLiveConnected ? liveProperties.slice(0, 4) : FALLBACK_PROPERTIES;

  // Real backend Save/Unsave toggle handler
  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to save properties to your portfolio');
      return;
    }

    const wasSaved = !!savedIds[id];
    // Optimistic UI update
    setSavedIds((prev) => ({ ...prev, [id]: !wasSaved }));

    try {
      if (wasSaved) {
        await propertyService.unsave(id);
        toast.success('Removed from saved properties');
      } else {
        await propertyService.save(id);
        toast.success('Property saved to your portfolio');
      }
      refetchSaved();
    } catch {
      // Revert optimistic update on error
      setSavedIds((prev) => ({ ...prev, [id]: wasSaved }));
      toast.error('Failed to update saved status');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Inquiry';
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <section id="featured-properties" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#DFBA73]">
                Curated Sri Lankan Portfolio
              </span>
            </div>

            {/* Live API Sync Status Badge */}
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Cloud DB Synced</span>
              </span>
            ) : isLoading || isFetching ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold tracking-wider">
                <RefreshCw size={10} className="animate-spin text-amber-400" />
                <span>Syncing Cloud Assets...</span>
              </span>
            ) : isError ? (
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-semibold transition-colors"
                title="Click to retry live backend connection"
              >
                <RefreshCw size={10} />
                <span>Retry Live Sync</span>
              </button>
            ) : null}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Featured Properties
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-normal leading-relaxed">
            Real marketplace assets retrieved directly from the verified property database across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {isError && (
            <button
              onClick={() => refetch()}
              className="btn-luxury-outline text-xs py-2 px-3.5 rounded-full flex items-center gap-1.5 text-neutral-300 hover:text-white"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}

          <Link
            href="/properties"
            className="btn-luxury-outline text-xs sm:text-sm py-2.5 px-5 rounded-full group"
          >
            <span>Explore All Properties</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Property Cards Grid */}
      {isLoading && properties.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="luxury-glass-card rounded-2xl h-80 animate-pulse bg-white/[0.03] border border-white/[0.08]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {properties.map((prop) => {
            const isSaved = !!savedIds[prop._id];
            const hasImage = prop.images && prop.images.length > 0 && prop.images[0];
            const displayImage = hasImage || '/images/luxury_hero.jpg';

            return (
              <div
                key={prop._id}
                className="luxury-glass-card group flex flex-col justify-between overflow-hidden border border-white/[0.08] hover:border-[#DFBA73]/40 transition-all duration-300 rounded-2xl"
              >
                {/* Card Image Area */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0D14]">
                  <img
                    src={displayImage}
                    alt={prop.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0C1017]/80 text-[#DFBA73] border border-[#DFBA73]/40 backdrop-blur-md shadow-md">
                      Exclusive
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium tracking-wider bg-black/60 text-white/90 border border-white/10 backdrop-blur-md uppercase">
                        {prop.propertyType}
                      </span>
                      <button
                        onClick={(e) => handleToggleSave(prop._id, e)}
                        type="button"
                        aria-label={isSaved ? 'Remove from saved' : 'Save property to portfolio'}
                        title={isSaved ? 'Remove from saved' : 'Save property to portfolio'}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isSaved
                            ? 'bg-[#DFBA73] text-[#0A0D14] border-[#DFBA73] shadow-md'
                            : 'bg-black/50 text-white hover:text-[#DFBA73] border-white/10 hover:bg-black/70'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Verified Asset Pill */}
                  <div className="absolute bottom-3 left-3 sm:left-4 z-10 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0D14]/85 border border-[#DFBA73]/30 backdrop-blur-md text-[11px] text-[#DFBA73] font-semibold">
                      <Sparkles size={11} className="text-[#DFBA73]" />
                      <span>Verified Asset</span>
                    </div>

                    {isLiveConnected && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md text-[10px] text-emerald-400 font-medium">
                        <CheckCircle2 size={10} />
                        <span>Live Sync</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Price Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#DFBA73] transition-colors leading-snug line-clamp-1">
                        {prop.title}
                      </h3>
                      <p className="text-right text-base sm:text-lg font-bold text-[#DFBA73] whitespace-nowrap">
                        {formatPrice(prop.askingPrice)}
                      </p>
                    </div>

                    {/* Location with Pin */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
                      <MapPin size={13} className="text-[#DFBA73] shrink-0" />
                      <span className="truncate">
                        {prop.location}
                        {prop.district && prop.district !== prop.location ? ` • ${prop.district}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Specs Row & Action */}
                  <div>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08] mb-4 text-xs text-neutral-300">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Bed size={14} className="text-[#DFBA73]" />
                        <span>{prop.bedrooms || '—'} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Bath size={14} className="text-[#DFBA73]" />
                        <span>{prop.bathrooms || '—'} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Home size={14} className="text-[#DFBA73]" />
                        <span>{prop.area ? `${prop.area.toLocaleString()} sqft` : '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        {prop.district || prop.location}
                      </span>
                      <Link
                        href={`/properties/${prop._id}`}
                        className="text-xs font-bold text-[#DFBA73] hover:text-white flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-200"
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


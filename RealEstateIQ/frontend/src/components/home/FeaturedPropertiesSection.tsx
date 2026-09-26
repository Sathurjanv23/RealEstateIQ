import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Bed, Bath, Home, ArrowRight, Sparkles, Bookmark, BookmarkCheck, RefreshCw } from 'lucide-react';
import { propertyService } from '../../services/services';
import { Property } from '../../types';

export function FeaturedPropertiesSection() {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  // Query authentic database properties
  const { data: backendData, isLoading } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: () => propertyService.getAll({ limit: 4 }),
    staleTime: 60000,
    retry: 2,
  });

  const properties: Property[] = backendData?.data?.data?.properties || [];

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Inquiry';
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <section id="featured-properties" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#DFBA73]">
              Curated Sri Lankan Portfolio
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Featured Properties
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-normal leading-relaxed">
            Real marketplace assets retrieved directly from the verified property database.
          </p>
        </div>

        <Link
          href="/properties"
          className="btn-luxury-outline text-xs sm:text-sm py-2.5 px-5 rounded-full self-start sm:self-auto group"
        >
          <span>Explore All Properties</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Property Cards Grid: Desktop 2-4 (2x2 grid), Tablet 2, Mobile 1 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="luxury-glass-card rounded-2xl h-80 animate-pulse bg-white/[0.03] border border-white/[0.08]" />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {properties.slice(0, 4).map((prop) => {
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
                        onClick={(e) => toggleSave(prop._id, e)}
                        type="button"
                        aria-label={isSaved ? 'Remove from saved' : 'Save property'}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isSaved
                            ? 'bg-[#DFBA73] text-[#0A0D14] border-[#DFBA73]'
                            : 'bg-black/50 text-white hover:text-[#DFBA73] border-white/10'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* AI Verified Pill */}
                  <div className="absolute bottom-3 left-3 sm:left-4 z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0D14]/85 border border-[#DFBA73]/30 backdrop-blur-md text-[11px] text-[#DFBA73] font-semibold">
                      <Sparkles size={11} className="text-[#DFBA73]" />
                      <span>Verified Asset</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Price Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#DFBA73] transition-colors leading-snug">
                        {prop.title}
                      </h3>
                      <p className="text-right text-base sm:text-lg font-bold text-[#DFBA73] whitespace-nowrap">
                        {formatPrice(prop.askingPrice)}
                      </p>
                    </div>

                    {/* Location with Pin */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
                      <MapPin size={13} className="text-[#DFBA73] shrink-0" />
                      <span className="truncate">{prop.location}{prop.district ? ` • ${prop.district}` : ''}</span>
                    </div>
                  </div>

                  {/* Specs Row & Action */}
                  <div>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08] mb-4 text-xs text-neutral-300">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Bed size={14} className="text-[#DFBA73]" />
                        <span>{prop.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Bath size={14} className="text-[#DFBA73]" />
                        <span>{prop.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Home size={14} className="text-[#DFBA73]" />
                        <span>{prop.area.toLocaleString()} sqft</span>
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
      ) : (
        <div className="luxury-glass-card p-12 text-center rounded-2xl border border-white/[0.08] text-xs text-neutral-400">
          Real property listings will appear here directly from your database.
        </div>
      )}
    </section>
  );
}

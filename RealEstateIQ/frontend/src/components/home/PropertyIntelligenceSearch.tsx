import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MapPin, Home, Bed, Sparkles, DollarSign, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { SL_LOCATIONS } from '../../utils/sriLankaLocations';

export function PropertyIntelligenceSearch() {
  const router = useRouter();
  const [location, setLocation] = useState('Colombo');
  const [propertyType, setPropertyType] = useState('villa');
  const [bedrooms, setBedrooms] = useState('3');
  const [area, setArea] = useState('2400');
  const [budget, setBudget] = useState('50M-100M');

  const propertyTypes = [
    { value: 'villa', label: 'Luxury Villa' },
    { value: 'house', label: 'Single Family House' },
    { value: 'apartment', label: 'Sky Penthouse / Apartment' },
    { value: 'commercial', label: 'Commercial Prime' },
    { value: 'land', label: 'Development Land Parcel' },
  ];

  const budgetOptions = [
    { value: '', label: 'All Budgets' },
    { value: 'under-30M', label: 'Under Rs. 30M' },
    { value: '30M-60M', label: 'Rs. 30M – 60M' },
    { value: '60M-100M', label: 'Rs. 60M – 100M' },
    { value: 'over-100M', label: 'Above Rs. 100M' },
  ];

  const handleGetValuation = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/predict',
      query: {
        location,
        propertyType,
        bedrooms,
        area: area || '2000',
        bathrooms: Math.max(1, Number(bedrooms) - 1).toString(),
        house_age: '3',
      },
    });
  };

  const handleExploreListings = () => {
    router.push({
      pathname: '/properties',
      query: {
        location,
        type: propertyType,
        bedrooms,
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="luxury-search-panel rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-8 relative overflow-hidden">
        {/* Ambient Top Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#DFBA73]/60 to-transparent" />

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#DFBA73] animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-[#DFBA73]">
              Property Intelligence
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline-block">
            Calibrated on 14,833 authentic Sri Lanka market transactions
          </span>
        </div>

        {/* Search Controls Form */}
        <form onSubmit={handleGetValuation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Control 1: Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} className="text-[#DFBA73]" /> Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0A0D14]/90 border border-white/[0.12] hover:border-[#DFBA73]/50 focus:border-[#DFBA73] text-white text-xs sm:text-sm rounded-xl px-3.5 py-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DFBA73]/40 transition-all font-medium cursor-pointer"
                >
                  {SL_LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value} className="bg-[#0A0D14] text-white">
                      {loc.label} ({loc.province})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Control 2: Property Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home size={12} className="text-[#DFBA73]" /> Property Type
              </label>
              <div className="relative">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-[#0A0D14]/90 border border-white/[0.12] hover:border-[#DFBA73]/50 focus:border-[#DFBA73] text-white text-xs sm:text-sm rounded-xl px-3.5 py-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DFBA73]/40 transition-all font-medium cursor-pointer"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#0A0D14] text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Control 3: Bedrooms */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bed size={12} className="text-[#DFBA73]" /> Bedrooms
              </label>
              <div className="relative">
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-[#0A0D14]/90 border border-white/[0.12] hover:border-[#DFBA73]/50 focus:border-[#DFBA73] text-white text-xs sm:text-sm rounded-xl px-3.5 py-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DFBA73]/40 transition-all font-medium cursor-pointer"
                >
                  <option value="1" className="bg-[#0A0D14] text-white">1 Bedroom</option>
                  <option value="2" className="bg-[#0A0D14] text-white">2 Bedrooms</option>
                  <option value="3" className="bg-[#0A0D14] text-white">3 Bedrooms</option>
                  <option value="4" className="bg-[#0A0D14] text-white">4 Bedrooms</option>
                  <option value="5" className="bg-[#0A0D14] text-white">5+ Bedrooms</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Control 4: Area (sqft) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-[#DFBA73]" /> Area (sqft)
              </label>
              <input
                type="number"
                min="300"
                max="30000"
                step="50"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 2400"
                className="w-full bg-[#0A0D14]/90 border border-white/[0.12] hover:border-[#DFBA73]/50 focus:border-[#DFBA73] text-white text-xs sm:text-sm rounded-xl px-3.5 py-3 focus:outline-none focus:ring-1 focus:ring-[#DFBA73]/40 transition-all font-medium"
              />
            </div>

            {/* Control 5: Budget */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={12} className="text-[#DFBA73]" /> Budget
              </label>
              <div className="relative">
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0A0D14]/90 border border-white/[0.12] hover:border-[#DFBA73]/50 focus:border-[#DFBA73] text-white text-xs sm:text-sm rounded-xl px-3.5 py-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#DFBA73]/40 transition-all font-medium cursor-pointer"
                >
                  {budgetOptions.map((b) => (
                    <option key={b.value} value={b.value} className="bg-[#0A0D14] text-white">
                      {b.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleExploreListings}
              className="btn-luxury-outline text-xs sm:text-sm py-3 px-5 rounded-xl font-medium order-2 sm:order-1"
            >
              Browse Matching Listings
            </button>
            <button
              type="submit"
              id="get-valuation-button"
              className="btn-luxury-gold text-xs sm:text-sm py-3 px-7 rounded-xl font-bold flex items-center justify-center gap-2 shadow-btn-gold order-1 sm:order-2"
            >
              <Sparkles size={16} />
              <span>Get Valuation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

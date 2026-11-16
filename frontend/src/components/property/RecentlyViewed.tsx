import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Eye, MapPin, Bed, Bath, ArrowRight, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useAreaUnit } from '../../context/UnitContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import { Property } from '../../types';

const RECENTLY_VIEWED_KEY = 'realestateiq_recently_viewed';
const MAX_RECENT = 8;

export interface SimplifiedRecentProperty {
  _id: string;
  title: string;
  askingPrice?: number;
  location: string;
  district?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  listingType?: 'sale' | 'rent';
  images?: string[];
  viewedAt: string;
}

export function addToRecentlyViewed(property: Property) {
  if (typeof window === 'undefined' || !property?._id) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: SimplifiedRecentProperty[] = raw ? JSON.parse(raw) : [];
    
    // Filter out if already present
    const filtered = list.filter((item) => item._id !== property._id);
    
    const entry: SimplifiedRecentProperty = {
      _id: property._id,
      title: property.title,
      askingPrice: property.askingPrice,
      location: property.location,
      district: property.district,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      propertyType: property.propertyType,
      listingType: property.listingType || 'sale',
      images: property.images || [],
      viewedAt: new Date().toISOString(),
    };

    filtered.unshift(entry);
    const trimmed = filtered.slice(0, MAX_RECENT);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save to recently viewed:', err);
  }
}

export function RecentlyViewed() {
  const [items, setItems] = useState<SimplifiedRecentProperty[]>([]);
  const { formatPrice } = useCurrency();
  const { formatArea } = useAreaUnit();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      setItems([]);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    setItems([]);
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recently Viewed Properties
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold">
                {items.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Properties you inspected during your recent market research
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
          title="Clear browsing history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const hasImage = item.images && item.images.length > 0 && item.images[0];
          const isRental = item.listingType === 'rent';

          return (
            <Link
              key={item._id}
              href={`/properties/${item._id}`}
              className="group flex flex-col bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all transform hover:-translate-y-1"
            >
              <div className="relative h-36 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                {hasImage ? (
                  <img
                    src={resolveImageUrl(item.images![0])}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Eye className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider text-white ${
                      isRental ? 'bg-emerald-600' : 'bg-indigo-600'
                    }`}
                  >
                    {isRental ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.district || item.location}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block -mb-0.5">Price</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatPrice(item.askingPrice || 0)}
                      {isRental && <span className="text-[10px] text-slate-400 font-normal"> /mo</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.bedrooms > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Bed className="w-3 h-3" /> {item.bedrooms}
                      </span>
                    )}
                    {item.area > 0 && (
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {formatArea(item.area)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

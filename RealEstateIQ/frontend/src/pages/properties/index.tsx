import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, Home, MapPin, Bed, Bath, Car, BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight, X, Map, LayoutGrid } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/services';
import { Property } from '../../types';
import { SL_LOCATIONS_GROUPED } from '../../utils/sriLankaLocations';

const PropertyMap = dynamic(() => import('../../components/map/PropertyMap'), {
  ssr: false,
  loading: () => <div className="skeleton h-[550px] w-full rounded-2xl" />,
});

const TYPES = ['', 'house', 'apartment', 'land', 'commercial', 'villa'];

function PropertyCard({ property, onSave, saved }: { property: Property; onSave: (id: string) => void; saved: boolean }) {
  const hasImage = property.images && property.images.length > 0 && property.images[0];

  return (
    <div className="glass-card-hover overflow-hidden group flex flex-col justify-between">
      <div>
        {hasImage ? (
          <div className="h-44 w-full relative overflow-hidden bg-surface-800">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="badge-indigo text-xs absolute top-3 left-3 capitalize backdrop-blur-md bg-surface-900/80 shadow">
              {property.propertyType}
            </span>
          </div>
        ) : (
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              {!hasImage && (
                <span className="badge-indigo text-xs mb-2 inline-flex capitalize">{property.propertyType}</span>
              )}
              <h3 className="font-semibold text-white text-sm truncate mt-1">{property.title}</h3>
            </div>
            <button
              onClick={() => onSave(property._id)}
              className={`ml-2 p-2 rounded-lg transition-all ${saved ? 'text-brand-400 bg-brand-500/20' : 'text-white/30 hover:text-brand-400 hover:bg-brand-500/10'}`}
            >
              {saved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
            </button>
          </div>

        <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <MapPin size={12} /> {property.location}{property.district ? `, ${property.district}` : ''}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Home size={12} className="text-brand-400" /> {property.area.toLocaleString()} sqft
          </div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Bed size={12} className="text-brand-400" /> {property.bedrooms}BR
          </div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Bath size={12} className="text-brand-400" /> {property.bathrooms}BA
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {property.askingPrice ? (
              <p className="text-brand-400 font-bold text-sm">Rs. {property.askingPrice.toLocaleString()}</p>
            ) : (
              <p className="text-white/30 text-sm">Price not set</p>
            )}
          </div>
          <Link
            href={`/properties/${property._id}`}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ location: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { data: savedData } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: () => propertyService.getSaved(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (savedData?.data?.data?.saved) {
      const ids = new Set<string>(
        savedData.data.data.saved.map((s: { property?: { _id: string } | string }) =>
          typeof s.property === 'object' && s.property !== null ? s.property._id : String(s.property)
        )
      );
      setSavedIds(ids);
    }
  }, [savedData]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['properties', page, search, filters],
    queryFn: () => propertyService.getAll({ page, limit: 12, search: search || undefined, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }),
  });

  const properties: Property[] = data?.data?.data?.properties || [];
  const pagination = data?.data?.data?.pagination;

  const handleSave = async (id: string) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      if (savedIds.has(id)) {
        await propertyService.unsave(id);
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        toast.success('Property removed from saved.');
      } else {
        await propertyService.save(id);
        setSavedIds(prev => new Set([...prev, id]));
        toast.success('Property saved!');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save property.');
    }
  };

  return (
    <>
      <Head>
        <title>Properties — RealEstateIQ</title>
        <meta name="description" content="Browse and search properties across Colombo, Kandy, Galle, and Negombo." />
      </Head>
      <DashboardLayout title="Properties">
        <div className="space-y-6 animate-fade-in">
          {/* Search & filters */}
          <div className="glass-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-dark pl-9 text-sm"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-surface-900/90 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'map'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  title="Map View"
                >
                  <Map size={14} /> Map
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary text-sm py-2 ${showFilters ? 'border-brand-500/50 bg-brand-500/10' : ''}`}
              >
                <Filter size={16} /> Filters
              </button>
              {isAuthenticated && (
                <Link href="/properties/new" className="btn-primary text-sm py-2">
                  + Add Property
                </Link>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-5 gap-3 animate-slide-up">
                <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="input-dark text-sm py-2">
                  <option value="">All Locations</option>
                  {Object.entries(SL_LOCATIONS_GROUPED).map(([province, locs]) => (
                    <optgroup key={province} label={`— ${province}`}>
                      {locs.map(loc => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })} className="input-dark text-sm py-2">
                  <option value="">All Types</option>
                  {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
                <input type="number" placeholder="Min Price" value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="input-dark text-sm py-2" />
                <input type="number" placeholder="Max Price" value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="input-dark text-sm py-2" />
                <input type="number" placeholder="Min Bedrooms" value={filters.bedrooms}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                  className="input-dark text-sm py-2" />
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-sm">
              {pagination ? `${pagination.total} properties found` : ''}
              {viewMode === 'map' && ' — Interactive Map View'}
            </p>
            {pagination && <p className="text-white/30 text-xs">Page {pagination.page} of {pagination.pages}</p>}
          </div>

          {/* Content View: Grid or Map */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Home size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-lg">No properties found</p>
              <p className="text-white/30 text-sm mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : viewMode === 'map' ? (
            <div className="animate-fade-in">
              <PropertyMap
                properties={properties}
                height="600px"
                centerCity={filters.location || undefined}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} onSave={handleSave} saved={savedIds.has(prop._id)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-white/50 text-sm">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

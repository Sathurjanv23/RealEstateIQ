import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, Home, MapPin, Bed, Bath, BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight, X, Map, LayoutGrid } from 'lucide-react';
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
    <div className="card-premium-hover overflow-hidden group flex flex-col justify-between bg-white border border-[#E7E3DA]">
      <div>
        {hasImage ? (
          <div className="h-48 w-full relative overflow-hidden bg-[#EFECE3]">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF4DC] text-[#8B6A14] border border-[#ECD57F] shadow-sm">
              {property.propertyType}
            </span>
          </div>
        ) : (
          <div className="h-2 w-full bg-[#123B2A]" />
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              {!hasImage && (
                <span className="badge-forest text-[10px] uppercase font-bold mb-2 inline-flex">
                  {property.propertyType}
                </span>
              )}
              <h3 className="font-bold text-[#17231C] text-sm truncate mt-0.5">{property.title}</h3>
            </div>
            <button
              onClick={() => onSave(property._id)}
              className={`p-2 rounded-lg transition-all ${
                saved
                  ? 'text-[#C9A227] bg-[#FAF4DC]'
                  : 'text-[#718078] hover:text-[#123B2A] hover:bg-[#F7F5F0]'
              }`}
              title={saved ? 'Remove from saved' : 'Save property'}
            >
              {saved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-[#718078] text-xs mb-3">
            <MapPin size={12} className="text-[#C9A227]" /> {property.location}{property.district ? `, ${property.district}` : ''}
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#E7E3DA] mb-4 text-xs text-[#718078]">
            <div className="flex items-center gap-1">
              <Home size={12} className="text-[#2F6B4F]" /> {property.area.toLocaleString()} sqft
            </div>
            <div className="flex items-center gap-1">
              <Bed size={12} className="text-[#2F6B4F]" /> {property.bedrooms} Beds
            </div>
            <div className="flex items-center gap-1">
              <Bath size={12} className="text-[#2F6B4F]" /> {property.bathrooms} Baths
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {property.askingPrice ? (
                <p className="text-[#123B2A] font-black text-base">Rs. {property.askingPrice.toLocaleString()}</p>
              ) : (
                <p className="text-[#718078] text-xs font-semibold">Price on Inquiry</p>
              )}
            </div>
            <Link
              href={`/properties/${property._id}`}
              className="text-xs font-bold text-[#2F6B4F] hover:text-[#123B2A] transition-colors"
            >
              View Asset →
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
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const queryParams = {
    page,
    limit: 12,
    ...(search && { search }),
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
  };

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => propertyService.getAll(queryParams),
    enabled: isAuthenticated,
  });

  const { data: savedData } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: () => propertyService.getSaved(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (savedData?.data?.data?.savedProperties) {
      setSavedIds(savedData.data.data.savedProperties.map((p: Property) => p?._id).filter(Boolean));
    }
  }, [savedData]);

  const properties: Property[] = data?.data?.data?.properties || [];
  const pagination = data?.data?.data?.pagination;

  const handleSave = async (id: string) => {
    const isSaved = savedIds.includes(id);
    try {
      if (isSaved) {
        await propertyService.unsave(id);
        setSavedIds(savedIds.filter((s) => s !== id));
        toast.success('Removed from saved properties');
      } else {
        await propertyService.save(id);
        setSavedIds([...savedIds, id]);
        toast.success('Property saved to portfolio');
      }
    } catch {
      toast.error('Action failed.');
    }
  };

  const clearFilters = () => {
    setFilters({ location: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' });
    setSearch('');
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <Head>
        <title>Sri Lanka Properties — RealEstateIQ</title>
        <meta name="description" content="Browse authentic real estate listings and portfolio assets across Sri Lanka." />
      </Head>
      <DashboardLayout title="Property Inventory">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          {/* Header controls: Search & Mode toggle */}
          <div className="card-premium p-4 bg-white border border-[#E7E3DA]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
                <input
                  type="text"
                  placeholder="Search properties by title, district or features..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-10 py-2.5 text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary text-xs py-2 px-3.5 ${
                    activeFilterCount > 0 ? 'border-[#123B2A] text-[#123B2A] bg-[#EBF3EE]' : ''
                  }`}
                >
                  <Filter size={14} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#123B2A] text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View Mode Toggle: Grid vs Map */}
                <div className="flex items-center border border-[#E7E3DA] rounded-xl overflow-hidden p-0.5 bg-[#FAF9F6]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'grid' ? 'bg-[#123B2A] text-white shadow-sm' : 'text-[#718078] hover:text-[#17231C]'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'map' ? 'bg-[#123B2A] text-white shadow-sm' : 'text-[#718078] hover:text-[#17231C]'
                    }`}
                    title="Map View"
                  >
                    <Map size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter expansion panel */}
            {showFilters && (
              <div className="pt-4 mt-4 border-t border-[#E7E3DA] grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">District / City</label>
                  <select
                    value={filters.location}
                    onChange={(e) => { setFilters({ ...filters, location: e.target.value }); setPage(1); }}
                    className="input-field py-2 text-xs"
                  >
                    <option value="">All Locations</option>
                    {Object.entries(SL_LOCATIONS_GROUPED).map(([province, locs]) => (
                      <optgroup key={province} label={`— ${province}`}>
                        {locs.map(loc => (
                          <option key={loc.value} value={loc.value}>{loc.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => { setFilters({ ...filters, propertyType: e.target.value }); setPage(1); }}
                    className="input-field py-2 text-xs"
                  >
                    <option value="">All Types</option>
                    {TYPES.filter(Boolean).map(t => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">Min Price (LKR)</label>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => { setFilters({ ...filters, minPrice: e.target.value }); setPage(1); }}
                    className="input-field py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">Max Price (LKR)</label>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => { setFilters({ ...filters, maxPrice: e.target.value }); setPage(1); }}
                    className="input-field py-2 text-xs"
                  />
                </div>

                {activeFilterCount > 0 && (
                  <div className="col-span-2 sm:col-span-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[#C94C4C] hover:text-[#A63838] font-bold flex items-center gap-1"
                    >
                      <X size={13} /> Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="card-premium p-4 bg-white border border-[#E7E3DA]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#17231C]">
                  Interactive Sri Lanka Asset Map ({properties.length} displayed)
                </span>
                <span className="text-xs text-[#718078]">Click any pin to inspect pricing</span>
              </div>
              <PropertyMap properties={properties} height="560px" />
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-80 rounded-2xl" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="card-premium p-16 text-center bg-white border border-[#E7E3DA]">
                  <Home size={40} className="text-[#DCD6CB] mx-auto mb-3" />
                  <p className="text-[#17231C] font-bold text-base">No properties match your filter criteria.</p>
                  <p className="text-[#718078] text-xs mt-1">Try broadening your search or resetting district filters.</p>
                  <button onClick={clearFilters} className="btn-secondary mt-5 text-xs py-2 px-4">
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop._id}
                      property={prop}
                      onSave={handleSave}
                      saved={savedIds.includes(prop._id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 pb-8">
              <p className="text-xs text-[#718078] font-medium">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total} properties
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="btn-secondary p-2 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#17231C] px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary p-2 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

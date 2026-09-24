import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { GitCompare, Plus, X, Home, Bed, Bath, Car, MapPin, Brain } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/services';
import { Property } from '../types';
import Link from 'next/link';

interface ComparisonResult {
  property: Property;
  estimatedValue: number | null;
  estimatedPricePerSqft: number | null;
  pricePerSqft: number | null;
}

export default function ComparePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [ids, setIds] = useState(['', '']);
  const [results, setResults] = useState<ComparisonResult[] | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const { data: propData } = useQuery({
    queryKey: ['availablePropertiesForCompare'],
    queryFn: () => propertyService.getAll({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const availableProperties: Property[] = propData?.data?.data?.properties || [];

  const compareMutation = useMutation({
    mutationFn: (idsToCompare?: string[]) => propertyService.compare((idsToCompare || ids).filter(Boolean)),
    onSuccess: (data) => {
      setResults(data.data.data.comparisons);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Comparison failed.');
    },
  });

  useEffect(() => {
    if (!router.isReady) return;
    const queryIds = router.query.ids;
    if (queryIds) {
      const parsed = (Array.isArray(queryIds) ? queryIds[0] : queryIds).split(',').filter(Boolean);
      if (parsed.length >= 2) {
        setIds(parsed);
        compareMutation.mutate(parsed);
      } else if (parsed.length === 1) {
        setIds([parsed[0], '']);
      }
    }
  }, [router.isReady, router.query.ids]);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    const validIds = ids.filter(Boolean);
    if (validIds.length < 2) {
      toast.error('Select at least 2 properties to compare.');
      return;
    }
    compareMutation.mutate();
  };

  const addId = () => { if (ids.length < 5) setIds([...ids, '']); };
  const removeId = (i: number) => setIds(ids.filter((_, idx) => idx !== i));

  return (
    <>
      <Head><title>Compare Assets — RealEstateIQ</title></Head>
      <DashboardLayout title="Asset Comparison">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-[#17231C]">Property Asset Comparison</h2>
            <p className="text-[#718078] text-xs mt-1">Benchmark up to 5 properties side-by-side with valuation metrics</p>
          </div>

          {/* Selector form */}
          <div className="card-premium p-6 bg-white border border-[#E7E3DA]">
            <h3 className="font-bold text-[#17231C] text-sm mb-2 flex items-center gap-2">
              <GitCompare size={16} className="text-[#123B2A]" /> Select Assets to Compare
            </h3>
            <p className="text-[#718078] text-xs mb-4">
              Choose properties from your portfolio inventory or enter property IDs.
            </p>
            <form onSubmit={handleCompare} className="space-y-3">
              {ids.map((id, i) => (
                <div key={i} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  {availableProperties.length > 0 && (
                    <select
                      value={id}
                      onChange={(e) => {
                        const n = [...ids];
                        n[i] = e.target.value;
                        setIds(n);
                      }}
                      className="input-field flex-1 text-xs truncate min-w-[200px]"
                    >
                      <option value="">Choose property {i + 1}...</option>
                      {availableProperties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.location}) — Rs. {p.askingPrice ? p.askingPrice.toLocaleString() : 'Price on Inquiry'}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    placeholder={`Or ID ${i + 1}`}
                    value={id}
                    onChange={(e) => { const n = [...ids]; n[i] = e.target.value; setIds(n); }}
                    className="input-field w-36 font-mono text-xs"
                  />
                  {i >= 2 && (
                    <button
                      type="button"
                      onClick={() => removeId(i)}
                      className="p-2.5 rounded-xl text-[#718078] hover:text-[#C94C4C] hover:bg-[#FDF1F1] transition-all"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-3">
                {ids.length < 5 && (
                  <button type="button" onClick={addId} className="btn-secondary text-xs py-2 px-3.5">
                    <Plus size={14} /> Add Another
                  </button>
                )}
                <button type="submit" disabled={compareMutation.isPending} className="btn-primary text-xs py-2 px-4 disabled:opacity-50">
                  <GitCompare size={14} />
                  {compareMutation.isPending ? 'Comparing...' : 'Run Comparative Analysis'}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#17231C] text-sm">Comparative Valuation Matrix</h3>
              <div className={`grid gap-4 ${results.length === 2 ? 'md:grid-cols-2' : results.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                {results.map((r) => (
                  <div key={r.property._id} className="card-premium p-5 bg-white border border-[#E7E3DA]">
                    <div className="h-1.5 -mx-5 -mt-5 mb-4 rounded-t-xl bg-[#123B2A]" />
                    <span className="badge-forest text-[10px] uppercase font-bold mb-2 inline-flex">{r.property.propertyType}</span>
                    <h4 className="font-bold text-[#17231C] text-sm mb-1 line-clamp-2">{r.property.title}</h4>
                    <div className="flex items-center gap-1 text-[#718078] text-xs mb-4">
                      <MapPin size={12} className="text-[#C9A227]" /> {r.property.location}
                    </div>

                    <div className="space-y-2 text-xs mb-4 py-2 border-y border-[#E7E3DA]">
                      <div className="flex justify-between">
                        <span className="text-[#718078]">Area:</span>
                        <strong className="text-[#17231C]">{r.property.area.toLocaleString()} sqft</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#718078]">Rooms:</span>
                        <strong className="text-[#17231C]">{r.property.bedrooms} Bed · {r.property.bathrooms} Bath</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#718078]">Asking Price:</span>
                        <strong className="text-[#123B2A]">{r.property.askingPrice ? `Rs. ${r.property.askingPrice.toLocaleString()}` : 'N/A'}</strong>
                      </div>
                      {r.pricePerSqft && (
                        <div className="flex justify-between">
                          <span className="text-[#718078]">Rate / sqft:</span>
                          <strong className="text-[#17231C]">Rs. {Math.round(r.pricePerSqft).toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {r.estimatedValue && (
                      <div className="p-3 rounded-xl bg-[#EAF4EE] border border-[#B8D9C5] mb-4">
                        <p className="text-[10px] uppercase font-bold text-[#2F6B4F]">Fair Market Valuation</p>
                        <p className="text-base font-black text-[#123B2A]">Rs. {Math.round(r.estimatedValue).toLocaleString()}</p>
                      </div>
                    )}

                    <Link
                      href={`/properties/${r.property._id}`}
                      className="text-xs font-bold text-[#2F6B4F] hover:text-[#123B2A] inline-flex items-center gap-1"
                    >
                      View Full Asset Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

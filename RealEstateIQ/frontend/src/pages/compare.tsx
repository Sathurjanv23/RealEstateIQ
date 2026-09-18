import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { GitCompare, Plus, X, Home, Bed, Bath, Car, MapPin } from 'lucide-react';
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
      toast.error('Enter at least 2 property IDs.');
      return;
    }
    compareMutation.mutate();
  };

  const addId = () => { if (ids.length < 5) setIds([...ids, '']); };
  const removeId = (i: number) => setIds(ids.filter((_, idx) => idx !== i));

  return (
    <>
      <Head><title>Compare Properties — RealEstateIQ</title></Head>
      <DashboardLayout title="Compare Properties">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Property Comparison</h2>
            <p className="text-white/50 text-sm mt-1">Compare up to 5 properties side by side</p>
          </div>

          {/* ID input form */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <GitCompare size={18} className="text-brand-400" /> Select or Enter Property IDs
            </h3>
            <p className="text-white/40 text-xs mb-4">
              Select properties from the list below, or paste property IDs directly.
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
                      className="input-dark flex-1 text-xs truncate min-w-[200px]"
                    >
                      <option value="">Choose property {i + 1}...</option>
                      {availableProperties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.location}) — Rs. {p.askingPrice ? p.askingPrice.toLocaleString() : 'N/A'}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    placeholder={`Or ID ${i + 1}`}
                    value={id}
                    onChange={(e) => { const n = [...ids]; n[i] = e.target.value; setIds(n); }}
                    className="input-dark w-36 font-mono text-xs"
                  />
                  {i >= 2 && (
                    <button type="button" onClick={() => removeId(i)} className="p-3 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                {ids.length < 5 && (
                  <button type="button" onClick={addId} className="btn-secondary text-sm py-2">
                    <Plus size={16} /> Add Another
                  </button>
                )}
                <button type="submit" disabled={compareMutation.isPending} className="btn-primary text-sm py-2 disabled:opacity-50">
                  <GitCompare size={16} />
                  {compareMutation.isPending ? 'Comparing...' : 'Compare Properties'}
                </button>
              </div>
            </form>
            <p className="text-white/30 text-xs mt-4">
              Tip: <Link href="/properties" className="text-brand-400 hover:text-brand-300">Browse Properties</Link> to find property IDs.
            </p>
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Comparison Results</h3>
              <div className={`grid gap-4 ${results.length === 2 ? 'md:grid-cols-2' : results.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                {results.map((r) => (
                  <div key={r.property._id} className="glass-card p-5">
                    <div className="h-1 -mx-5 -mt-5 mb-4 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                    <span className="badge-indigo text-xs capitalize mb-2 inline-flex">{r.property.propertyType}</span>
                    <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">{r.property.title}</h4>
                    <div className="flex items-center gap-1 text-white/50 text-xs mb-4">
                      <MapPin size={12} /> {r.property.location}
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      {[
                        { icon: <Home size={11} />, label: 'Area', value: `${r.property.area.toLocaleString()} sqft` },
                        { icon: <Bed size={11} />, label: 'Beds/Baths', value: `${r.property.bedrooms}BR / ${r.property.bathrooms}BA` },
                        { icon: <Car size={11} />, label: 'Parking', value: r.property.parking },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                          <span className="text-white/40 flex items-center gap-1">{s.icon} {s.label}</span>
                          <span className="text-white/70">{s.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-2">
                      {r.property.askingPrice ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Asking Price</span>
                          <span className="text-amber-400 font-semibold">Rs. {r.property.askingPrice.toLocaleString()}</span>
                        </div>
                      ) : null}
                      {r.estimatedValue ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">ML Estimate</span>
                          <span className="text-brand-400 font-semibold">Rs. {Math.round(r.estimatedValue).toLocaleString()}</span>
                        </div>
                      ) : null}
                      {r.property.askingPrice && r.estimatedValue ? (
                        <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-white/40">Diff</span>
                          <span className={`font-semibold ${r.property.askingPrice > r.estimatedValue ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {r.property.askingPrice > r.estimatedValue ? '+' : ''}
                            Rs. {Math.round(r.property.askingPrice - r.estimatedValue).toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <Link href={`/properties/${r.property._id}`} className="btn-secondary text-xs py-2 w-full justify-center mt-4">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-xs text-center">
                ML Estimate requires a prior prediction for the property. Run a prediction on each property first.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

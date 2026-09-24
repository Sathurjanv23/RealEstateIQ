import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Star, Brain, Home, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/services';
import { Recommendation } from '../types';
import { SL_LOCATIONS_GROUPED } from '../utils/sriLankaLocations';
const TYPES = ['', 'house', 'apartment', 'land', 'commercial', 'villa'];

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [prefs, setPrefs] = useState({
    budget: '', location: '', bedrooms: '', bathrooms: '', minArea: '', maxArea: '', propertyType: '',
  });
  const [search, setSearch] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['recommendations', prefs],
    queryFn: () => marketService.getRecommendations(Object.fromEntries(Object.entries(prefs).filter(([, v]) => v))),
    enabled: search && isAuthenticated,
  });

  const recommendations: Recommendation[] = data?.data?.data?.recommendations || [];

  return (
    <>
      <Head><title>Curated Yields & Recommendations — RealEstateIQ</title></Head>
      <DashboardLayout title="Asset Matching">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-white">Curated Property Matching</h2>
            <p className="text-[#94A3B8] text-xs mt-1">Multi-factor weighted asset alignment based on your acquisition criteria</p>
          </div>

          {/* Institutional Note */}
          <div className="card-premium p-4 border border-[#00DC82]/30 bg-[#00DC82]/10 flex gap-3 items-center">
            <ShieldCheck size={18} className="text-[#00DC82] shrink-0" />
            <p className="text-xs text-[#94A3B8]">
              Scoring utilizes transparent multi-factor weighted evaluation (Budget: 40%, Area: 25%, Bedrooms: 20%, Bathrooms: 15%).
            </p>
          </div>

          {/* Preferences Form: Dark Slate */}
          <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
            <h3 className="font-bold text-white text-sm mb-4 pb-2 border-b border-[#162E40]">Set Portfolio Target Criteria</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Max Budget (LKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 75000000"
                  value={prefs.budget}
                  onChange={(e) => setPrefs({ ...prefs, budget: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">District / Location</label>
                <select
                  value={prefs.location}
                  onChange={(e) => setPrefs({ ...prefs, location: e.target.value })}
                  className="input-field"
                >
                  <option value="">Any District</option>
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
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Asset Type</label>
                <select
                  value={prefs.propertyType}
                  onChange={(e) => setPrefs({ ...prefs, propertyType: e.target.value })}
                  className="input-field"
                >
                  <option value="">Any Asset Type</option>
                  {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={prefs.bedrooms}
                  onChange={(e) => setPrefs({ ...prefs, bedrooms: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={prefs.bathrooms}
                  onChange={(e) => setPrefs({ ...prefs, bathrooms: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Min Area (sqft)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={prefs.minArea}
                  onChange={(e) => setPrefs({ ...prefs, minArea: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={() => setSearch(true)}
              className="btn-primary mt-5 text-xs py-2.5 px-5 font-bold"
            >
              <Star size={14} /> Identify Matching Properties
            </button>
          </div>

          {/* Results */}
          {search && (
            loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-48 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="card-premium p-16 text-center bg-[#0B1722] border border-[#162E40]">
                <Star size={48} className="text-[#64748B] mx-auto mb-3" />
                <p className="text-white font-bold text-base">No properties matching your criteria</p>
                <p className="text-[#94A3B8] text-xs mt-1">Try expanding your budget ceiling or choosing all locations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#94A3B8]">{recommendations.length} properties matched your preferences</p>
                <div className="grid md:grid-cols-2 gap-5">
                  {recommendations.map((rec) => (
                    <div key={rec.property._id} className="card-premium-hover p-5 bg-[#0B1722] border border-[#162E40] flex flex-col justify-between">
                      <div>
                        {/* Match score bar */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/30">
                            {rec.property.propertyType}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-[#08141F] overflow-hidden border border-[#162E40]">
                              <div
                                className="h-full rounded-full bg-[#00DC82]"
                                style={{ width: `${rec.matchPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-[#00DC82]">
                              {rec.matchPercentage}% Match
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1 truncate">{rec.property.title}</h3>
                        <div className="flex items-center gap-1 text-[#94A3B8] text-xs mb-3">
                          <MapPin size={12} className="text-[#00DC82]" /> {rec.property.location}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#94A3B8] mb-4 py-2 border-y border-[#142938]">
                          <span>{rec.property.area.toLocaleString()} sqft</span>
                          <span>{rec.property.bedrooms} Beds</span>
                          <span>{rec.property.bathrooms} Baths</span>
                        </div>

                        {rec.property.askingPrice && (
                          <p className="text-[#00DC82] font-black text-sm mb-4">Rs. {rec.property.askingPrice.toLocaleString()}</p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`/properties/${rec.property._id}`}
                          className="btn-secondary text-xs py-2 flex-1 justify-center font-semibold"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/predict?area=${rec.property.area}&bedrooms=${rec.property.bedrooms}&bathrooms=${rec.property.bathrooms}&location=${rec.property.location}&house_age=${rec.property.houseAge}&parking=${rec.property.parking}&propertyId=${rec.property._id}`}
                          className="btn-primary text-xs py-2 flex-1 justify-center font-bold"
                        >
                          <Brain size={13} /> Valuate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

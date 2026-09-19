import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Star, Brain, Home, MapPin, AlertTriangle } from 'lucide-react';
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
  const criteria = data?.data?.data?.matchingCriteria;

  return (
    <>
      <Head><title>Recommendations — RealEstateIQ</title></Head>
      <DashboardLayout title="Property Recommendations">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Recommendations</h2>
            <p className="text-white/50 text-sm mt-1">Rule-based property matching based on your preferences</p>
          </div>

          {/* Note */}
          <div className="glass-card p-4 border-blue-500/20 flex gap-3">
            <AlertTriangle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/60">
              Recommendations use transparent rule-based weighted scoring (budget: 40pts, bedrooms: 20pts, bathrooms: 15pts, area: 25pts).
              This is not an ML recommendation system.
            </p>
          </div>

          {/* Preferences form */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-5">Set Your Preferences</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-2">Budget (Max LKR)</label>
                <input type="number" placeholder="e.g. 500000" value={prefs.budget}
                  onChange={(e) => setPrefs({ ...prefs, budget: e.target.value })} className="input-dark text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">Location</label>
                <select value={prefs.location} onChange={(e) => setPrefs({ ...prefs, location: e.target.value })} className="input-dark text-sm">
                  <option value="">Any Location</option>
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
                <label className="block text-xs text-white/50 mb-2">Property Type</label>
                <select value={prefs.propertyType} onChange={(e) => setPrefs({ ...prefs, propertyType: e.target.value })} className="input-dark text-sm">
                  <option value="">Any Type</option>
                  {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">Bedrooms</label>
                <input type="number" min="1" placeholder="e.g. 3" value={prefs.bedrooms}
                  onChange={(e) => setPrefs({ ...prefs, bedrooms: e.target.value })} className="input-dark text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">Bathrooms</label>
                <input type="number" min="1" placeholder="e.g. 2" value={prefs.bathrooms}
                  onChange={(e) => setPrefs({ ...prefs, bathrooms: e.target.value })} className="input-dark text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-2">Min Area (sqft)</label>
                <input type="number" placeholder="e.g. 1500" value={prefs.minArea}
                  onChange={(e) => setPrefs({ ...prefs, minArea: e.target.value })} className="input-dark text-sm" />
              </div>
            </div>
            <button onClick={() => setSearch(true)} className="btn-primary mt-5 text-sm">
              <Star size={16} /> Find Recommendations
            </button>
          </div>

          {/* Results */}
          {search && (
            loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <Star size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No matches found</p>
                <p className="text-white/30 text-sm mt-2">Try adjusting your preferences or broadening your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white/50 text-sm">{recommendations.length} properties matched your preferences</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <div key={rec.property._id} className="glass-card-hover p-5">
                      {/* Match score bar */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="badge-indigo text-xs capitalize">{rec.property.propertyType}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${rec.matchPercentage}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                          </div>
                          <span className={`text-sm font-bold ${rec.matchPercentage >= 80 ? 'text-emerald-400' : rec.matchPercentage >= 60 ? 'text-amber-400' : 'text-white/60'}`}>
                            {rec.matchPercentage}%
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-1 truncate">{rec.property.title}</h3>
                      <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
                        <MapPin size={12} /> {rec.property.location}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                        <span>{rec.property.area.toLocaleString()} sqft</span>
                        <span>{rec.property.bedrooms}BR</span>
                        <span>{rec.property.bathrooms}BA</span>
                      </div>
                      {rec.property.askingPrice && (
                        <p className="text-brand-400 font-bold mb-3">Rs. {rec.property.askingPrice.toLocaleString()}</p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/properties/${rec.property._id}`} className="btn-secondary text-xs py-2 flex-1 justify-center">View Property</Link>
                        <Link href={`/predict?area=${rec.property.area}&bedrooms=${rec.property.bedrooms}&bathrooms=${rec.property.bathrooms}&location=${rec.property.location}&house_age=${rec.property.houseAge}&parking=${rec.property.parking}&propertyId=${rec.property._id}`}
                          className="btn-primary text-xs py-2 flex-1 justify-center">
                          <Brain size={12} /> Predict
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

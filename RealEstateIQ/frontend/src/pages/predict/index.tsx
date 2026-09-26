import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Brain, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { predictionService } from '../../services/services';
import { Prediction } from '../../types';
import { SL_LOCATIONS_GROUPED, SL_LOCATION_VALUES } from '../../utils/sriLankaLocations';

export default function PredictPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    area: '',
    bedrooms: '3',
    bathrooms: '2',
    location: 'Colombo',
    house_age: '5',
    parking: '1',
    propertyId: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!router.isReady) return;
    const { area, bedrooms, bathrooms, location, house_age, parking, propertyId } = router.query;
    if (area || bedrooms || bathrooms || location || house_age || parking || propertyId) {
      setForm((prev) => ({
        ...prev,
        ...(area ? { area: String(area) } : {}),
        ...(bedrooms ? { bedrooms: String(bedrooms) } : {}),
        ...(bathrooms ? { bathrooms: String(bathrooms) } : {}),
        ...(location && SL_LOCATION_VALUES.includes(String(location)) ? { location: String(location) } : {}),
        ...(house_age ? { house_age: String(house_age) } : {}),
        ...(parking ? { parking: String(parking) } : {}),
        ...(propertyId ? { propertyId: String(propertyId) } : {}),
      }));
    }
  }, [router.isReady, router.query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.area || Number(form.area) <= 0) {
      toast.error('Please enter a valid area.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        location: form.location,
        house_age: Number(form.house_age),
        parking: Number(form.parking),
        propertyId: form.propertyId || undefined,
      };
      const res = await predictionService.predict(payload);
      const prediction: Prediction = res.data.data.prediction;
      // Store result for the result page
      localStorage.setItem('riq_last_prediction', JSON.stringify(prediction));
      router.push('/predict/result');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Valuation failed. Please verify ML service connectivity.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'area', label: 'Property Area (sqft)', type: 'number', placeholder: 'e.g. 2200', min: '1', max: '50000', note: 'Primary valuation driver (~70% weight)' },
    { name: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '1–20', min: '1', max: '20' },
    { name: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: '1–20', min: '1', max: '20' },
    { name: 'house_age', label: 'House Age (years)', type: 'number', placeholder: '0–150', min: '0', max: '150' },
    { name: 'parking', label: 'Parking Spaces', type: 'number', placeholder: '0–20', min: '0', max: '20' },
  ];

  return (
    <>
      <Head>
        <title>Property Valuation Engine — RealEstateIQ</title>
        <meta name="description" content="Calculate fair market property value across Sri Lankan districts using authentic transaction models." />
      </Head>
      <DashboardLayout title="Valuation Engine">
        <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
          {/* Institutional Note Banner */}
          <div className="luxury-glass-card p-4 border border-[#DFBA73]/30 bg-[#DFBA73]/10 flex gap-3.5 items-start">
            <ShieldCheck size={20} className="text-[#DFBA73] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-serif font-bold text-[#DFBA73] uppercase tracking-wide">
                Sri Lanka Benchmark Valuation Calibration
              </p>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Trained on 14,833 authentic market transactions across Western, Central, Southern, Northern, and Eastern provinces.
                Outputs include 95% confidence bounds and bank-grade PDF certificate generation.
              </p>
            </div>
          </div>

          {/* Form Container: Luxury Obsidian Glass */}
          <div className="luxury-glass-card p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.08]">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Enter Asset Parameters</h2>
                <p className="text-xs text-neutral-400">Provide exact property specifications for accurate appraisal</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
                23 Districts
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  District / Location in Sri Lanka <span className="text-[#F87171]">*</span>
                </label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {Object.entries(SL_LOCATIONS_GROUPED).map(([province, locs]) => (
                    <optgroup key={province} label={`— ${province}`}>
                      {locs.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Calibrated to local land rates and transaction benchmarks.
                </p>
              </div>

              {/* Dynamic numeric fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.name === 'area' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      {f.label} {f.name === 'area' && <span className="text-[#F87171]">*</span>}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={(form as Record<string, string>)[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      min={f.min}
                      max={f.max}
                      className="input-field"
                      required={f.name === 'area'}
                    />
                    {f.note && (
                      <p className="text-[11px] text-[#DFBA73] font-semibold mt-1">
                        {f.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm font-bold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A0D12] border-t-transparent rounded-full animate-spin" />
                      Computing Valuation...
                    </>
                  ) : (
                    <>
                      <Brain size={17} /> Compute Fair Market Valuation <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

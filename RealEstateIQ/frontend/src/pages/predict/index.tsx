import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Brain, Info } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { predictionService } from '../../services/services';
import { Prediction } from '../../types';

const LOCATIONS = ['Colombo', 'Kandy', 'Galle', 'Negombo'];

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
        ...(location && LOCATIONS.includes(String(location)) ? { location: String(location) } : {}),
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
      const msg = error.response?.data?.message || 'Prediction failed. Is the ML service running?';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'area', label: 'Property Area (sqft)', type: 'number', placeholder: 'e.g. 2200', min: '1', max: '50000', note: 'Most important predictor' },
    { name: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '1–20', min: '1', max: '20' },
    { name: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: '1–20', min: '1', max: '20' },
    { name: 'house_age', label: 'House Age (years)', type: 'number', placeholder: '0–150', min: '0', max: '150' },
    { name: 'parking', label: 'Parking Spaces', type: 'number', placeholder: '0–20', min: '0', max: '20' },
  ];

  return (
    <>
      <Head>
        <title>Predict Property Value — RealEstateIQ</title>
        <meta name="description" content="Use AI to estimate property values based on area, location, bedrooms, and more." />
      </Head>
      <DashboardLayout title="Predict Property Value">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Info banner */}
          <div className="glass-card p-4 mb-6 border-brand-500/30 flex gap-3">
            <Info size={18} className="text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/80 font-medium">About this prediction</p>
              <p className="text-xs text-white/50 mt-1">
                Fields are based on the actual trained model features: area, bedrooms, bathrooms, location, house age, and parking.
                The model is Linear Regression (R²=0.9965) trained on synthetic Sri Lanka property data.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Brain size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Property Details</h2>
                  {form.propertyId && (
                    <span className="badge-indigo text-xs">Pre-filled from property</span>
                  )}
                </div>
                <p className="text-white/50 text-sm">Enter property characteristics for ML estimation</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location select */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-white/70 mb-2">
                  Location <span className="text-white/30 font-normal">(City)</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-dark"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Numeric fields */}
              <div className="grid md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-white/70 mb-2">
                      {field.label}
                      {field.note && <span className="ml-2 text-xs text-brand-400/70">{field.note}</span>}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      className="input-dark"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Optional property ID */}
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-white/70 mb-2">
                  Property ID <span className="text-white/30 font-normal">(Optional — links prediction to a saved property)</span>
                </label>
                <input
                  id="propertyId"
                  name="propertyId"
                  type="text"
                  placeholder="Paste property ID if applicable"
                  value={form.propertyId}
                  onChange={handleChange}
                  className="input-dark"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Getting ML Estimate...
                  </span>
                ) : (
                  <><Brain size={18} /> Predict Property Value</>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/30 text-xs mt-4">
            ⚠️ This is an ML estimate, not a guaranteed market valuation. Dataset is synthetic.
          </p>
        </div>
      </DashboardLayout>
    </>
  );
}

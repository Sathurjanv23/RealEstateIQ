import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/services';

const LOCATIONS = ['Colombo', 'Kandy', 'Galle', 'Negombo'];
const TYPES = ['house', 'apartment', 'land', 'commercial', 'villa'];
const AMENITIES = ['Swimming Pool', 'Garden', 'Parking', 'Security', 'CCTV', 'Solar Panels', 'Gym', 'Elevator', 'Balcony', 'Mountain View', 'Smart Home'];

export default function NewPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'house', location: 'Colombo',
    district: '', area: '', bedrooms: '3', bathrooms: '2', parking: '1',
    houseAge: '0', landSize: '', askingPrice: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.area) { toast.error('Title and area are required.'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking),
        houseAge: Number(form.houseAge),
        landSize: form.landSize ? Number(form.landSize) : undefined,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        amenities: selectedAmenities,
      };
      const res = await propertyService.create(payload);
      const prop = res.data.data.property;
      toast.success('Property added successfully!');
      router.push(`/properties/${prop._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to add property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Add Property — RealEstateIQ</title></Head>
      <DashboardLayout title="Add Property">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Link href="/properties" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm">
            <ArrowLeft size={16} /> Back to Properties
          </Link>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Home size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">List a Property</h1>
                <p className="text-white/50 text-sm">Add property details to the platform</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic info */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-2">Property Title *</label>
                <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
                  placeholder="e.g. Modern 3BR Villa in Colombo 7" className="input-dark" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-white/70 mb-2">Property Type *</label>
                  <select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange} className="input-dark capitalize">
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-white/70 mb-2">City *</label>
                  <select id="location" name="location" value={form.location} onChange={handleChange} className="input-dark">
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-white/70 mb-2">District / Area</label>
                <input id="district" name="district" type="text" value={form.district} onChange={handleChange}
                  placeholder="e.g. Colombo 7, Peradeniya" className="input-dark" />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'area', label: 'Area (sqft) *', placeholder: 'e.g. 2200' },
                  { name: 'bedrooms', label: 'Bedrooms *', placeholder: '1–20' },
                  { name: 'bathrooms', label: 'Bathrooms *', placeholder: '1–20' },
                  { name: 'parking', label: 'Parking', placeholder: '0–20' },
                  { name: 'houseAge', label: 'House Age (years) *', placeholder: '0–150' },
                  { name: 'landSize', label: 'Land Size (perches)', placeholder: 'Optional' },
                ].map((f) => (
                  <div key={f.name}>
                    <label htmlFor={f.name} className="block text-sm font-medium text-white/70 mb-2">{f.label}</label>
                    <input id={f.name} name={f.name} type="number" min="0" placeholder={f.placeholder}
                      value={form[f.name as keyof typeof form]} onChange={handleChange} className="input-dark" />
                  </div>
                ))}
              </div>

              {/* Asking price */}
              <div>
                <label htmlFor="askingPrice" className="block text-sm font-medium text-white/70 mb-2">Asking Price (LKR)</label>
                <input id="askingPrice" name="askingPrice" type="number" min="0" placeholder="Optional — leave blank if not set"
                  value={form.askingPrice} onChange={handleChange} className="input-dark" />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea id="description" name="description" rows={4} value={form.description}
                  onChange={handleChange} placeholder="Describe the property..."
                  className="input-dark resize-none" />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedAmenities.includes(a)
                        ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                        : 'border-white/10 text-white/50 hover:border-brand-500/50 hover:text-white/70'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
                {loading ? 'Adding Property...' : 'Add Property'}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

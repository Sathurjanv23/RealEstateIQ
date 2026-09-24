import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/services';
import { SL_LOCATIONS_GROUPED } from '../../utils/sriLankaLocations';
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
      toast.success('Property listing added successfully!');
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
      <Head><title>Add Listing — RealEstateIQ</title></Head>
      <DashboardLayout title="Add Property Listing">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Link href="/properties" className="inline-flex items-center gap-2 text-[#718078] hover:text-[#123B2A] text-sm font-semibold">
            <ArrowLeft size={16} /> Back to Properties
          </Link>

          <div className="card-premium p-6 sm:p-8 bg-white border border-[#E7E3DA]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E7E3DA]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#EBF3EE] border border-[#B8D1C4] text-[#123B2A]">
                <Home size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#17231C]">Create Property Listing</h2>
                <p className="text-[#718078] text-xs">Add a new Sri Lankan property asset to your portfolio inventory</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Modern Luxury Villa in Cinnamon Gardens"
                  value={form.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe architectural layout, neighborhood proximity, etc..."
                  value={form.description}
                  onChange={handleChange}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Property Type</label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">District / City *</label>
                  <select name="location" value={form.location} onChange={handleChange} className="input-field" required>
                    {Object.entries(SL_LOCATIONS_GROUPED).map(([province, locs]) => (
                      <optgroup key={province} label={`— ${province}`}>
                        {locs.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Area (sqft) *</label>
                  <input type="number" name="area" placeholder="2200" value={form.area} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Bedrooms</label>
                  <input type="number" name="bedrooms" min="0" value={form.bedrooms} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Bathrooms</label>
                  <input type="number" name="bathrooms" min="0" value={form.bathrooms} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Parking</label>
                  <input type="number" name="parking" min="0" value={form.parking} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">House Age (yrs)</label>
                  <input type="number" name="houseAge" min="0" value={form.houseAge} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Land (perches)</label>
                  <input type="number" name="landSize" placeholder="10" value={form.landSize} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Asking Price (LKR)</label>
                <input type="number" name="askingPrice" placeholder="e.g. 85000000" value={form.askingPrice} onChange={handleChange} className="input-field" />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => {
                    const active = selectedAmenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? 'bg-[#123B2A] text-white border-[#123B2A]'
                            : 'bg-white text-[#718078] border-[#E7E3DA] hover:border-[#123B2A]'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link href="/properties" className="btn-secondary flex-1 py-3 justify-center text-xs">
                  Cancel
                </Link>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 justify-center text-xs disabled:opacity-50">
                  {loading ? 'Creating...' : 'Save & Publish Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

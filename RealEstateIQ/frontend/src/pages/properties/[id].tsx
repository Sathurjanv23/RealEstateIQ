import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft, Home, MapPin, Bed, Bath, Car, Calendar, Brain,
  BookmarkPlus, BookmarkCheck, Mail, Send, X, GitCompare, Loader2
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService, inquiryService } from '../../services/services';
import { Property } from '../../types';
import { WhatsAppButton, WhatsAppIcon } from '../../components/ui/WhatsAppButton';
import { getPropertyWhatsAppUrl } from '../../utils/whatsapp';
import { DealRatingBadge } from '../../components/deal/DealRatingBadge';
import { estimatePropertyFairValue } from '../../utils/dealRating';
import { MortgageCalculator } from '../../components/mortgage/MortgageCalculator';
import { resolveImageUrl } from '../../utils/imageUrl';

const PropertyMap = dynamic(() => import('../../components/map/PropertyMap'), {
  ssr: false,
  loading: () => <div className="skeleton h-[280px] w-full rounded-2xl" />,
});

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [inquireModal, setInquireModal] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', phone: '', email: '', date: '', message: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getOne(id as string),
    enabled: !!id,
  });

  const property: Property | undefined = data?.data?.data?.property;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.name || !inquiry.phone) {
      toast.error('Please provide your name and contact phone number.');
      return;
    }
    setIsSubmittingInquiry(true);
    try {
      await inquiryService.create({
        propertyId: id as string,
        propertyName: property?.title || 'Property',
        propertyLocation: property?.location,
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email || undefined,
        preferredDate: inquiry.date || undefined,
        message: inquiry.message || undefined,
      });
      toast.success('Inquiry submitted! Confirmation email dispatched.');
      setInquireModal(false);
      setInquiry({ name: '', phone: '', email: '', date: '', message: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => saved ? propertyService.unsave(id as string) : propertyService.save(id as string),
    onSuccess: () => {
      setSaved(!saved);
      toast.success(saved ? 'Removed from saved properties.' : 'Property saved to portfolio!');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Action failed.');
    },
  });

  if (isLoading) return (
    <DashboardLayout title="Property Details">
      <div className="space-y-4 max-w-4xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </DashboardLayout>
  );

  if (error || !property) return (
    <DashboardLayout title="Property Details">
      <div className="card-premium p-16 text-center max-w-xl mx-auto bg-[#0B1722] border border-[#162E40]">
        <Home size={48} className="text-[#64748B] mx-auto mb-4" />
        <p className="text-white font-bold text-lg">Property not found.</p>
        <Link href="/properties" className="btn-secondary mt-5 inline-flex font-semibold">
          <ArrowLeft size={16} /> Back to Properties
        </Link>
      </div>
    </DashboardLayout>
  );

  const pricePerSqft = property.askingPrice && property.area > 0
    ? Math.round(property.askingPrice / property.area)
    : null;

  const estimatedPrice = estimatePropertyFairValue({
    area: property.area,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    houseAge: property.houseAge,
  });

  const whatsappUrl = getPropertyWhatsAppUrl({
    propertyTitle: property.title,
    location: property.location,
    price: property.askingPrice,
    propertyId: property._id,
    bedrooms: property.bedrooms,
    area: property.area,
  });

  return (
    <>
      <Head>
        <title>{property.title} — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Property Details">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#DFBA73] text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> Back to Properties
          </Link>

          {/* Photo Gallery Banner */}
          {property.images && property.images.length > 0 && (
            <div className="luxury-glass-card overflow-hidden p-3 space-y-3">
              <div className="relative h-72 md:h-96 rounded-xl overflow-hidden bg-[#080A0E]">
                <img
                  src={resolveImageUrl(property.images[activeImage] || property.images[0])}
                  alt={property.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30 shadow-sm backdrop-blur-md">
                    {property.propertyType}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#080A0E]/80 text-white border border-white/10 shadow-sm backdrop-blur-md">
                    Photo {activeImage + 1} of {property.images.length}
                  </span>
                </div>
              </div>
              {property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx
                          ? 'border-[#DFBA73] scale-95 ring-2 ring-[#DFBA73]/30'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={resolveImageUrl(img)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Header Card: Luxury Obsidian Glass */}
          <div className="luxury-glass-card p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider mb-2.5 inline-flex px-2 py-0.5 rounded bg-[#DFBA73]/10 text-[#DFBA73] border border-[#DFBA73]/30">
                  {property.propertyType}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-white mb-2">{property.title}</h1>
                <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                  <MapPin size={15} className="text-[#DFBA73]" /> {property.location}{property.district ? `, ${property.district}` : ''}
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3.5 shrink-0">
                {property.askingPrice && (
                  <div className="md:text-right">
                    <p className="text-xs uppercase font-bold text-neutral-400 mb-0.5">Asking Price</p>
                    <p className="text-3xl font-serif font-black text-[#DFBA73]">Rs. {property.askingPrice.toLocaleString()}</p>
                    {pricePerSqft && <p className="text-xs text-neutral-400 font-semibold mt-0.5">Rs. {pricePerSqft.toLocaleString()} / sqft</p>}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <WhatsAppButton
                    href={whatsappUrl}
                    label="1-Click WhatsApp Inquiry"
                    sublabel="Instant Agent Direct Chat"
                  />
                  <button
                    onClick={() => setInquireModal(true)}
                    className="btn-primary text-xs py-2.5 px-4 font-bold"
                  >
                    <Mail size={15} /> Schedule Viewing
                  </button>
                  <Link
                    href={`/compare?ids=${property._id}`}
                    className="btn-secondary text-xs py-2.5 px-4 font-semibold"
                  >
                    <GitCompare size={15} /> Compare
                  </Link>
                  {isAuthenticated && (
                    <button
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      className={`btn-secondary text-xs py-2.5 px-3.5 font-semibold ${saved ? 'border-[#DFBA73] text-[#DFBA73] bg-[#DFBA73]/15' : ''}`}
                    >
                      {saved ? <><BookmarkCheck size={15} /> Saved</> : <><BookmarkPlus size={15} /> Save</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Valuation Deal Rating Banner ⚖️ */}
          {property.askingPrice && (
            <DealRatingBadge
              askingPrice={property.askingPrice}
              estimatedPrice={estimatedPrice}
              variant="banner"
            />
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property Specs */}
            <div className="luxury-glass-card p-6">
              <h2 className="font-serif font-bold text-white text-base mb-4 pb-2 border-b border-white/[0.08]">
                Property Specifications
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Home size={15} className="text-[#DFBA73]" />, label: 'Total Area', value: `${property.area.toLocaleString()} sqft` },
                  { icon: <Bed size={15} className="text-[#DFBA73]" />, label: 'Bedrooms', value: property.bedrooms },
                  { icon: <Bath size={15} className="text-[#DFBA73]" />, label: 'Bathrooms', value: property.bathrooms },
                  { icon: <Car size={15} className="text-[#DFBA73]" />, label: 'Parking', value: property.parking },
                  { icon: <Calendar size={15} className="text-[#DFBA73]" />, label: 'House Age', value: `${property.houseAge} years` },
                  ...(property.landSize ? [{ icon: <MapPin size={15} className="text-[#DFBA73]" />, label: 'Land Size', value: `${property.landSize} perches` }] : []),
                ].map((spec) => (
                  <div key={spec.label} className="p-3 rounded-xl bg-[#090D14] border border-white/[0.08]">
                    <div className="flex items-center gap-1.5 mb-1">{spec.icon}<p className="text-[11px] text-neutral-400 font-medium">{spec.label}</p></div>
                    <p className="text-sm font-bold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Description */}
            <div className="luxury-glass-card p-6">
              <h2 className="font-serif font-bold text-white text-base mb-4 pb-2 border-b border-white/[0.08]">
                Asset Amenities & Description
              </h2>
              {property.amenities.length === 0 ? (
                <p className="text-neutral-400 text-xs">No specific amenities listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.map((a) => (
                    <span key={a} className="text-xs px-2.5 py-1 rounded-lg bg-[#DFBA73]/10 text-[#DFBA73] border border-[#DFBA73]/30 font-medium">{a}</span>
                  ))}
                </div>
              )}

              {property.description && (
                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <h3 className="font-bold text-neutral-300 mb-2 text-xs uppercase tracking-wider">Overview</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="luxury-glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <MapPin size={16} className="text-[#DFBA73]" /> Location & Cartography
              </h2>
              <span className="text-xs text-[#DFBA73] bg-[#DFBA73]/10 border border-[#DFBA73]/30 px-2.5 py-1 rounded-full font-bold">
                {property.location}{property.district ? ` · ${property.district}` : ''}
              </span>
            </div>
            <PropertyMap
              properties={[property]}
              selectedProperty={property}
              height="300px"
              centerCity={property.location}
              zoom={13}
            />
          </div>

          {/* Valuation CTA */}
          {isAuthenticated && (
            <div className="luxury-glass-card p-6 bg-[#DFBA73]/10 border border-[#DFBA73]/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-serif font-bold text-[#DFBA73] flex items-center gap-2 mb-1 text-lg">
                    <Brain size={18} /> Benchmark Property Valuation
                  </h3>
                  <p className="text-neutral-300 text-xs leading-relaxed max-w-xl">
                    Run the 23-district valuation engine on this property&apos;s specifications to calculate fair-market value and confidence intervals.
                  </p>
                </div>
                <Link
                  href={`/predict?area=${property.area}&bedrooms=${property.bedrooms}&bathrooms=${property.bathrooms}&location=${property.location}&house_age=${property.houseAge}&parking=${property.parking}&propertyId=${property._id}`}
                  className="btn-primary text-xs py-2.5 px-4 font-bold"
                >
                  <Brain size={15} /> Valuate This Property
                </Link>
              </div>
            </div>
          )}

          {/* Sri Lanka Home Loan & Mortgage EMI Calculator 🧮 */}
          <MortgageCalculator
            initialPrice={property.askingPrice || estimatedPrice}
            propertyTitle={property.title}
            location={property.location}
          />

          {/* Schedule Viewing / Inquire Modal */}
          {inquireModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
              <div className="luxury-glass-card max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-white/[0.15]">
                <div className="flex items-center justify-between mb-5 border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                      <Mail size={16} className="text-[#DFBA73]" /> Schedule Property Viewing
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{property.title} ({property.location})</p>
                  </div>
                  <button
                    onClick={() => setInquireModal(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Instant WhatsApp Quick Action Banner */}
                <div className="p-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366] text-black flex items-center justify-center shrink-0">
                      <WhatsAppIcon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Prefer instant response?</p>
                      <p className="text-[11px] text-neutral-300">Skip the form and chat directly with our verified broker</p>
                    </div>
                  </div>
                  <WhatsAppButton href={whatsappUrl} variant="compact" label="Chat Now" />
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyantha Jayasuriya"
                      value={inquiry.name}
                      onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 77 123 4567"
                        value={inquiry.phone}
                        onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={inquiry.date}
                        onChange={(e) => setInquiry({ ...inquiry, date: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={inquiry.email}
                      onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Message for Agent / Broker</label>
                    <textarea
                      rows={3}
                      placeholder="I would like to schedule a viewing or request the legal title report..."
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      className="input-field text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInquireModal(false)}
                      className="btn-secondary flex-1 text-xs py-2.5 justify-center font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="btn-primary flex-1 text-xs py-2.5 justify-center font-bold disabled:opacity-50"
                    >
                      {isSubmittingInquiry ? (
                        <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><Send size={15} /> Send Viewing Inquiry</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

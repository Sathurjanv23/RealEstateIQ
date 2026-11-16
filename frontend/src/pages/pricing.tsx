import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Sparkles, CheckCircle2, ShieldCheck, Zap, Crown, ArrowRight,
  Building2, Home, Loader2, Star, CreditCard
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { paymentService, propertyService } from '../services/services';
import { Property } from '../types';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  badge: string;
  popular?: boolean;
  features: string[];
}

export default function PricingPage() {
  const router = useRouter();
  const { propertyId } = router.query;
  const { user, isAuthenticated } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<string>('featured_listing_30d');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>((propertyId as string) || '');
  const [phone, setPhone] = useState<string>('+94 ');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch user's active properties to boost
  const { data: propsData } = useQuery({
    queryKey: ['myProperties'],
    queryFn: () => propertyService.getAll({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const properties: Property[] = propsData?.data?.data?.properties || [];

  useEffect(() => {
    if (propertyId && typeof propertyId === 'string') {
      setSelectedPropertyId(propertyId);
    } else if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0]._id);
    }
  }, [propertyId, properties, selectedPropertyId]);

  const { data: pkgData, isLoading: loadingPkgs } = useQuery({
    queryKey: ['paymentPackages'],
    queryFn: () => paymentService.getPackages(),
  });

  const packages: Package[] = pkgData?.data?.data?.packages || [
    {
      id: 'featured_listing_7d',
      title: 'Gold Boost (7 Days)',
      description: 'Pin your property to the top of search results and category pages for 7 days. 5x more buyer views.',
      price: 2500,
      currency: 'LKR',
      durationDays: 7,
      badge: 'Gold Featured',
      features: [
        'Top placement in search results',
        'Golden Featured luxury badge',
        '5x more buyer inquiries',
        'Active for 7 full days',
      ],
    },
    {
      id: 'featured_listing_30d',
      title: 'Platinum Boost (30 Days)',
      description: 'Maximum exposure for premium properties. Pinned on homepage, social media highlights, and top search ranking.',
      price: 7500,
      currency: 'LKR',
      durationDays: 30,
      badge: 'Platinum Luxury',
      popular: true,
      features: [
        'Homepage premium carousel spotlight',
        'Guaranteed #1 search ranking',
        'Platinum Luxury Shield badge',
        'Direct 1-click WhatsApp leads',
        'Active for 30 full days',
      ],
    },
    {
      id: 'agent_pro_monthly',
      title: 'Agent Pro Membership',
      description: 'Designed for top-producing Sri Lankan real estate agents, brokers, and developers.',
      price: 15000,
      currency: 'LKR',
      durationDays: 30,
      badge: 'Verified Agent',
      features: [
        'Verified Agent Official Blue Badge',
        'Unlimited property listings',
        '5 complimentary Platinum Boosts',
        'Direct buyer lead routing & CRM',
        'Priority telephone support',
      ],
    },
  ];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in or register to upgrade.');
      router.push(`/login?redirect=/pricing${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ''}`);
      return;
    }

    if (selectedPackage.startsWith('featured_listing') && !selectedPropertyId) {
      toast.error('Please select a property to boost.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await paymentService.createCheckout({
        packageId: selectedPackage,
        propertyId: selectedPackage.startsWith('featured_listing') ? selectedPropertyId : undefined,
        phone: phone.trim() || undefined,
      });

      const { payhereParams } = res.data.data;

      // Submit form directly to PayHere payment gateway
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payhereParams.sandbox
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout';

      Object.entries(payhereParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      toast.loading('Redirecting to PayHere Central Bank approved secure gateway...');
      form.submit();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pricing & Property Boost — RealEstateIQ</title>
        <meta
          name="description"
          content="Accelerate property sales with RealEstateIQ Featured Listings and Agent Pro subscriptions across Sri Lanka."
        />
      </Head>

      <DashboardLayout title="Pricing & Growth">
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-16">
          {/* Header Hero */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="badge-gold text-xs px-3 py-1 uppercase tracking-wider font-bold">
              🇱🇰 Sri Lanka Commercial Monetization
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
              Supercharge Your Listings & Close Deals Faster
            </h1>
            <p className="text-neutral-400 text-sm">
              Attract high-intent buyers and property investors with verified badges, top-tier search visibility, and instant WhatsApp direct leads.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer luxury-glass-card relative p-7 flex flex-col justify-between transition-all duration-300 ${
                    isSelected
                      ? 'border-[#DFBA73] ring-1 ring-[#DFBA73]/50 shadow-2xl scale-[1.02] bg-[#0E1520]'
                      : 'hover:border-white/20 bg-[#0A0E17]/80'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#080A0E] text-[10px] uppercase font-black px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Crown size={12} /> Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#DFBA73] bg-[#DFBA73]/10 px-2.5 py-1 rounded-md border border-[#DFBA73]/20">
                        {pkg.badge}
                      </span>
                      {isSelected && <CheckCircle2 size={20} className="text-[#DFBA73]" />}
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-black text-white">{pkg.title}</h3>
                      <p className="text-neutral-400 text-xs mt-1 min-h-[32px]">{pkg.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-neutral-400 font-semibold">LKR</span>
                        <span className="text-3xl font-serif font-black text-white">
                          Rs. {pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-500 font-semibold">
                          /{pkg.durationDays} days
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 pt-2 text-xs text-neutral-300">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#DFBA73] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#080A0E] shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    {isSelected ? 'Selected Package' : 'Choose Package'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Checkout Configuration Card */}
          <div className="luxury-glass-card p-6 sm:p-8 max-w-2xl mx-auto border border-[#DFBA73]/30 bg-[#0A0F1A]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-[#DFBA73]/10 border border-[#DFBA73]/20 text-[#DFBA73]">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Instant PayHere Checkout</h3>
                <p className="text-xs text-neutral-400">
                  Approved by Central Bank of Sri Lanka · Visa, Master, Genie, FriMi, EzCash, mCash
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5">
              {selectedPackage.startsWith('featured_listing') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    Select Property to Boost
                  </label>
                  {properties.length > 0 ? (
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="input-field text-xs bg-[#070B12] text-white border-white/10 focus:border-[#DFBA73]"
                      required
                    >
                      {properties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} — ({p.location}) {p.askingPrice ? `Rs. ${p.askingPrice.toLocaleString()}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                      No properties found in your account.{' '}
                      <a href="/properties/new" className="underline font-bold text-[#DFBA73]">
                        Post a property first
                      </a>{' '}
                      to apply a boost.
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Contact Phone Number (For SMS & WhatsApp alerts)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="input-field text-xs bg-[#070B12] text-white border-white/10 focus:border-[#DFBA73]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#DFBA73]/10"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Connecting to PayHere Gateway...
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> Pay with PayHere & Activate Boost
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#DFBA73]" /> 256-bit Bank Grade Encryption
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-[#DFBA73]" /> Instant Real-time Activation
                </span>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

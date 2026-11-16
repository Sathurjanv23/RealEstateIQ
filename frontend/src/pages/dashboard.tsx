import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Brain, Home, History, TrendingUp, ArrowRight, BarChart3, ShieldCheck, Handshake, KeyRound, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { predictionService, propertyService, marketService, offerService, rentalService } from '../services/services';
import { Offer, RentalApplication } from '../types';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [activityTab, setActivityTab] = useState<'offers' | 'rentals'>('offers');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const { data: historyData } = useQuery({
    queryKey: ['predictionHistory'],
    queryFn: () => predictionService.getHistory({ limit: 5 }),
    enabled: isAuthenticated,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['propertiesCount'],
    queryFn: () => propertyService.getAll({ limit: 1 }),
    enabled: isAuthenticated,
  });

  const { data: modelData } = useQuery({
    queryKey: ['marketModelInfo'],
    queryFn: () => marketService.getModelInfo(),
    enabled: isAuthenticated,
  });

  const { data: offersData } = useQuery({
    queryKey: ['myOffers'],
    queryFn: () => offerService.getMyOffers(),
    enabled: isAuthenticated,
  });

  const { data: rentalsData } = useQuery({
    queryKey: ['myRentalApplications'],
    queryFn: () => rentalService.getMyApplications(),
    enabled: isAuthenticated,
  });

  const myOffers: Offer[] = offersData?.data?.data?.offers || [];
  const myApplications: RentalApplication[] = rentalsData?.data?.data?.applications || [];

  const predictions = historyData?.data?.data?.predictions || [];
  const totalProperties = propertiesData?.data?.data?.pagination?.total || 0;
  const modelInfo = modelData?.data?.data;
  const modelVersion = modelInfo?.version || modelInfo?.model_version || 'RIQ-v1.0';
  const modelR2 = modelInfo?.metrics?.r2 != null
    ? Number(modelInfo.metrics.r2).toFixed(4)
    : (modelInfo?.r2 != null ? Number(modelInfo.r2).toFixed(4) : '0.9965');

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#061017]">
        <div className="skeleton w-48 h-8 bg-white/10" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Intelligence Hub — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Intelligence Hub">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="luxury-glass-card p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DFBA73]/10 text-[#DFBA73] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#DFBA73]/30">
                  <ShieldCheck size={12} /> RealEstateIQ Verified Portfolio
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                  Welcome back, <span className="text-[#DFBA73]">{user?.name}</span>
                </h2>
                <p className="text-neutral-400 text-sm mt-1">
                  Access institutional-grade valuation analytics and track Sri Lankan luxury real estate assets.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <Link href="/predict" className="btn-primary text-xs py-2.5 px-4 font-bold">
                  <Brain size={15} /> Run Valuation
                </Link>
                <Link href="/properties" className="btn-secondary text-xs py-2.5 px-4 font-semibold">
                  <Home size={15} /> Browse Properties
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Properties Monitored"
              value={totalProperties}
              icon={<Home size={20} className="text-[#DFBA73]" />}
              color="bg-[#DFBA73]/10 border border-[#DFBA73]/25"
            />
            <StatCard
              label="My Valuations"
              value={historyData?.data?.data?.pagination?.total || 0}
              icon={<Brain size={20} className="text-[#DFBA73]" />}
              color="bg-[#DFBA73]/10 border border-[#DFBA73]/25"
            />
            <StatCard
              label="Engine Version"
              value={modelVersion}
              icon={<TrendingUp size={20} className="text-[#DFBA73]" />}
              color="bg-[#DFBA73]/10 border border-[#DFBA73]/25"
            />
            <StatCard
              label="Model R² Score"
              value={modelR2}
              icon={<BarChart3 size={20} className="text-[#DFBA73]" />}
              color="bg-[#DFBA73]/10 border border-[#DFBA73]/25"
            />
          </div>

          {/* Quick Action Panels */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/predict', icon: <Brain size={22} />, label: 'Fair Market Valuation', desc: 'Instant estimate calibrated on 23 districts', badge: 'Core' },
              { href: '/market', icon: <BarChart3 size={22} />, label: 'District Intelligence', desc: 'Examine median square-foot rates and trends', badge: 'Analytics' },
              { href: '/recommendations', icon: <TrendingUp size={22} />, label: 'Curated Asset Matching', desc: 'Identify high-yield opportunities meeting criteria', badge: 'Yields' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="luxury-glass-card p-6 group hover:border-[#DFBA73]/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#DFBA73]/10 border border-[#DFBA73]/25 flex items-center justify-center text-[#DFBA73] group-hover:bg-[#DFBA73] group-hover:text-[#0A0D12] transition-all">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
                    {action.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-white text-base mb-1 group-hover:text-[#DFBA73] transition-colors">{action.label}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{action.desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#DFBA73] mt-4 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Module</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Active Offers & Tenancy Applications */}
          <div className="luxury-glass-card overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] bg-[#090D14] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <Handshake size={17} className="text-[#DFBA73]" /> My Real Estate Pipeline & Offers
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Track your submitted purchase offers and rental applications</p>
              </div>

              {/* Toggle Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#04080D] border border-white/[0.08] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActivityTab('offers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activityTab === 'offers'
                      ? 'bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#050B10] font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Handshake size={13} />
                  <span>Purchase Offers ({myOffers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('rentals')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activityTab === 'rentals'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <KeyRound size={13} />
                  <span>Rental Applications ({myApplications.length})</span>
                </button>
              </div>
            </div>

            {activityTab === 'offers' ? (
              <div className="divide-y divide-white/[0.06]">
                {myOffers.length === 0 ? (
                  <div className="p-10 text-center">
                    <Handshake size={32} className="text-neutral-600 mx-auto mb-2.5" />
                    <p className="text-neutral-400 text-xs font-medium">No purchase offers submitted yet.</p>
                    <Link href="/properties" className="text-[#DFBA73] font-semibold text-xs hover:underline mt-1.5 inline-block">
                      Browse properties to make an offer →
                    </Link>
                  </div>
                ) : (
                  myOffers.map((offer) => {
                    const prop = typeof offer.propertyId === 'object' ? (offer.propertyId as any) : null;
                    return (
                      <div key={offer._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {prop?.title || 'Property Asset'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 flex-wrap">
                            <span>Financing: <strong className="text-white">{offer.financingType}</strong></span>
                            <span>·</span>
                            <span>Closing: <strong className="text-white">{offer.targetClosingDays} days</strong></span>
                            <span>·</span>
                            <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[#DFBA73] font-serif font-black text-sm sm:text-base">
                            {formatPrice(offer.offerAmount)}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : offer.status === 'COUNTERED'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : offer.status === 'REJECTED'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30'
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {myApplications.length === 0 ? (
                  <div className="p-10 text-center">
                    <KeyRound size={32} className="text-neutral-600 mx-auto mb-2.5" />
                    <p className="text-neutral-400 text-xs font-medium">No rental applications submitted yet.</p>
                    <Link href="/properties" className="text-emerald-400 font-semibold text-xs hover:underline mt-1.5 inline-block">
                      Browse rental listings to apply →
                    </Link>
                  </div>
                ) : (
                  myApplications.map((app) => {
                    const prop = typeof app.propertyId === 'object' ? (app.propertyId as any) : null;
                    return (
                      <div key={app._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {prop?.title || 'Rental Asset'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 flex-wrap">
                            <span>Move-in: <strong className="text-white">{new Date(app.moveInDate).toLocaleDateString()}</strong></span>
                            <span>·</span>
                            <span>Lease: <strong className="text-white">{app.leaseDurationMonths} mo</strong></span>
                            <span>·</span>
                            <span>Occupants: <strong className="text-white">{app.occupantsCount}</strong></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-emerald-400 font-serif font-black text-sm sm:text-base">
                            Income: {formatPrice(app.monthlyIncome)}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : app.status === 'DECLINED'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Recent Predictions */}
          <div className="luxury-glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#090D14]">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <History size={16} className="text-[#DFBA73]" /> Recent Property Valuations
              </h3>
              <Link href="/history" className="text-xs font-semibold text-[#DFBA73] hover:underline flex items-center gap-1">
                View all history <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {predictions.length === 0 ? (
                <div className="p-12 text-center">
                  <Brain size={36} className="text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm font-medium">No property valuations recorded yet.</p>
                  <Link href="/predict" className="text-[#DFBA73] font-semibold text-xs hover:underline mt-2 inline-block">
                    Generate your first property valuation →
                  </Link>
                </div>
              ) : (
                predictions.map((pred: { _id: string; inputFeatures: { location: string; area: number; bedrooms: number }; predictedPrice: number; modelVersion: string; createdAt: string }) => (
                  <div key={pred._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {pred.inputFeatures.location} — {pred.inputFeatures.area.toLocaleString()} sqft, {pred.inputFeatures.bedrooms} Beds
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(pred.createdAt).toLocaleDateString()} · {pred.modelVersion}
                      </p>
                    </div>
                    <p className="text-[#DFBA73] font-serif font-black text-base">
                      Rs. {Math.round(pred.predictedPrice).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

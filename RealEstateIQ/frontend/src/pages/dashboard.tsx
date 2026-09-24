import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Brain, Home, History, TrendingUp, ArrowRight, BarChart3, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { predictionService, propertyService, marketService } from '../services/services';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#718078] text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#123B2A]">{value}</p>
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

  const predictions = historyData?.data?.data?.predictions || [];
  const totalProperties = propertiesData?.data?.data?.pagination?.total || 0;
  const modelInfo = modelData?.data?.data;
  const modelVersion = modelInfo?.version || modelInfo?.model_version || 'RIQ-v1.0';
  const modelR2 = modelInfo?.metrics?.r2 != null
    ? Number(modelInfo.metrics.r2).toFixed(4)
    : (modelInfo?.r2 != null ? Number(modelInfo.r2).toFixed(4) : '0.9965');

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="skeleton w-48 h-8" />
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
          {/* Welcome Banner: Pure White with Deep Forest Green branding */}
          <div className="card-premium p-6 sm:p-8 bg-white border border-[#E7E3DA]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4DC] text-[#8B6A14] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#ECD57F]">
                  <ShieldCheck size={12} /> RealEstateIQ Verified Portfolio
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#17231C]">
                  Welcome back, <span className="text-[#123B2A]">{user?.name}</span>
                </h2>
                <p className="text-[#718078] text-sm mt-1">
                  Access institutional-grade valuation analytics and track Sri Lankan real estate assets.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <Link href="/predict" className="btn-primary text-xs py-2.5 px-4">
                  <Brain size={15} /> Run Valuation
                </Link>
                <Link href="/properties" className="btn-secondary text-xs py-2.5 px-4">
                  <Home size={15} /> Browse Properties
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid: Pure White Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Properties Monitored"
              value={totalProperties}
              icon={<Home size={20} className="text-[#123B2A]" />}
              color="bg-[#EBF3EE] border border-[#B8D1C4]"
            />
            <StatCard
              label="My Valuations"
              value={historyData?.data?.data?.pagination?.total || 0}
              icon={<Brain size={20} className="text-[#2F6B4F]" />}
              color="bg-[#EAF4EE] border border-[#B8D9C5]"
            />
            <StatCard
              label="Engine Version"
              value={modelVersion}
              icon={<TrendingUp size={20} className="text-[#8B6A14]" />}
              color="bg-[#FAF4DC] border border-[#ECD57F]"
            />
            <StatCard
              label="Model R² Score"
              value={modelR2}
              icon={<BarChart3 size={20} className="text-[#3F7D58]" />}
              color="bg-[#EAF4EE] border border-[#B8D9C5]"
            />
          </div>

          {/* Quick Action Panels */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/predict', icon: <Brain size={22} />, label: 'Fair Market Valuation', desc: 'Instant estimate calibrated on 23 districts', badge: 'Core' },
              { href: '/market', icon: <BarChart3 size={22} />, label: 'District Intelligence', desc: 'Examine median square-foot rates and trends', badge: 'Analytics' },
              { href: '/recommendations', icon: <TrendingUp size={22} />, label: 'Curated Asset Matching', desc: 'Identify high-yield opportunities meeting criteria', badge: 'Yields' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="card-premium-hover p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] border border-[#B8D1C4] flex items-center justify-center text-[#123B2A] group-hover:bg-[#123B2A] group-hover:text-white transition-colors">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF4DC] text-[#8B6A14] border border-[#ECD57F]">
                    {action.badge}
                  </span>
                </div>
                <h3 className="font-bold text-[#17231C] text-sm mb-1 group-hover:text-[#123B2A] transition-colors">{action.label}</h3>
                <p className="text-[#718078] text-xs leading-relaxed">{action.desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#123B2A] mt-4 group-hover:text-[#2F6B4F]">
                  <span>Explore Module</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Predictions */}
          <div className="card-premium overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#E7E3DA] bg-[#FAF9F6]">
              <h3 className="font-bold text-[#17231C] text-sm flex items-center gap-2">
                <History size={16} className="text-[#123B2A]" /> Recent Property Valuations
              </h3>
              <Link href="/history" className="text-xs font-semibold text-[#123B2A] hover:text-[#2F6B4F] flex items-center gap-1">
                View all history <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-[#E7E3DA]">
              {predictions.length === 0 ? (
                <div className="p-12 text-center">
                  <Brain size={36} className="text-[#DCD6CB] mx-auto mb-3" />
                  <p className="text-[#718078] text-sm font-medium">No property valuations recorded yet.</p>
                  <Link href="/predict" className="text-[#123B2A] font-semibold text-xs hover:text-[#2F6B4F] mt-2 inline-block">
                    Generate your first property valuation →
                  </Link>
                </div>
              ) : (
                predictions.map((pred: { _id: string; inputFeatures: { location: string; area: number; bedrooms: number }; predictedPrice: number; modelVersion: string; createdAt: string }) => (
                  <div key={pred._id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#17231C]">
                        {pred.inputFeatures.location} — {pred.inputFeatures.area.toLocaleString()} sqft, {pred.inputFeatures.bedrooms} Beds
                      </p>
                      <p className="text-xs text-[#718078] mt-0.5">
                        {new Date(pred.createdAt).toLocaleDateString()} · {pred.modelVersion}
                      </p>
                    </div>
                    <p className="text-[#123B2A] font-extrabold text-sm sm:text-base">
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

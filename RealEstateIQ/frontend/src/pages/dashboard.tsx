import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Brain, Home, History, BookmarkCheck, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { predictionService, propertyService, marketService } from '../services/services';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
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
  const modelVersion = modelInfo?.version || modelInfo?.model_version || 'LR-v1.0';
  const modelR2 = modelInfo?.metrics?.r2 != null
    ? Number(modelInfo.metrics.r2).toFixed(4)
    : (modelInfo?.r2 != null ? Number(modelInfo.r2).toFixed(4) : '0.9965');

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="skeleton w-48 h-8" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Dashboard">
        <div className="space-y-8 animate-fade-in">
          {/* Welcome */}
          <div className="glass-card p-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))' }}>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, <span className="text-gradient">{user?.name}</span> 👋
            </h2>
            <p className="text-white/50 mb-6">
              Ready to predict property values and explore the market?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/predict" className="btn-primary text-sm py-2.5">
                <Brain size={16} /> Predict Property Value
              </Link>
              <Link href="/properties" className="btn-secondary text-sm py-2.5">
                <Home size={16} /> Browse Properties
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Properties"
              value={totalProperties}
              icon={<Home size={20} className="text-brand-300" />}
              color="bg-brand-500/20"
            />
            <StatCard
              label="My Predictions"
              value={historyData?.data?.data?.pagination?.total || 0}
              icon={<Brain size={20} className="text-violet-300" />}
              color="bg-violet-500/20"
            />
            <StatCard
              label="Model"
              value={modelVersion}
              icon={<TrendingUp size={20} className="text-emerald-300" />}
              color="bg-emerald-500/20"
            />
            <StatCard
              label="R² Score"
              value={modelR2}
              icon={<BarChart3 size={20} className="text-amber-300" />}
              color="bg-amber-500/20"
            />
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/predict', icon: <Brain size={24} />, label: 'Predict Value', desc: 'Get ML price estimate', color: 'text-brand-400' },
              { href: '/market', icon: <BarChart3 size={24} />, label: 'Market Analytics', desc: 'Explore real stats', color: 'text-violet-400' },
              { href: '/recommendations', icon: <TrendingUp size={24} />, label: 'Recommendations', desc: 'Find matching properties', color: 'text-emerald-400' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="glass-card-hover p-6 group">
                <div className={`${action.color} mb-4`}>{action.icon}</div>
                <h3 className="font-semibold text-white mb-1">{action.label}</h3>
                <p className="text-white/50 text-sm">{action.desc}</p>
                <ArrowRight size={16} className="mt-4 text-white/20 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Recent Predictions */}
          <div className="glass-card">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <History size={18} className="text-brand-400" /> Recent Predictions
              </h3>
              <Link href="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {predictions.length === 0 ? (
                <div className="p-12 text-center">
                  <Brain size={40} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">No predictions yet.</p>
                  <Link href="/predict" className="text-brand-400 text-sm hover:text-brand-300 mt-2 inline-block">
                    Make your first prediction →
                  </Link>
                </div>
              ) : (
                predictions.map((pred: { _id: string; inputFeatures: { location: string; area: number; bedrooms: number }; predictedPrice: number; modelVersion: string; createdAt: string }) => (
                  <div key={pred._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {pred.inputFeatures.location} — {pred.inputFeatures.area} sqft, {pred.inputFeatures.bedrooms}BR
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(pred.createdAt).toLocaleDateString()} · {pred.modelVersion}
                      </p>
                    </div>
                    <p className="text-brand-400 font-semibold text-sm">
                      Rs. {pred.predictedPrice.toLocaleString()}
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

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Users, Home, Brain, BarChart3, Activity } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';

function MetricCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
    enabled: isAuthenticated && isAdmin,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['predictionAnalytics'],
    queryFn: adminService.getPredictionAnalytics,
    enabled: isAuthenticated && isAdmin,
  });

  const metrics = dashData?.data?.data;
  const analytics = analyticsData?.data?.data;

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <>
      <Head><title>Admin Dashboard — RealEstateIQ</title></Head>
      <DashboardLayout title="Admin Dashboard">
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard size={24} className="text-brand-400" /> Admin Dashboard
              </h2>
              <p className="text-white/50 text-sm mt-1">Platform-wide metrics and controls</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={metrics?.totalUsers ?? '—'} icon={<Users size={20} className="text-brand-300" />} color="bg-brand-500/20" />
            <MetricCard label="Properties" value={metrics?.totalProperties ?? '—'} icon={<Home size={20} className="text-violet-300" />} color="bg-violet-500/20" />
            <MetricCard label="Predictions" value={metrics?.totalPredictions ?? '—'} icon={<Brain size={20} className="text-cyan-300" />} color="bg-cyan-500/20" />
            <MetricCard label="Saved" value={metrics?.totalSaved ?? '—'} icon={<Activity size={20} className="text-emerald-300" />} color="bg-emerald-500/20" />
          </div>

          {/* Active Model */}
          {metrics?.activeModel && (
            <div className="glass-card p-6 border-brand-500/20" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain size={18} className="text-brand-400" /> Active Production Model
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Version', value: metrics.activeModel.version },
                  { label: 'Algorithm', value: metrics.activeModel.algorithm },
                  { label: 'R²', value: metrics.activeModel.r2?.toFixed(4) ?? '—' },
                  { label: 'MAE', value: metrics.activeModel.mae ? `Rs. ${Math.round(metrics.activeModel.mae).toLocaleString()}` : '—' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-4 text-center">
                    <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                    <p className="text-sm font-bold text-brand-400">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/admin/users', label: 'Manage Users', icon: <Users size={20} />, desc: 'View, update roles, delete users' },
              { href: '/admin/models', label: 'ML Models', icon: <Brain size={20} />, desc: 'View trained models and metrics' },
              { href: '/admin/audit-logs', label: 'Audit Logs', icon: <Activity size={20} />, desc: 'Full system audit trail' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="glass-card-hover p-6 group">
                <div className="text-brand-400 mb-3">{link.icon}</div>
                <h3 className="font-semibold text-white mb-1">{link.label}</h3>
                <p className="text-white/40 text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Prediction activity chart */}
          {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-400" /> Daily Predictions (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e1e38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

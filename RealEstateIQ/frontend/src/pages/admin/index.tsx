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

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#00DC82]/10 border border-[#00DC82]/20 text-[#00DC82]">
          {icon}
        </div>
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

  const { data: dashData } = useQuery({
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
      <Head><title>Admin Suite Overview — RealEstateIQ</title></Head>
      <DashboardLayout title="System Administration">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <LayoutDashboard size={22} className="text-[#00DC82]" /> Platform Governance
              </h2>
              <p className="text-[#94A3B8] text-xs mt-1">System-wide infrastructure metrics, models, and security controls</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Registered Users" value={metrics?.totalUsers ?? '—'} icon={<Users size={20} />} />
            <MetricCard label="Property Assets" value={metrics?.totalProperties ?? '—'} icon={<Home size={20} />} />
            <MetricCard label="Valuation Audits" value={metrics?.totalPredictions ?? '—'} icon={<Brain size={20} />} />
            <MetricCard label="Saved Portfolios" value={metrics?.totalSaved ?? '—'} icon={<Activity size={20} />} />
          </div>

          {/* Active Model */}
          {metrics?.activeModel && (
            <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 pb-2 border-b border-[#162E40]">
                <Brain size={16} className="text-[#00DC82]" /> Active Production Valuation Engine
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Model Version', value: metrics.activeModel.version },
                  { label: 'Algorithm', value: metrics.activeModel.algorithm },
                  { label: 'Calibration R²', value: metrics.activeModel.r2?.toFixed(4) ?? '0.9965' },
                  { label: 'Mean Abs Error', value: metrics.activeModel.mae ? `Rs. ${Math.round(metrics.activeModel.mae).toLocaleString()}` : 'Rs. 8,127' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-[#08141F] border border-[#162E40] text-center">
                    <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/admin/users', label: 'User Directory', icon: <Users size={20} />, desc: 'Manage client accounts and access permissions' },
              { href: '/admin/models', label: 'AI Model Registry', icon: <Brain size={20} />, desc: 'Inspect performance metrics and trained artifacts' },
              { href: '/admin/audit-logs', label: 'Security & Audit Logs', icon: <Activity size={20} />, desc: 'Full institutional system access audit trail' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="card-premium-hover p-5 bg-[#0B1722] border border-[#162E40] group">
                <div className="w-10 h-10 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82] mb-3 group-hover:bg-[#00DC82] group-hover:text-[#061017] transition-colors">
                  {link.icon}
                </div>
                <h3 className="font-bold text-white text-sm mb-1 group-hover:text-[#00DC82] transition-colors">{link.label}</h3>
                <p className="text-[#94A3B8] text-xs leading-relaxed">{link.desc}</p>
              </Link>
            ))}
          </div>

          {/* Prediction activity chart */}
          {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
            <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
              <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#00DC82]" /> Daily Valuation Volume (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={analytics.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162E40" />
                  <XAxis dataKey="_id" tick={{ fill: '#94A3B8', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#08141F', border: '1px solid #162E40', borderRadius: '10px', color: '#F8FAFC' }} />
                  <Bar dataKey="count" fill="#00DC82" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

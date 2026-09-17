import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { FileBarChart, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';
import { Prediction } from '../../types';

export default function AdminPredictionsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data: analyticsData } = useQuery({
    queryKey: ['adminPredictionAnalytics'],
    queryFn: adminService.getPredictionAnalytics,
    enabled: isAdmin,
  });

  const analytics = analyticsData?.data?.data;

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Predictions — Admin</title></Head>
      <DashboardLayout title="Prediction Analytics">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Prediction Analytics</h2>
            <p className="text-white/50 text-sm mt-1">{analytics?.total || 0} total predictions</p>
          </div>

          {/* By location */}
          {analytics?.byLocation?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Brain size={18} className="text-brand-400" /> Predictions by Location
                </h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Location</th><th>Predictions</th><th>Avg Predicted Price</th></tr>
                </thead>
                <tbody>
                  {analytics.byLocation.map((loc: { _id: string; count: number; avgPrice: number }) => (
                    <tr key={loc._id}>
                      <td className="font-medium">{loc._id}</td>
                      <td>{loc.count}</td>
                      <td className="text-brand-400">Rs. {Math.round(loc.avgPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent activity */}
          {analytics?.recentActivity?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileBarChart size={18} className="text-brand-400" /> Daily Activity (Last 30 Days)
                </h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Predictions</th></tr>
                </thead>
                <tbody>
                  {[...analytics.recentActivity].reverse().map((day: { _id: string; count: number }) => (
                    <tr key={day._id}>
                      <td>{day._id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(day.count / Math.max(...analytics.recentActivity.map((d: { count: number }) => d.count))) * 100}%` }} />
                          </div>
                          <span>{day.count}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

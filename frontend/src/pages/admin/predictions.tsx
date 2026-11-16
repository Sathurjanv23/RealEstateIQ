import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { FileBarChart, Brain } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';

export default function AdminPredictionsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

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
      <Head><title>Valuation Audits — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="Valuation Audits">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Valuation Audits & Analytics</h2>
            <p className="text-neutral-400 text-xs mt-1">{analytics?.total || 0} total institutional valuations audited</p>
          </div>

          {/* By location */}
          {analytics?.byLocation?.length > 0 && (
            <div className="luxury-glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08] bg-[#090D14]">
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <Brain size={16} className="text-[#DFBA73]" /> Valuation Volume by District
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>District</th><th>Valuations</th><th>Average Estimated Price</th></tr>
                  </thead>
                  <tbody>
                    {analytics.byLocation.map((loc: { _id: string; count: number; avgPrice: number }) => (
                      <tr key={loc._id}>
                        <td className="font-serif font-bold text-white">{loc._id}</td>
                        <td className="text-neutral-400">{loc.count}</td>
                        <td className="text-[#DFBA73] font-serif font-bold">Rs. {Math.round(loc.avgPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent activity */}
          {analytics?.recentActivity?.length > 0 && (
            <div className="luxury-glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08] bg-[#090D14]">
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <FileBarChart size={16} className="text-[#DFBA73]" /> Daily Audit Volume (Last 30 Days)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Valuation Queries</th></tr>
                  </thead>
                  <tbody>
                    {[...analytics.recentActivity].reverse().map((day: { _id: string; count: number }) => {
                      const maxVal = Math.max(...analytics.recentActivity.map((d: { count: number }) => d.count)) || 1;
                      return (
                        <tr key={day._id}>
                          <td className="text-neutral-300 font-mono text-xs">{day._id}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2 rounded-full bg-[#090D14] border border-white/[0.08] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#DFBA73] to-[#C5A880]"
                                  style={{ width: `${(day.count / maxVal) * 100}%` }}
                                />
                              </div>
                              <span className="font-bold text-white text-xs">{day.count}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

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
            <h2 className="text-2xl font-black text-[#17231C]">Valuation Audit Analytics</h2>
            <p className="text-[#718078] text-xs mt-1">{analytics?.total || 0} total institutional valuations audited</p>
          </div>

          {/* By location */}
          {analytics?.byLocation?.length > 0 && (
            <div className="card-premium overflow-hidden bg-white border border-[#E7E3DA]">
              <div className="px-6 py-4 border-b border-[#E7E3DA] bg-[#FAF9F6]">
                <h3 className="font-bold text-[#17231C] text-sm flex items-center gap-2">
                  <Brain size={16} className="text-[#123B2A]" /> Valuation Volume by District
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
                        <td className="font-bold text-[#17231C]">{loc._id}</td>
                        <td className="text-[#718078]">{loc.count}</td>
                        <td className="text-[#123B2A] font-black">Rs. {Math.round(loc.avgPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent activity */}
          {analytics?.recentActivity?.length > 0 && (
            <div className="card-premium overflow-hidden bg-white border border-[#E7E3DA]">
              <div className="px-6 py-4 border-b border-[#E7E3DA] bg-[#FAF9F6]">
                <h3 className="font-bold text-[#17231C] text-sm flex items-center gap-2">
                  <FileBarChart size={16} className="text-[#123B2A]" /> Daily Audit Volume (Last 30 Days)
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
                          <td className="text-[#17231C] font-mono text-xs">{day._id}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2 rounded-full bg-[#EFECE3] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#123B2A]"
                                  style={{ width: `${(day.count / maxVal) * 100}%` }}
                                />
                              </div>
                              <span className="font-bold text-[#17231C] text-xs">{day.count}</span>
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

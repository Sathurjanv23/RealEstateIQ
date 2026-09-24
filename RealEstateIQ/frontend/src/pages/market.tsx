import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Home, MapPin, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/services';
import { MarketAnalytics } from '../types';
import { SL_LOCATIONS_GROUPED } from '../utils/sriLankaLocations';

const COLORS = ['#123B2A', '#2F6B4F', '#C9A227', '#3F7D58', '#718078', '#5F957B'];
const TYPES = ['', 'house', 'apartment', 'land', 'commercial', 'villa'];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-premium p-5 bg-white border border-[#E7E3DA]">
      <p className="text-[11px] text-[#718078] uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-[#123B2A]">{value}</p>
      {sub && <p className="text-xs text-[#718078] mt-1">{sub}</p>}
    </div>
  );
}

export default function MarketPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState({ location: '', propertyType: '' });

  const { data, isLoading: loading } = useQuery({
    queryKey: ['marketAnalytics', filters],
    queryFn: () => marketService.getAnalytics(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
  });

  const analytics: MarketAnalytics | undefined = data?.data?.data;

  const formatPrice = (val: number | null | undefined) => val ? `Rs. ${Math.round(val).toLocaleString()}` : 'N/A';

  return (
    <>
      <Head>
        <title>Market Intelligence — RealEstateIQ</title>
        <meta name="description" content="Authentic Sri Lankan real estate market analytics across 23 districts and property types." />
      </Head>
      <DashboardLayout title="Market Intelligence">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          {/* Header controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#17231C]">Market Intelligence & Trends</h2>
              <p className="text-[#718078] text-xs mt-1">Calibrated from authentic transaction and listing records</p>
            </div>
            <div className="flex gap-2.5">
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="input-field text-xs py-2 w-auto bg-white"
              >
                <option value="">All Districts</option>
                {Object.entries(SL_LOCATIONS_GROUPED).map(([province, locs]) => (
                  <optgroup key={province} label={`— ${province}`}>
                    {locs.map(loc => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="input-field text-xs py-2 w-auto bg-white"
              >
                <option value="">All Asset Types</option>
                {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
          </div>

          {/* Institutional Note */}
          <div className="card-premium p-4 border border-[#B8D9C5] bg-[#EAF4EE] flex gap-3 items-center">
            <ShieldCheck size={18} className="text-[#3F7D58] shrink-0" />
            <p className="text-xs text-[#2F6B4F] font-medium">
              {analytics?.note || 'Market metrics computed from verified transaction records.'}
              {' '}Calibrated on Sri Lankan real estate benchmarks across 23 districts.
            </p>
          </div>

          {/* Overall Stats */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))}
            </div>
          ) : analytics?.overall ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Monitored" value={String(analytics.overall.count)} />
              <StatCard label="Average Price" value={formatPrice(analytics.overall.avgPrice)} />
              <StatCard label="Median Price" value={formatPrice(analytics.overall.medianPrice)} />
              <StatCard label="Avg Price / Sqft" value={analytics.overall.avgPricePerSqft ? `Rs. ${Math.round(analytics.overall.avgPricePerSqft).toLocaleString()}` : 'N/A'} />
            </div>
          ) : null}

          {/* Charts */}
          {analytics && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avg price by location */}
              {analytics.byLocation.length > 0 && (
                <div className="card-premium p-6 bg-white border border-[#E7E3DA]">
                  <h3 className="font-bold text-[#17231C] text-sm mb-5 flex items-center gap-2">
                    <MapPin size={16} className="text-[#123B2A]" /> Average Price by District (LKR)
                  </h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={analytics.byLocation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFECE3" />
                      <XAxis dataKey="_id" tick={{ fill: '#718078', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#718078', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E7E3DA', borderRadius: '10px', color: '#17231C', boxShadow: '0 4px 12px rgba(18,59,42,0.08)' }}
                        formatter={(v: number) => [`Rs. ${Math.round(v).toLocaleString()}`, 'Avg Price']}
                      />
                      <Bar dataKey="avgPrice" fill="#123B2A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* By property type */}
              {analytics.byPropertyType.length > 0 && (
                <div className="card-premium p-6 bg-white border border-[#E7E3DA]">
                  <h3 className="font-bold text-[#17231C] text-sm mb-5 flex items-center gap-2">
                    <Home size={16} className="text-[#123B2A]" /> Portfolio Composition by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={analytics.byPropertyType}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="45%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {analytics.byPropertyType.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#FFFFFF',
                          border: '1px solid #E7E3DA',
                          borderRadius: '10px',
                          color: '#17231C',
                          boxShadow: '0 4px 12px rgba(18,59,42,0.08)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', color: '#718078', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Price by location table */}
          {analytics && analytics.byLocation.length > 0 && (
            <div className="card-premium overflow-hidden bg-white border border-[#E7E3DA]">
              <div className="px-6 py-4 border-b border-[#E7E3DA] bg-[#FAF9F6] flex items-center justify-between">
                <h3 className="font-bold text-[#17231C] text-sm flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#123B2A]" /> District Valuation Breakdown
                </h3>
                <span className="text-xs text-[#718078] font-medium md:hidden">Scroll sideways →</span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="data-table min-w-[620px]">
                  <thead>
                    <tr>
                      <th>District</th><th>Assets</th><th>Average Price</th><th>Min Price</th><th>Max Price</th><th>Avg Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.byLocation.map((loc) => (
                      <tr key={loc._id}>
                        <td className="font-bold text-[#17231C]">{loc._id}</td>
                        <td className="text-[#718078] font-medium">{loc.count}</td>
                        <td className="text-[#123B2A] font-black">Rs. {Math.round(loc.avgPrice).toLocaleString()}</td>
                        <td className="text-[#718078]">Rs. {loc.minPrice ? Math.round(loc.minPrice).toLocaleString() : '—'}</td>
                        <td className="text-[#718078]">Rs. {loc.maxPrice ? Math.round(loc.maxPrice).toLocaleString() : '—'}</td>
                        <td className="text-[#718078]">{loc.avgArea ? `${Math.round(loc.avgArea).toLocaleString()} sqft` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analytics?.overall?.count === 0 && (
            <div className="card-premium p-16 text-center bg-white border border-[#E7E3DA]">
              <BarChart3 size={48} className="text-[#DCD6CB] mx-auto mb-4" />
              <p className="text-[#17231C] font-bold">No property records available for analytics.</p>
              <p className="text-[#718078] text-xs mt-1">Add property listings to generate district intelligence.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

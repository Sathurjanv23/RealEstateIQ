import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Home, MapPin, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/services';
import { MarketAnalytics } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
const LOCATIONS = ['', 'Colombo', 'Kandy', 'Galle', 'Negombo'];
const TYPES = ['', 'house', 'apartment', 'land', 'commercial', 'villa'];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
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
        <meta name="description" content="Real estate market analytics across Sri Lanka locations and property types." />
      </Head>
      <DashboardLayout title="Market Intelligence">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Market Analytics</h2>
              <p className="text-white/50 text-sm mt-1">Statistics from properties in the database</p>
            </div>
            <div className="flex gap-3">
              <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="input-dark text-sm py-2">
                <option value="">All Locations</option>
                {LOCATIONS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="input-dark text-sm py-2">
                <option value="">All Types</option>
                {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass-card p-4 border-amber-500/20 flex gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/60">
              {analytics?.note || 'Analytics computed from properties stored in the database.'}
              {' '}Market intelligence derived from authentic Sri Lanka real estate transaction data.
            </p>
          </div>

          {/* Overall stats */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : analytics?.overall ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Properties" value={String(analytics.overall.count)} />
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
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                    <MapPin size={18} className="text-brand-400" /> Average Price by Location
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.byLocation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="_id" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ background: '#1e1e38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, 'Avg Price']}
                      />
                      <Bar dataKey="avgPrice" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* By property type */}
              {analytics.byPropertyType.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                    <Home size={18} className="text-brand-400" /> Properties by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.byPropertyType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, count }) => `${_id}: ${count}`}>
                        {analytics.byPropertyType.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e1e38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Price by location table */}
          {analytics && analytics.byLocation.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand-400" /> Location Breakdown
                </h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Location</th><th>Properties</th><th>Avg Price</th><th>Min Price</th><th>Max Price</th><th>Avg Area</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.byLocation.map((loc) => (
                    <tr key={loc._id}>
                      <td className="font-medium">{loc._id}</td>
                      <td>{loc.count}</td>
                      <td className="text-brand-400">Rs. {Math.round(loc.avgPrice).toLocaleString()}</td>
                      <td className="text-white/60">Rs. {loc.minPrice?.toLocaleString() || '—'}</td>
                      <td className="text-white/60">Rs. {loc.maxPrice?.toLocaleString() || '—'}</td>
                      <td className="text-white/60">{loc.avgArea ? `${Math.round(loc.avgArea).toLocaleString()} sqft` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {analytics?.overall?.count === 0 && (
            <div className="glass-card p-16 text-center">
              <BarChart3 size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No property data available for analytics.</p>
              <p className="text-white/30 text-sm mt-2">Add properties to see market statistics.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

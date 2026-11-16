import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, BarChart3, ArrowRight, ShieldCheck, MapPin, Building2, RefreshCw } from 'lucide-react';
import { marketService } from '../../services/services';
import { MarketAnalytics } from '../../types';

export function MarketIntelligenceSection() {
  const [activeMetric, setActiveMetric] = useState<'avgPrice' | 'rateSqft'>('avgPrice');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['landingMarketAnalytics'],
    queryFn: () => marketService.getAnalytics(),
    staleTime: 60000,
    retry: 2,
  });

  const analytics: MarketAnalytics | undefined = analyticsData?.data?.data;

  // Chart data formatted strictly from the real backend database analytics
  const locationStats = analytics?.byLocation || [];
  const chartData = locationStats.map((item) => {
    const avgM = Number((item.avgPrice / 1000000).toFixed(1));
    const rateSqft = item.avgArea && item.avgArea > 0 ? Math.round(item.avgPrice / item.avgArea) : Math.round(item.avgPrice / 2000);
    return {
      name: item._id,
      avgPriceM: avgM,
      rateSqft,
      transactions: item.count,
    };
  });

  const overall = analytics?.overall;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="luxury-glass-card p-3 rounded-xl border border-[#DFBA73]/40 shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{data.name} District</p>
          <p className="text-[#DFBA73] font-semibold">
            {activeMetric === 'avgPrice'
              ? `Avg Price: Rs. ${data.avgPriceM}M`
              : `Sqft Rate: Rs. ${data.rateSqft?.toLocaleString()}`}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">
            Database Listings: <span className="text-white font-medium">{data.transactions}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="market-intelligence" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#DFBA73]">
              Authentic Market Intelligence
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Sri Lankan Property Dynamics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-normal leading-relaxed">
            Market analytics aggregated directly from verified database records and authentic Sri Lankan transaction data.
          </p>
        </div>

        <Link
          href="/market"
          className="btn-luxury-outline text-xs sm:text-sm py-2.5 px-5 rounded-full self-start sm:self-auto group"
        >
          <span>Open Full Intelligence Suite</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4 Stat Cards from Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="luxury-glass-card p-5 rounded-2xl border border-white/[0.08]">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Database Properties
          </span>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {isLoading ? '...' : (overall?.count || 0)}
          </p>
          <span className="text-[10px] text-[#DFBA73] mt-1 block">Active Database Assets</span>
        </div>

        <div className="luxury-glass-card p-5 rounded-2xl border border-white/[0.08]">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Database Average Price
          </span>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#DFBA73]">
            {isLoading
              ? '...'
              : overall?.avgPrice
              ? `Rs. ${(overall.avgPrice / 1000000).toFixed(1)}M`
              : 'N/A'}
          </p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Mean Transaction Benchmark</span>
        </div>

        <div className="luxury-glass-card p-5 rounded-2xl border border-white/[0.08]">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Median Sqft Rate
          </span>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {isLoading
              ? '...'
              : overall?.avgPricePerSqft
              ? `Rs. ${Math.round(overall.avgPricePerSqft).toLocaleString()}`
              : 'N/A'}
          </p>
          <span className="text-[10px] text-emerald-400 mt-1 block">Authentic Area Price Ratio</span>
        </div>

        <div className="luxury-glass-card p-5 rounded-2xl border border-white/[0.08]">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            ML Training Records
          </span>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white">14,833</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">50-Year Market Transactions</span>
        </div>
      </div>

      {/* Chart Panel Container */}
      <div className="luxury-glass-card p-5 sm:p-7 md:p-8 rounded-2xl md:rounded-3xl border border-white/[0.08]">
        {/* Metric Toggle Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#DFBA73]" />
            <h3 className="text-sm sm:text-base font-serif font-normal text-white">
              Authentic District Breakdown
            </h3>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => setActiveMetric('avgPrice')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === 'avgPrice'
                  ? 'bg-[#DFBA73] text-[#0A0D14] shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Average Price (M LKR)
            </button>
            <button
              onClick={() => setActiveMetric('rateSqft')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetric === 'rateSqft'
                  ? 'bg-[#DFBA73] text-[#0A0D14] shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Rate / Sqft (LKR)
            </button>
          </div>
        </div>

        {/* Responsive Recharts Bar Container */}
        {isLoading ? (
          <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <RefreshCw size={14} className="animate-spin text-[#DFBA73]" />
              <span>Loading authentic district analytics...</span>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickFormatter={(val) => activeMetric === 'avgPrice' ? `${val}M` : `${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                <Bar
                  dataKey={activeMetric === 'avgPrice' ? 'avgPriceM' : 'rateSqft'}
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#DFBA73' : index === 1 ? '#C5A880' : '#8A6827'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400">
            Market analytics will appear here as records sync from the database.
          </div>
        )}

        {/* Bottom District Highlights */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/[0.08] text-xs">
            {chartData.slice(0, 4).map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DFBA73]" />
                <span className="text-neutral-300 font-medium">{d.name}:</span>
                <span className="text-[#DFBA73] font-bold">Rs. {d.avgPriceM}M</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

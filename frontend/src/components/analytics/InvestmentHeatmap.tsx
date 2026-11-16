import { useEffect, useRef, useState, useId } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SRI_LANKA_DISTRICT_YIELDS,
  ALL_DISTRICT_KEYS,
  TOP_YIELD_DISTRICTS,
  TOP_GROWTH_DISTRICTS,
  calculateInvestmentProjection,
  DistrictInvestmentData,
} from '../../utils/sriLankaYieldData';
import { TrendingUp, Percent, DollarSign, MapPin, Sparkles, Building2, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

type HeatmapMetric = 'yield' | 'growth' | 'price';

export default function InvestmentHeatmap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeMetric, setActiveMetric] = useState<HeatmapMetric>('yield');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Galle');
  const [simulatorPrice, setSimulatorPrice] = useState<number>(35000000); // 35M LKR benchmark

  const priceSliderId = useId();
  const districtSelectId = useId();

  // Color & Radius helper based on metric
  const getCircleStyling = (district: DistrictInvestmentData, metric: HeatmapMetric) => {
    if (metric === 'yield') {
      const y = district.grossRentalYield;
      if (y >= 9.0) return { color: '#00DC82', fillColor: '#00DC82', radius: 24000, label: `${y}% Yield` };
      if (y >= 7.5) return { color: '#DFBA73', fillColor: '#DFBA73', radius: 19000, label: `${y}% Yield` };
      if (y >= 6.5) return { color: '#818CF8', fillColor: '#818CF8', radius: 16000, label: `${y}% Yield` };
      return { color: '#F97316', fillColor: '#F97316', radius: 13000, label: `${y}% Yield` };
    }

    if (metric === 'growth') {
      const g = district.capitalAppreciation5Yr;
      if (g >= 14.0) return { color: '#00DC82', fillColor: '#00DC82', radius: 24000, label: `+${g}% / yr` };
      if (g >= 12.0) return { color: '#DFBA73', fillColor: '#DFBA73', radius: 19000, label: `+${g}% / yr` };
      if (g >= 10.5) return { color: '#818CF8', fillColor: '#818CF8', radius: 16000, label: `+${g}% / yr` };
      return { color: '#F97316', fillColor: '#F97316', radius: 13000, label: `+${g}% / yr` };
    }

    // price per sqft
    const p = district.avgSqftPrice;
    if (p >= 30000) return { color: '#EF4444', fillColor: '#EF4444', radius: 24000, label: `Rs. ${p.toLocaleString()}/sqft` };
    if (p >= 20000) return { color: '#DFBA73', fillColor: '#DFBA73', radius: 20000, label: `Rs. ${p.toLocaleString()}/sqft` };
    if (p >= 15000) return { color: '#818CF8', fillColor: '#818CF8', radius: 16000, label: `Rs. ${p.toLocaleString()}/sqft` };
    return { color: '#00DC82', fillColor: '#00DC82', radius: 13000, label: `Rs. ${p.toLocaleString()}/sqft` };
  };

  // Initialize or re-draw Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [7.8731, 80.7718], // Center of Sri Lanka
        zoom: 8,
        minZoom: 7,
        maxZoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      circlesLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Refresh heat circles on metric change
    if (circlesLayerRef.current && mapInstanceRef.current) {
      circlesLayerRef.current.clearLayers();

      Object.values(SRI_LANKA_DISTRICT_YIELDS).forEach((district) => {
        const styling = getCircleStyling(district, activeMetric);

        // Core heat circle
        const circle = L.circle(district.coordinates, {
          radius: styling.radius,
          color: styling.color,
          weight: 2,
          fillColor: styling.fillColor,
          fillOpacity: 0.28,
        });

        // Glowing center dot marker
        const centerMarker = L.circleMarker(district.coordinates, {
          radius: 6,
          color: '#06080C',
          weight: 2,
          fillColor: styling.color,
          fillOpacity: 1,
        });

        const popupHtml = `
          <div style="font-family: ui-sans-serif, system-ui; min-width: 240px; color: #FFFFFF; background: #0A0D14; border-radius: 12px; padding: 12px; border: 1px solid rgba(223, 186, 115, 0.35); box-shadow: 0 10px 25px rgba(0,0,0,0.8);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 14px; font-weight: 800; color: #DFBA73;">${district.district}</span>
              <span style="font-size: 10px; background: rgba(223, 186, 115, 0.15); color: #DFBA73; padding: 2px 7px; border-radius: 999px; font-weight: 700;">${district.province}</span>
            </div>
            <div style="margin-bottom: 8px; font-size: 11px; color: #94A3B8;">${district.description}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; font-size: 11px;">
              <div style="background: rgba(255,255,255,0.04); padding: 6px 8px; border-radius: 6px;">
                <div style="color: #64748B; font-size: 9px; text-transform: uppercase;">Gross Yield</div>
                <div style="color: #00DC82; font-weight: 800; font-size: 13px;">${district.grossRentalYield}%</div>
              </div>
              <div style="background: rgba(255,255,255,0.04); padding: 6px 8px; border-radius: 6px;">
                <div style="color: #64748B; font-size: 9px; text-transform: uppercase;">Capital Growth</div>
                <div style="color: #DFBA73; font-weight: 800; font-size: 13px;">+${district.capitalAppreciation5Yr}%/yr</div>
              </div>
            </div>
            <div style="font-size: 10px; color: #94A3B8; margin-bottom: 8px;">
              <strong style="color: #E2E8F0;">Est. Rent:</strong> Rs. ${district.avgMonthlyRent.toLocaleString()} / mo<br/>
              <strong style="color: #E2E8F0;">Price/Sqft:</strong> Rs. ${district.avgSqftPrice.toLocaleString()}<br/>
              <strong style="color: #E2E8F0;">Demand:</strong> ${district.topDemandDriver}
            </div>
            <a href="/properties?location=${district.district}" style="display: block; text-align: center; background: #DFBA73; color: #0A0D14; font-size: 11px; font-weight: 800; padding: 6px 10px; border-radius: 6px; text-decoration: none; margin-top: 6px;">
              View Properties in ${district.district} →
            </a>
          </div>
        `;

        circle.bindPopup(popupHtml);
        centerMarker.bindPopup(popupHtml);

        circle.on('click', () => setSelectedDistrict(district.district));
        centerMarker.on('click', () => setSelectedDistrict(district.district));

        circle.addTo(circlesLayerRef.current!);
        centerMarker.addTo(circlesLayerRef.current!);
      });
    }
  }, [activeMetric]);

  const projection = calculateInvestmentProjection(simulatorPrice, selectedDistrict);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metric Selector Bar & Insights Header */}
      <div className="luxury-glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#DFBA73]/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#DFBA73] uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Sri Lanka Real Estate Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
            District Investment Heatmap & Rental Yield
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Comprehensive macro-level yield, appreciation, and rental benchmarks across all 25 districts
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex bg-[#070A0F] p-1 rounded-xl border border-white/[0.1] self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric('yield')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'yield'
                ? 'bg-[#00DC82] text-[#06080C] shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Percent size={13} /> Gross Yield (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('growth')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'growth'
                ? 'bg-[#DFBA73] text-[#06080C] shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp size={13} /> Capital Growth
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('price')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'price'
                ? 'bg-[#818CF8] text-[#06080C] shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign size={13} /> Price / Sqft
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs px-2 text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Heat Intensity:</span>
          {activeMetric === 'yield' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00DC82]" /> &gt; 9.0% High Tourism Yield</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DFBA73]" /> 7.5% - 9.0% Strong Suburban</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" /> 6.5% - 7.5% Stable Prime</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> &lt; 6.5% Developing</span>
            </div>
          )}
          {activeMetric === 'growth' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00DC82]" /> &gt; 14.0% Boom Corridor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DFBA73]" /> 12.0% - 14.0% Steady Growth</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" /> 10.0% - 12.0% Heritage Hub</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> &lt; 10.0% Emerging</span>
            </div>
          )}
          {activeMetric === 'price' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> &gt; Rs. 30,000 / sqft (Prime)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#DFBA73]" /> Rs. 20k - 30k (Mid-Tier)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" /> Rs. 15k - 20k (Accessible)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00DC82]" /> &lt; Rs. 15,000 (Value Entry)</span>
            </div>
          )}
        </div>
        <span className="text-[11px] text-neutral-500 italic">Click any district circle to simulate real cash flow</span>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-[#070A0F]">
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '520px', zIndex: 10 }}
        />
      </div>

      {/* Top Districts Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Rental Yields */}
        <div className="luxury-glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
              <Percent size={16} className="text-[#00DC82]" /> Top 5 Highest Rental Yield Districts
            </h3>
            <span className="text-[11px] text-[#00DC82] font-semibold bg-[#00DC82]/10 px-2 py-0.5 rounded-full">Tourism & Villas</span>
          </div>

          <div className="space-y-3">
            {TOP_YIELD_DISTRICTS.map((d, index) => (
              <div
                key={d.district}
                onClick={() => setSelectedDistrict(d.district)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDistrict === d.district
                    ? 'border-[#00DC82] bg-[#00DC82]/10 shadow-md'
                    : 'border-white/[0.06] bg-[#090D14]/70 hover:border-[#00DC82]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {d.district}
                      <span className="text-[10px] text-neutral-400 font-normal">({d.province})</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate max-w-[200px] sm:max-w-xs">{d.topDemandDriver}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-[#00DC82]">{d.grossRentalYield}%</span>
                  <p className="text-[10px] text-neutral-400">Rs. {Math.round(d.avgMonthlyRent / 1000)}k / mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Capital Growth */}
        <div className="luxury-glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-[#DFBA73]" /> Top 5 Capital Growth Corridors
            </h3>
            <span className="text-[11px] text-[#DFBA73] font-semibold bg-[#DFBA73]/10 px-2 py-0.5 rounded-full">5-Yr Appreciation</span>
          </div>

          <div className="space-y-3">
            {TOP_GROWTH_DISTRICTS.map((d, index) => (
              <div
                key={d.district}
                onClick={() => setSelectedDistrict(d.district)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDistrict === d.district
                    ? 'border-[#DFBA73] bg-[#DFBA73]/10 shadow-md'
                    : 'border-white/[0.06] bg-[#090D14]/70 hover:border-[#DFBA73]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {d.district}
                      <span className="text-[10px] text-neutral-400 font-normal">({d.province})</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate max-w-[200px] sm:max-w-xs">{d.investmentGrade}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-[#DFBA73]">+{d.capitalAppreciation5Yr}%/yr</span>
                  <p className="text-[10px] text-neutral-400">Rs. {d.avgSqftPrice.toLocaleString()}/sqft</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Rental ROI & Cashflow Simulator Card */}
      <div className="luxury-glass-card p-6 sm:p-8 border border-[#DFBA73]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#DFBA73]/10 via-[#00DC82]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DFBA73]/10 border border-[#DFBA73]/30 flex items-center justify-center text-[#DFBA73]">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="font-serif font-black text-white text-lg sm:text-xl">
                Real Estate ROI & Rental Cashflow Simulator
              </h3>
              <p className="text-xs text-neutral-400">
                Simulate 5-year compounding returns based on district historical performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={districtSelectId} className="text-xs font-semibold text-neutral-300">Target District:</label>
            <select
              id={districtSelectId}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#090D14] border border-[#DFBA73]/40 text-white rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#DFBA73]"
            >
              {ALL_DISTRICT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k} ({SRI_LANKA_DISTRICT_YIELDS[k].province})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Investment Price Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor={priceSliderId} className="text-xs font-semibold text-neutral-300">
              Simulated Property Investment Capital:
            </label>
            <span className="text-lg font-mono font-bold text-[#DFBA73]">
              Rs. {simulatorPrice.toLocaleString()} LKR
              <span className="text-xs text-neutral-400 ml-1.5 font-normal">
                ({(simulatorPrice / 1000000).toFixed(1)}M)
              </span>
            </span>
          </div>

          <input
            id={priceSliderId}
            type="range"
            min={10000000}
            max={200000000}
            step={2500000}
            value={simulatorPrice}
            onChange={(e) => setSimulatorPrice(Number(e.target.value))}
            className="w-full accent-[#DFBA73] cursor-pointer h-2 bg-neutral-800 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
            <span>Rs. 10 Million</span>
            <span>Rs. 100 Million</span>
            <span>Rs. 200 Million</span>
          </div>
        </div>

        {/* Projected Financial Returns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#090D14]/90 p-4 rounded-xl border border-white/[0.08]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
              Est. Monthly Rent
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#00DC82]">
              Rs. {projection.monthlyRent.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Yield: <strong className="text-white">{projection.grossRentalYield}%</strong> gross / {projection.netRentalYield}% net
            </p>
          </div>

          <div className="bg-[#090D14]/90 p-4 rounded-xl border border-white/[0.08]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
              5-Yr Rental Earnings
            </p>
            <p className="text-xl sm:text-2xl font-black text-white">
              Rs. {(projection.totalRentalIncome5Yr / 1000000).toFixed(2)}M
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Cumulative net rental cash</p>
          </div>

          <div className="bg-[#090D14]/90 p-4 rounded-xl border border-white/[0.08]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
              5-Yr Capital Gain
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#DFBA73]">
              +Rs. {(projection.capitalGain5Yr / 1000000).toFixed(2)}M
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Target Value: Rs. {(projection.projectedValue5Yr / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-[#090D14]/90 p-4 rounded-xl border border-white/[0.08]">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">
              5-Yr Total Projected ROI
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#818CF8]">
              +{projection.totalRoiPercentage}%
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Payback: <strong className="text-white">{projection.paybackYears} yrs</strong>
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#DFBA73] shrink-0" />
            <p className="text-xs text-neutral-300">
              <strong className="text-white">{selectedDistrict} Grade:</strong> {projection.investmentGrade} | Primary Demographics: {projection.topDemandDriver}
            </p>
          </div>

          <Link
            href={`/properties?location=${selectedDistrict}`}
            className="btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-2 shrink-0"
          >
            Browse {selectedDistrict} Listings <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

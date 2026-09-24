import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Brain, ArrowLeft, Download, ShieldCheck, MapPin, Home, Bed, Bath, Clock, Car } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Prediction } from '../../types';
import { generateValuationPDF } from '../../utils/pdfGenerator';

function FeatureBar({ name, value }: { name: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#17231C] capitalize">
          {name.replace('location_', 'District: ').replace('_', ' ')}
        </span>
        <span className="text-xs font-bold text-[#123B2A]">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="feature-bar">
        <div className="feature-bar-fill" style={{ width: `${Math.min(100, pct * 1.5)}%` }} />
      </div>
    </div>
  );
}

export default function PredictionResultPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    const stored = localStorage.getItem('riq_last_prediction');
    if (stored) {
      try {
        setPrediction(JSON.parse(stored));
      } catch {
        router.push('/predict');
      }
    } else {
      router.push('/predict');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!prediction) return null;

  const { predictedPrice, pricePerSqft, modelVersion, algorithm, datasetVersion, featureImportance, inputFeatures, createdAt } = prediction;
  const sortedFeatures = Object.entries(featureImportance || {}).sort(([, a], [, b]) => b - a);

  // Confidence calculations
  const mae = algorithm === 'LinearRegression' ? 8126.7 : 20325.76;
  const margin = Math.round(mae * 1.96);
  const low = Math.max(0, Math.round(predictedPrice - margin));
  const high = Math.round(predictedPrice + margin);

  return (
    <>
      <Head>
        <title>Valuation Certificate — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Valuation Certificate">
        <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
          {/* Back link */}
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 text-[#718078] hover:text-[#123B2A] text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> New Property Valuation
          </Link>

          {/* Main Result Card: Pure White with Soft Realistic Shadow */}
          <div className="card-premium p-8 text-center bg-white border border-[#E7E3DA] shadow-soft-lg">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#EBF3EE] border border-[#B8D1C4] text-[#123B2A]">
              <Brain size={26} />
            </div>

            <p className="text-xs text-[#718078] font-bold uppercase tracking-widest mb-1">
              Estimated Fair Market Value
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#123B2A] mb-2 tracking-tight">
              Rs. {Math.round(predictedPrice).toLocaleString()}
            </h1>

            {pricePerSqft && (
              <p className="text-sm font-semibold text-[#718078] mb-5">
                Rs. {Math.round(pricePerSqft).toLocaleString()} per square foot
              </p>
            )}

            {/* 95% Confidence Interval badge & range */}
            <div className="inline-flex flex-col items-center p-4 px-6 rounded-2xl bg-[#EAF4EE] border border-[#B8D9C5] max-w-md mx-auto">
              <span className="text-[11px] uppercase tracking-wider text-[#2F6B4F] font-bold mb-1">
                95% Valuation Confidence Interval
              </span>
              <span className="text-base sm:text-lg font-black text-[#17231C]">
                Rs. {low.toLocaleString()} – Rs. {high.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#718078] mt-0.5 font-medium">
                Calculated Model Margin: ± Rs. {margin.toLocaleString()} ({algorithm || 'Model'} MAE: Rs. {Math.round(mae).toLocaleString()})
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => generateValuationPDF(prediction)}
                className="btn-primary text-sm py-3 px-6 shadow-soft-md"
              >
                <Download size={16} className="text-[#C9A227]" /> Download Official PDF Valuation Certificate
              </button>
            </div>
          </div>

          {/* Property Input Summary */}
          <div className="card-premium p-6 bg-white border border-[#E7E3DA]">
            <h3 className="font-bold text-[#17231C] text-sm mb-4 pb-3 border-b border-[#E7E3DA]">
              Evaluated Asset Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <MapPin size={13} className="text-[#123B2A]" /> Location
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.location}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <Home size={13} className="text-[#123B2A]" /> Area
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.area.toLocaleString()} sqft</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <Bed size={13} className="text-[#123B2A]" /> Bedrooms
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.bedrooms} Bedrooms</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <Bath size={13} className="text-[#123B2A]" /> Bathrooms
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.bathrooms} Bathrooms</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-[#123B2A]" /> House Age
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.house_age} Years</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E3DA]">
                <p className="text-[#718078] font-medium flex items-center gap-1.5 mb-1">
                  <Car size={13} className="text-[#123B2A]" /> Parking
                </p>
                <p className="font-bold text-[#17231C] text-sm">{inputFeatures.parking} Spaces</p>
              </div>
            </div>
          </div>

          {/* Factor Importance Breakdown */}
          {sortedFeatures.length > 0 && (
            <div className="card-premium p-6 bg-white border border-[#E7E3DA]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7E3DA]">
                <h3 className="font-bold text-[#17231C] text-sm">
                  Valuation Factor Attribution
                </h3>
                <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">
                  Relative Weight
                </span>
              </div>
              <div className="space-y-4">
                {sortedFeatures.map(([feat, val]) => (
                  <FeatureBar key={feat} name={feat} value={val} />
                ))}
              </div>
            </div>
          )}

          {/* Model Audit Metadata */}
          <div className="p-4 rounded-xl bg-white border border-[#E7E3DA] text-xs text-[#718078] flex flex-wrap items-center justify-between gap-3">
            <span>Model: <strong className="text-[#17231C]">{modelVersion}</strong> ({algorithm || 'LinearRegression'})</span>
            <span>Dataset: <strong className="text-[#17231C]">{datasetVersion}</strong></span>
            <span>Audit Date: <strong className="text-[#17231C]">{new Date(createdAt).toLocaleDateString()}</strong></span>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

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
        <span className="text-xs font-semibold text-[#CBD5E1] capitalize">
          {name.replace('location_', 'District: ').replace('_', ' ')}
        </span>
        <span className="text-xs font-bold text-[#00DC82]">{(value * 100).toFixed(1)}%</span>
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
            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#00DC82] text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> New Property Valuation
          </Link>

          {/* Main Result Card */}
          <div className="card-premium p-8 text-center bg-[#0B1722] border border-[#162E40] shadow-2xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#00DC82]/10 border border-[#00DC82]/30 text-[#00DC82]">
              <Brain size={26} />
            </div>

            <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-1">
              Estimated Fair Market Value
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#00DC82] mb-2 tracking-tight">
              Rs. {Math.round(predictedPrice).toLocaleString()}
            </h1>

            {pricePerSqft && (
              <p className="text-sm font-semibold text-[#94A3B8] mb-5">
                Rs. {Math.round(pricePerSqft).toLocaleString()} per square foot
              </p>
            )}

            {/* 95% Confidence Interval badge & range */}
            <div className="inline-flex flex-col items-center p-4 px-6 rounded-2xl bg-[#08141F] border border-[#162E40] max-w-md mx-auto">
              <span className="text-[11px] uppercase tracking-wider text-[#00DC82] font-bold mb-1">
                95% Valuation Confidence Interval
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                Rs. {low.toLocaleString()} – Rs. {high.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 font-medium">
                Calculated Model Margin: ± Rs. {margin.toLocaleString()} ({algorithm || 'Model'} MAE: Rs. {Math.round(mae).toLocaleString()})
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => generateValuationPDF(prediction)}
                className="btn-primary text-sm py-3 px-6 font-bold"
              >
                <Download size={16} /> Download Official PDF Valuation Certificate
              </button>
            </div>
          </div>

          {/* Property Input Summary */}
          <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
            <h3 className="font-bold text-white text-sm mb-4 pb-3 border-b border-[#162E40]">
              Evaluated Asset Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <MapPin size={13} className="text-[#00DC82]" /> Location
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.location}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <Home size={13} className="text-[#00DC82]" /> Area
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.area.toLocaleString()} sqft</p>
              </div>

              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <Bed size={13} className="text-[#00DC82]" /> Bedrooms
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.bedrooms} Bedrooms</p>
              </div>

              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <Bath size={13} className="text-[#00DC82]" /> Bathrooms
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.bathrooms} Bathrooms</p>
              </div>

              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-[#00DC82]" /> House Age
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.house_age} Years</p>
              </div>

              <div className="p-3 rounded-xl bg-[#08141F] border border-[#162E40]">
                <p className="text-[#94A3B8] font-medium flex items-center gap-1.5 mb-1">
                  <Car size={13} className="text-[#00DC82]" /> Parking
                </p>
                <p className="font-bold text-white text-sm">{inputFeatures.parking} Spaces</p>
              </div>
            </div>
          </div>

          {/* Factor Importance Breakdown */}
          {sortedFeatures.length > 0 && (
            <div className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#162E40]">
                <h3 className="font-bold text-white text-sm">
                  Valuation Factor Attribution
                </h3>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
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
          <div className="p-4 rounded-xl bg-[#08141F] border border-[#162E40] text-xs text-[#94A3B8] flex flex-wrap items-center justify-between gap-3">
            <span>Model: <strong className="text-white">{modelVersion}</strong> ({algorithm || 'LinearRegression'})</span>
            <span>Dataset: <strong className="text-white">{datasetVersion}</strong></span>
            <span>Audit Date: <strong className="text-white">{new Date(createdAt).toLocaleDateString()}</strong></span>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

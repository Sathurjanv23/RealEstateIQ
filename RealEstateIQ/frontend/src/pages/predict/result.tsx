import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Brain, TrendingUp, TrendingDown, Minus, ArrowLeft, BarChart3, Clock, Database, Download, FileText } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Prediction } from '../../types';
import { generateValuationPDF } from '../../utils/pdfGenerator';

function FeatureBar({ name, value }: { name: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-white/70 capitalize">{name.replace('location_', 'Location: ').replace('_', ' ')}</span>
        <span className="text-sm text-brand-400">{(value * 100).toFixed(1)}%</span>
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
      try { setPrediction(JSON.parse(stored)); }
      catch { router.push('/predict'); }
    } else {
      router.push('/predict');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!prediction) return null;

  const { predictedPrice, pricePerSqft, modelVersion, algorithm, datasetVersion, featureImportance, inputFeatures, createdAt } = prediction;
  const sortedFeatures = Object.entries(featureImportance || {}).sort(([, a], [, b]) => b - a);

  return (
    <>
      <Head>
        <title>Prediction Result — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Prediction Result">
        <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
          {/* Back link */}
          <Link href="/predict" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> New Prediction
          </Link>

          {/* Main result card */}
          <div className="glass-card p-8 text-center border-brand-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Brain size={28} className="text-white" />
            </div>
            <p className="text-sm text-white/50 uppercase tracking-wider mb-2">ML Estimated Market Value</p>
            <h1 className="text-5xl font-black text-gradient mb-2">
              Rs. {predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h1>

            {/* 95% Confidence Interval badge & range */}
            <div className="mt-4 inline-flex flex-col items-center p-3.5 px-6 rounded-2xl bg-brand-500/10 border border-brand-500/20 max-w-lg mx-auto">
              <span className="text-[11px] uppercase tracking-wider text-brand-300 font-semibold mb-1">
                95% Valuation Confidence Interval
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                Rs. {Math.max(0, Math.round(predictedPrice - 8126.7 * 1.96)).toLocaleString()} – Rs. {Math.round(predictedPrice + 8126.7 * 1.96).toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                Model Margin: ± Rs. {Math.round(8126.7 * 1.96).toLocaleString()} (Linear Regression MAE: Rs. 8,127)
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => generateValuationPDF(prediction)}
                className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-brand-500/20 text-sm py-2.5 px-6"
              >
                <Download size={16} /> Download Valuation Report (PDF)
              </button>
            </div>

            <p className="text-white/30 text-xs mt-4">
              ⚠️ This is an ML model estimate, not a guaranteed market valuation.
              Dataset is synthetic.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Price / Sqft', value: pricePerSqft ? `Rs. ${Math.round(pricePerSqft).toLocaleString()}` : '—' },
              { label: 'Model', value: algorithm || modelVersion },
              { label: 'Version', value: modelVersion },
              { label: 'Predicted On', value: new Date(createdAt).toLocaleDateString() },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Input summary */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Database size={18} className="text-brand-400" /> Input Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Area', value: `${inputFeatures.area.toLocaleString()} sqft` },
                { label: 'Location', value: inputFeatures.location },
                { label: 'Bedrooms', value: inputFeatures.bedrooms },
                { label: 'Bathrooms', value: inputFeatures.bathrooms },
                { label: 'House Age', value: `${inputFeatures.house_age} years` },
                { label: 'Parking', value: `${inputFeatures.parking} spaces` },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-surface-700">
                  <p className="text-xs text-white/40 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature importance */}
          {sortedFeatures.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-400" /> Feature Importance
              </h3>
              <p className="text-xs text-white/40 mb-5">
                Relative importance of each feature in the model&apos;s prediction (from actual model coefficients).
              </p>
              <div className="space-y-4">
                {sortedFeatures.map(([name, value]) => (
                  <FeatureBar key={name} name={name} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* Model metadata */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-brand-400" /> Model Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Algorithm', value: algorithm },
                { label: 'Version', value: modelVersion },
                { label: 'Dataset', value: datasetVersion },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-white/40 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-mono text-xs">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => generateValuationPDF(prediction)}
              className="btn-primary"
            >
              <Download size={16} /> Download PDF Report
            </button>
            <Link href="/predict" className="btn-secondary">New Prediction</Link>
            <Link href="/history" className="btn-secondary">View History</Link>
            <Link href="/properties" className="btn-secondary">Browse Properties</Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

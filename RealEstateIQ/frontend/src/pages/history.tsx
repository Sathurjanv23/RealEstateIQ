import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { History, Brain, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { predictionService } from '../services/services';
import { Prediction } from '../types';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['predictionHistory', page],
    queryFn: () => predictionService.getHistory({ page, limit: 10 }),
    enabled: isAuthenticated,
  });

  const predictions: Prediction[] = data?.data?.data?.predictions || [];
  const pagination = data?.data?.data?.pagination;

  return (
    <>
      <Head>
        <title>Prediction History — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Prediction History">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">My Predictions</h2>
              <p className="text-white/50 text-sm mt-1">
                {pagination?.total || 0} total predictions
              </p>
            </div>
            <Link href="/predict" className="btn-primary text-sm py-2.5">
              <Brain size={16} /> New Prediction
            </Link>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-16 text-center">
                <History size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg font-medium">No predictions yet</p>
                <p className="text-white/30 text-sm mt-2">Make your first prediction to see it here.</p>
                <Link href="/predict" className="btn-primary mt-6 inline-flex">
                  <Brain size={16} /> Predict Now
                </Link>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Area</th>
                      <th>Bedrooms</th>
                      <th>Estimated Value</th>
                      <th>Price/Sqft</th>
                      <th>Model</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred) => (
                      <tr key={pred._id}>
                        <td className="text-white/50 text-xs">
                          {new Date(pred.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-white/30">{new Date(pred.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td>{pred.inputFeatures.location}</td>
                        <td>{pred.inputFeatures.area.toLocaleString()} sqft</td>
                        <td>{pred.inputFeatures.bedrooms}BR / {pred.inputFeatures.bathrooms}BA</td>
                        <td className="text-brand-400 font-semibold">
                          Rs. {pred.predictedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-white/60">
                          {pred.pricePerSqft ? `Rs. ${Math.round(pred.pricePerSqft).toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <span className="badge-indigo">{pred.modelVersion}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                    <p className="text-sm text-white/40">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary text-sm py-2 px-3 disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="btn-secondary text-sm py-2 px-3 disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

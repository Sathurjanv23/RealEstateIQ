import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { History, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <title>Valuation History — RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Valuation History">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">Property Valuation History</h2>
              <p className="text-neutral-400 text-xs mt-1">
                {pagination?.total || 0} total valuations generated
              </p>
            </div>
            <Link href="/predict" className="btn-primary text-xs py-2.5 px-4 font-bold">
              <Brain size={15} /> New Valuation
            </Link>
          </div>

          <div className="luxury-glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-16 text-center">
                <History size={48} className="text-neutral-600 mx-auto mb-4" />
                <p className="text-white font-serif text-lg">No valuations recorded yet</p>
                <p className="text-neutral-400 text-xs mt-1">Run your first property appraisal to see audit records here.</p>
                <Link href="/predict" className="btn-primary mt-6 inline-flex text-xs py-2.5 px-4 font-bold">
                  <Brain size={15} /> Run Valuation Now
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>District / Location</th>
                        <th>Area</th>
                        <th>Configuration</th>
                        <th>Estimated Value</th>
                        <th>Price / Sqft</th>
                        <th>Engine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred) => (
                        <tr key={pred._id}>
                          <td className="text-neutral-400 text-xs">
                            {new Date(pred.createdAt).toLocaleDateString()}
                            <br />
                            <span className="text-[10px] text-neutral-500">{new Date(pred.createdAt).toLocaleTimeString()}</span>
                          </td>
                          <td className="font-serif font-bold text-white">{pred.inputFeatures.location}</td>
                          <td className="text-white">{pred.inputFeatures.area.toLocaleString()} sqft</td>
                          <td className="text-neutral-400">{pred.inputFeatures.bedrooms} Bed · {pred.inputFeatures.bathrooms} Bath</td>
                          <td className="text-[#DFBA73] font-serif font-bold text-sm">
                            Rs. {Math.round(pred.predictedPrice).toLocaleString()}
                          </td>
                          <td className="text-neutral-300">
                            {pred.pricePerSqft ? `Rs. ${Math.round(pred.pricePerSqft).toLocaleString()}` : '—'}
                          </td>
                          <td>
                            <span className="badge-gold text-[10px] font-bold">{pred.modelVersion}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#090D14]">
                    <p className="text-xs text-neutral-400 font-medium">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30"
                      >
                        <ChevronRight size={14} />
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

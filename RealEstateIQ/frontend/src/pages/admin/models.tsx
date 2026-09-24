import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Brain, CheckCircle, Archive, GitBranch } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';
import { MlModel } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  production: 'badge-green',
  development: 'badge-forest',
  staging: 'badge-gold',
  archived: 'badge-rose',
};

export default function AdminModelsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['mlModels'],
    queryFn: adminService.getMlModels,
    enabled: isAdmin,
  });

  const models: MlModel[] = data?.data?.data?.models || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminService.updateModelStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mlModels'] }); toast.success('Model status updated.'); },
    onError: () => toast.error('Failed to update status.'),
  });

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>AI Models — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="Model Registry">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-white">AI Model Registry</h2>
            <p className="text-[#94A3B8] text-xs mt-1">Institutional valuation models and calibrated metrics</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-2xl" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="card-premium p-16 text-center bg-[#0B1722] border border-[#162E40]">
              <Brain size={48} className="text-[#1E3A4E] mx-auto mb-4" />
              <p className="text-white font-bold">No models registered yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model._id} className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-base">{model.modelName}</h3>
                        <span className={STATUS_COLORS[model.status] || 'badge-forest'}>{model.status}</span>
                      </div>
                      <p className="text-[#00DC82] text-xs font-mono font-bold mb-1">{model.version} · {model.algorithm}</p>
                      <p className="text-[#94A3B8] text-xs">
                        Dataset: {model.datasetVersion} · Trained: {new Date(model.trainingDate).toLocaleDateString()}
                        · Train: {model.trainSize} / Test: {model.testSize} rows
                      </p>
                    </div>
                    <select
                      value={model.status}
                      onChange={(e) => statusMutation.mutate({ id: model._id, status: e.target.value })}
                      className="input-field text-xs py-2 w-auto bg-[#08141F] border-[#162E40] text-white"
                    >
                      {['development', 'staging', 'production', 'archived'].map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
                    {[
                      { label: 'MAE', value: `Rs. ${Math.round(model.metrics.mae).toLocaleString()}` },
                      { label: 'RMSE', value: `Rs. ${Math.round(model.metrics.rmse).toLocaleString()}` },
                      { label: 'Calibration R²', value: model.metrics.r2.toFixed(4) },
                      { label: 'CV R² Mean', value: model.metrics.cv_r2_mean?.toFixed(4) ?? '—' },
                      { label: 'CV R² Std', value: model.metrics.cv_r2_std ? `±${model.metrics.cv_r2_std.toFixed(4)}` : '—' },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-xl bg-[#08141F] border border-[#162E40] text-center">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">{m.label}</p>
                        <p className="text-sm font-black text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feature importance bar */}
                  {model.featureImportance && Object.keys(model.featureImportance).length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#162E40]">
                      <p className="text-xs font-bold text-white mb-2">Feature Importance Breakdown</p>
                      <div className="space-y-1.5">
                        {Object.entries(model.featureImportance)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([feat, val]) => (
                            <div key={feat} className="flex items-center gap-3 text-xs">
                              <span className="w-28 text-[#94A3B8] truncate">{feat}</span>
                              <div className="flex-1 feature-bar">
                                <div className="feature-bar-fill" style={{ width: `${Math.round(val * 100)}%` }} />
                              </div>
                              <span className="text-[#00DC82] font-bold w-12 text-right">{(val * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

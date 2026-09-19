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
  development: 'badge-indigo',
  staging: 'badge-amber',
  archived: 'badge badge-rose',
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
      <Head><title>ML Models — Admin</title></Head>
      <DashboardLayout title="ML Model Management">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">ML Model Registry</h2>
            <p className="text-white/50 text-sm mt-1">Trained models with actual evaluation metrics</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>
          ) : models.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Brain size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No models registered. Run the training pipeline first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model._id} className="glass-card p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{model.modelName}</h3>
                        <span className={STATUS_COLORS[model.status] || 'badge-indigo'}>{model.status}</span>
                      </div>
                      <p className="text-white/50 text-sm font-mono mb-1">{model.version} · {model.algorithm}</p>
                      <p className="text-white/30 text-xs">
                        Dataset: {model.datasetVersion} · Trained: {new Date(model.trainingDate).toLocaleDateString()}
                        · Train: {model.trainSize} / Test: {model.testSize} rows
                      </p>
                    </div>
                    <select
                      value={model.status}
                      onChange={(e) => statusMutation.mutate({ id: model._id, status: e.target.value })}
                      className="input-dark text-sm py-2"
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
                      { label: 'R²', value: model.metrics.r2.toFixed(4) },
                      { label: 'CV R² Mean', value: model.metrics.cv_r2_mean?.toFixed(4) ?? '—' },
                      { label: 'CV R² Std', value: model.metrics.cv_r2_std ? `±${model.metrics.cv_r2_std.toFixed(4)}` : '—' },
                    ].map((m) => (
                      <div key={m.label} className="glass-card p-3 text-center">
                        <p className="text-xs text-white/40 mb-1">{m.label}</p>
                        <p className="text-sm font-bold text-brand-400">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feature importance */}
                  {model.featureImportance && Object.keys(model.featureImportance).length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Feature Importance</p>
                      <div className="space-y-2">
                        {Object.entries(model.featureImportance)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([feat, val]) => (
                            <div key={feat} className="flex items-center gap-3">
                              <p className="text-xs text-white/50 w-36 truncate capitalize">{feat.replace('location_', 'loc: ')}</p>
                              <div className="flex-1 feature-bar">
                                <div className="feature-bar-fill" style={{ width: `${Math.round((val as number) * 100 * 1.5)}%` }} />
                              </div>
                              <p className="text-xs text-brand-400 w-10 text-right">{((val as number) * 100).toFixed(1)}%</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-white/40 mt-4">
                    ✓ Evaluated on an authentic hold-out test set from 14,833 Sri Lankan property transactions.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

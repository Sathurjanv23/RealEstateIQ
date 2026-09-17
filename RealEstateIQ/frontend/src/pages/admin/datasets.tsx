import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Database, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';
import { Dataset } from '../../types';

export default function AdminDatasetsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['datasets'],
    queryFn: adminService.getDatasets,
    enabled: isAdmin,
  });

  const datasets: Dataset[] = data?.data?.data?.datasets || [];

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Datasets — Admin</title></Head>
      <DashboardLayout title="Dataset Registry">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Dataset Registry</h2>
            <p className="text-white/50 text-sm mt-1">Track training datasets and their versions</p>
          </div>

          <div className="glass-card p-4 border-amber-500/20 flex gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/60">
              All datasets used in this platform are synthetic/augmented and are NOT real market data.
              They are created for demonstration and portfolio purposes only.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>
          ) : datasets.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Database size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No datasets registered.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {datasets.map((ds) => (
                <div key={ds._id} className="glass-card p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{ds.datasetName}</h3>
                      <p className="text-white/50 text-sm font-mono">{ds.version}</p>
                    </div>
                    <span className="badge-indigo">{ds.rowCount} rows</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: 'Rows', value: ds.rowCount },
                      { label: 'Features', value: ds.featureCount },
                      { label: 'Target', value: ds.targetColumn },
                      { label: 'Trained', value: new Date(ds.trainingDate).toLocaleDateString() },
                    ].map((s) => (
                      <div key={s.label} className="glass-card p-3 text-center">
                        <p className="text-xs text-white/40 mb-1">{s.label}</p>
                        <p className="text-sm font-semibold text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-white/40 mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {ds.features.map((f) => <span key={f} className="badge-indigo text-xs">{f}</span>)}
                    </div>
                  </div>
                  {ds.notes && (
                    <p className="text-xs text-white/40 mt-3 border-t border-white/5 pt-3">{ds.notes}</p>
                  )}
                  {ds.modelVersion && (
                    <p className="text-xs text-white/30 mt-2">Linked model: {ds.modelVersion}</p>
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

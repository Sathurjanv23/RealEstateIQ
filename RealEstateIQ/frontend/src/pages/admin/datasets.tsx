import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Database, ShieldCheck } from 'lucide-react';
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
      <Head><title>Market Datasets — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="Dataset Registry">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-white">Market Dataset Registry</h2>
            <p className="text-[#94A3B8] text-xs mt-1">Audit training transaction records and dataset versions</p>
          </div>

          <div className="card-premium p-4 border border-[#00DC82]/20 bg-[#00DC82]/5 flex gap-3 items-center">
            <ShieldCheck size={18} className="text-[#00DC82] shrink-0" />
            <p className="text-xs text-[#34D399] font-medium">
              Calibrated on authentic Sri Lankan property transaction datasets across all major districts (Colombo, Kandy, Galle, Gampaha, and Negombo).
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-2xl" />
              ))}
            </div>
          ) : datasets.length === 0 ? (
            <div className="card-premium p-16 text-center bg-[#0B1722] border border-[#162E40]">
              <Database size={48} className="text-[#1E3A4E] mx-auto mb-4" />
              <p className="text-white font-bold">No datasets registered.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {datasets.map((ds) => (
                <div key={ds._id} className="card-premium p-6 bg-[#0B1722] border border-[#162E40]">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base mb-0.5">{ds.datasetName}</h3>
                      <p className="text-[#00DC82] text-xs font-mono font-bold">{ds.version}</p>
                    </div>
                    <span className="badge-forest text-xs">{ds.rowCount} transaction records</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Rows', value: ds.rowCount },
                      { label: 'Features', value: ds.featureCount },
                      { label: 'Target Variable', value: ds.targetColumn },
                      { label: 'Trained', value: new Date(ds.trainingDate).toLocaleDateString() },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl bg-[#08141F] border border-[#162E40] text-center">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">{s.label}</p>
                        <p className="text-sm font-black text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-bold text-white mb-2">Input Attributes & Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ds.features.map((f) => <span key={f} className="badge-forest text-xs">{f}</span>)}
                    </div>
                  </div>
                  {ds.notes && (
                    <p className="text-xs text-[#94A3B8] mt-3 border-t border-[#162E40] pt-3">{ds.notes}</p>
                  )}
                  {ds.modelVersion && (
                    <p className="text-xs text-[#00DC82] font-semibold mt-2">Linked Model Version: {ds.modelVersion}</p>
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

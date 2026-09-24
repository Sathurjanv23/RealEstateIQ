import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';
import { AuditLog } from '../../types';

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: 'badge-forest',
  USER_REGISTER: 'badge-green',
  USER_LOGOUT: 'badge-rose',
  PROPERTY_CREATED: 'badge-green',
  PROPERTY_UPDATED: 'badge-gold',
  PROPERTY_DELETED: 'badge-rose',
  PREDICTION_CREATED: 'badge-forest',
  PROPERTY_SAVED: 'badge-forest',
  PROPERTY_UNSAVED: 'badge-gold',
  ADMIN_USER_UPDATED: 'badge-gold',
  ADMIN_USER_DELETED: 'badge-rose',
  MODEL_STATUS_CHANGED: 'badge-gold',
};

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => adminService.getAuditLogs({ page, limit: 20 }),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const logs: AuditLog[] = data?.data?.data?.logs || [];
  const pagination = data?.data?.data?.pagination;

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Audit Logs — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="System Audit Logs">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-white">System Audit Logs</h2>
            <p className="text-[#94A3B8] text-xs mt-1">{pagination?.total || 0} audit events logged · Real-time auto-refresh</p>
          </div>

          <div className="card-premium overflow-hidden bg-[#0B1722] border border-[#162E40]">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded-xl" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="p-16 text-center">
                <ClipboardList size={48} className="text-[#1E3A4E] mx-auto mb-4" />
                <p className="text-white font-bold">No audit events recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th><th>Action</th><th>User</th><th>Resource</th><th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td className="text-xs text-[#94A3B8]">
                          {new Date(log.createdAt).toLocaleDateString()}{' '}
                          <span className="text-[10px] text-[#64748B]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td>
                          <span className={ACTION_COLORS[log.action] || 'badge-forest'}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-xs text-white font-mono">
                          {log.userId ? (
                            typeof log.userId === 'object' ? log.userId.email : 'Unknown'
                          ) : 'Anonymous'}
                        </td>
                        <td className="text-xs text-[#CBD5E1]">
                          {log.resource}
                          {log.resourceId && <span className="text-[#94A3B8] ml-1 font-mono">({log.resourceId.slice(-8)})</span>}
                        </td>
                        <td className="text-xs text-[#94A3B8] font-mono">{log.ipAddress || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#162E40] bg-[#08141F]">
                <p className="text-xs text-[#94A3B8] font-medium">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                    className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

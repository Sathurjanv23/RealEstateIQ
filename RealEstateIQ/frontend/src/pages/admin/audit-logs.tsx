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
  USER_LOGIN: 'badge-indigo',
  USER_REGISTER: 'badge-green',
  USER_LOGOUT: 'badge badge-rose',
  PROPERTY_CREATED: 'badge-green',
  PROPERTY_UPDATED: 'badge-amber',
  PROPERTY_DELETED: 'badge badge-rose',
  PREDICTION_CREATED: 'badge-indigo',
  PROPERTY_SAVED: 'badge-indigo',
  PROPERTY_UNSAVED: 'badge-amber',
  ADMIN_USER_UPDATED: 'badge-amber',
  ADMIN_USER_DELETED: 'badge badge-rose',
  MODEL_STATUS_CHANGED: 'badge-amber',
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
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const logs: AuditLog[] = data?.data?.data?.logs || [];
  const pagination = data?.data?.data?.pagination;

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Audit Logs — Admin</title></Head>
      <DashboardLayout title="Audit Logs">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">System Audit Logs</h2>
            <p className="text-white/50 text-sm mt-1">{pagination?.total || 0} total audit events · Auto-refreshes every 30s</p>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
            ) : logs.length === 0 ? (
              <div className="p-16 text-center">
                <ClipboardList size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No audit events yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th><th>Action</th><th>User</th><th>Resource</th><th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-xs text-white/40">
                        {new Date(log.createdAt).toLocaleDateString()}{' '}
                        <span className="text-white/30">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td>
                        <span className={ACTION_COLORS[log.action] || 'badge-indigo'}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-xs text-white/60">
                        {log.userId ? (
                          typeof log.userId === 'object' ? log.userId.email : 'Unknown'
                        ) : 'Anonymous'}
                      </td>
                      <td className="text-xs text-white/50">
                        {log.resource}
                        {log.resourceId && <span className="text-white/30 ml-1 font-mono">({log.resourceId.slice(-8)})</span>}
                      </td>
                      <td className="text-xs text-white/30 font-mono">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <p className="text-sm text-white/40">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

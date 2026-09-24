import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Trash2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/services';
import { User } from '../../types';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => adminService.getUsers({ page, limit: 20 }),
    enabled: isAdmin,
  });

  const users: User[] = data?.data?.data?.users || [];
  const pagination = data?.data?.data?.pagination;

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminService.updateUserRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success('Role updated.'); },
    onError: () => toast.error('Failed to update role.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success('User deleted.'); },
    onError: () => toast.error('Failed to delete user.'),
  });

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Client Directory — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="Client Directory">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-white">Client & User Directory</h2>
            <p className="text-[#94A3B8] text-xs mt-1">{pagination?.total || 0} registered investors and administrators</p>
          </div>

          <div className="card-premium overflow-hidden bg-[#0B1722] border border-[#162E40]">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client Name</th><th>Email</th><th>Access Role</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#061017] bg-[#00DC82]">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="text-[#94A3B8] text-xs font-mono">{u.email}</td>
                        <td>
                          <span className={u.role === 'ADMIN' ? 'badge-gold' : 'badge-forest'}>{u.role}</span>
                        </td>
                        <td className="text-[#CBD5E1] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {u.id !== currentUser?.id && (
                              <>
                                <button
                                  onClick={() => roleMutation.mutate({ id: u.id, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#00DC82] hover:bg-[#00DC82]/10 transition-all"
                                  title={u.role === 'ADMIN' ? 'Demote to Investor' : 'Promote to Admin'}
                                >
                                  <ShieldCheck size={16} />
                                </button>
                                <button
                                  onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(u.id); }}
                                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
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

import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Home, Search, MapPin, Bed, Bath, Car, BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService, adminService } from '../../services/services';
import { Property } from '../../types';

export default function AdminPropertiesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['adminProperties', page, search],
    queryFn: () => propertyService.getAll({ page, limit: 15, search: search || undefined }),
    enabled: isAdmin,
  });

  const properties: Property[] = data?.data?.data?.properties || [];
  const pagination = data?.data?.data?.pagination;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await propertyService.delete(id);
      toast.success('Property deleted.');
      refetch();
    } catch {
      toast.error('Failed to delete property.');
    }
  };

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head><title>Properties — Admin</title></Head>
      <DashboardLayout title="Property Management">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">All Properties</h2>
              <p className="text-white/50 text-sm mt-1">{pagination?.total || 0} properties in database</p>
            </div>
            <Link href="/properties/new" className="btn-primary text-sm py-2.5">+ Add Property</Link>
          </div>

          <div className="glass-card p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" placeholder="Search properties..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-dark pl-9 text-sm" />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Property</th><th>Location</th><th>Specs</th><th>Asking Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div>
                          <p className="font-medium text-white text-sm line-clamp-1">{p.title}</p>
                          <span className="text-xs text-white/40 capitalize">{p.propertyType}</span>
                        </div>
                      </td>
                      <td className="text-white/60 text-xs">{p.location}{p.district ? `, ${p.district}` : ''}</td>
                      <td className="text-white/60 text-xs">{p.area.toLocaleString()} sqft · {p.bedrooms}BR/{p.bathrooms}BA</td>
                      <td className="text-brand-400 font-semibold text-sm">
                        {p.askingPrice ? `Rs. ${p.askingPrice.toLocaleString()}` : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/properties/${p._id}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View</Link>
                          <button onClick={() => handleDelete(p._id, p.title)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
                        </div>
                      </td>
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

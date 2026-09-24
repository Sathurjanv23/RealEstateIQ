import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Home, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/services';
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
      <Head><title>Property Inventory — Admin RealEstateIQ</title></Head>
      <DashboardLayout title="Property Inventory">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#17231C]">Property Inventory</h2>
              <p className="text-[#718078] text-xs mt-1">{pagination?.total || 0} active assets in database</p>
            </div>
            <Link href="/properties/new" className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5">
              <Plus size={14} /> Add Property
            </Link>
          </div>

          <div className="card-premium p-4 bg-white border border-[#E7E3DA]">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
              <input
                type="text"
                placeholder="Search properties by title or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-10 text-xs"
              />
            </div>
          </div>

          <div className="card-premium overflow-hidden bg-white border border-[#E7E3DA]">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Property</th><th>Location</th><th>Specs</th><th>Asking Price</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div>
                            <p className="font-bold text-[#17231C] text-sm line-clamp-1">{p.title}</p>
                            <span className="badge-forest text-[9px] uppercase font-bold capitalize mt-1 inline-flex">{p.propertyType}</span>
                          </div>
                        </td>
                        <td className="text-[#718078] text-xs">{p.location}{p.district ? `, ${p.district}` : ''}</td>
                        <td className="text-[#718078] text-xs">{p.area.toLocaleString()} sqft · {p.bedrooms} Beds / {p.bathrooms} Baths</td>
                        <td className="text-[#123B2A] font-black text-sm">
                          {p.askingPrice ? `Rs. ${p.askingPrice.toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <div className="flex gap-3">
                            <Link href={`/properties/${p._id}`} className="text-xs font-bold text-[#2F6B4F] hover:text-[#123B2A] transition-colors">View</Link>
                            <button onClick={() => handleDelete(p._id, p.title)}
                              className="text-xs font-bold text-[#C94C4C] hover:text-[#A63838] transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E3DA] bg-[#FAF9F6]">
                <p className="text-xs text-[#718078] font-medium">Page {pagination.page} of {pagination.pages}</p>
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

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  CalendarCheck, Search, Phone, Mail, Clock, CheckCircle2,
  AlertCircle, Trash2, ArrowUpRight, Filter, ChevronLeft, ChevronRight,
  MessageSquare, UserCheck
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { inquiryService } from '../../services/services';
import { Inquiry } from '../../types';

export default function AdminInquiriesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/dashboard');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['adminInquiries', page, statusFilter],
    queryFn: () => inquiryService.getAll({
      page,
      limit: 15,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    enabled: isAdmin,
  });

  const inquiries: Inquiry[] = data?.data?.data?.inquiries || [];
  const pagination = data?.data?.data?.pagination;

  // Local filter for search query
  const filteredInquiries = inquiries.filter((inq) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.propertyName.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      (inq.email && inq.email.toLowerCase().includes(q))
    );
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inquiryService.updateStatus(id, newStatus);
      toast.success(`Inquiry status updated to ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete inquiry from "${name}"?`)) return;
    try {
      await inquiryService.delete(id);
      toast.success('Inquiry removed');
      refetch();
    } catch {
      toast.error('Failed to delete inquiry');
    }
  };

  const counts = {
    total: pagination?.total || inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    resolved: inquiries.filter((i) => i.status === 'resolved').length,
  };

  if (isLoading || !isAdmin) return null;

  return (
    <>
      <Head>
        <title>Viewing Inquiries — Admin RealEstateIQ</title>
      </Head>
      <DashboardLayout title="Property Inquiries">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <CalendarCheck className="text-brand-400" size={26} />
                Property Viewing Inquiries
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Manage schedule viewing requests and buyer inquiries received across all listings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-brand-500">
              <p className="text-xs text-white/50 uppercase font-semibold">Total Inquiries</p>
              <p className="text-2xl font-bold text-white mt-1">{counts.total}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-l-amber-500">
              <p className="text-xs text-white/50 uppercase font-semibold">Pending / New</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{counts.new}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-l-sky-500">
              <p className="text-xs text-white/50 uppercase font-semibold">Contacted</p>
              <p className="text-2xl font-bold text-sky-400 mt-1">{counts.contacted}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-l-emerald-500">
              <p className="text-xs text-white/50 uppercase font-semibold">Resolved</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{counts.resolved}</p>
            </div>
          </div>

          {/* Controls: Search and Status Filter */}
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Search inquirer name, property, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark pl-10 w-full text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={15} className="text-white/40 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-dark text-sm w-full sm:w-44 py-2"
              >
                <option value="all">All Statuses</option>
                <option value="new">New (Pending)</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Inquiries Table */}
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-white/40">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck className="mx-auto text-white/20 mb-3" size={44} />
                <p className="text-white/60 font-medium">No inquiries found</p>
                <p className="text-white/40 text-xs mt-1">
                  Viewing inquiries submitted through property pages will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase font-medium bg-white/[0.02]">
                      <th className="py-3.5 px-4">Inquirer</th>
                      <th className="py-3.5 px-4">Property</th>
                      <th className="py-3.5 px-4">Preferred Date</th>
                      <th className="py-3.5 px-4">Message</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Inquirer Details */}
                        <td className="py-4 px-4">
                          <p className="font-semibold text-white">{inq.name}</p>
                          <div className="flex flex-col gap-1 mt-1 text-xs text-white/60">
                            <a
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                            >
                              <Phone size={12} className="text-brand-400" />
                              {inq.phone}
                            </a>
                            {inq.email && (
                              <a
                                href={`mailto:${inq.email}`}
                                className="inline-flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                              >
                                <Mail size={12} className="text-sky-400" />
                                {inq.email}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Property */}
                        <td className="py-4 px-4 max-w-xs">
                          <Link
                            href={`/properties/${inq.propertyId}`}
                            className="font-medium text-white hover:text-brand-400 transition-colors inline-flex items-center gap-1 group"
                          >
                            <span className="truncate">{inq.propertyName}</span>
                            <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </Link>
                          {inq.propertyLocation && (
                            <p className="text-xs text-white/40 mt-0.5">{inq.propertyLocation}</p>
                          )}
                        </td>

                        {/* Preferred Viewing Date */}
                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          {inq.preferredDate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-white/80 border border-white/10 font-mono">
                              <Clock size={12} className="text-brand-400" />
                              {inq.preferredDate}
                            </span>
                          ) : (
                            <span className="text-white/30 italic">Flexible</span>
                          )}
                          <p className="text-[10px] text-white/40 mt-1">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Inquirer Message */}
                        <td className="py-4 px-4 max-w-sm">
                          {inq.message ? (
                            <p className="text-xs text-white/70 line-clamp-2" title={inq.message}>
                              {inq.message}
                            </p>
                          ) : (
                            <span className="text-xs text-white/30 italic">No message provided</span>
                          )}
                        </td>

                        {/* Status Select Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors ${
                              inq.status === 'new'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : inq.status === 'contacted'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : inq.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            <option value="new" className="bg-slate-900 text-amber-400">● New (Pending)</option>
                            <option value="contacted" className="bg-slate-900 text-sky-400">● Contacted</option>
                            <option value="resolved" className="bg-slate-900 text-emerald-400">● Resolved</option>
                            <option value="cancelled" className="bg-slate-900 text-red-400">● Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(inq._id, inq.name)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10 text-xs text-white/50">
                <span>Page {pagination.page} of {pagination.pages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
                  >
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

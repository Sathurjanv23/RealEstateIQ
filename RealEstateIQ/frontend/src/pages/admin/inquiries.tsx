import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  CalendarCheck, Search, Phone, Mail, Clock, CheckCircle2,
  Trash2, ArrowUpRight, Filter, ChevronLeft, ChevronRight,
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
      <DashboardLayout title="Client Inquiries">
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                <CalendarCheck className="text-[#00DC82]" size={24} />
                Property Viewing Inquiries
              </h2>
              <p className="text-[#94A3B8] text-xs mt-1">
                Manage schedule viewing requests and client inquiries received across all property listings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-premium p-4 bg-[#0B1722] border border-[#162E40] border-l-4 border-l-[#00DC82]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Total Inquiries</p>
              <p className="text-2xl font-black text-white mt-1">{counts.total}</p>
            </div>
            <div className="card-premium p-4 bg-[#0B1722] border border-[#162E40] border-l-4 border-l-[#F59E0B]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Pending / New</p>
              <p className="text-2xl font-black text-[#FBBF24] mt-1">{counts.new}</p>
            </div>
            <div className="card-premium p-4 bg-[#0B1722] border border-[#162E40] border-l-4 border-l-[#38BDF8]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Contacted</p>
              <p className="text-2xl font-black text-[#38BDF8] mt-1">{counts.contacted}</p>
            </div>
            <div className="card-premium p-4 bg-[#0B1722] border border-[#162E40] border-l-4 border-l-[#10B981]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Resolved</p>
              <p className="text-2xl font-black text-[#34D399] mt-1">{counts.resolved}</p>
            </div>
          </div>

          {/* Controls: Search and Status Filter */}
          <div className="card-premium p-4 bg-[#0B1722] border border-[#162E40] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={15} />
              <input
                type="text"
                placeholder="Search inquirer name, property, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full text-xs bg-[#08141F] border-[#162E40] text-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-[#94A3B8] hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs w-full sm:w-44 py-2 bg-[#08141F] border-[#162E40] text-white"
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
          <div className="card-premium overflow-hidden bg-[#0B1722] border border-[#162E40]">
            {loading ? (
              <div className="text-center py-16 text-[#94A3B8] text-sm">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck className="mx-auto text-[#1E3A4E] mb-3" size={40} />
                <p className="text-white font-bold text-sm">No client inquiries found</p>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Viewing inquiries submitted through property pages will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#162E40] text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider bg-[#08141F]">
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Property</th>
                      <th className="py-3.5 px-4">Preferred Date</th>
                      <th className="py-3.5 px-4">Message</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162E40]">
                    {filteredInquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Inquirer Details */}
                        <td className="py-4 px-4">
                          <p className="font-bold text-white">{inq.name}</p>
                          <div className="flex flex-col gap-1 mt-1 text-xs text-[#94A3B8]">
                            <a
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1.5 hover:text-[#00DC82] transition-colors font-mono"
                            >
                              <Phone size={12} className="text-[#00DC82]" />
                              {inq.phone}
                            </a>
                            {inq.email && (
                              <a
                                href={`mailto:${inq.email}`}
                                className="inline-flex items-center gap-1.5 hover:text-[#00DC82] transition-colors"
                              >
                                <Mail size={12} className="text-[#00DC82]" />
                                {inq.email}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Property */}
                        <td className="py-4 px-4 max-w-xs">
                          <Link
                            href={`/properties/${inq.propertyId}`}
                            className="font-bold text-white hover:text-[#00DC82] transition-colors inline-flex items-center gap-1 group"
                          >
                            <span className="truncate">{inq.propertyName}</span>
                            <ArrowUpRight size={13} className="text-[#00DC82] shrink-0" />
                          </Link>
                          {inq.propertyLocation && (
                            <p className="text-[11px] text-[#94A3B8] mt-0.5">{inq.propertyLocation}</p>
                          )}
                        </td>

                        {/* Preferred Viewing Date */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {inq.preferredDate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#08141F] text-white border border-[#162E40] font-mono text-[11px]">
                              <Clock size={11} className="text-[#00DC82]" />
                              {inq.preferredDate}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] italic">Flexible</span>
                          )}
                          <p className="text-[10px] text-[#64748B] mt-1">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Inquirer Message */}
                        <td className="py-4 px-4 max-w-sm">
                          {inq.message ? (
                            <p className="text-xs text-[#CBD5E1] line-clamp-2" title={inq.message}>
                              {inq.message}
                            </p>
                          ) : (
                            <span className="text-xs text-[#64748B] italic">No message provided</span>
                          )}
                        </td>

                        {/* Status Select Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-colors ${
                              inq.status === 'new'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : inq.status === 'contacted'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : inq.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <option value="new" className="bg-[#08141F] text-white">New</option>
                            <option value="contacted" className="bg-[#08141F] text-white">Contacted</option>
                            <option value="resolved" className="bg-[#08141F] text-white">Resolved</option>
                            <option value="cancelled" className="bg-[#08141F] text-white">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(inq._id, inq.name)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete inquiry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

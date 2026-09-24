import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Home,
  Globe,
  History,
  BookmarkCheck,
  GitCompare,
  BarChart3,
  Star,
  LogOut,
  ChevronRight,
  Brain,
  Users,
  Database,
  FileBarChart,
  ClipboardList,
  CalendarCheck,
  Building2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  adminOnly?: boolean;
}

const userNav: NavItem[] = [
  { href: '/', label: 'Home Landing', icon: <Globe size={18} /> },
  { href: '/dashboard', label: 'Intelligence Hub', icon: <LayoutDashboard size={18} /> },
  { href: '/properties', label: 'Properties', icon: <Home size={18} /> },
  { href: '/predict', label: 'Property Valuation', icon: <Brain size={18} />, badge: 'Engine' },
  { href: '/history', label: 'Valuation History', icon: <History size={18} /> },
  { href: '/saved', label: 'Saved Portfolio', icon: <BookmarkCheck size={18} /> },
  { href: '/compare', label: 'Compare Assets', icon: <GitCompare size={18} /> },
  { href: '/market', label: 'Market Analytics', icon: <BarChart3 size={18} /> },
  { href: '/recommendations', label: 'Curated Yields', icon: <Star size={18} /> },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'System Overview', icon: <LayoutDashboard size={18} />, adminOnly: true },
  { href: '/admin/inquiries', label: 'Client Inquiries', icon: <CalendarCheck size={18} />, adminOnly: true, badge: 'Live' },
  { href: '/admin/users', label: 'User Management', icon: <Users size={18} />, adminOnly: true },
  { href: '/admin/properties', label: 'Property Inventory', icon: <Building2 size={18} />, adminOnly: true },
  { href: '/admin/predictions', label: 'Valuation Audits', icon: <FileBarChart size={18} />, adminOnly: true },
  { href: '/admin/models', label: 'AI Model Registry', icon: <Brain size={18} />, adminOnly: true },
  { href: '/admin/datasets', label: 'Market Datasets', icon: <Database size={18} />, adminOnly: true },
  { href: '/admin/audit-logs', label: 'Security & Logs', icon: <ClipboardList size={18} />, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useRouter();
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      {/* Mobile background overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[#17231C]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Luxury Architectural Sidebar in Dark Slate (#08141F) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
          bg-[#08141F] border-r border-[#142938] shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#142938] bg-[#061017]/80">
          <BrandLogo size="md" showText={true} />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-[#142938] bg-[#061017]/40">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-[#0B1722] border border-[#162E40]">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm border border-[#00DC82]/40 shrink-0"
              style={{ backgroundColor: '#09211A' }}
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Estate Investor'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    isAdmin
                      ? 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40'
                      : 'bg-[#00DC82]/15 text-[#00DC82] border border-[#00DC82]/30'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Investor'}
                </span>
                {isAdmin && <ShieldCheck size={12} className="text-[#C9A227]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-3 mb-2 mt-1">
            Platform Modules
          </p>

          {userNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#00DC82]/15 text-[#00DC82] border-l-4 border-l-[#00DC82] border-y border-r border-[#00DC82]/30 shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#00DC82]' : 'text-[#64748B] group-hover:text-white'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#00DC82]/20 text-[#00DC82] border border-[#00DC82]/40">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={13} className="text-[#00DC82]" />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                <p className="text-[10px] font-bold text-[#C9A227] uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={11} /> Admin Suite
                </p>
              </div>
              {adminNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#C9A227]/20 text-[#C9A227] border-l-4 border-l-[#C9A227] border-white/10 font-bold'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={isActive ? 'text-[#C9A227]' : 'text-[#64748B] group-hover:text-[#C9A227]'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#C9A227]/30 text-[#C9A227] border border-[#C9A227]/50">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-[#142938] bg-[#061017]/80 space-y-2">
          {/* Real estate market badge */}
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]" />
              Sri Lanka Valuation IQ
            </span>
            <span className="font-mono text-[#00DC82] font-bold text-[10px]">R² 0.996</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#FCA5A5] hover:text-white hover:bg-[#C94C4C]/20 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

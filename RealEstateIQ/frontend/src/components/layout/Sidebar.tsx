import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Home,
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
  { href: '/dashboard', label: 'Intelligence Hub', icon: <LayoutDashboard size={18} /> },
  { href: '/properties', label: 'Properties', icon: <Home size={18} /> },
  { href: '/predict', label: 'AI Valuation', icon: <Brain size={18} />, badge: 'ML' },
  { href: '/history', label: 'Valuation History', icon: <History size={18} /> },
  { href: '/saved', label: 'Portfolio / Saved', icon: <BookmarkCheck size={18} /> },
  { href: '/compare', label: 'Compare Assets', icon: <GitCompare size={18} /> },
  { href: '/market', label: 'Market Analytics', icon: <BarChart3 size={18} /> },
  { href: '/recommendations', label: 'Top Yields', icon: <Star size={18} /> },
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Luxury Architectural Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
          bg-[#070b14] border-r border-indigo-500/10 shadow-2xl shadow-indigo-950/40`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-500/10 bg-[#090e1c]/50">
          <BrandLogo size="md" showText={true} />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 border-b border-indigo-500/10 bg-indigo-950/20">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md border border-indigo-400/30 shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
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
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Investor'}
                </span>
                {isAdmin && <ShieldCheck size={12} className="text-amber-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-indigo-500/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">
            Platform Modules
          </p>

          {userNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={13} className="text-indigo-400 opacity-80" />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
        <div className="p-3 border-t border-indigo-500/10 bg-[#060911] space-y-2">
          {/* Real estate market badge */}
          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SL Real Estate AI
            </span>
            <span className="font-mono text-emerald-400 font-bold text-[10px]">R² 0.88</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

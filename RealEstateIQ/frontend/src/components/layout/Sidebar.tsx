import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Home, TrendingUp, History, BookmarkCheck,
  GitCompare, BarChart3, Star, LogOut, ChevronRight, Building2,
  Brain, Users, Database, FileBarChart, ClipboardList, Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const userNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/properties', label: 'Properties', icon: <Home size={18} /> },
  { href: '/predict', label: 'Predict Value', icon: <Brain size={18} /> },
  { href: '/history', label: 'Predictions', icon: <History size={18} /> },
  { href: '/saved', label: 'Saved', icon: <BookmarkCheck size={18} /> },
  { href: '/compare', label: 'Compare', icon: <GitCompare size={18} /> },
  { href: '/market', label: 'Market Intel', icon: <BarChart3 size={18} /> },
  { href: '/recommendations', label: 'Recommended', icon: <Star size={18} /> },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} />, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: <Users size={18} />, adminOnly: true },
  { href: '/admin/properties', label: 'Properties', icon: <Building2 size={18} />, adminOnly: true },
  { href: '/admin/predictions', label: 'Predictions', icon: <FileBarChart size={18} />, adminOnly: true },
  { href: '/admin/models', label: 'ML Models', icon: <Brain size={18} />, adminOnly: true },
  { href: '/admin/datasets', label: 'Datasets', icon: <Database size={18} />, adminOnly: true },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <ClipboardList size={18} />, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const navItems = isAdmin ? [...userNav, ...adminNav] : userNav;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
          bg-surface-800 border-r border-white/5`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">RealEstateIQ</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`text-xs ${isAdmin ? 'text-amber-400' : 'text-brand-400'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {isAdmin && (
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-2 mt-1">User</p>
          )}
          {userNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {(pathname === item.href) && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </Link>
          ))}

          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 mb-2 mt-4">Admin</p>
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="nav-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

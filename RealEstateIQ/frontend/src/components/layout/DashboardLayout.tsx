import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { BrandLogo } from '../ui/BrandLogo';
import { PwaInstallPrompt } from '../ui/PwaInstallPrompt';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#061017] text-[#F8FAFC] overflow-hidden font-sans">
      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar: Dark Slate (#08141F) with sleek border */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#142938] bg-[#08141F] sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo on Mobile, Page Title on Desktop */}
            <div className="lg:hidden">
              <BrandLogo size="sm" showText={true} />
            </div>

            {title && (
              <div className="hidden lg:flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sri Lanka Market Status */}
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00DC82]/10 border border-[#00DC82]/30 text-[#00DC82] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DC82] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DC82]"></span>
              </span>
              <span>CMB Market Active</span>
            </div>

            {/* Notification button */}
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#00DC82] hover:bg-white/5 border border-[#142938] transition-all"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* User Profile avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm border border-[#00DC82]/40"
              style={{ backgroundColor: '#09211A' }}
              title={user?.name || 'User Profile'}
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
        </header>

        {/* Page content with bottom safe padding for MobileBottomNav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-8 bg-[#061017]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />

      {/* PWA Install Banner */}
      <PwaInstallPrompt />
    </div>
  );
}

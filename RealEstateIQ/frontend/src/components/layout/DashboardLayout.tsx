import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { BrandLogo } from '../ui/BrandLogo';
import { PwaInstallPrompt } from '../ui/PwaInstallPrompt';
import { Menu, Bell, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#080A0E] text-[#F8FAFC] overflow-hidden font-sans">
      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar: Luxury Obsidian Glass with subtle border */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo on Mobile, Page Title on Desktop */}
            <div className="lg:hidden">
              <BrandLogo size="sm" variant="luxury" showText={true} />
            </div>

            {title && (
              <div className="hidden lg:flex items-center gap-2">
                <h1 className="text-lg font-serif font-normal text-white tracking-tight">{title}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Go to Home Page Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-neutral-300 hover:text-[#DFBA73] hover:border-[#DFBA73]/50 text-xs font-semibold transition-all group"
              title="Go to Home Landing Page"
            >
              <Home size={15} className="text-[#DFBA73] group-hover:scale-110 transition-transform" />
              <span>Home Page</span>
            </Link>

            {/* Live Sri Lanka Market Status */}
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[#DFBA73] text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFBA73] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFBA73]"></span>
              </span>
              <span>SL Market Active</span>
            </div>

            {/* Notification button */}
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#DFBA73] hover:bg-white/5 border border-white/[0.08] transition-all"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* User Profile avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm border border-[#DFBA73]/40"
              style={{ backgroundColor: '#0E131C' }}
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-8 bg-[#080A0E]">
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

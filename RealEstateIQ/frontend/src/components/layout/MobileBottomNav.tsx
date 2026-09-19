import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Home,
  Brain,
  BarChart3,
  BookmarkCheck,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const router = useRouter();
  const { pathname } = router;

  const navItems = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      href: '/properties',
      label: 'Listings',
      icon: Home,
      isActive: pathname.startsWith('/properties'),
    },
    {
      href: '/predict',
      label: 'Predict',
      icon: Brain,
      isPrimary: true,
      isActive: pathname.startsWith('/predict'),
    },
    {
      href: '/market',
      label: 'Intel',
      icon: BarChart3,
      isActive: pathname === '/market',
    },
    {
      href: '/saved',
      label: 'Saved',
      icon: BookmarkCheck,
      isActive: pathname === '/saved',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-indigo-500/20 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            // Elevated Center AI Valuation Action Button
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 duration-200 ${
                    item.isActive
                      ? 'bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 shadow-indigo-500/50 scale-105 ring-2 ring-indigo-400/40'
                      : 'bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-indigo-600/40 group-hover:scale-105'
                  }`}
                >
                  <Icon size={22} className="animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-sky-400 mt-1 uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                item.isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_6px_#818cf8]" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* Drawer Menu button for Admin / full options */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
}

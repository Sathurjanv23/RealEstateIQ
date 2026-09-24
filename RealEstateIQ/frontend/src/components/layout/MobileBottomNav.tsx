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
      label: 'Valuate',
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
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#08141F]/95 backdrop-blur-md border-t border-[#142938] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200 ${
                    item.isActive
                      ? 'bg-[#00DC82] text-[#061017] scale-105 shadow-[#00DC82]/30'
                      : 'bg-[#00DC82] text-[#061017] group-hover:scale-105'
                  }`}
                >
                  <Icon size={22} className="text-[#061017]" />
                </div>
                <span className="text-[10px] font-bold text-[#00DC82] mt-1 uppercase tracking-wider">
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
                  ? 'text-[#00DC82] font-bold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={19} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00DC82] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* Drawer Menu button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#94A3B8] hover:text-white transition-colors"
        >
          <Menu size={19} />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
}

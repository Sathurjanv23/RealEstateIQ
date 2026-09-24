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
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FFFFFF] border-t border-[#E7E3DA] px-2 py-1.5 shadow-[0_-4px_20px_rgba(18,59,42,0.06)]"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            // Elevated Center Deep Forest Green Valuation Button with Gold Accent
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform active:scale-95 duration-200 ${
                    item.isActive
                      ? 'bg-[#123B2A] border-2 border-[#C9A227] scale-105'
                      : 'bg-[#123B2A] border border-[#2F6B4F] group-hover:scale-105'
                  }`}
                >
                  <Icon size={20} className="text-[#C9A227]" />
                </div>
                <span className="text-[10px] font-bold text-[#123B2A] mt-1 uppercase tracking-wider">
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
                  ? 'text-[#123B2A] font-bold'
                  : 'text-[#718078] hover:text-[#17231C]'
              }`}
            >
              <div className="relative">
                <Icon size={19} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#C9A227] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* Drawer Menu button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#718078] hover:text-[#17231C] transition-colors"
        >
          <Menu size={19} />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
}

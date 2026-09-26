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
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:w-[440px] sm:left-1/2 sm:-translate-x-1/2 z-50 lg:hidden bg-[#0A0D14]/90 backdrop-blur-2xl border border-white/[0.12] shadow-2xl rounded-3xl p-2 transition-all duration-300"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around relative px-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-7 group focus:outline-none z-10"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[#080A0E] shadow-[0_6px_22px_rgba(212,175,55,0.45)] active:scale-95 transition-all duration-300 ${
                    item.isActive
                      ? 'ring-4 ring-[#DFBA73]/50 scale-110'
                      : 'group-hover:scale-105'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #F6E7CA 0%, #DFBA73 35%, #C5A880 75%, #A88448 100%)',
                    boxShadow: '0 6px 20px -2px rgba(212, 175, 55, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <Icon size={24} className="text-[#080A0E] stroke-[2.2] flex-shrink-0" />
                </div>
                <span className="text-[10px] font-black text-[#DFBA73] mt-1 uppercase tracking-wider drop-shadow-md">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                item.isActive
                  ? 'text-[#DFBA73] bg-[#DFBA73]/10 border border-[#DFBA73]/25 font-bold shadow-[0_2px_10px_rgba(223,186,115,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon size={19} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#DFBA73] rounded-full shadow-[0_0_8px_#DFBA73]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Drawer Menu button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all border border-transparent"
        >
          <Menu size={19} />
          <span className="text-[10px] mt-1 font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}

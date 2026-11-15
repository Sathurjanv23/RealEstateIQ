import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCircle2, MessageSquare, Crown, TrendingUp,
  ShieldCheck, X, Check, ArrowRight, Trash2
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'inquiry' | 'payment' | 'market' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'inquiry',
    title: 'New Viewing Inquiry',
    message: 'A prospective buyer requested a viewing appointment for your Colombo 7 property.',
    time: '12m ago',
    read: false,
    actionUrl: '/dashboard',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'PayHere Boost Active',
    message: 'Your 30-Day Platinum Boost has been activated. Pinned at top of search results.',
    time: '2h ago',
    read: false,
    actionUrl: '/pricing',
  },
  {
    id: 'n3',
    type: 'market',
    title: 'District Rate Update',
    message: 'Southern Province (Galle & Matara) rental yields reached 8.4% benchmark.',
    time: '1d ago',
    read: true,
    actionUrl: '/market',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Verified Agent Status',
    message: 'Your profile has been authenticated with the Sri Lanka Real Estate Board verification badge.',
    time: '2d ago',
    read: true,
    actionUrl: '/properties',
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare size={14} className="text-[#DFBA73]" />;
      case 'payment':
        return <Crown size={14} className="text-amber-400" />;
      case 'market':
        return <TrendingUp size={14} className="text-emerald-400" />;
      case 'system':
      default:
        return <ShieldCheck size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#DFBA73] hover:bg-white/5 border border-white/[0.08] transition-all group"
        aria-label="View notifications"
        title="Notifications & Alerts"
      >
        <Bell size={17} className="group-hover:scale-105 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DFBA73] text-[9px] font-black text-[#080A0E] shadow-md ring-2 ring-[#080A0E]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0B101B]/95 border border-[#DFBA73]/30 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-serif font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DFBA73]/20 text-[#DFBA73]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-[#DFBA73] hover:underline font-semibold flex items-center gap-1"
                >
                  <Check size={12} /> Mark read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex px-3 pt-2 gap-2 border-b border-white/[0.06] text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-1.5 transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-[#DFBA73] text-[#DFBA73]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-1.5 transition-colors border-b-2 ${
                activeTab === 'unread'
                  ? 'border-[#DFBA73] text-[#DFBA73]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 flex gap-3 items-start transition-all cursor-pointer ${
                    !item.read
                      ? 'bg-[#DFBA73]/[0.06] hover:bg-[#DFBA73]/[0.1]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <span className="text-[10px] text-neutral-500 shrink-0">{item.time}</span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {item.actionUrl ? (
                        <Link
                          href={item.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-bold text-[#DFBA73] hover:underline inline-flex items-center gap-1"
                        >
                          View Details <ArrowRight size={10} />
                        </Link>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={(e) => deleteNotification(item.id, e)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        title="Dismiss notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {!item.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500 text-xs">
                No notifications found.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-white/[0.08] bg-black/40 text-center">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-[#DFBA73] hover:underline"
            >
              Go to Intelligence Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, TrendingDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

interface PriceWatchButtonProps {
  propertyId: string;
  propertyTitle: string;
  currentPrice: number;
}

export function PriceWatchButton({
  propertyId,
  propertyTitle,
  currentPrice,
}: PriceWatchButtonProps) {
  const { formatPrice } = useCurrency();
  const [isWatching, setIsWatching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dropThreshold, setDropThreshold] = useState<number>(5); // 5% drop

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('realestateiq_price_watches');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[propertyId]) {
            setIsWatching(true);
          }
        }
      } catch (e) {
        console.error('Error loading price watches:', e);
      }
    }
  }, [propertyId]);

  const handleToggleWatch = () => {
    if (isWatching) {
      // Remove watch
      try {
        const stored = localStorage.getItem('realestateiq_price_watches');
        const parsed = stored ? JSON.parse(stored) : {};
        delete parsed[propertyId];
        localStorage.setItem('realestateiq_price_watches', JSON.stringify(parsed));
        setIsWatching(false);
        toast.success(`Price watch removed for ${propertyTitle}.`);
      } catch {
        toast.error('Failed to update price watch.');
      }
    } else {
      setShowModal(true);
    }
  };

  const handleConfirmWatch = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('realestateiq_price_watches');
      const parsed = stored ? JSON.parse(stored) : {};
      const targetPrice = Math.round(currentPrice * (1 - dropThreshold / 100));

      parsed[propertyId] = {
        propertyId,
        title: propertyTitle,
        initialPrice: currentPrice,
        dropThreshold,
        targetPrice,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('realestateiq_price_watches', JSON.stringify(parsed));
      setIsWatching(true);
      setShowModal(false);
      toast.success(
        `Price Watch Active! You'll be notified if price drops by ${dropThreshold}% (${formatPrice(targetPrice)}).`,
        { duration: 5000 }
      );
    } catch {
      toast.error('Failed to save price watch.');
    }
  };

  const targetAlertPrice = Math.round(currentPrice * (1 - dropThreshold / 100));

  return (
    <>
      <button
        type="button"
        onClick={handleToggleWatch}
        className={`btn-secondary text-xs py-2.5 px-3.5 font-semibold transition-all ${
          isWatching
            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
            : 'hover:border-[#DFBA73]/50 text-neutral-300 hover:text-white'
        }`}
        title={isWatching ? 'Price Drop Watch Active' : 'Set Price Drop Alert'}
      >
        {isWatching ? (
          <>
            <BellRing size={15} className="text-emerald-400 animate-pulse" />
            <span>Watching (-{dropThreshold}%)</span>
          </>
        ) : (
          <>
            <Bell size={15} className="text-[#DFBA73]" />
            <span>Price Watch</span>
          </>
        )}
      </button>

      {/* Price Watch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="luxury-glass-card max-w-md w-full p-6 shadow-2xl relative border border-[#DFBA73]/40 bg-[#0B1522]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#DFBA73]/15 text-[#DFBA73] border border-[#DFBA73]/30">
                  <TrendingDown size={18} />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-white text-base">
                    Property Price Watch™
                  </h3>
                  <p className="text-[11px] text-neutral-400">விலை மாற்ற எச்சரிக்கை</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmWatch} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#070E17] border border-white/[0.06] text-xs">
                <p className="text-neutral-400">Selected Property:</p>
                <p className="font-bold text-white mt-0.5 truncate">{propertyTitle}</p>
                <p className="text-xs text-[#DFBA73] font-mono mt-1 font-bold">
                  Current Listed Price: {formatPrice(currentPrice)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Notify me when price drops by:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDropThreshold(pct)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        dropThreshold === pct
                          ? 'bg-[#DFBA73]/20 border-[#DFBA73] text-[#DFBA73]'
                          : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {pct}% Drop
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                <p className="text-neutral-300">Target Notification Price:</p>
                <p className="text-base font-serif font-bold text-emerald-400 font-mono mt-0.5">
                  {formatPrice(targetAlertPrice)}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  You will receive an in-app alert & notification if the seller reduces price to or below this amount.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs flex-1 py-2.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex-1 py-2.5 font-bold"
                >
                  Activate Watch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

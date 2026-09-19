import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed prompt in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) return;

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If installed, hide prompt
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#0e1628] to-[#070b15] border border-indigo-500/30 shadow-2xl shadow-indigo-950/80 backdrop-blur-xl">
        {/* Glow highlight */}
        <div className="absolute top-0 right-10 w-24 h-12 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <BrandLogo size="sm" showText={false} href="" />

          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Install RealEstateIQ App</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                PWA
              </span>
            </h4>
            <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
              Install on your home screen or desktop for fast offline valuations and instant access.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all"
              >
                <Download size={13} />
                Install App
              </button>

              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

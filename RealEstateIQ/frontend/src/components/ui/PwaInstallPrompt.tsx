import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
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
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] animate-slide-up">
      <div className="relative p-4 rounded-2xl bg-[#0B1722] border border-[#162E40] shadow-2xl">
        <div className="flex items-start gap-3">
          <BrandLogo size="sm" showText={false} href="" />

          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Install RealEstateIQ</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
                App
              </span>
            </h4>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Install on your device for instant offline access and property market valuations.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="btn-primary text-xs py-1.5 px-3.5"
              >
                <Download size={13} />
                Install App
              </button>

              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-[#142938] transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#94A3B8] hover:text-white transition-colors p-1"
            aria-label="Close install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

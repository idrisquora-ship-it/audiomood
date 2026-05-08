import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (dismissed || isStandalone) {
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // For iOS, show instructions banner
    if (isIOSDevice && isMobile) {
      // Show after a short delay for first-time visitors
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 md:hidden">
      <div className="relative rounded-xl bg-gradient-to-r from-primary/90 to-primary p-4 shadow-lg backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 p-1 text-primary-foreground/70 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-primary-foreground">
              Install Senoxa
            </h3>
            {isIOS ? (
              <p className="mt-1 text-sm text-primary-foreground/80">
                Tap the share button <span className="inline-block rotate-90">⎋</span> then "Add to Home Screen"
              </p>
            ) : (
              <p className="mt-1 text-sm text-primary-foreground/80">
                Add to your home screen for the best experience
              </p>
            )}
          </div>
        </div>

        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstall}
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;

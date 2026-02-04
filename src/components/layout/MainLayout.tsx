import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import MobilePlayer from './MobilePlayer';
import GlobalPlayer from '@/components/player/GlobalPlayer';
import LyricsModal from '@/components/player/LyricsModal';
import NotificationBell from '@/components/notifications/NotificationBell';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
  const { currentSong, isMinimized } = usePlayer();
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();

  // Calculate bottom padding based on player state and device
  const getBottomPadding = () => {
    if (isMobile) {
      // Mobile: bottom nav (56px) + player if playing (64px)
      if (currentSong) return 'pb-32';
      return 'pb-16';
    }
    // Desktop: player height
    if (currentSong) {
      return isMinimized ? 'pb-20' : 'pb-28';
    }
    return 'pb-0';
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header - Visible only on mobile */}
      <MobileHeader />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          'md:ml-64', // Sidebar offset on desktop
          'pt-14 md:pt-0', // Mobile header offset
          getBottomPadding()
        )}
        style={{ height: '100vh' }}
      >
        {/* Desktop Top Bar with Notification Bell */}
        {isAuthenticated && (
          <div className="sticky top-0 z-30 hidden justify-end p-4 bg-background/80 backdrop-blur-sm md:flex">
            <NotificationBell />
          </div>
        )}
        <Outlet />
      </main>

      {/* Desktop Player */}
      <div className="hidden md:block">
        <GlobalPlayer />
      </div>

      {/* Mobile Player */}
      <MobilePlayer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Lyrics Modal */}
      <LyricsModal />
    </div>
  );
};

export default MainLayout;

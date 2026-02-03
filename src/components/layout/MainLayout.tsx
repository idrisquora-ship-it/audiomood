import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalPlayer from '@/components/player/GlobalPlayer';
import LyricsModal from '@/components/player/LyricsModal';
import NotificationBell from '@/components/notifications/NotificationBell';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
  const { currentSong, isMinimized } = usePlayer();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content - Scrollable */}
      <main
        className={cn(
          'ml-64 flex-1 overflow-y-auto',
          currentSong ? (isMinimized ? 'pb-20' : 'pb-28') : 'pb-0'
        )}
        style={{ height: '100vh' }}
      >
        {/* Top Bar with Notification Bell */}
        {isAuthenticated && (
          <div className="sticky top-0 z-30 flex justify-end p-4 bg-background/80 backdrop-blur-sm">
            <NotificationBell />
          </div>
        )}
        <Outlet />
      </main>

      {/* Global Player */}
      <GlobalPlayer />

      {/* Lyrics Modal */}
      <LyricsModal />
    </div>
  );
};

export default MainLayout;

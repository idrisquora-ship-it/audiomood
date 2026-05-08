import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, Music, BarChart3, Upload, LogIn, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface MobileSidebarProps {
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { profile, isAuthenticated, isArtist } = useAuthContext();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Your Library', path: '/library' },
  ];

  const artistItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Music', path: '/upload' },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Music className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gradient-primary">Senoxa</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* User Profile */}
          {isAuthenticated && profile && (
            <Link
              to="/profile"
              onClick={onClose}
              className={cn(
                'mb-4 flex items-center gap-3 rounded-lg p-3 transition-colors',
                isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.display_name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-medium">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{profile.display_name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
            </Link>
          )}

          {/* Main Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Artist Section */}
          {isAuthenticated && isArtist && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                  Artist
                </h3>
                <nav className="space-y-1">
                  {artistItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </>
          )}

          {/* Playlists */}
          {isAuthenticated && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                  Playlists
                </h3>
                <nav className="space-y-1">
                  <Link
                    to="/liked"
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive('/liked')
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Heart className="h-5 w-5" />
                    Liked Songs
                  </Link>
                </nav>
              </div>
            </>
          )}

          {/* Settings */}
          <Separator className="my-4" />
          <nav className="space-y-1">
            <Link
              to="/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive('/settings')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </ScrollArea>

      {/* Auth Button */}
      {!isAuthenticated && (
        <div className="border-t border-border p-4">
          <Link to="/login" onClick={onClose}>
            <Button variant="outline" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;

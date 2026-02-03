import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  PlusCircle,
  Heart,
  Music,
  BarChart3,
  Upload,
  User,
  LogOut,
  Disc3,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const Sidebar: React.FC = () => {
  const { user, isAuthenticated, role, logout, upgradeToArtist } = useUser();
  const location = useLocation();

  const mainNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: Library, label: 'Your Library' },
  ];

  const artistNavItems = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Music' },
    { to: '/my-music', icon: Disc3, label: 'My Music' },
  ];

  const playlistItems = [
    { to: '/liked', icon: Heart, label: 'Liked Songs' },
    { to: '/playlists', icon: Music, label: 'Playlists' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient-primary">Senoxa</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <ul className="space-y-1">
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(to)
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Separator className="mx-3 my-4 bg-sidebar-border" />

      {/* Artist Section */}
      {role === 'artist' && (
        <>
          <div className="px-6 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Artist Studio
            </span>
          </div>
          <nav className="px-3">
            <ul className="space-y-1">
              {artistNavItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(to)
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <Separator className="mx-3 my-4 bg-sidebar-border" />
        </>
      )}

      {/* Playlists */}
      <div className="px-6 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Music
        </span>
      </div>
      <nav className="flex-1 overflow-hidden px-3">
        <ScrollArea className="h-full">
          <ul className="space-y-1 pb-4">
            {playlistItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(to)
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/playlists/create"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Create Playlist
              </NavLink>
            </li>
          </ul>
        </ScrollArea>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <NavLink
              to="/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                isActive('/profile')
                  ? 'bg-sidebar-accent'
                  : 'hover:bg-sidebar-accent'
              )}
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="h-8 w-8 rounded-full bg-muted"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </NavLink>

            {role === 'listener' && (
              <Button
                onClick={upgradeToArtist}
                variant="outline"
                size="sm"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Become an Artist
              </Button>
            )}

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        ) : (
          <NavLink to="/login">
            <Button className="w-full gradient-primary">
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

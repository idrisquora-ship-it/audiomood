import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, Music, BarChart3, Upload, LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile, isAuthenticated, isArtist, loading } = useAuthContext();
  const isActive = (path: string) => location.pathname === path;
  const navItems = [{ icon: Home, label: 'Home', path: '/' }, { icon: Search, label: 'Search', path: '/search' }, { icon: Library, label: 'Your Library', path: '/library' }];
  const artistItems = [{ icon: BarChart3, label: 'Dashboard', path: '/dashboard' }, { icon: Upload, label: 'Upload Music', path: '/upload' }];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center gap-2 px-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"><Music className="h-5 w-5 text-white" /></div><span className="text-xl font-bold text-gradient-primary">Senoxa</span></div>
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-4">{navItems.map(item => (<Link key={item.path} to={item.path} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><item.icon className="h-5 w-5" />{item.label}</Link>))}</nav>
        {isAuthenticated && isArtist && (<><Separator className="my-2" /><div className="py-4"><h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Artist</h3><nav className="space-y-1">{artistItems.map(item => (<Link key={item.path} to={item.path} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><item.icon className="h-5 w-5" />{item.label}</Link>))}</nav></div></>)}
        {isAuthenticated && (<><Separator className="my-2" /><div className="py-4"><h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Playlists</h3><nav className="space-y-1"><Link to="/liked" className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive('/liked') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><Heart className="h-5 w-5" />Liked Songs</Link></nav></div></>)}
      </ScrollArea>
      <div className="border-t border-border p-4">
        {loading ? <div className="flex items-center justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : isAuthenticated && profile ? (
          <Link to="/profile" className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-colors', isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-medium">{profile.display_name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{profile.display_name}</p><p className="truncate text-xs text-muted-foreground capitalize">{profile.role}</p></div>
          </Link>
        ) : <Link to="/login"><Button variant="outline" className="w-full"><LogIn className="mr-2 h-4 w-4" />Sign In</Button></Link>}
      </div>
    </aside>
  );
};

export default Sidebar;

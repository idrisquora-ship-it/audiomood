import React from 'react';
import { Heart, Users, LogOut, Sparkles, Loader2, Music } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLikes } from '@/hooks/useLikes';
import { useFollows } from '@/hooks/useFollows';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage: React.FC = () => {
  const { profile, isAuthenticated, isArtist, loading: authLoading, signOut, upgradeToArtist } = useAuthContext();
  const { likedSongs, loading: likesLoading } = useLikes();
  const { followedArtists, loading: followsLoading } = useFollows();
  if (authLoading) { return <div className="flex items-center justify-center p-8 py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }
  if (!isAuthenticated || !profile) { return <Navigate to="/login" replace />; }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-6">
        <Avatar className="h-32 w-32"><AvatarImage src={profile.avatar || undefined} /><AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white">{profile.display_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
        <div><p className="text-sm font-medium text-muted-foreground capitalize">{profile.role}</p><h1 className="text-4xl font-bold">{profile.display_name}</h1><p className="mt-2 text-muted-foreground">Member since {new Date(profile.created_at).toLocaleDateString()}</p><div className="mt-4 flex gap-3">{!isArtist && <Button onClick={upgradeToArtist} className="gradient-primary glow-primary"><Sparkles className="mr-2 h-4 w-4" />Become an Artist</Button>}<Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</Button></div></div>
      </div>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Liked Songs</CardTitle><Heart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{likesLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{likedSongs.length}</div>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Following</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{followsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{followedArtists.length}</div>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Playlists</CardTitle><Music className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div></CardContent></Card>
      </div>
      <section><h2 className="mb-4 text-xl font-semibold">Quick Links</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Link to="/liked"><Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"><CardContent className="flex items-center gap-4 p-4"><Heart className="h-8 w-8 text-primary" /><div><h3 className="font-semibold">Liked Songs</h3><p className="text-sm text-muted-foreground">Your favorite tracks</p></div></CardContent></Card></Link><Link to="/library"><Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"><CardContent className="flex items-center gap-4 p-4"><Music className="h-8 w-8 text-primary" /><div><h3 className="font-semibold">Your Library</h3><p className="text-sm text-muted-foreground">Playlists and more</p></div></CardContent></Card></Link>{isArtist && <Link to="/dashboard"><Card className="bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"><CardContent className="flex items-center gap-4 p-4"><Sparkles className="h-8 w-8 text-primary" /><div><h3 className="font-semibold">Artist Dashboard</h3><p className="text-sm text-muted-foreground">Manage your music</p></div></CardContent></Card></Link>}</div></section>
    </div>
  );
};

export default ProfilePage;

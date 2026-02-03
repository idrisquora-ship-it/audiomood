import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Music, Play, TrendingUp, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useArtistStats } from '@/hooks/useStreams';
import { useSongs, Song } from '@/hooks/useSongs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SongCard from '@/components/music/SongCard';

const ArtistDashboard: React.FC = () => {
  const { profile, isArtist, isAuthenticated, loading: authLoading } = useAuthContext();
  const { stats, loading: statsLoading } = useArtistStats();
  const { getSongsByArtist } = useSongs();
  const [mySongs, setMySongs] = useState<Song[]>([]); const [songsLoading, setSongsLoading] = useState(true);
  useEffect(() => { const loadSongs = async () => { if (profile) { setSongsLoading(true); const songs = await getSongsByArtist(profile.id); setMySongs(songs); setSongsLoading(false); } }; loadSongs(); }, [profile, getSongsByArtist]);
  if (authLoading) { return <div className="p-8"><Skeleton className="h-10 w-64 mb-8" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}</div></div>; }
  if (!isAuthenticated) { return <Navigate to="/login" replace />; }
  if (!isArtist) { return <div className="flex flex-col items-center justify-center p-8 py-20"><BarChart3 className="h-16 w-16 text-muted-foreground/50" /><h2 className="mt-4 text-2xl font-bold">Artist Dashboard</h2><p className="mt-2 text-muted-foreground">Upgrade to artist to access your dashboard</p><Link to="/profile"><Button className="mt-6 gradient-primary">Become an Artist</Button></Link></div>; }
  const loading = statsLoading;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between"><div><h1 className="text-3xl font-bold">Artist Dashboard</h1><p className="text-muted-foreground">Track your performance</p></div><Link to="/upload"><Button className="gradient-primary glow-primary"><Music className="mr-2 h-4 w-4" />Upload Music</Button></Link></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Streams</CardTitle><Play className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats.totalStreams.toLocaleString()}</div>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Listeners</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats.monthlyListeners.toLocaleString()}</div>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Followers</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats.followers.toLocaleString()}</div>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Songs</CardTitle><Music className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{songsLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{mySongs.length}</div>}</CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="bg-muted/30"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Plays Over Time</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-64" /> : <ResponsiveContainer width="100%" height={250}><LineChart data={stats.recentPlays}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" /><XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => new Date(value).toLocaleDateString('en', { weekday: 'short' })} /><YAxis stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} /></LineChart></ResponsiveContainer>}</CardContent></Card>
        <Card className="bg-muted/30"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Top Songs</CardTitle></CardHeader><CardContent>{loading ? <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : stats.topSongs.length > 0 ? <div className="space-y-2">{stats.topSongs.map((song, index) => <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"><span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span><img src={song.cover_url || '/placeholder.svg'} alt={song.title} className="h-10 w-10 rounded-md object-cover" /><div className="flex-1 min-w-0"><p className="font-medium truncate">{song.title}</p><p className="text-sm text-muted-foreground">{song.plays.toLocaleString()} plays</p></div></div>)}</div> : <div className="flex flex-col items-center justify-center py-8"><Music className="h-12 w-12 text-muted-foreground/50" /><p className="mt-4 text-muted-foreground">No songs yet</p></div>}</CardContent></Card>
      </div>
      <section><h2 className="mb-4 text-xl font-semibold">My Music</h2>{songsLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array(6).fill(0).map((_, i) => <div key={i} className="space-y-3"><Skeleton className="aspect-square rounded-lg" /><Skeleton className="h-4 w-3/4" /></div>)}</div> : mySongs.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{mySongs.map(song => <SongCard key={song.id} song={song} queue={mySongs} showPlays />)}</div> : <div className="flex flex-col items-center justify-center py-12"><Music className="h-12 w-12 text-muted-foreground/50" /><p className="mt-4 text-muted-foreground">No songs uploaded yet</p><Link to="/upload"><Button className="mt-4 gradient-primary">Upload Your First Song</Button></Link></div>}</section>
    </div>
  );
};

export default ArtistDashboard;

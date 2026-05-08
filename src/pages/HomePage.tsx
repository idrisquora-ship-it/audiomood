import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, Headphones, Music } from 'lucide-react';
import { useSongs, useArtists, Song } from '@/hooks/useSongs';
import { useStreams } from '@/hooks/useStreams';
import { useAuthContext } from '@/contexts/AuthContext';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';
import AuthGate from '@/components/auth/AuthGate';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage: React.FC = () => {
  const { profile, isAuthenticated } = useAuthContext();
  const { getTrendingSongs, getRecentSongs, loading: songsLoading } = useSongs();
  const { artists, loading: artistsLoading } = useArtists();
  const { recentlyPlayed, loading: streamsLoading } = useStreams();

  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [recentUploads, setRecentUploads] = useState<Song[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadSongs = async () => {
      const [trending, recent] = await Promise.all([
        getTrendingSongs(6),
        getRecentSongs(6),
      ]);
      setTrendingSongs(trending);
      setRecentUploads(recent);
    };
    loadSongs();
  }, [getTrendingSongs, getRecentSongs, isAuthenticated]);

  const loading = songsLoading || artistsLoading;

  return (
    <AuthGate>
      <div className="p-4 md:p-8">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-6 md:p-8">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-4xl font-bold">
                {isAuthenticated && profile
                  ? `Welcome back, ${profile.display_name}`
                  : 'Welcome to Senoxa'}
              </h1>
              <p className="mt-2 text-sm md:text-lg text-muted-foreground">
                Discover new music and support independent artists
              </p>
            </div>
            <div className="absolute -right-20 -top-20 h-40 md:h-64 w-40 md:w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 md:h-64 w-40 md:w-64 rounded-full bg-accent/10 blur-3xl" />
          </div>
        </section>

        {/* Recently Played */}
        {isAuthenticated && recentlyPlayed.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="mb-4 md:mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold">Recently Played</h2>
            </div>
            {streamsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
                {recentlyPlayed.slice(0, 6).map(song => (
                  <SongCard key={song.id} song={song} queue={recentlyPlayed} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending Songs */}
        <section className="mb-8 md:mb-12">
          <div className="mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">Trending Now</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : trendingSongs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
              {trendingSongs.map(song => (
                <SongCard key={song.id} song={song} queue={trendingSongs} showPlays />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No songs yet. Be the first to upload!</p>
            </div>
          )}
        </section>

        {/* Recent Uploads */}
        <section className="mb-8 md:mb-12">
          <div className="mb-4 md:mb-6 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">Fresh Releases</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : recentUploads.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
              {recentUploads.map(song => (
                <SongCard key={song.id} song={song} queue={recentUploads} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No songs yet</p>
            </div>
          )}
        </section>

        {/* Popular Artists */}
        <section className="mb-8 md:mb-12">
          <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold">Popular Artists</h2>
          {artistsLoading ? (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-32 md:w-44 shrink-0 space-y-3">
                  <Skeleton className="aspect-square rounded-full" />
                  <Skeleton className="mx-auto h-4 w-3/4" />
                  <Skeleton className="mx-auto h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : artists.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 md:gap-6 pb-4">
                {artists.map(artist => (
                  <div key={artist.id} className="w-32 md:w-44 shrink-0">
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No artists yet</p>
            </div>
          )}
        </section>
      </div>
    </AuthGate>
  );
};

export default HomePage;

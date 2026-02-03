import React from 'react';
import { TrendingUp, Clock, Headphones } from 'lucide-react';
import { mockSongs, mockArtists } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const HomePage: React.FC = () => {
  const { user, recentlyPlayed } = useUser();

  // Get trending songs (sorted by plays)
  const trendingSongs = [...mockSongs].sort((a, b) => b.plays - a.plays).slice(0, 6);
  
  // Get recent uploads (sorted by date)
  const recentUploads = [...mockSongs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  ).slice(0, 6);

  // Get recently played songs
  const recentlyPlayedSongs = recentlyPlayed
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 6) as typeof mockSongs;

  return (
    <div className="p-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">
              {user ? `Welcome back, ${user.displayName}` : 'Welcome to Senoxa'}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover new music and support independent artists
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayedSongs.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recentlyPlayedSongs.map(song => (
              <SongCard key={song.id} song={song} queue={recentlyPlayedSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Songs */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trendingSongs.map(song => (
            <SongCard key={song.id} song={song} queue={trendingSongs} showPlays />
          ))}
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Fresh Releases</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {recentUploads.map(song => (
            <SongCard key={song.id} song={song} queue={recentUploads} />
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Popular Artists</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-6 pb-4">
            {mockArtists.map(artist => (
              <div key={artist.id} className="w-44 shrink-0">
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    </div>
  );
};

export default HomePage;

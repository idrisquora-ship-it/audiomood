import React from 'react';
import { Heart, Play, Music } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { usePlayer } from '@/contexts/PlayerContext';
import AuthGate from '@/components/auth/AuthGate';
import SongCard from '@/components/music/SongCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const LikedSongsPage: React.FC = () => {
  const { likedSongs, loading } = useLikes();
  const { playSong } = usePlayer();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  return (
    <AuthGate>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex h-32 w-32 md:h-48 md:w-48 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-xl">
            <Heart className="h-16 w-16 md:h-24 md:w-24 text-white" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Playlist</p>
            <h1 className="mt-1 md:mt-2 text-3xl md:text-5xl font-bold">Liked Songs</h1>
            <p className="mt-2 md:mt-4 text-sm md:text-base text-muted-foreground">
              {loading ? '...' : `${likedSongs.length} songs`}
            </p>
            {likedSongs.length > 0 && (
              <Button
                onClick={handlePlayAll}
                className="mt-4 gradient-primary glow-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            )}
          </div>
        </div>

        {/* Songs List */}
        {loading ? (
          <div className="space-y-1">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4 p-2 md:p-3">
                <Skeleton className="h-4 w-6 md:w-8" />
                <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 md:w-48" />
                  <Skeleton className="h-3 w-24 md:w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : likedSongs.length > 0 ? (
          <div className="space-y-1">
            {likedSongs.map((song, index) => (
              <div key={song.id} className="flex items-center gap-2 md:gap-4">
                <span className="w-6 md:w-8 text-center text-xs md:text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <SongCard song={song} variant="row" queue={likedSongs} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-20">
            <Heart className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg md:text-xl font-semibold">No liked songs yet</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Songs you like will appear here
            </p>
          </div>
        )}
      </div>
    </AuthGate>
  );
};

export default LikedSongsPage;

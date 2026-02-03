import React from 'react';
import { Heart, Play, Music } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuthContext } from '@/contexts/AuthContext';
import SongCard from '@/components/music/SongCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const LikedSongsPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { likedSongs, loading } = useLikes();
  const { playSong } = usePlayer();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <Heart className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold">Sign in to see liked songs</h2>
        <p className="mt-2 text-muted-foreground">
          Your liked songs will appear here
        </p>
        <Link to="/login">
          <Button className="mt-6 gradient-primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end gap-6">
        <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-xl">
          <Heart className="h-24 w-24 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Playlist</p>
          <h1 className="mt-2 text-5xl font-bold">Liked Songs</h1>
          <p className="mt-4 text-muted-foreground">
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
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : likedSongs.length > 0 ? (
        <div className="space-y-1">
          {likedSongs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-4">
              <span className="w-8 text-center text-sm text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <SongCard song={song} variant="row" queue={likedSongs} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No liked songs yet</h3>
          <p className="mt-2 text-muted-foreground">
            Songs you like will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;

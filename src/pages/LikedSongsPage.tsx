import React from 'react';
import { Heart, Play } from 'lucide-react';
import { mockSongs } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { usePlayer } from '@/contexts/PlayerContext';
import SongCard from '@/components/music/SongCard';
import { Button } from '@/components/ui/button';

const LikedSongsPage: React.FC = () => {
  const { likedSongs } = useUser();
  const { playSong } = usePlayer();

  const likedSongsList = likedSongs
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean) as typeof mockSongs;

  const handlePlayAll = () => {
    if (likedSongsList.length > 0) {
      playSong(likedSongsList[0], likedSongsList);
    }
  };

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
            {likedSongsList.length} songs
          </p>
          {likedSongsList.length > 0 && (
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
      {likedSongsList.length > 0 ? (
        <div className="space-y-1">
          {likedSongsList.map((song, index) => (
            <div key={song.id} className="flex items-center gap-4">
              <span className="w-8 text-center text-sm text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <SongCard song={song} variant="row" queue={likedSongsList} />
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

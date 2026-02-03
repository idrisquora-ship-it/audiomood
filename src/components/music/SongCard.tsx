import React from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { useUser } from '@/contexts/UserContext';
import { formatDuration, formatPlays } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SongCardProps {
  song: Song;
  queue?: Song[];
  showArtist?: boolean;
  showPlays?: boolean;
  variant?: 'card' | 'row';
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  queue,
  showArtist = true,
  showPlays = false,
  variant = 'card',
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayer();
  const { likedSongs, toggleLikeSong } = useUser();

  const isCurrentSong = currentSong?.id === song.id;
  const isLiked = likedSongs.includes(song.id);

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  if (variant === 'row') {
    return (
      <div
        className={cn(
          'group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50',
          isCurrentSong && 'bg-muted/50'
        )}
      >
        {/* Cover with play overlay */}
        <div className="relative h-12 w-12 shrink-0">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="h-full w-full rounded-md object-cover"
          />
          <button
            onClick={handlePlay}
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-md bg-black/60 transition-opacity',
              isCurrentSong && isPlaying
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            )}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-medium truncate',
              isCurrentSong && 'text-primary'
            )}
          >
            {song.title}
          </h4>
          {showArtist && (
            <p className="text-sm text-muted-foreground truncate">
              {song.artistName}
            </p>
          )}
        </div>

        {/* Duration & Actions */}
        <div className="flex items-center gap-2">
          {showPlays && (
            <span className="text-sm text-muted-foreground w-16 text-right">
              {formatPlays(song.plays)}
            </span>
          )}
          <span className="text-sm text-muted-foreground w-12 text-right">
            {formatDuration(song.duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLikeSong(song.id)}
            className={cn(
              'opacity-0 group-hover:opacity-100',
              isLiked && 'opacity-100 text-primary'
            )}
          >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className={cn(
            'absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full gradient-primary shadow-lg transition-all glow-primary',
            isCurrentSong && isPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          )}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                'font-medium truncate',
                isCurrentSong && 'text-primary'
              )}
            >
              {song.title}
            </h4>
            {showArtist && (
              <p className="text-sm text-muted-foreground truncate">
                {song.artistName}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleLikeSong(song.id)}>
                <Heart className="mr-2 h-4 w-4" />
                {isLiked ? 'Unlike' : 'Like'}
              </DropdownMenuItem>
              <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default SongCard;

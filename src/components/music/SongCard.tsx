import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Music } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/hooks/useSongs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SongCardProps { song: Song; queue?: Song[]; variant?: 'card' | 'row'; showPlays?: boolean; }

const SongCard: React.FC<SongCardProps> = ({ song, queue, variant = 'card', showPlays = false }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;
  const handlePlay = () => { if (isCurrentSong) { togglePlay(); } else { playSong(song, queue || [song]); } };
  const formatDuration = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, '0')}`; };
  const formatPlays = (plays: number) => { if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`; if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`; return plays.toString(); };

  if (variant === 'row') {
    return (
      <div className={cn('group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50', isCurrentSong && 'bg-primary/10')}>
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          {song.cover_url ? <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-muted"><Music className="h-6 w-6 text-muted-foreground" /></div>}
          <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {isCurrentSong && isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" fill="white" />}
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-medium', isCurrentSong && 'text-primary')}>{song.title}</p>
          <p className="truncate text-sm text-muted-foreground">{song.artist?.display_name || 'Unknown Artist'}</p>
        </div>
        <span className="text-sm text-muted-foreground">{formatDuration(song.duration)}</span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {song.cover_url ? <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><Music className="h-12 w-12 text-muted-foreground" /></div>}
        <button onClick={handlePlay} className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-105">
          {isCurrentSong && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
        </button>
      </div>
      <div className="mt-3">
        <p className={cn('truncate font-medium', isCurrentSong && 'text-primary')}>{song.title}</p>
        <p className="truncate text-sm text-muted-foreground">{song.artist?.display_name || 'Unknown Artist'}</p>
        {showPlays && <p className="mt-1 text-xs text-muted-foreground">{formatPlays(song.plays)} plays</p>}
      </div>
    </div>
  );
};

export default SongCard;

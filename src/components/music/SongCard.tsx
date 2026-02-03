import React from 'react';
import { Play, Pause, Music, Download, Check, Loader2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useOfflineDownload } from '@/hooks/useOfflineDownload';
import { Song } from '@/hooks/useSongs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SongCardProps { 
  song: Song; 
  queue?: Song[]; 
  variant?: 'card' | 'row'; 
  showPlays?: boolean; 
  showDownload?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  queue, 
  variant = 'card', 
  showPlays = false,
  showDownload = true 
}) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { downloadSong, isDownloaded, downloading, isOnline, getOfflineUrl } = useOfflineDownload();
  
  const isCurrentSong = currentSong?.id === song.id;
  const downloaded = isDownloaded(song.id);
  const isDownloading = downloading === song.id;

  const handlePlay = () => { 
    if (isCurrentSong) { 
      togglePlay(); 
    } else { 
      // If offline and song is downloaded, use offline URL
      if (!isOnline && downloaded) {
        const offlineUrl = getOfflineUrl(song.id);
        if (offlineUrl) {
          playSong({ ...song, audio_url: offlineUrl }, queue || [song]); 
          return;
        }
      }
      playSong(song, queue || [song]); 
    } 
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloaded && !isDownloading) {
      downloadSong(song);
    }
  };

  const formatDuration = (seconds: number) => { 
    const mins = Math.floor(seconds / 60); 
    const secs = Math.floor(seconds % 60); 
    return `${mins}:${secs.toString().padStart(2, '0')}`; 
  };
  
  const formatPlays = (plays: number) => { 
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`; 
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`; 
    return plays.toString(); 
  };

  if (variant === 'row') {
    return (
      <div className={cn(
        'group flex items-center gap-3 md:gap-4 rounded-lg p-2 md:p-3 transition-colors hover:bg-muted/50', 
        isCurrentSong && 'bg-primary/10'
      )}>
        <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0 overflow-hidden rounded-md">
          {song.cover_url ? (
            <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Music className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
            </div>
          )}
          <button 
            onClick={handlePlay} 
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5 text-white" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 text-white" fill="white" />
            )}
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm md:text-base font-medium', isCurrentSong && 'text-primary')}>
            {song.title}
          </p>
          <p className="truncate text-xs md:text-sm text-muted-foreground">
            {song.artist?.display_name || 'Unknown Artist'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showDownload && (
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={cn(
                'p-1 rounded transition-colors',
                downloaded ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : downloaded ? (
                <Check className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
          )}
          <span className="text-xs md:text-sm text-muted-foreground">
            {formatDuration(song.duration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {song.cover_url ? (
          <img 
            src={song.cover_url} 
            alt={song.title} 
            className="h-full w-full object-cover transition-transform group-hover:scale-105" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Play button */}
        <button 
          onClick={handlePlay} 
          className="absolute bottom-2 right-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-105"
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Play className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
          )}
        </button>

        {/* Download button */}
        {showDownload && (
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              'absolute top-2 right-2 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-all group-hover:opacity-100',
              downloaded ? 'text-primary' : 'text-foreground hover:bg-background'
            )}
          >
            {isDownloading ? (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
            ) : downloaded ? (
              <Check className="h-3 w-3 md:h-4 md:w-4" />
            ) : (
              <Download className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </button>
        )}

        {/* Downloaded indicator */}
        {downloaded && (
          <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="mt-2 md:mt-3">
        <p className={cn('truncate text-sm md:text-base font-medium', isCurrentSong && 'text-primary')}>
          {song.title}
        </p>
        <p className="truncate text-xs md:text-sm text-muted-foreground">
          {song.artist?.display_name || 'Unknown Artist'}
        </p>
        {showPlays && (
          <p className="mt-1 text-xs text-muted-foreground">{formatPlays(song.plays)} plays</p>
        )}
      </div>
    </div>
  );
};

export default SongCard;

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ListMusic,
  Mic2,
  Heart,
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useUser } from '@/contexts/UserContext';
import { formatDuration } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const GlobalPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    volume,
    isMinimized,
    showLyrics,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMinimize,
    toggleLyrics,
  } = usePlayer();

  const { likedSongs, toggleLikeSong, addToRecentlyPlayed } = useUser();

  // Track recently played
  React.useEffect(() => {
    if (currentSong && isPlaying) {
      addToRecentlyPlayed(currentSong.id);
    }
  }, [currentSong?.id, isPlaying]);

  if (!currentSong) {
    return null;
  }

  const isLiked = likedSongs.includes(currentSong.id);
  const progress = currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-64 right-0 z-50 border-t border-border bg-[hsl(var(--player-background))] transition-all duration-300',
        isMinimized ? 'h-20' : 'h-28'
      )}
    >
      {/* Progress bar (always at top) */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-muted cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seek(percent * currentSong.duration);
        }}
      >
        <div
          className="h-full gradient-primary transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="flex h-full items-center justify-between px-4 pt-1">
        {/* Song Info */}
        <div className="flex items-center gap-4 w-80">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="h-14 w-14 rounded-lg object-cover shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium truncate">{currentSong.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentSong.artistName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLikeSong(currentSong.id)}
            className={cn(
              'shrink-0',
              isLiked && 'text-primary'
            )}
          >
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSong}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              onClick={togglePlay}
              size="icon"
              className="h-10 w-10 rounded-full gradient-primary glow-primary"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSong}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {!isMinimized && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDuration(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={currentSong.duration}
                step={1}
                onValueChange={([value]) => seek(value)}
                className="w-96"
              />
              <span>{formatDuration(currentSong.duration)}</span>
            </div>
          )}
        </div>

        {/* Extra Controls */}
        <div className="flex items-center gap-2 w-80 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLyrics}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              showLyrics && 'text-primary'
            )}
          >
            <Mic2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <ListMusic className="h-5 w-5" />
          </Button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-muted-foreground hover:text-foreground"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value / 100)}
              className="w-24"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMinimize}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMinimized ? (
              <Maximize2 className="h-5 w-5" />
            ) : (
              <Minimize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalPlayer;

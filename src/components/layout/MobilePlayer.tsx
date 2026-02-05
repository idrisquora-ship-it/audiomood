import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, Music, Heart, Download, Check, Loader2, ListPlus } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLikes } from '@/hooks/useLikes';
import { useOfflineDownload } from '@/hooks/useOfflineDownload';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AddToPlaylistDialog } from '@/components/music/SongActions';
import { useToast } from '@/hooks/use-toast';

const MobilePlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    nextSong,
    previousSong,
    toggleLyrics,
  } = usePlayer();
  
  const { isLiked, toggleLike } = useLikes();
  const { downloadSong, isDownloaded, downloading } = useOfflineDownload();
  const { isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  const [expanded, setExpanded] = React.useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = React.useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);
  const downloaded = isDownloaded(currentSong.id);
  const isDownloading = downloading === currentSong.id;

  const handleOpenPlaylistDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add songs to playlists',
        variant: 'destructive',
      });
      return;
    }
    setShowPlaylistDialog(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloaded && !isDownloading) {
      downloadSong(currentSong);
    }
  };

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden">
      {/* Mini Player */}
      <Sheet open={expanded} onOpenChange={setExpanded}>
        <SheetTrigger asChild>
          <div className="relative border-t border-border bg-background/95 backdrop-blur-lg">
            {/* Progress bar */}
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3 p-2 pt-3">
              {/* Cover */}
              {currentSong.cover_url ? (
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                  <Music className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Song Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{currentSong.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentSong.artist?.display_name}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" fill="currentColor" />
                  )}
                </Button>
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
              >
                <ChevronUp className="h-5 w-5 rotate-180" />
              </Button>
              <span className="text-sm font-medium">Now Playing</span>
              <Button variant="ghost" size="icon" onClick={toggleLyrics}>
                <span className="text-xs font-medium">Lyrics</span>
              </Button>
            </div>

            {/* Album Art */}
            <div className="flex flex-1 flex-col items-center justify-center px-8">
              <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl shadow-2xl">
                {currentSong.cover_url ? (
                  <img
                    src={currentSong.cover_url}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Music className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Song Info & Actions */}
              <div className="mt-6 w-full text-center">
                <h2 className="truncate text-xl font-bold">{currentSong.title}</h2>
                <p className="truncate text-muted-foreground">
                  {currentSong.artist?.display_name}
                </p>
                
                {/* Like, Playlist & Download buttons */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleLike(currentSong.id)}
                    className={cn('h-10 w-10', liked && 'text-destructive')}
                  >
                    <Heart className={cn('h-6 w-6', liked && 'fill-current')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenPlaylistDialog}
                    className="h-10 w-10"
                  >
                    <ListPlus className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={cn('h-10 w-10', downloaded && 'text-primary')}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : downloaded ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Download className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6">
              {/* Progress */}
              <div className="mb-6">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={([value]) => seek(value)}
                  className="cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6">
                <Button variant="ghost" size="icon" onClick={previousSong}>
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button
                  onClick={togglePlay}
                  className="h-16 w-16 rounded-full gradient-primary glow-primary"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7" fill="currentColor" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={nextSong}>
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <AddToPlaylistDialog
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
        song={currentSong}
      />
    </div>
  );
};

export default MobilePlayer;

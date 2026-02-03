import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, ChevronUp, ChevronDown, Music } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import SongInfoDrawer from './SongInfoDrawer';

const GlobalPlayer: React.FC = () => {
  const { currentSong, isPlaying, currentTime, duration, volume, isMinimized, togglePlay, seek, setVolume, toggleMinimize, toggleLyrics, nextSong, previousSong } = usePlayer();
  if (!currentSong) return null;
  const formatTime = (seconds: number) => { if (isNaN(seconds)) return '0:00'; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, '0')}`; };
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 left-64 right-0 z-50 h-16 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="flex h-full items-center gap-4 px-4">
          <div className="flex items-center gap-3">
            {currentSong.cover_url ? <img src={currentSong.cover_url} alt={currentSong.title} className="h-10 w-10 rounded-md object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"><Music className="h-5 w-5 text-muted-foreground" /></div>}
            <div className="min-w-0"><p className="truncate text-sm font-medium">{currentSong.title}</p><p className="truncate text-xs text-muted-foreground">{currentSong.artist?.display_name}</p></div>
          </div>
          <div className="flex-1 mx-4"><Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={([value]) => seek(value)} className="cursor-pointer" /></div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}</Button>
            <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8"><ChevronUp className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg">
      <div className="h-1 w-full bg-muted"><div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} /></div>
      <div className="flex h-24 items-center justify-between px-6">
        <div className="flex w-1/4 items-center gap-4">
          {currentSong.cover_url ? <img src={currentSong.cover_url} alt={currentSong.title} className="h-16 w-16 rounded-lg object-cover shadow-lg" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted shadow-lg"><Music className="h-8 w-8 text-muted-foreground" /></div>}
          <div className="min-w-0"><p className="truncate font-medium">{currentSong.title}</p><p className="truncate text-sm text-muted-foreground">{currentSong.artist?.display_name}</p></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={previousSong}><SkipBack className="h-5 w-5" /></Button>
            <Button onClick={togglePlay} className="h-12 w-12 rounded-full gradient-primary glow-primary">{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}</Button>
            <Button variant="ghost" size="icon" onClick={nextSong}><SkipForward className="h-5 w-5" /></Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{formatTime(currentTime)}</span><Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={([value]) => seek(value)} className="w-64 cursor-pointer" /><span>{formatTime(duration)}</span></div>
        </div>
        <div className="flex w-1/4 items-center justify-end gap-4">
          <SongInfoDrawer />
          <Button variant="ghost" size="icon" onClick={toggleLyrics}><Mic2 className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>{volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</Button><Slider value={[volume * 100]} max={100} step={1} onValueChange={([value]) => setVolume(value / 100)} className="w-24 cursor-pointer" /></div>
          <Button variant="ghost" size="icon" onClick={toggleMinimize}><ChevronDown className="h-5 w-5" /></Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalPlayer;

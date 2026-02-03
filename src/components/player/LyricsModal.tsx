import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { mockLyrics } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const LyricsModal: React.FC = () => {
  const { currentSong, currentTime, showLyrics, toggleLyrics } = usePlayer();
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const lyrics = currentSong ? mockLyrics[currentSong.id] : null;

  // Find active lyric line
  useEffect(() => {
    if (!lyrics) return;

    const currentLineIndex = lyrics.lines.findIndex((line, index) => {
      const nextLine = lyrics.lines[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    if (currentLineIndex !== -1 && currentLineIndex !== activeLineIndex) {
      setActiveLineIndex(currentLineIndex);
    }
  }, [currentTime, lyrics, activeLineIndex]);

  if (!showLyrics || !currentSong) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-lg animate-in fade-in duration-300">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLyrics}
        className="absolute right-6 top-6 z-10"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Song info */}
      <div className="absolute left-6 top-6 flex items-center gap-4">
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          className="h-16 w-16 rounded-lg object-cover shadow-lg"
        />
        <div>
          <h2 className="text-xl font-bold">{currentSong.title}</h2>
          <p className="text-muted-foreground">{currentSong.artistName}</p>
        </div>
      </div>

      {/* Lyrics */}
      <div className="flex h-full items-center justify-center pt-24 pb-32">
        <ScrollArea className="h-full w-full max-w-2xl" ref={containerRef}>
          <div className="px-6 py-12 space-y-6 text-center">
            {lyrics ? (
              lyrics.lines.map((line, index) => (
                <p
                  key={index}
                  className={cn(
                    'text-2xl font-medium transition-all duration-300',
                    index === activeLineIndex
                      ? 'text-foreground scale-110 text-gradient-primary'
                      : index < activeLineIndex
                      ? 'text-muted-foreground/50'
                      : 'text-muted-foreground/70'
                  )}
                >
                  {line.text}
                </p>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-xl">No lyrics available for this song</p>
                <p className="mt-2 text-sm">
                  Lyrics will appear here when available
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LyricsModal;

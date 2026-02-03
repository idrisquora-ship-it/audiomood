import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLyrics } from '@/hooks/useLyrics';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LyricsModal: React.FC = () => {
  const { currentSong, currentTime, showLyrics, toggleLyrics } = usePlayer();
  const { lyrics, fetchLyrics, clearLyrics } = useLyrics();
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (currentSong && showLyrics) {
      fetchLyrics(currentSong.id);
    } else {
      clearLyrics();
    }
  }, [currentSong?.id, showLyrics, fetchLyrics, clearLyrics]);

  // Find active lyric line
  useEffect(() => {
    if (!lyrics?.lines) return;

    const currentLineIndex = lyrics.lines.findIndex((line, index) => {
      const nextLine = lyrics.lines[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    if (currentLineIndex !== -1 && currentLineIndex !== activeLineIndex) {
      setActiveLineIndex(currentLineIndex);
    }
  }, [currentTime, lyrics, activeLineIndex]);

  // Auto-scroll to active lyric line
  useEffect(() => {
    if (!lyrics?.lines || activeLineIndex < 0) return;

    const activeElement = lineRefs.current[activeLineIndex];
    if (activeElement && containerRef.current) {
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const elementTop = activeElement.offsetTop;
      const elementHeight = activeElement.clientHeight;
      
      // Center the active line in the viewport
      const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex, lyrics]);

  // Reset line refs when lyrics change
  useEffect(() => {
    if (lyrics?.lines) {
      lineRefs.current = new Array(lyrics.lines.length).fill(null);
    }
  }, [lyrics]);

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
          src={currentSong.cover_url || '/placeholder.svg'}
          alt={currentSong.title}
          className="h-16 w-16 rounded-lg object-cover shadow-lg"
        />
        <div>
          <h2 className="text-xl font-bold">{currentSong.title}</h2>
          <p className="text-muted-foreground">{currentSong.artist?.display_name}</p>
        </div>
      </div>

      {/* Lyrics Container */}
      <div className="flex h-full items-center justify-center pt-24 pb-32">
        <div 
          ref={containerRef}
          className="h-full w-full max-w-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="px-6 py-12 space-y-6 text-center">
            {lyrics?.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, index) => (
                <p
                  key={index}
                  ref={(el) => { lineRefs.current[index] = el; }}
                  className={cn(
                    'text-2xl font-medium transition-all duration-500',
                    index === activeLineIndex
                      ? 'text-foreground scale-110 text-gradient-primary'
                      : index < activeLineIndex
                      ? 'text-muted-foreground/50 scale-100'
                      : 'text-muted-foreground/70 scale-100'
                  )}
                >
                  {line.text}
                </p>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-xl">No lyrics available for this song</p>
                <p className="mt-2 text-sm">
                  Lyrics will be auto-generated when songs are uploaded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;

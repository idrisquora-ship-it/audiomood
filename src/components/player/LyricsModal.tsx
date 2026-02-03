import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Flag, Share2, Copy, Check } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLyrics } from '@/hooks/useLyrics';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const LyricsModal: React.FC = () => {
  const { currentSong, currentTime, showLyrics, toggleLyrics } = usePlayer();
  const { lyrics, fetchLyrics, clearLyrics } = useLyrics();
  const { settings } = useSettingsContext();
  const { toast } = useToast();
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const lyricsSettings = settings?.lyrics_settings || {
    wrap_text: true,
    font_size: 'medium',
    line_spacing: 'normal',
    auto_scroll: true,
    highlight_mode: 'line',
  };

  // Font size classes
  const fontSizeClasses = {
    small: 'text-lg md:text-xl',
    medium: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
  };

  // Line spacing classes
  const lineSpacingClasses = {
    compact: 'space-y-3',
    normal: 'space-y-6',
    relaxed: 'space-y-10',
  };

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

  // Auto-scroll to active lyric line - smooth centering
  useEffect(() => {
    if (!lyrics?.lines || activeLineIndex < 0 || !lyricsSettings.auto_scroll) return;

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
  }, [activeLineIndex, lyrics, lyricsSettings.auto_scroll]);

  // Reset line refs when lyrics change
  useEffect(() => {
    if (lyrics?.lines) {
      lineRefs.current = new Array(lyrics.lines.length).fill(null);
    }
  }, [lyrics]);

  const handleCopyLyric = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Lyric copied to clipboard' });
  };

  const handleShareLyric = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: currentSong?.title,
        text: `"${text}" - ${currentSong?.artist?.display_name}`,
      });
    } else {
      handleCopyLyric(`"${text}" - ${currentSong?.artist?.display_name}`);
    }
  };

  const handleReportLyrics = () => {
    toast({ 
      title: 'Report Submitted', 
      description: 'Thank you for helping us improve lyrics accuracy' 
    });
  };

  // Render word-by-word highlighting for karaoke mode
  const renderKaraokeLine = (text: string, lineTime: number, nextLineTime: number | undefined, isActive: boolean) => {
    if (!isActive || lyricsSettings.highlight_mode !== 'word') {
      return text;
    }

    const words = text.split(' ');
    const lineDuration = (nextLineTime || lineTime + 5) - lineTime;
    const wordDuration = lineDuration / words.length;
    const timeIntoLine = currentTime - lineTime;
    const activeWordIndex = Math.floor(timeIntoLine / wordDuration);

    return (
      <span>
        {words.map((word, i) => (
          <span
            key={i}
            className={cn(
              'transition-all duration-200',
              i <= activeWordIndex ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {word}{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    );
  };

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

      {/* Report button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReportLyrics}
        className="absolute right-20 top-6 z-10 text-muted-foreground hover:text-foreground"
      >
        <Flag className="h-4 w-4 mr-2" />
        Report Issue
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
          className="h-full w-full max-w-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent px-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className={cn(
            'py-12 text-center',
            lineSpacingClasses[lyricsSettings.line_spacing]
          )}>
            {lyrics?.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, index) => {
                const isActive = index === activeLineIndex;
                const nextLine = lyrics.lines[index + 1];
                
                return (
                  <p
                    key={index}
                    ref={(el) => { lineRefs.current[index] = el; }}
                    onClick={() => setSelectedLine(selectedLine === index ? null : index)}
                    className={cn(
                      'font-medium transition-all duration-500 cursor-pointer select-text',
                      fontSizeClasses[lyricsSettings.font_size],
                      lyricsSettings.wrap_text ? 'whitespace-normal break-words' : 'whitespace-nowrap',
                      isActive
                        ? 'text-foreground scale-105 text-gradient-primary'
                        : index < activeLineIndex
                        ? 'text-muted-foreground/50 scale-100'
                        : 'text-muted-foreground/70 scale-100',
                      selectedLine === index && 'ring-2 ring-primary/50 rounded-lg p-2 bg-primary/5'
                    )}
                  >
                    {renderKaraokeLine(line.text, line.time, nextLine?.time, isActive)}
                    
                    {/* Selection actions */}
                    {selectedLine === index && (
                      <span className="flex items-center justify-center gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLyric(line.text);
                          }}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareLyric(line.text);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </span>
                    )}
                  </p>
                );
              })
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

      {/* Artist Notes */}
      {currentSong.artist_notes && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-lg text-center">
          <p className="text-sm text-muted-foreground italic">
            "{currentSong.artist_notes}" — {currentSong.artist?.display_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default LyricsModal;

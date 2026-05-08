import React from 'react';
import { Info, X, Calendar, Music2, User, Sparkles } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

const SongInfoDrawer: React.FC = () => {
  const { currentSong } = usePlayer();

  if (!currentSong) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Song Information</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Cover Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={currentSong.cover_url || '/placeholder.svg'}
              alt={currentSong.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{currentSong.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{currentSong.artist?.display_name || 'Unknown Artist'}</span>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            {currentSong.genre && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Music2 className="h-4 w-4" />
                  Genre
                </span>
                <Badge variant="secondary">{currentSong.genre}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Release Date
              </span>
              <span className="text-sm">
                {format(new Date(currentSong.created_at), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-sm">
                {Math.floor(currentSong.duration / 60)}:{String(currentSong.duration % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plays</span>
              <span className="text-sm">{currentSong.plays?.toLocaleString() || 0}</span>
            </div>
          </div>

          <Separator />

          {/* Lyrics Source */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Lyrics Source</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lyrics are auto-generated using AI transcription and may not be 100% accurate.
            </p>
          </div>

          {/* Artist Notes */}
          {currentSong.artist_notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Artist Notes</h4>
                <p className="text-sm text-muted-foreground">{currentSong.artist_notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SongInfoDrawer;

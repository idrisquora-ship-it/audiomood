import React from 'react';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineDownload } from '@/hooks/useOfflineDownload';
import { Song } from '@/hooks/useSongs';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DownloadButtonProps {
  song: Song;
  variant?: 'icon' | 'full';
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  song,
  variant = 'icon',
  className,
}) => {
  const { downloadSong, removeSong, isDownloaded, downloading } = useOfflineDownload();

  const downloaded = isDownloaded(song.id);
  const isDownloading = downloading === song.id;

  const handleClick = () => {
    if (downloaded) return;
    downloadSong(song);
  };

  if (downloaded) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={variant === 'icon' ? 'icon' : 'sm'}
            className={cn('text-primary', className)}
          >
            <Check className="h-4 w-4" />
            {variant === 'full' && <span className="ml-2">Downloaded</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => removeSong(song.id)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size={variant === 'icon' ? 'icon' : 'sm'}
      onClick={handleClick}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {variant === 'full' && (
        <span className="ml-2">{isDownloading ? 'Downloading...' : 'Download'}</span>
      )}
    </Button>
  );
};

export default DownloadButton;

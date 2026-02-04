import React, { useState } from 'react';
import { Heart, ListPlus, MoreHorizontal, Plus, Check } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuthContext } from '@/contexts/AuthContext';
import { Song } from '@/hooks/useSongs';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SongActionsProps {
  song: Song;
  variant?: 'icon' | 'menu';
  className?: string;
}

const SongActions: React.FC<SongActionsProps> = ({ song, variant = 'menu', className }) => {
  const { isAuthenticated } = useAuthContext();
  const { isLiked, toggleLike } = useLikes();
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();
  const { toast } = useToast();
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);

  const liked = isLiked(song.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like songs',
        variant: 'destructive',
      });
      return;
    }
    toggleLike(song.id);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    await addSongToPlaylist(playlistId, song.id);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setCreating(true);
    const playlist = await createPlaylist(newPlaylistName.trim());
    if (playlist) {
      await addSongToPlaylist(playlist.id, song.id);
    }
    setNewPlaylistName('');
    setShowNewPlaylist(false);
    setCreating(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLike}
        className={cn(
          'p-1.5 rounded-full transition-colors',
          liked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground',
          className
        )}
      >
        <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      </button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'p-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground hover:bg-muted',
              className
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleLike}>
            <Heart className={cn('mr-2 h-4 w-4', liked && 'fill-current text-destructive')} />
            {liked ? 'Unlike' : 'Like'}
          </DropdownMenuItem>
          
          {isAuthenticated && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ListPlus className="mr-2 h-4 w-4" />
                  Add to Playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem onClick={() => setShowNewPlaylist(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Playlist
                  </DropdownMenuItem>
                  {playlists.length > 0 && <DropdownMenuSeparator />}
                  {playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                    >
                      {playlist.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewPlaylist} onOpenChange={setShowNewPlaylist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlaylist(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist} disabled={creating || !newPlaylistName.trim()}>
              {creating ? 'Creating...' : 'Create & Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SongActions;

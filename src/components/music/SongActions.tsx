 import React, { useState } from 'react';
 import { Heart, ListPlus, MoreHorizontal, Plus, Music } from 'lucide-react';
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
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 interface SongActionsProps {
   song: Song;
   variant?: 'icon' | 'menu';
   className?: string;
 }
 
 // Separate dialog component for selecting playlist
 export const AddToPlaylistDialog: React.FC<{
   open: boolean;
   onOpenChange: (open: boolean) => void;
   song: Song;
 }> = ({ open, onOpenChange, song }) => {
   const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();
   const [showNewPlaylist, setShowNewPlaylist] = useState(false);
   const [newPlaylistName, setNewPlaylistName] = useState('');
   const [creating, setCreating] = useState(false);
 
   const handleAddToPlaylist = async (playlistId: string) => {
     await addSongToPlaylist(playlistId, song.id);
     onOpenChange(false);
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
     onOpenChange(false);
   };
 
   if (showNewPlaylist) {
     return (
       <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-sm">
           <DialogHeader>
             <DialogTitle>Create New Playlist</DialogTitle>
           </DialogHeader>
           <Input
             placeholder="Playlist name"
             value={newPlaylistName}
             onChange={(e) => setNewPlaylistName(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
             autoFocus
           />
           <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" onClick={() => setShowNewPlaylist(false)}>
               Back
             </Button>
             <Button onClick={handleCreatePlaylist} disabled={creating || !newPlaylistName.trim()}>
               {creating ? 'Creating...' : 'Create & Add'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     );
   }
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-sm">
         <DialogHeader>
           <DialogTitle>Add to Playlist</DialogTitle>
         </DialogHeader>
         <div className="space-y-2">
           <Button
             variant="outline"
             className="w-full justify-start"
             onClick={() => setShowNewPlaylist(true)}
           >
             <Plus className="mr-2 h-4 w-4" />
             Create New Playlist
           </Button>
           
           {playlists.length > 0 && (
             <ScrollArea className="max-h-60">
               <div className="space-y-1">
                 {playlists.map((playlist) => (
                   <Button
                     key={playlist.id}
                     variant="ghost"
                     className="w-full justify-start"
                     onClick={() => handleAddToPlaylist(playlist.id)}
                   >
                     <Music className="mr-2 h-4 w-4 text-muted-foreground" />
                     <span className="truncate">{playlist.title}</span>
                     <span className="ml-auto text-xs text-muted-foreground">
                       {playlist.songCount || 0} songs
                     </span>
                   </Button>
                 ))}
               </div>
             </ScrollArea>
           )}
           
           {playlists.length === 0 && (
             <p className="text-center text-sm text-muted-foreground py-4">
               No playlists yet. Create one to get started!
             </p>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 };
 
 const SongActions: React.FC<SongActionsProps> = ({ song, variant = 'menu', className }) => {
   const { isAuthenticated } = useAuthContext();
   const { isLiked, toggleLike } = useLikes();
   const { toast } = useToast();
   const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
 
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
 
   const handleOpenPlaylistDialog = (e?: React.MouseEvent) => {
     e?.stopPropagation();
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
 
   if (variant === 'icon') {
     return (
       <>
         <div className={cn('flex items-center gap-1', className)}>
           <button
             onClick={handleLike}
             className={cn(
               'p-1.5 rounded-full transition-colors',
               liked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
             )}
           >
             <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
           </button>
           <button
             onClick={handleOpenPlaylistDialog}
             className="p-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
           >
             <ListPlus className="h-4 w-4" />
           </button>
         </div>
         <AddToPlaylistDialog
           open={showPlaylistDialog}
           onOpenChange={setShowPlaylistDialog}
           song={song}
         />
       </>
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
               <DropdownMenuItem onClick={handleOpenPlaylistDialog}>
                 <ListPlus className="mr-2 h-4 w-4" />
                 Add to Playlist
               </DropdownMenuItem>
             </>
           )}
         </DropdownMenuContent>
       </DropdownMenu>
 
       <AddToPlaylistDialog
         open={showPlaylistDialog}
         onOpenChange={setShowPlaylistDialog}
         song={song}
       />
     </>
   );
 };
 
 export default SongActions;
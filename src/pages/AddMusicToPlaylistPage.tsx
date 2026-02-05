 import React, { useState, useEffect } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { ArrowLeft, Search, Music, Check, Plus } from 'lucide-react';
 import { useSongs, Song } from '@/hooks/useSongs';
 import { usePlaylists } from '@/hooks/usePlaylists';
 import { useAuthContext } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Skeleton } from '@/components/ui/skeleton';
 import { cn } from '@/lib/utils';
 
 const AddMusicToPlaylistPage: React.FC = () => {
   const { id: playlistId } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { isAuthenticated } = useAuthContext();
   const { songs, loading: songsLoading } = useSongs();
   const { getPlaylistWithSongs, addSongToPlaylist } = usePlaylists();
   
   const [searchQuery, setSearchQuery] = useState('');
   const [playlistSongIds, setPlaylistSongIds] = useState<string[]>([]);
   const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const loadPlaylist = async () => {
       if (!playlistId) return;
       setLoading(true);
       const playlist = await getPlaylistWithSongs(playlistId);
       if (playlist?.songs) {
         setPlaylistSongIds(playlist.songs.map(s => s.id));
       }
       setLoading(false);
     };
     loadPlaylist();
   }, [playlistId, getPlaylistWithSongs]);
 
   if (!isAuthenticated) {
     navigate('/login');
     return null;
   }
 
   const filteredSongs = songs.filter(song =>
     song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     song.artist?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleAddSong = async (song: Song) => {
     if (!playlistId) return;
     const isAlreadyInPlaylist = playlistSongIds.includes(song.id) || addedIds.has(song.id);
     if (isAlreadyInPlaylist) return;
     
     await addSongToPlaylist(playlistId, song.id);
     setAddedIds(prev => new Set([...prev, song.id]));
   };
 
   const isInPlaylist = (songId: string) => 
     playlistSongIds.includes(songId) || addedIds.has(songId);
 
   return (
     <div className="p-4 md:p-8">
       {/* Header */}
       <div className="mb-6 flex items-center gap-4">
         <Button
           variant="ghost"
           size="icon"
           onClick={() => navigate(`/playlist/${playlistId}`)}
         >
           <ArrowLeft className="h-5 w-5" />
         </Button>
         <div>
           <h1 className="text-xl md:text-2xl font-bold">Add Music</h1>
           <p className="text-sm text-muted-foreground">
             Browse and add songs to your playlist
           </p>
         </div>
       </div>
 
       {/* Search */}
       <div className="mb-6 relative">
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <Input
           placeholder="Search songs..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-10"
         />
       </div>
 
       {/* Songs List */}
       {loading || songsLoading ? (
         <div className="space-y-2">
           {Array(8).fill(0).map((_, i) => (
             <div key={i} className="flex items-center gap-3 p-2">
               <Skeleton className="h-12 w-12 rounded-md" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-4 w-40" />
                 <Skeleton className="h-3 w-24" />
               </div>
               <Skeleton className="h-8 w-8 rounded-full" />
             </div>
           ))}
         </div>
       ) : filteredSongs.length > 0 ? (
         <div className="space-y-1">
           {filteredSongs.map((song) => {
             const added = isInPlaylist(song.id);
             return (
               <div
                 key={song.id}
                 className="flex items-center gap-3 p-2 md:p-3 rounded-lg hover:bg-muted/50 transition-colors"
               >
                 {/* Cover */}
                 <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                   {song.cover_url ? (
                     <img
                       src={song.cover_url}
                       alt={song.title}
                       className="h-full w-full object-cover"
                     />
                   ) : (
                     <div className="flex h-full w-full items-center justify-center bg-muted">
                       <Music className="h-5 w-5 text-muted-foreground" />
                     </div>
                   )}
                 </div>
 
                 {/* Info */}
                 <div className="min-w-0 flex-1">
                   <p className="truncate text-sm font-medium">{song.title}</p>
                   <p className="truncate text-xs text-muted-foreground">
                     {song.artist?.display_name || 'Unknown Artist'}
                   </p>
                 </div>
 
                 {/* Add Button */}
                 <Button
                   variant={added ? 'secondary' : 'outline'}
                   size="icon"
                   className={cn('h-9 w-9 shrink-0', added && 'text-primary')}
                   onClick={() => handleAddSong(song)}
                   disabled={added}
                 >
                   {added ? (
                     <Check className="h-4 w-4" />
                   ) : (
                     <Plus className="h-4 w-4" />
                   )}
                 </Button>
               </div>
             );
           })}
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center py-16">
           <Music className="h-12 w-12 text-muted-foreground/50" />
           <h3 className="mt-4 text-lg font-semibold">No songs found</h3>
           <p className="mt-2 text-sm text-muted-foreground text-center">
             {searchQuery ? 'Try a different search term' : 'No music available yet'}
           </p>
         </div>
       )}
 
       {/* Done Button */}
       <div className="fixed bottom-20 md:bottom-8 left-0 right-0 p-4 md:pl-72 bg-gradient-to-t from-background via-background to-transparent">
         <Button
           className="w-full gradient-primary glow-primary"
           onClick={() => navigate(`/playlist/${playlistId}`)}
         >
           Done ({addedIds.size} added)
         </Button>
       </div>
     </div>
   );
 };
 
 export default AddMusicToPlaylistPage;
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Play, Music, Trash2, Loader2, Plus } from 'lucide-react';
import { usePlaylists, Playlist } from '@/hooks/usePlaylists';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuthContext } from '@/contexts/AuthContext';
import SongCard from '@/components/music/SongCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { getPlaylistWithSongs, deletePlaylist, removeSongFromPlaylist } = usePlaylists();
  const { playSong } = usePlayer();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getPlaylistWithSongs(id);
      setPlaylist(data);
      setLoading(false);
    };
    loadPlaylist();
  }, [id, getPlaylistWithSongs]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (deleted) {
    return <Navigate to="/library" replace />;
  }

  const handlePlayAll = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    const success = await deletePlaylist(id);
    if (success) {
      setDeleted(true);
    }
    setDeleting(false);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;
    await removeSongFromPlaylist(id, songId);
    // Refresh playlist
    const data = await getPlaylistWithSongs(id);
    setPlaylist(data);
  };

  const handleAddMusic = () => {
    navigate(`/playlist/${id}/add-music`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-end gap-6">
            <Skeleton className="h-32 w-32 md:h-48 md:w-48 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <Music className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold">Playlist not found</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
        <div className="flex h-32 w-32 md:h-48 md:w-48 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 shadow-xl shrink-0">
          {playlist.cover_url ? (
            <img
              src={playlist.cover_url}
              alt={playlist.title}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <Music className="h-16 w-16 md:h-24 md:w-24 text-white" />
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Playlist</p>
          <h1 className="mt-1 md:mt-2 text-3xl md:text-5xl font-bold">{playlist.title}</h1>
          <p className="mt-2 md:mt-4 text-sm md:text-base text-muted-foreground">
            {playlist.songs?.length || 0} songs
          </p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {playlist.songs && playlist.songs.length > 0 ? (
              <Button
                onClick={handlePlayAll}
                className="gradient-primary glow-primary"
                size="sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            ) : null}
            <Button
              onClick={handleAddMusic}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Music
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{playlist.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Songs List */}
      {playlist.songs && playlist.songs.length > 0 ? (
        <div className="space-y-1">
          {playlist.songs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-2 md:gap-4 group">
              <span className="w-6 md:w-8 text-center text-xs md:text-sm text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <SongCard song={song} variant="row" queue={playlist.songs} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 md:opacity-0"
                onClick={() => handleRemoveSong(song.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
          <Music className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg md:text-xl font-semibold">No songs in this playlist</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Add songs to get started
          </p>
          <Button
            onClick={handleAddMusic}
            className="mt-4 gradient-primary glow-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Music
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;

import React, { useState } from 'react';
import { Library, Plus, Music } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useLikes } from '@/hooks/useLikes';
import { useStreams } from '@/hooks/useStreams';
import { useAuthContext } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const LibraryPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { playlists, loading: playlistsLoading, createPlaylist } = usePlaylists();
  const { likedSongs, loading: likesLoading } = useLikes();
  const { recentlyPlayed, loading: streamsLoading } = useStreams();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    
    setCreating(true);
    const playlist = await createPlaylist(newPlaylistTitle, isPublic);
    setCreating(false);
    
    if (playlist) {
      setIsCreateOpen(false);
      setNewPlaylistTitle('');
      setIsPublic(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20">
        <Library className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold">Sign in to view your library</h2>
        <p className="mt-2 text-muted-foreground">
          Your playlists, liked songs, and listening history will appear here
        </p>
        <Link to="/login">
          <Button className="mt-6 gradient-primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Library className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Library</h1>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Playlist Name</Label>
                <Input
                  id="title"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Make Public</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistTitle.trim() || creating}
                className="w-full gradient-primary"
              >
                {creating ? 'Creating...' : 'Create Playlist'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link to="/liked">
          <Card className="group flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Liked Songs</h3>
              <p className="text-sm text-muted-foreground">
                {likesLoading ? '...' : `${likedSongs.length} songs`}
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Playlists */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Your Playlists</h2>
        {playlistsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-muted/30">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlists.map(playlist => (
              <Card
                key={playlist.id}
                className="group overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                <div className="aspect-square relative">
                  {playlist.cover_url ? (
                    <img
                      src={playlist.cover_url}
                      alt={playlist.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Music className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{playlist.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {playlist.songCount} songs
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No playlists yet. Create one!</p>
          </div>
        )}
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Recently Played</h2>
          {streamsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="flex items-center gap-3 p-3 bg-muted/30">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyPlayed.slice(0, 4).map(song => (
                <Card key={song.id} className="flex items-center gap-3 p-3 bg-muted/30">
                  <img
                    src={song.cover_url || '/placeholder.svg'}
                    alt={song.title}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist?.display_name}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default LibraryPage;

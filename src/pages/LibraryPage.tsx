import React, { useState } from 'react';
import { Library, Plus, Music, Download } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useLikes } from '@/hooks/useLikes';
import { useStreams } from '@/hooks/useStreams';
import { useOfflineDownload } from '@/hooks/useOfflineDownload';
import { useAuthContext } from '@/contexts/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import SongCard from '@/components/music/SongCard';

const LibraryPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { playlists, loading: playlistsLoading, createPlaylist } = usePlaylists();
  const { likedSongs, loading: likesLoading } = useLikes();
  const { recentlyPlayed, loading: streamsLoading } = useStreams();
  const { downloadedSongs, isOnline } = useOfflineDownload();
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

  return (
    <AuthGate>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Library className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Your Library</h1>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary w-full sm:w-auto">
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

        {/* Offline Status Banner */}
        {!isOnline && (
          <div className="mb-6 rounded-lg bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary">
              📶 You're offline. Only downloaded songs are available.
            </p>
          </div>
        )}

        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="downloads">
              Downloads ({downloadedSongs.length})
            </TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists">
            {/* Quick Access */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
              <Link to="/liked">
                <Card className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <Music className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Liked Songs</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {likesLoading ? '...' : `${likedSongs.length} songs`}
                    </p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Playlists */}
            {playlistsLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-muted/30">
                    <Skeleton className="aspect-square" />
                    <div className="p-3 md:p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : playlists.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          <Music className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-sm md:text-base truncate">{playlist.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
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
          </TabsContent>

          <TabsContent value="downloads">
            {downloadedSongs.length > 0 ? (
              <div className="space-y-1">
                {downloadedSongs.map((song, index) => (
                  <div key={song.id} className="flex items-center gap-2 md:gap-4">
                    <span className="w-6 md:w-8 text-center text-xs md:text-sm text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <SongCard song={song} variant="row" queue={downloadedSongs} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Download className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No downloads yet</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Download songs to listen offline
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {streamsLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="flex items-center gap-3 p-3 bg-muted/30">
                    <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : recentlyPlayed.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                {recentlyPlayed.map(song => (
                  <Card key={song.id} className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <img
                      src={song.cover_url || '/placeholder.svg'}
                      alt={song.title}
                      className="h-10 w-10 md:h-12 md:w-12 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist?.display_name}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Music className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No listening history yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGate>
  );
};

export default LibraryPage;

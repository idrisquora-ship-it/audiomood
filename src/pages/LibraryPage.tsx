import React from 'react';
import { Library, Plus, Music } from 'lucide-react';
import { mockPlaylists, mockSongs } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LibraryPage: React.FC = () => {
  const { likedSongs, recentlyPlayed } = useUser();

  const likedSongsList = likedSongs
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean);

  const recentlyPlayedSongs = recentlyPlayed
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Library className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Library</h1>
        </div>
        <Link to="/playlists/create">
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Playlist
          </Button>
        </Link>
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
                {likedSongsList.length} songs
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Playlists */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Your Playlists</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPlaylists.map(playlist => {
            const playlistSongs = playlist.songIds
              .map(id => mockSongs.find(s => s.id === id))
              .filter(Boolean);

            return (
              <Link key={playlist.id} to={`/playlists/${playlist.id}`}>
                <Card className="group overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="aspect-square relative">
                    {playlist.coverUrl ? (
                      <img
                        src={playlist.coverUrl}
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
                      {playlistSongs.length} songs
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayedSongs.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Recently Played</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyPlayedSongs.map(song => song && (
              <Card key={song.id} className="flex items-center gap-3 p-3 bg-muted/30">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artistName}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LibraryPage;

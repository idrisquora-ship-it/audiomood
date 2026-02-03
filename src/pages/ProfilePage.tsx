import React from 'react';
import { User, Settings, Music, Heart, Users, Sparkles } from 'lucide-react';
import { mockSongs, mockArtists } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SongCard from '@/components/music/SongCard';
import ArtistCard from '@/components/music/ArtistCard';

const ProfilePage: React.FC = () => {
  const {
    user,
    role,
    likedSongs,
    recentlyPlayed,
    followedArtists,
    upgradeToArtist,
  } = useUser();

  const likedSongsList = likedSongs
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean) as typeof mockSongs;

  const recentlyPlayedSongs = recentlyPlayed
    .map(id => mockSongs.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 6) as typeof mockSongs;

  const followedArtistsList = followedArtists
    .map(id => mockArtists.find(a => a.id === id))
    .filter(Boolean) as typeof mockArtists;

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-6">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="h-32 w-32 rounded-full bg-muted ring-4 ring-primary/20"
        />
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase">
            {role}
          </p>
          <h1 className="mt-1 text-4xl font-bold">{user.displayName}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {likedSongs.length} liked songs
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {followedArtists.length} following
            </span>
          </div>
          {role === 'listener' && (
            <Button
              onClick={upgradeToArtist}
              className="mt-4 gradient-primary glow-primary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Become an Artist
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentlyPlayed.length}</p>
              <p className="text-sm text-muted-foreground">Songs Played</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{likedSongs.length}</p>
              <p className="text-sm text-muted-foreground">Liked Songs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{followedArtists.length}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Played */}
      {recentlyPlayedSongs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Recently Played</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyPlayedSongs.map(song => (
              <SongCard key={song.id} song={song} queue={recentlyPlayedSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Following */}
      {followedArtistsList.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Following</h2>
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {followedArtistsList.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;

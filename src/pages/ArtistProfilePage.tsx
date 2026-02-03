import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Play, Users, Music, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFollows } from '@/hooks/useFollows';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/hooks/useSongs';
import SongCard from '@/components/music/SongCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface ArtistProfile {
  id: string;
  display_name: string;
  avatar: string | null;
  role: string;
  created_at: string;
}

const ArtistProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile: currentUser } = useAuthContext();
  const { isFollowing, toggleFollow, followedArtists } = useFollows();
  const { playSong } = usePlayer();
  
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchArtistData = async () => {
      setLoading(true);
      setError(false);
      
      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (artistError || !artistData) {
        setError(true);
        setLoading(false);
        return;
      }

      setArtist(artistData as ArtistProfile);

      // Fetch artist songs
      const { data: songsData } = await supabase
        .from('songs')
        .select(`
          *,
          artist:profiles!songs_artist_id_fkey (
            id,
            display_name,
            avatar
          )
        `)
        .eq('artist_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (songsData) {
        setSongs(songsData as Song[]);
      }

      // Fetch follower count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', id);

      setFollowerCount(count || 0);
      setLoading(false);
    };

    fetchArtistData();
  }, [id]);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  if (error) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8 flex flex-col items-center gap-4 md:gap-6 sm:flex-row">
          <Skeleton className="h-28 w-28 md:h-40 md:w-40 rounded-full" />
          <div className="space-y-3 text-center sm:text-left">
            <Skeleton className="h-6 md:h-8 w-36 md:w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-24 md:w-32 mx-auto sm:mx-0" />
            <Skeleton className="h-10 w-24 mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return <Navigate to="/" replace />;
  }

  const isOwnProfile = currentUser?.id === artist.id;
  const totalPlays = songs.reduce((sum, song) => sum + song.plays, 0);

  return (
    <div className="p-4 md:p-8">
      {/* Artist Header */}
      <div className="mb-6 md:mb-8 flex flex-col items-center gap-4 md:gap-6 sm:flex-row">
        <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-primary/20">
          <AvatarImage src={artist.avatar || undefined} alt={artist.display_name} />
          <AvatarFallback className="text-3xl md:text-5xl bg-gradient-to-br from-primary to-accent text-white">
            {artist.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center sm:text-left">
          <p className="text-xs md:text-sm font-medium text-muted-foreground capitalize mb-1">
            {artist.role}
          </p>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{artist.display_name}</h1>
          
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-4 sm:justify-start">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              {followerCount} followers
            </span>
            <span className="flex items-center gap-1">
              <Music className="h-3 w-3 md:h-4 md:w-4" />
              {songs.length} songs
            </span>
            <span>{totalPlays.toLocaleString()} plays</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:justify-start">
            {songs.length > 0 && (
              <Button onClick={handlePlayAll} className="gradient-primary glow-primary">
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            )}
            
            {!isOwnProfile && (
              <Button
                variant={isFollowing(artist.id) ? 'outline' : 'default'}
                onClick={() => toggleFollow(artist.id)}
              >
                {isFollowing(artist.id) ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <section>
        <h2 className="mb-4 text-lg md:text-xl font-semibold">
          {artist.role === 'artist' ? 'Songs' : 'Public Playlists'}
        </h2>
        
        {songs.length > 0 ? (
          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queue={songs}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {artist.role === 'artist' 
                ? 'No songs uploaded yet' 
                : 'No public content'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistProfilePage;

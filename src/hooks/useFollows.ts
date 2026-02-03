import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FollowedArtist {
  id: string;
  display_name: string;
  avatar: string | null;
}

export function useFollows() {
  const { profile, isAuthenticated } = useAuthContext();
  const [followedArtistIds, setFollowedArtistIds] = useState<string[]>([]);
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollowedArtists = useCallback(async () => {
    if (!profile) {
      setFollowedArtistIds([]);
      setFollowedArtists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('follows')
      .select(`
        artist_id,
        artist:profiles!follows_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('follower_id', profile.id);

    if (error) {
      console.error('Error fetching followed artists:', error);
    } else {
      const ids = data.map(f => f.artist_id);
      const artists = data.map(f => f.artist).filter(Boolean) as FollowedArtist[];
      setFollowedArtistIds(ids);
      setFollowedArtists(artists);
    }
    setLoading(false);
  }, [profile]);

  const toggleFollow = useCallback(async (artistId: string) => {
    if (!profile || !isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to follow artists',
        variant: 'destructive',
      });
      return;
    }

    if (artistId === profile.id) {
      toast({
        title: 'Cannot follow yourself',
        variant: 'destructive',
      });
      return;
    }

    const isFollowing = followedArtistIds.includes(artistId);

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', profile.id)
        .eq('artist_id', artistId);

      if (error) {
        console.error('Error unfollowing:', error);
        toast({
          title: 'Error',
          description: 'Failed to unfollow artist',
          variant: 'destructive',
        });
      } else {
        setFollowedArtistIds(prev => prev.filter(id => id !== artistId));
        setFollowedArtists(prev => prev.filter(a => a.id !== artistId));
        toast({
          title: 'Unfollowed',
        });
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: profile.id, artist_id: artistId });

      if (error) {
        console.error('Error following:', error);
        toast({
          title: 'Error',
          description: 'Failed to follow artist',
          variant: 'destructive',
        });
      } else {
        setFollowedArtistIds(prev => [...prev, artistId]);
        
        // Fetch artist info
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .eq('id', artistId)
          .single();

        if (data) {
          setFollowedArtists(prev => [...prev, data as FollowedArtist]);
        }
        
        toast({
          title: 'Following',
        });
      }
    }
  }, [profile, isAuthenticated, followedArtistIds, toast]);

  const isFollowing = useCallback((artistId: string) => {
    return followedArtistIds.includes(artistId);
  }, [followedArtistIds]);

  useEffect(() => {
    fetchFollowedArtists();
  }, [fetchFollowedArtists]);

  return {
    followedArtistIds,
    followedArtists,
    loading,
    toggleFollow,
    isFollowing,
    fetchFollowedArtists,
  };
}

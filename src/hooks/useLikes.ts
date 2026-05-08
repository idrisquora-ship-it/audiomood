import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Song } from './useSongs';

export function useLikes() {
  const { profile, isAuthenticated } = useAuthContext();
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLikedSongs = useCallback(async () => {
    if (!profile) {
      setLikedSongIds([]);
      setLikedSongs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('likes')
      .select(`
        song_id,
        songs:songs (
          *,
          artist:profiles!songs_artist_id_fkey (
            id,
            display_name,
            avatar
          )
        )
      `)
      .eq('user_id', profile.id);

    if (error) {
      console.error('Error fetching liked songs:', error);
    } else {
      const ids = data.map(l => l.song_id);
      const songs = data.map(l => l.songs).filter(Boolean) as Song[];
      setLikedSongIds(ids);
      setLikedSongs(songs);
    }
    setLoading(false);
  }, [profile]);

  const toggleLike = useCallback(async (songId: string) => {
    if (!profile || !isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like songs',
        variant: 'destructive',
      });
      return;
    }

    const isLiked = likedSongIds.includes(songId);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', profile.id)
        .eq('song_id', songId);

      if (error) {
        console.error('Error unliking song:', error);
        toast({
          title: 'Error',
          description: 'Failed to unlike song',
          variant: 'destructive',
        });
      } else {
        setLikedSongIds(prev => prev.filter(id => id !== songId));
        setLikedSongs(prev => prev.filter(s => s.id !== songId));
      }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: profile.id, song_id: songId });

      if (error) {
        console.error('Error liking song:', error);
        toast({
          title: 'Error',
          description: 'Failed to like song',
          variant: 'destructive',
        });
      } else {
        setLikedSongIds(prev => [...prev, songId]);
        // Fetch the full song data
        const { data } = await supabase
          .from('songs')
          .select(`
            *,
            artist:profiles!songs_artist_id_fkey (
              id,
              display_name,
              avatar
            )
          `)
          .eq('id', songId)
          .single();

        if (data) {
          setLikedSongs(prev => [...prev, data as Song]);
        }
      }
    }
  }, [profile, isAuthenticated, likedSongIds, toast]);

  const isLiked = useCallback((songId: string) => {
    return likedSongIds.includes(songId);
  }, [likedSongIds]);

  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  return {
    likedSongIds,
    likedSongs,
    loading,
    toggleLike,
    isLiked,
    fetchLikedSongs,
  };
}

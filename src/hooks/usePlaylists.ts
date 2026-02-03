import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Song } from './useSongs';

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  songs?: Song[];
  songCount?: number;
}

export function usePlaylists() {
  const { profile, isAuthenticated } = useAuthContext();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlaylists = useCallback(async () => {
    if (!profile) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs (
          song_id
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
    } else {
      const playlistsWithCount = data.map(p => ({
        ...p,
        songCount: p.playlist_songs?.length || 0,
      }));
      setPlaylists(playlistsWithCount as Playlist[]);
    }
    setLoading(false);
  }, [profile]);

  const createPlaylist = useCallback(async (title: string, isPublic: boolean = false) => {
    if (!profile || !isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to create playlists',
        variant: 'destructive',
      });
      return null;
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: profile.id,
        title,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create playlist',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Playlist created',
      description: `"${title}" has been created`,
    });

    await fetchPlaylists();
    return data as Playlist;
  }, [profile, isAuthenticated, toast, fetchPlaylists]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    if (!profile) return false;

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', profile.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete playlist',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Playlist deleted',
    });

    await fetchPlaylists();
    return true;
  }, [profile, toast, fetchPlaylists]);

  const addSongToPlaylist = useCallback(async (playlistId: string, songId: string) => {
    if (!profile) return false;

    // Get current max order_index
    const { data: existing } = await supabase
      .from('playlist_songs')
      .select('order_index')
      .eq('playlist_id', playlistId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        order_index: nextIndex,
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already added',
          description: 'This song is already in the playlist',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add song to playlist',
          variant: 'destructive',
        });
      }
      return false;
    }

    toast({
      title: 'Added to playlist',
    });

    await fetchPlaylists();
    return true;
  }, [profile, toast, fetchPlaylists]);

  const removeSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    if (!profile) return false;

    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove song from playlist',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Removed from playlist',
    });

    await fetchPlaylists();
    return true;
  }, [profile, toast, fetchPlaylists]);

  const getPlaylistWithSongs = useCallback(async (playlistId: string) => {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs (
          order_index,
          songs:songs (
            *,
            artist:profiles!songs_artist_id_fkey (
              id,
              display_name,
              avatar
            )
          )
        )
      `)
      .eq('id', playlistId)
      .single();

    if (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }

    const songs = data.playlist_songs
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .map((ps: any) => ps.songs)
      .filter(Boolean) as Song[];

    return {
      ...data,
      songs,
    } as Playlist;
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    loading,
    fetchPlaylists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylistWithSongs,
  };
}

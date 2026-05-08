import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Song {
  id: string;
  artist_id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  duration: number;
  genre: string | null;
  plays: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  artist_notes?: string | null;
  artist?: {
    id: string;
    display_name: string;
    avatar: string | null;
  };
}

export interface Artist {
  id: string;
  display_name: string;
  avatar: string | null;
  role: string;
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load songs',
        variant: 'destructive',
      });
    } else {
      setSongs(data as Song[]);
    }
    setLoading(false);
  }, [toast]);

  const getTrendingSongs = useCallback(async (limit = 10) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .order('plays', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending songs:', error);
      return [];
    }
    return data as Song[];
  }, []);

  const getRecentSongs = useCallback(async (limit = 10) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent songs:', error);
      return [];
    }
    return data as Song[];
  }, []);

  const getSongsByArtist = useCallback(async (artistId: string) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artist songs:', error);
      return [];
    }
    return data as Song[];
  }, []);

  const searchSongs = useCallback(async (query: string) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .or(`title.ilike.%${query}%,genre.ilike.%${query}%`)
      .order('plays', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching songs:', error);
      return [];
    }
    return data as Song[];
  }, []);

  const recordStream = useCallback(async (songId: string, profileId: string, durationPlayed: number) => {
    const { error } = await supabase
      .from('streams')
      .insert({
        song_id: songId,
        user_id: profileId,
        duration_played: durationPlayed,
      });

    if (error) {
      console.error('Error recording stream:', error);
    }

    // Increment plays count
    await supabase.rpc('increment_song_plays', { song_uuid: songId });
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return {
    songs,
    loading,
    fetchSongs,
    getTrendingSongs,
    getRecentSongs,
    getSongsByArtist,
    searchSongs,
    recordStream,
  };
}

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'artist')
      .order('display_name');

    if (error) {
      console.error('Error fetching artists:', error);
    } else {
      setArtists(data as Artist[]);
    }
    setLoading(false);
  }, []);

  const searchArtists = useCallback(async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'artist')
      .ilike('display_name', `%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching artists:', error);
      return [];
    }
    return data as Artist[];
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  return {
    artists,
    loading,
    fetchArtists,
    searchArtists,
  };
}

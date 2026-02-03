import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Song } from './useSongs';

interface Stream {
  id: string;
  song_id: string;
  user_id: string | null;
  played_at: string;
  duration_played: number;
  songs?: Song;
}

interface DailyStats {
  date: string;
  count: number;
}

export function useStreams() {
  const { profile } = useAuthContext();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentlyPlayed = useCallback(async () => {
    if (!profile) {
      setRecentlyPlayed([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('streams')
      .select(`
        song_id,
        played_at,
        songs:songs (
          *,
          artist:profiles!songs_artist_id_fkey (
            id,
            display_name,
            avatar
          )
        )
      `)
      .eq('user_id', profile.id)
      .order('played_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching recently played:', error);
    } else {
      // Remove duplicates, keep most recent
      const seen = new Set<string>();
      const uniqueSongs = data
        .filter(s => {
          if (seen.has(s.song_id)) return false;
          seen.add(s.song_id);
          return true;
        })
        .map(s => s.songs)
        .filter(Boolean) as Song[];
      
      setRecentlyPlayed(uniqueSongs);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [fetchRecentlyPlayed]);

  return {
    recentlyPlayed,
    loading,
    fetchRecentlyPlayed,
  };
}

export function useArtistStats() {
  const { profile, isArtist } = useAuthContext();
  const [stats, setStats] = useState({
    totalStreams: 0,
    monthlyListeners: 0,
    followers: 0,
    topSongs: [] as Song[],
    recentPlays: [] as DailyStats[],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!profile || !isArtist) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get total streams for artist's songs
    const { data: songs } = await supabase
      .from('songs')
      .select('id, plays')
      .eq('artist_id', profile.id);

    const songIds = songs?.map(s => s.id) || [];
    const totalStreams = songs?.reduce((acc, s) => acc + s.plays, 0) || 0;

    // Get monthly listeners (unique users in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let monthlyListeners = 0;
    if (songIds.length > 0) {
      const { data: streams } = await supabase
        .from('streams')
        .select('user_id')
        .in('song_id', songIds)
        .gte('played_at', thirtyDaysAgo.toISOString());

      const uniqueUsers = new Set(streams?.map(s => s.user_id).filter(Boolean));
      monthlyListeners = uniqueUsers.size;
    }

    // Get followers count
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id);

    // Get top songs
    const { data: topSongsData } = await supabase
      .from('songs')
      .select(`
        *,
        artist:profiles!songs_artist_id_fkey (
          id,
          display_name,
          avatar
        )
      `)
      .eq('artist_id', profile.id)
      .order('plays', { ascending: false })
      .limit(5);

    // Get daily plays for last 7 days
    const recentPlays: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (songIds.length > 0) {
        const { count } = await supabase
          .from('streams')
          .select('*', { count: 'exact', head: true })
          .in('song_id', songIds)
          .gte('played_at', `${dateStr}T00:00:00`)
          .lt('played_at', `${dateStr}T23:59:59`);

        recentPlays.push({ date: dateStr, count: count || 0 });
      } else {
        recentPlays.push({ date: dateStr, count: 0 });
      }
    }

    setStats({
      totalStreams,
      monthlyListeners,
      followers: followers || 0,
      topSongs: (topSongsData as Song[]) || [],
      recentPlays,
    });
    setLoading(false);
  }, [profile, isArtist]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}

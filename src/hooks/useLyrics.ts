import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LyricLine {
  time: number;
  text: string;
}

interface Lyrics {
  lines: LyricLine[];
}

export function useLyrics() {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLyrics = useCallback(async (songId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lyrics')
      .select('lyrics_json')
      .eq('song_id', songId)
      .single();

    if (error) {
      console.error('Error fetching lyrics:', error);
      setLyrics(null);
    } else {
      const lyricsData = data.lyrics_json as unknown as Lyrics;
      setLyrics(lyricsData);
    }
    setLoading(false);
  }, []);

  const clearLyrics = useCallback(() => {
    setLyrics(null);
  }, []);

  return {
    lyrics,
    loading,
    fetchLyrics,
    clearLyrics,
  };
}

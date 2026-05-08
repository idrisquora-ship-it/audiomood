import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Song } from '@/hooks/useSongs';
import { supabase } from '@/integrations/supabase/client';

export type RepeatMode = 'off' | 'one' | 'all';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
  showLyrics: boolean;
  queue: Song[];
  queueIndex: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMinimize: () => void;
  toggleLyrics: () => void;
  nextSong: () => void;
  previousSong: () => void;
  addToQueue: (song: Song) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [streamRecorded, setStreamRecorded] = useState<string | null>(null);
  const streamRecordedRef = useRef<string | null>(null);
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef(0);
  const repeatModeRef = useRef<RepeatMode>('off');
  const shuffleRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);
  useEffect(() => { streamRecordedRef.current = streamRecorded; }, [streamRecorded]);

  const recordStream = useCallback(async (songId: string, durationPlayed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return;
      await supabase.from('streams').insert({
        song_id: songId,
        user_id: profile.id,
        duration_played: Math.floor(durationPlayed),
      });
      await supabase.rpc('increment_song_plays', { song_uuid: songId });
    } catch (err) {
      console.error('Error recording stream:', err);
    }
  }, []);

  // Setup audio event listeners ONCE
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0.7;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const song = currentSongRef.current;
      if (audio.currentTime >= 30 && song && streamRecordedRef.current !== song.id) {
        streamRecordedRef.current = song.id;
        setStreamRecorded(song.id);
        recordStream(song.id, audio.currentTime);
      }
    };

    const handleDurationChange = () => setDuration(audio.duration || 0);

    const handleEnded = () => {
      const song = currentSongRef.current;
      if (song && streamRecordedRef.current !== song.id) {
        recordStream(song.id, audio.duration || audio.currentTime);
        streamRecordedRef.current = song.id;
        setStreamRecorded(song.id);
      }

      const rm = repeatModeRef.current;
      const q = queueRef.current;
      const idx = queueIndexRef.current;

      if (rm === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }

      if (idx < q.length - 1) {
        const nextIdx = shuffleRef.current
          ? Math.floor(Math.random() * q.length)
          : idx + 1;
        setQueueIndex(nextIdx);
      } else if (rm === 'all' && q.length > 0) {
        setQueueIndex(shuffleRef.current ? Math.floor(Math.random() * q.length) : 0);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [recordStream]);

  // Play song when queueIndex changes
  useEffect(() => {
    if (queue.length > 0 && queue[queueIndex]) {
      const song = queue[queueIndex];
      if (currentSong?.id !== song.id) {
        setCurrentSong(song);
        setStreamRecorded(null);
        streamRecordedRef.current = null;
        const audio = audioRef.current;
        audio.src = song.audio_url;
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  }, [queueIndex, queue]);

  const playSong = useCallback((song: Song, songQueue?: Song[]) => {
    if (songQueue) {
      setQueue(songQueue);
      const index = songQueue.findIndex(s => s.id === song.id);
      setQueueIndex(index >= 0 ? index : 0);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }

    setCurrentSong(song);
    setStreamRecorded(null);
    streamRecordedRef.current = null;

    const audio = audioRef.current;
    audio.src = song.audio_url;
    audio.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong]);

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    audioRef.current.volume = newVolume;
    setVolumeState(newVolume);
  }, []);

  const toggleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);
  const toggleLyrics = useCallback(() => setShowLyrics(prev => !prev), []);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;
    if (shuffle) {
      setQueueIndex(Math.floor(Math.random() * queue.length));
    } else {
      setQueueIndex((queueIndex + 1) % queue.length);
    }
  }, [queue, queueIndex, shuffle]);

  const previousSong = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (shuffle) {
      setQueueIndex(Math.floor(Math.random() * queue.length));
    } else {
      setQueueIndex(queueIndex === 0 ? queue.length - 1 : queueIndex - 1);
    }
  }, [queue, queueIndex, currentTime, seek, shuffle]);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(prev => !prev), []);
  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, currentTime, duration, volume,
        isMinimized, showLyrics, queue, queueIndex, shuffle, repeatMode,
        playSong, togglePlay, seek, setVolume, toggleMinimize, toggleLyrics,
        nextSong, previousSong, addToQueue, toggleShuffle, cycleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

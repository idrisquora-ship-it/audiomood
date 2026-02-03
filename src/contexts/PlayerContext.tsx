import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Song } from '@/hooks/useSongs';

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
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMinimize: () => void;
  toggleLyrics: () => void;
  nextSong: () => void;
  previousSong: () => void;
  addToQueue: (song: Song) => void;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const audio = audioRef.current;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => { if (queueIndex < queue.length - 1) { setQueueIndex(prev => prev + 1); } else { setIsPlaying(false); } };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    return () => { audio.removeEventListener('timeupdate', handleTimeUpdate); audio.removeEventListener('durationchange', handleDurationChange); audio.removeEventListener('ended', handleEnded); audio.pause(); };
  }, []);

  const playSong = useCallback((song: Song, songQueue?: Song[]) => {
    if (songQueue) { setQueue(songQueue); const index = songQueue.findIndex(s => s.id === song.id); setQueueIndex(index >= 0 ? index : 0); } else if (queue.length === 0) { setQueue([song]); setQueueIndex(0); }
    setCurrentSong(song);
    if (audioRef.current) { audioRef.current.src = song.audio_url; audioRef.current.play().catch(console.error); setIsPlaying(true); }
  }, [queue]);

  const togglePlay = useCallback(() => { if (!audioRef.current || !currentSong) return; if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(console.error); } setIsPlaying(!isPlaying); }, [isPlaying, currentSong]);
  const seek = useCallback((time: number) => { if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); } }, []);
  const setVolume = useCallback((newVolume: number) => { if (audioRef.current) { audioRef.current.volume = newVolume; } setVolumeState(newVolume); }, []);
  const toggleMinimize = useCallback(() => { setIsMinimized(!isMinimized); }, [isMinimized]);
  const toggleLyrics = useCallback(() => { setShowLyrics(!showLyrics); }, [showLyrics]);
  const nextSong = useCallback(() => { if (queue.length === 0) return; const nextIndex = (queueIndex + 1) % queue.length; setQueueIndex(nextIndex); const song = queue[nextIndex]; setCurrentSong(song); if (audioRef.current) { audioRef.current.src = song.audio_url; audioRef.current.play().catch(console.error); setIsPlaying(true); } }, [queue, queueIndex]);
  const previousSong = useCallback(() => { if (queue.length === 0) return; if (currentTime > 3) { seek(0); return; } const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1; setQueueIndex(prevIndex); const song = queue[prevIndex]; setCurrentSong(song); if (audioRef.current) { audioRef.current.src = song.audio_url; audioRef.current.play().catch(console.error); setIsPlaying(true); } }, [queue, queueIndex, currentTime, seek]);
  const addToQueue = useCallback((song: Song) => { setQueue(prev => [...prev, song]); }, []);

  return (
    <PlayerContext.Provider value={{ currentSong, isPlaying, currentTime, duration, volume, isMinimized, showLyrics, queue, queueIndex, playSong, togglePlay, seek, setVolume, toggleMinimize, toggleLyrics, nextSong, previousSong, addToQueue }}>
      {children}
    </PlayerContext.Provider>
  );
};

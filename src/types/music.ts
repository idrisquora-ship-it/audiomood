export type UserRole = 'listener' | 'artist';

export interface User {
  id: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  createdAt: Date;
}

export interface Song {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  audioUrl: string;
  coverUrl: string;
  duration: number; // in seconds
  genre: string;
  createdAt: Date;
  plays: number;
}

export interface Lyrics {
  id: string;
  songId: string;
  lines: LyricLine[];
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  coverUrl?: string;
  isPublic: boolean;
  songIds: string[];
  createdAt: Date;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMinimized: boolean;
  showLyrics: boolean;
  queue: Song[];
  queueIndex: number;
}

export interface ArtistStats {
  totalStreams: number;
  monthlyListeners: number;
  followers: number;
  topSongs: Song[];
  recentPlays: { date: string; count: number }[];
}

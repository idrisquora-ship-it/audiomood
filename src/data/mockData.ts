import { Song, Playlist, Lyrics, User } from '@/types/music';

export const mockArtists: User[] = [
  {
    id: 'artist-1',
    displayName: 'Neon Dreams',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    role: 'artist',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'artist-2',
    displayName: 'Crystal Wave',
    avatar: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop',
    role: 'artist',
    createdAt: new Date('2023-03-20'),
  },
  {
    id: 'artist-3',
    displayName: 'Midnight Echo',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
    role: 'artist',
    createdAt: new Date('2023-05-10'),
  },
  {
    id: 'artist-4',
    displayName: 'Aurora Beats',
    avatar: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop',
    role: 'artist',
    createdAt: new Date('2023-06-25'),
  },
];

export const mockSongs: Song[] = [
  {
    id: 'song-1',
    artistId: 'artist-1',
    artistName: 'Neon Dreams',
    title: 'Electric Sunset',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    duration: 237,
    genre: 'Electronic',
    createdAt: new Date('2024-01-10'),
    plays: 125000,
  },
  {
    id: 'song-2',
    artistId: 'artist-2',
    artistName: 'Crystal Wave',
    title: 'Ocean of Stars',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    duration: 195,
    genre: 'Ambient',
    createdAt: new Date('2024-01-08'),
    plays: 89000,
  },
  {
    id: 'song-3',
    artistId: 'artist-3',
    artistName: 'Midnight Echo',
    title: 'Shadows Dance',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    duration: 268,
    genre: 'Synthwave',
    createdAt: new Date('2024-01-05'),
    plays: 156000,
  },
  {
    id: 'song-4',
    artistId: 'artist-4',
    artistName: 'Aurora Beats',
    title: 'Northern Lights',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
    duration: 312,
    genre: 'Chillwave',
    createdAt: new Date('2024-01-03'),
    plays: 203000,
  },
  {
    id: 'song-5',
    artistId: 'artist-1',
    artistName: 'Neon Dreams',
    title: 'City Lights',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
    duration: 245,
    genre: 'Electronic',
    createdAt: new Date('2024-01-01'),
    plays: 178000,
  },
  {
    id: 'song-6',
    artistId: 'artist-2',
    artistName: 'Crystal Wave',
    title: 'Deep Blue',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    duration: 289,
    genre: 'Ambient',
    createdAt: new Date('2023-12-28'),
    plays: 67000,
  },
  {
    id: 'song-7',
    artistId: 'artist-3',
    artistName: 'Midnight Echo',
    title: 'Velvet Night',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop',
    duration: 256,
    genre: 'Synthwave',
    createdAt: new Date('2023-12-25'),
    plays: 134000,
  },
  {
    id: 'song-8',
    artistId: 'artist-4',
    artistName: 'Aurora Beats',
    title: 'Solar Flare',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    duration: 278,
    genre: 'Chillwave',
    createdAt: new Date('2023-12-20'),
    plays: 221000,
  },
];

export const mockLyrics: Record<string, Lyrics> = {
  'song-1': {
    id: 'lyrics-1',
    songId: 'song-1',
    lines: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      { time: 15, text: 'Watching the sunset fade to night' },
      { time: 22, text: 'Electric colors fill the sky' },
      { time: 30, text: 'Neon dreams are coming alive' },
      { time: 38, text: 'Feel the rhythm, feel the vibe' },
      { time: 46, text: 'Dancing through the city lights' },
      { time: 54, text: 'Everything feels so right tonight' },
      { time: 62, text: '♪ Synth break ♪' },
      { time: 80, text: 'Lost in the moment, lost in time' },
      { time: 88, text: 'This electric sunset is mine' },
    ],
  },
  'song-3': {
    id: 'lyrics-3',
    songId: 'song-3',
    lines: [
      { time: 0, text: '♪ Dark ambient intro ♪' },
      { time: 20, text: 'In the shadows, we come alive' },
      { time: 28, text: 'Dancing where the moonlight hides' },
      { time: 36, text: 'Echoes of the midnight hour' },
      { time: 44, text: 'Feel the darkness, feel its power' },
      { time: 52, text: 'Shadows dance around us now' },
      { time: 60, text: 'To the rhythm, we will bow' },
    ],
  },
};

export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    userId: 'user-1',
    title: 'Late Night Vibes',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    isPublic: true,
    songIds: ['song-1', 'song-3', 'song-5'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'playlist-2',
    userId: 'user-1',
    title: 'Chill Electronic',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    isPublic: true,
    songIds: ['song-2', 'song-4', 'song-6', 'song-8'],
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'playlist-3',
    userId: 'user-1',
    title: 'Focus Mode',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
    isPublic: false,
    songIds: ['song-2', 'song-6'],
    createdAt: new Date('2024-01-10'),
  },
];

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatPlays = (plays: number): string => {
  if (plays >= 1000000) {
    return `${(plays / 1000000).toFixed(1)}M`;
  }
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}K`;
  }
  return plays.toString();
};

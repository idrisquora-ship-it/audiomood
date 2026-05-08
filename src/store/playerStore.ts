import { create } from "zustand";

export type PlayerState = {
  currentSongId: string | null;
  currentSongTitle: string;
  currentArtistName: string;
  currentSongSourceUri: string;
  /** Profile id (listener row) used to resolve playback URLs / offline downloads */
  playbackProfileId: string | null;
  isPlaying: boolean;
  playbackSeconds: number;
  queueIndex: number;
  queueSourceType: "playlist" | "album" | "single" | null;
  queueSongIds: string[];
  autoplayRecommendations: boolean;
  setAutoplayRecommendations: (enabled: boolean) => void;
  setNowPlaying: (songId: string, songTitle: string, artistName: string, sourceUri?: string) => void;
  setPlaybackProfileId: (profileId: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSeconds: (seconds: number) => void;
  nextInQueue: () => string | null;
  prevInQueue: () => string | null;
  setQueue: (songIds: string[], sourceType: PlayerState["queueSourceType"], startSongId: string) => void;
  clearQueue: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSongId: null,
  currentSongTitle: "",
  currentArtistName: "",
  currentSongSourceUri: "",
  playbackProfileId: null,
  isPlaying: false,
  playbackSeconds: 0,
  queueIndex: 0,
  queueSourceType: null,
  queueSongIds: [],
  autoplayRecommendations: true,
  setAutoplayRecommendations: (autoplayRecommendations) => set({ autoplayRecommendations }),
  setNowPlaying: (currentSongId, currentSongTitle, currentArtistName, currentSongSourceUri = "") =>
    set({ currentSongId, currentSongTitle, currentArtistName, currentSongSourceUri, playbackSeconds: 0 }),
  setPlaybackProfileId: (playbackProfileId) => set({ playbackProfileId }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSeconds: (playbackSeconds) => set({ playbackSeconds }),
  nextInQueue: () => {
    const state = get();
    if (state.queueSongIds.length === 0) return null;
    if (state.queueIndex >= state.queueSongIds.length - 1) return null;
    const nextIndex = state.queueIndex + 1;
    const nextSongId = state.queueSongIds[nextIndex] ?? null;
    set({ queueIndex: nextIndex, currentSongId: nextSongId });
    return nextSongId;
  },
  prevInQueue: () => {
    const state = get();
    if (state.queueSongIds.length === 0) return null;
    if (state.queueIndex <= 0) return null;
    const prevIndex = state.queueIndex - 1;
    const prevSongId = state.queueSongIds[prevIndex] ?? null;
    set({ queueIndex: prevIndex, currentSongId: prevSongId });
    return prevSongId;
  },
  setQueue: (queueSongIds, queueSourceType, currentSongId) =>
    set({
      queueSongIds,
      queueSourceType,
      currentSongId,
      queueIndex: Math.max(0, queueSongIds.findIndex((id) => id === currentSongId))
    }),
  clearQueue: () =>
    set({
      currentSongId: null,
      currentSongTitle: "",
      currentArtistName: "",
      currentSongSourceUri: "",
      playbackProfileId: null,
      isPlaying: false,
      playbackSeconds: 0,
      queueIndex: 0,
      queueSourceType: null,
      queueSongIds: []
    })
}));

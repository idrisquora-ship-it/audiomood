import { usePlayerStore } from "@/store/playerStore";

export type QueueSourceType = "playlist" | "album" | "single";

export function buildQueueFromSource(songIds: string[], startSongId: string) {
  const startIndex = Math.max(0, songIds.findIndex((id) => id === startSongId));
  return [...songIds.slice(startIndex), ...songIds.slice(0, startIndex)];
}

export function playFromPlaylist(playlistSongIds: string[], selectedSongId: string) {
  const queue = buildQueueFromSource(playlistSongIds, selectedSongId);
  usePlayerStore.getState().setQueue(queue, "playlist", selectedSongId);
}

export function playFromAlbum(albumSongIds: string[], selectedSongId: string) {
  const queue = buildQueueFromSource(albumSongIds, selectedSongId);
  usePlayerStore.getState().setQueue(queue, "album", selectedSongId);
}

export function playSingleAndAutofill(selectedSongId: string, recommendedSongIds: string[]) {
  const queue = [selectedSongId, ...recommendedSongIds];
  usePlayerStore.getState().setQueue(queue, "single", selectedSongId);
}

export function onQueueEnd(sourceSongIds: string[], recommendedSongIds: string[]) {
  const state = usePlayerStore.getState();
  if (!state.autoplayRecommendations) {
    state.setQueue([], null, "");
    return { message: "Autoplay is off. Playback stopped." };
  }
  const queue = [...recommendedSongIds];
  state.setQueue(queue, "single", recommendedSongIds[0] ?? "");
  return { message: "Playing recommended songs based on this playlist" };
}

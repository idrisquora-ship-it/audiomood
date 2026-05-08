import TrackPlayer, { Event } from "react-native-track-player";

/** Headless RNTP playback service (lock screen / OS controls delegate to TrackPlayer native). */
export default async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void TrackPlayer.pause();
  });
}

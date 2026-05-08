import { useEffect } from "react";
import TrackPlayer, { Event, State, useProgress, useTrackPlayerEvents } from "react-native-track-player";
import { setupPlayer } from "@/features/music/playerService";
import { playNextTrackFromQueue, playPrevTrackFromQueue } from "@/features/music/songService";
import { usePlayerStore } from "@/store/playerStore";

export function PlaybackBootstrap() {
  const currentSongId = usePlayerStore((s) => s.currentSongId);
  const uri = usePlayerStore((s) => s.currentSongSourceUri);
  const title = usePlayerStore((s) => s.currentSongTitle);
  const artist = usePlayerStore((s) => s.currentArtistName);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setPlaybackSeconds = usePlayerStore((s) => s.setPlaybackSeconds);

  useEffect(() => {
    void setupPlayer();
  }, []);

  const progress = useProgress(400);
  useEffect(() => {
    if (!currentSongId || !uri) return;
    setPlaybackSeconds(Math.floor(progress.position));
  }, [progress.position, currentSongId, uri, setPlaybackSeconds]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await setupPlayer();
      if (!currentSongId || !uri) {
        await TrackPlayer.reset();
        return;
      }
      const active = await TrackPlayer.getActiveTrack();
      const needsLoad = active?.id !== currentSongId;
      if (needsLoad) {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: currentSongId,
          url: uri,
          title: title || "Unknown title",
          artist: artist || "Unknown artist"
        });
      }
      if (cancelled) return;
      const st = await TrackPlayer.getPlaybackState();
      if (isPlaying) {
        if (st.state !== State.Playing && st.state !== State.Buffering) {
          await TrackPlayer.play();
        }
      } else if (st.state === State.Playing) {
        await TrackPlayer.pause();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentSongId, uri, title, artist, isPlaying]);

  useTrackPlayerEvents([Event.RemotePlay], () => {
    setIsPlaying(true);
  });
  useTrackPlayerEvents([Event.RemotePause], () => {
    setIsPlaying(false);
  });

  useTrackPlayerEvents([Event.RemoteNext], () => {
    void playNextTrackFromQueue();
  });
  useTrackPlayerEvents([Event.RemotePrevious], () => {
    void playPrevTrackFromQueue();
  });
  useTrackPlayerEvents([Event.PlaybackQueueEnded], (event) => {
    // Ignore queue-ended emissions caused by manual reset/load transitions.
    if (!usePlayerStore.getState().isPlaying) return;
    if ((event?.position ?? 0) < 0.5) return;
    void playNextTrackFromQueue().then((advanced) => {
      if (!advanced) usePlayerStore.getState().setIsPlaying(false);
    });
  });

  return null;
}

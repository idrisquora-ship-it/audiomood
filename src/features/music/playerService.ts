import TrackPlayer, { Capability } from "react-native-track-player";

let initialized = false;

export async function setupPlayer() {
  if (initialized) return;
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    compactCapabilities: [Capability.Play, Capability.Pause]
  });
  initialized = true;
}

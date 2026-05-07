import { beforeEach, describe, expect, test } from "bun:test";
import { buildQueueFromSource, onQueueEnd } from "@/features/music/queueService";
import { usePlayerStore } from "@/store/playerStore";

describe("queueService", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentSongId: null,
      currentSongTitle: "",
      currentArtistName: "",
      isPlaying: false,
      queueSourceType: null,
      queueSongIds: [],
      autoplayRecommendations: true
    });
  });

  test("buildQueueFromSource starts from selected song", () => {
    const queue = buildQueueFromSource(["s1", "s2", "s3", "s4"], "s3");
    expect(queue).toEqual(["s3", "s4", "s1", "s2"]);
  });

  test("onQueueEnd stops when autoplay off", () => {
    usePlayerStore.getState().setAutoplayRecommendations(false);
    const result = onQueueEnd(["p1", "p2"], ["r1", "r2"]);
    expect(result.message).toContain("Autoplay is off");
    expect(usePlayerStore.getState().queueSongIds.length).toBe(0);
  });

  test("onQueueEnd switches to recommendations when autoplay on", () => {
    usePlayerStore.getState().setAutoplayRecommendations(true);
    const result = onQueueEnd(["p1", "p2"], ["r1", "r2"]);
    expect(result.message).toContain("recommended songs");
    expect(usePlayerStore.getState().queueSongIds).toEqual(["r1", "r2"]);
  });
});

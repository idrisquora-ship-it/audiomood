import { describe, expect, test } from "bun:test";
import { getNextLikedState } from "@/features/music/likedSongsService";

describe("likedSongsService", () => {
  test("toggles from false to true", () => {
    const next = getNextLikedState({}, "song-1");
    expect(next["song-1"]).toBe(true);
  });

  test("toggles from true to false", () => {
    const next = getNextLikedState({ "song-1": true }, "song-1");
    expect(next["song-1"]).toBe(false);
  });
});

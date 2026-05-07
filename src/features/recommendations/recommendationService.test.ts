import { describe, expect, test } from "bun:test";
import { calculateRecommendationScore } from "@/features/recommendations/recommendationService";

describe("recommendation scoring", () => {
  test("adds positive weights", () => {
    const score = calculateRecommendationScore([
      "liked_same_artist",
      "liked_same_genre",
      "completed_similar"
    ]);
    expect(score).toBe(24);
  });

  test("applies negative weights", () => {
    const score = calculateRecommendationScore([
      "liked_same_artist",
      "skipped_quickly",
      "blocked_reported_artist"
    ]);
    expect(score).toBe(-8);
  });

  test("ignores unknown signals", () => {
    const score = calculateRecommendationScore(["unknown_signal"]);
    expect(score).toBe(0);
  });
});

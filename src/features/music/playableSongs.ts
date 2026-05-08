/** Listener-facing catalogue: publish without admin gate; lyrics may still be processing. */
export const PLAYABLE_SONG_STATUSES = ["approved", "processing_lyrics", "pending_review"] as const;

export type PlayableSongStatus = (typeof PLAYABLE_SONG_STATUSES)[number];

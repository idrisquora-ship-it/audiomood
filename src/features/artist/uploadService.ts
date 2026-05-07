import { supabase } from "@/lib/supabase";

type UploadSongLegacyInput = {
  artistId: string;
  title: string;
  description?: string;
  audioPath: string;
  coverPath?: string;
  genreId?: string;
  moodId?: string;
  language?: string;
  explicit?: boolean;
  releaseDate?: string;
};

async function uploadArrayBuffer(bucket: string, storagePath: string, uri: string, contentType: string) {
  const res = await fetch(uri);
  const buf = await res.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buf, { contentType, upsert: true });
  if (error) throw error;
  return storagePath;
}

/** @deprecated Prefer `submitSongForReview` — kept for callers that already have storage paths */
export async function createSongDraft(input: UploadSongLegacyInput) {
  const { data, error } = await supabase
    .from("songs")
    .insert({
      artist_id: input.artistId,
      title: input.title,
      description: input.description ?? null,
      audio_path: input.audioPath,
      cover_path: input.coverPath ?? null,
      genre_id: input.genreId ?? null,
      mood_id: input.moodId ?? null,
      language: input.language ?? null,
      explicit: input.explicit ?? false,
      release_date: input.releaseDate ?? null,
      status: "pending_review"
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("lyrics_jobs").insert({ song_id: data.id, provider: "elevenlabs", status: "pending" });
  await supabase.functions.invoke("generate-song-lyrics", { body: { song_id: data.id } });

  return data.id;
}

export type SubmitSongInput = {
  artistId: string;
  title: string;
  description?: string;
  audioUri: string;
  audioMime?: string | null;
  coverUri?: string | null;
  genreId?: string;
  moodId?: string;
  language?: string;
  explicit?: boolean;
  releaseDate?: string;
  copyrightAccepted: boolean;
  autoGenerateLyrics: boolean;
};

function extFromMime(mime?: string | null): string {
  if (!mime) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) return "m4a";
  return "m4a";
}

export async function submitSongForReview(input: SubmitSongInput): Promise<string> {
  if (!input.copyrightAccepted) throw new Error("Please confirm you have the rights to distribute this recording.");
  if (!input.title.trim()) throw new Error("Title is required.");
  const ext = extFromMime(input.audioMime);
  const audioPath = `${input.artistId}/${Date.now()}.${ext}`;
  const mime =
    input.audioMime ??
    (ext === "mp3" ? "audio/mpeg" : ext === "wav" ? "audio/wav" : "audio/mp4");

  await uploadArrayBuffer("song-audio", audioPath, input.audioUri, mime);

  let coverPath: string | null = null;
  if (input.coverUri) {
    const cp = `${input.artistId}/${Date.now()}-cover.jpg`;
    await uploadArrayBuffer("song-covers", cp, input.coverUri, "image/jpeg");
    coverPath = cp;
  }

  const status = input.autoGenerateLyrics ? "processing_lyrics" : "pending_review";

  const { data, error } = await supabase
    .from("songs")
    .insert({
      artist_id: input.artistId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      audio_path: audioPath,
      cover_path: coverPath,
      genre_id: input.genreId ?? null,
      mood_id: input.moodId ?? null,
      language: input.language?.trim() || null,
      explicit: input.explicit ?? false,
      release_date: input.releaseDate?.trim() || null,
      status
    })
    .select("id")
    .single();

  if (error) throw error;

  if (input.autoGenerateLyrics) {
    await supabase.from("lyrics_jobs").insert({ song_id: data.id, provider: "elevenlabs", status: "pending" });
    await supabase.from("lyrics").upsert({ song_id: data.id, status: "processing" }, { onConflict: "song_id" });
    await supabase.functions.invoke("generate-song-lyrics", { body: { song_id: data.id } });
  }

  return data.id;
}

export async function createAlbum(artistId: string, title: string, description?: string, coverPath?: string, releaseDate?: string) {
  const { data, error } = await supabase
    .from("albums")
    .insert({
      artist_id: artistId,
      title,
      description: description ?? null,
      cover_path: coverPath ?? null,
      release_date: releaseDate ?? null
    })
    .select("id,title")
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAlbumCover(artistId: string, localCoverUri: string) {
  const fileName = `${artistId}/${Date.now()}-cover.jpg`;
  await uploadArrayBuffer("album-covers", fileName, localCoverUri, "image/jpeg");
  return fileName;
}

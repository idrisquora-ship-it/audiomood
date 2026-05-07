import * as FileSystem from "expo-file-system";
import { addDownloadedSong } from "@/features/settings/settingsService";
import { supabase } from "@/lib/supabase";

function downloadsDir(profileId: string) {
  return `${FileSystem.documentDirectory}downloads/${profileId}/`;
}

export async function ensureSongDownloaded(
  profileId: string,
  songId: string,
  audioPath: string
) {
  const dir = downloadsDir(profileId);
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const localPath = `${dir}${songId}.mp3`;
  const localInfo = await FileSystem.getInfoAsync(localPath);
  if (localInfo.exists) {
    await addDownloadedSong(profileId, songId, localPath);
    return localPath;
  }

  const signed = await supabase.storage.from("song-audio").createSignedUrl(audioPath, 60 * 10);
  const signedUrl = signed.data?.signedUrl;
  if (!signedUrl) throw new Error("Failed to create signed URL for download");

  await FileSystem.downloadAsync(signedUrl, localPath);
  await addDownloadedSong(profileId, songId, localPath);
  return localPath;
}

export async function resolvePlayableSongUri(
  profileId: string,
  songId: string,
  audioPath: string,
  offlineModeEnabled: boolean
) {
  const downloadRow = await supabase
    .from("downloaded_songs")
    .select("local_path")
    .eq("user_id", profileId)
    .eq("song_id", songId)
    .maybeSingle();

  const localPath = downloadRow.data?.local_path;
  if (localPath) {
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) return localPath;
  }

  if (offlineModeEnabled) return null;

  const signed = await supabase.storage.from("song-audio").createSignedUrl(audioPath, 60 * 10);
  return signed.data?.signedUrl ?? null;
}

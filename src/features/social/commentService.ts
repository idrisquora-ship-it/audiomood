import { supabase } from "@/lib/supabase";

export async function getSongComments(songId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("id,song_id,user_id,parent_comment_id,body,created_at")
    .eq("song_id", songId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addComment(songId: string, userId: string, body: string, parentCommentId?: string) {
  const { error } = await supabase.from("comments").insert({
    song_id: songId,
    user_id: userId,
    body,
    parent_comment_id: parentCommentId ?? null
  });
  if (error) throw error;

  const song = await supabase
    .from("songs")
    .select("artist_id")
    .eq("id", songId)
    .single();
  if (song.data?.artist_id) {
    const artistUser = await supabase
      .from("artist_profiles")
      .select("user_id")
      .eq("id", song.data.artist_id)
      .single();
    if (artistUser.data?.user_id) {
      const artistProfile = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", artistUser.data.user_id)
        .single();
      if (artistProfile.data?.id) {
        await supabase.from("notifications").insert({
          user_id: artistProfile.data.id,
          title: "New song comment",
          body: "Someone commented on your song.",
          type: "song_comment",
          payload: { song_id: songId }
        });
      }
    }
  }
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}

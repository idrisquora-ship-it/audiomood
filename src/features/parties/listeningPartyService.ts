import { supabase } from "@/lib/supabase";
import { createNotification } from "@/features/engagement/signalService";
import { upsertRecommendationScore } from "@/features/recommendations/recommendationService";

export type ListeningParty = {
  id: string;
  host_user_id: string;
  title: string;
  is_public: boolean;
  status: "active" | "ended";
};

export async function getListeningParties() {
  const { data, error } = await supabase
    .from("listening_parties")
    .select("id,host_user_id,title,is_public,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return (data ?? []) as ListeningParty[];
}

export async function createListeningParty(hostUserId: string, title: string, isPublic: boolean) {
  const { data, error } = await supabase
    .from("listening_parties")
    .insert({ host_user_id: hostUserId, title, is_public: isPublic, status: "active" })
    .select("id,host_user_id,title,is_public,status")
    .single();
  if (error) throw error;

  await supabase.from("party_members").upsert(
    { party_id: data.id, user_id: hostUserId, role: "host" },
    { onConflict: "party_id,user_id" }
  );
  await supabase.from("party_playback_state").upsert(
    { party_id: data.id, playback_seconds: 0, is_playing: false, updated_by: hostUserId },
    { onConflict: "party_id" }
  );

  await createNotification({
    userProfileId: hostUserId,
    title: "Listening party created",
    body: title,
    type: "party_created",
    data: { party_id: data.id }
  });

  return data as ListeningParty;
}

export async function joinParty(partyId: string, userId: string) {
  const { error } = await supabase
    .from("party_members")
    .upsert({ party_id: partyId, user_id: userId, role: "guest" }, { onConflict: "party_id,user_id" });
  if (error) throw error;
  const partyRes = await supabase.from("listening_parties").select("host_user_id,title").eq("id", partyId).maybeSingle();
  if (partyRes.data?.host_user_id && partyRes.data.host_user_id !== userId) {
    await createNotification({
      userProfileId: partyRes.data.host_user_id,
      title: "New party member joined",
      body: `${partyRes.data.title ?? "Your party"} has a new member.`,
      type: "party_join",
      data: { party_id: partyId },
      push: true
    });
  }
}

export async function leaveParty(partyId: string, userId: string) {
  const { error } = await supabase.from("party_members").delete().eq("party_id", partyId).eq("user_id", userId);
  if (error) throw error;
}

export async function endParty(partyId: string) {
  const { error } = await supabase
    .from("listening_parties")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", partyId);
  if (error) throw error;
}

export async function transferHost(partyId: string, newHostUserId: string) {
  const { error: partyError } = await supabase.from("listening_parties").update({ host_user_id: newHostUserId }).eq("id", partyId);
  if (partyError) throw partyError;
  await supabase.from("party_members").update({ role: "guest" }).eq("party_id", partyId).eq("role", "host");
  await supabase.from("party_members").update({ role: "host" }).eq("party_id", partyId).eq("user_id", newHostUserId);
}

export async function getPartyMembers(partyId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select("id,party_id,user_id,role,joined_at")
    .eq("party_id", partyId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendPartyMessage(partyId: string, userId: string, message: string) {
  const { error } = await supabase.from("party_messages").insert({ party_id: partyId, user_id: userId, message });
  if (error) throw error;
  if (message.startsWith("INVITE:")) {
    const partyRes = await supabase.from("listening_parties").select("host_user_id,title").eq("id", partyId).maybeSingle();
    if (partyRes.data?.host_user_id) {
      await createNotification({
        userProfileId: partyRes.data.host_user_id,
        title: "Party invite activity",
        body: `Invite sent in ${partyRes.data.title ?? "party chat"}.`,
        type: "party_invite_signal",
        data: { party_id: partyId }
      });
    }
  }
}

export async function sendPartyReaction(partyId: string, userId: string, reaction: string) {
  const { error } = await supabase.from("party_reactions").insert({ party_id: partyId, user_id: userId, reaction });
  if (error) throw error;
}

export async function suggestPartySong(partyId: string, userId: string, songId: string) {
  const queueRes = await supabase
    .from("party_queue")
    .select("position")
    .eq("party_id", partyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (queueRes.data?.position ?? -1) + 1;
  const { error } = await supabase.from("party_queue").insert({
    party_id: partyId,
    song_id: songId,
    position: nextPosition,
    suggested_by: userId
  });
  if (error) throw error;
}

export async function voteSkip(partyId: string, userId: string, voteType: "skip" | "keep") {
  const { error } = await supabase
    .from("party_votes")
    .upsert({ party_id: partyId, user_id: userId, vote_type: voteType }, { onConflict: "party_id,user_id,vote_type" });
  if (error) throw error;
}

export async function getPartyPlaybackState(partyId: string) {
  const { data, error } = await supabase
    .from("party_playback_state")
    .select("party_id,song_id,playback_seconds,is_playing,updated_by,updated_at")
    .eq("party_id", partyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function hostUpdatePlaybackState(
  partyId: string,
  hostUserId: string,
  state: { songId?: string | null; playbackSeconds: number; isPlaying: boolean }
) {
  const { error } = await supabase.from("party_playback_state").upsert(
    {
      party_id: partyId,
      song_id: state.songId ?? null,
      playback_seconds: state.playbackSeconds,
      is_playing: state.isPlaying,
      updated_by: hostUserId,
      updated_at: new Date().toISOString()
    },
    { onConflict: "party_id" }
  );
  if (error) throw error;

  if (state.songId) {
    const membersRes = await supabase.from("party_members").select("user_id").eq("party_id", partyId);
    await Promise.all(
      (membersRes.data ?? []).map((m) =>
        upsertRecommendationScore(m.user_id, state.songId as string, ["completed_similar", "trending_fav_genre"])
      )
    );
  }
}


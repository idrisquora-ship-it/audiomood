import { supabase } from "@/lib/supabase";
import { createNotification } from "@/features/engagement/signalService";

export type LiveRoom = {
  id: string;
  host_user_id: string;
  title: string;
  description: string | null;
  room_type: string | null;
  status: "live" | "ended";
};

export async function getLiveRooms() {
  const { data, error } = await supabase
    .from("live_rooms")
    .select("id,host_user_id,title,description,room_type,status")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return (data ?? []) as LiveRoom[];
}

export async function createLiveRoom(hostUserId: string, title: string, description: string, roomType: string) {
  const { data, error } = await supabase
    .from("live_rooms")
    .insert({
      host_user_id: hostUserId,
      title,
      description: description || null,
      room_type: roomType,
      status: "live"
    })
    .select("id,host_user_id,title,description,room_type,status")
    .single();
  if (error) throw error;

  await supabase.from("live_room_participants").upsert(
    { room_id: data.id, user_id: hostUserId, role: "host" },
    { onConflict: "room_id,user_id" }
  );
  await supabase.from("live_room_speakers").upsert(
    { room_id: data.id, user_id: hostUserId, is_muted: false },
    { onConflict: "room_id,user_id" }
  );

  await createNotification({
    userProfileId: hostUserId,
    title: "Live room started",
    body: title,
    type: "live_room_created",
    data: { room_id: data.id, room_type: roomType }
  });

  return data as LiveRoom;
}

export async function joinLiveRoom(roomId: string, userId: string) {
  const { error } = await supabase
    .from("live_room_participants")
    .upsert({ room_id: roomId, user_id: userId, role: "listener" }, { onConflict: "room_id,user_id" });
  if (error) throw error;
  const roomRes = await supabase.from("live_rooms").select("host_user_id,title").eq("id", roomId).maybeSingle();
  if (roomRes.data?.host_user_id && roomRes.data.host_user_id !== userId) {
    await createNotification({
      userProfileId: roomRes.data.host_user_id,
      title: "Participant joined your room",
      body: roomRes.data.title ?? "Live room",
      type: "live_room_join",
      data: { room_id: roomId },
      push: true
    });
  }
}

export async function leaveLiveRoom(roomId: string, userId: string) {
  await supabase.from("live_room_speakers").delete().eq("room_id", roomId).eq("user_id", userId);
  const { error } = await supabase.from("live_room_participants").delete().eq("room_id", roomId).eq("user_id", userId);
  if (error) throw error;
}

export async function endLiveRoom(roomId: string) {
  const { error } = await supabase.from("live_rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", roomId);
  if (error) throw error;
}

export async function getLiveRoomParticipants(roomId: string) {
  const { data, error } = await supabase
    .from("live_room_participants")
    .select("id,room_id,user_id,role,joined_at")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLiveRoomSpeakers(roomId: string) {
  const { data, error } = await supabase
    .from("live_room_speakers")
    .select("id,room_id,user_id,is_muted,added_at")
    .eq("room_id", roomId)
    .order("added_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendLiveRoomMessage(roomId: string, userId: string, message: string) {
  const { error } = await supabase.from("live_room_messages").insert({ room_id: roomId, user_id: userId, message });
  if (error) throw error;
}

export async function sendLiveRoomReaction(roomId: string, userId: string, reaction: string) {
  const { error } = await supabase.from("live_room_reactions").insert({ room_id: roomId, user_id: userId, reaction });
  if (error) throw error;
}

export async function requestToSpeak(roomId: string, userId: string) {
  const { error } = await supabase
    .from("live_room_requests")
    .upsert(
      { room_id: roomId, user_id: userId, request_type: "speak", status: "pending" },
      { onConflict: "room_id,user_id,request_type" }
    );
  if (error) throw error;
  const roomRes = await supabase.from("live_rooms").select("host_user_id,title").eq("id", roomId).maybeSingle();
  if (roomRes.data?.host_user_id && roomRes.data.host_user_id !== userId) {
    await createNotification({
      userProfileId: roomRes.data.host_user_id,
      title: "New mic request",
      body: `Someone requested to speak in ${roomRes.data.title ?? "your room"}.`,
      type: "live_room_speak_request",
      data: { room_id: roomId },
      push: true
    });
  }
}

export async function getSpeakRequests(roomId: string) {
  const { data, error } = await supabase
    .from("live_room_requests")
    .select("id,room_id,user_id,request_type,status,created_at")
    .eq("room_id", roomId)
    .eq("request_type", "speak")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveSpeakRequest(requestId: string, roomId: string, userId: string) {
  await supabase.from("live_room_requests").update({ status: "accepted" }).eq("id", requestId);
  await supabase.from("live_room_participants").upsert({ room_id: roomId, user_id: userId, role: "speaker" }, { onConflict: "room_id,user_id" });
  const { error } = await supabase
    .from("live_room_speakers")
    .upsert({ room_id: roomId, user_id: userId, is_muted: false }, { onConflict: "room_id,user_id" });
  if (error) throw error;
  await createNotification({
    userProfileId: userId,
    title: "Mic request approved",
    body: "You are now a speaker in the live room.",
    type: "live_room_request_approved",
    data: { room_id: roomId },
    push: true
  });
}

export async function rejectSpeakRequest(requestId: string) {
  const reqRes = await supabase.from("live_room_requests").select("room_id,user_id").eq("id", requestId).maybeSingle();
  const { error } = await supabase.from("live_room_requests").update({ status: "rejected" }).eq("id", requestId);
  if (error) throw error;
  if (reqRes.data?.user_id) {
    await createNotification({
      userProfileId: reqRes.data.user_id,
      title: "Mic request rejected",
      body: "Your request to speak was not approved.",
      type: "live_room_request_rejected",
      data: { room_id: reqRes.data.room_id }
    });
  }
}

export async function muteSpeaker(roomId: string, userId: string, muted: boolean) {
  const { error } = await supabase
    .from("live_room_speakers")
    .update({ is_muted: muted })
    .eq("room_id", roomId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function removeParticipant(roomId: string, userId: string) {
  await supabase.from("live_room_speakers").delete().eq("room_id", roomId).eq("user_id", userId);
  const { error } = await supabase.from("live_room_participants").delete().eq("room_id", roomId).eq("user_id", userId);
  if (error) throw error;
}

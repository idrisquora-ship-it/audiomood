import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  approveSpeakRequest,
  endLiveRoom,
  getLiveRoomParticipants,
  getLiveRoomSpeakers,
  getSpeakRequests,
  leaveLiveRoom,
  muteSpeaker,
  rejectSpeakRequest,
  removeParticipant,
  requestToSpeak,
  sendLiveRoomMessage,
  sendLiveRoomReaction
} from "@/features/liveRooms/liveRoomService";
import { supabase } from "@/lib/supabase";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

type LiveMessage = { id: string; user_id: string; message: string };
type LiveReaction = { id: string; reaction: string };

export default function LiveRoomStageScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [profileId, setProfileId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Array<{ user_id: string; role: string }>>([]);
  const [speakers, setSpeakers] = useState<Array<{ user_id: string; is_muted: boolean }>>([]);
  const [requests, setRequests] = useState<Array<{ id: string; user_id: string; status: string }>>([]);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!roomId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) return;
      setProfileId(profile.id);

      const roomRes = await supabase.from("live_rooms").select("host_user_id").eq("id", roomId).maybeSingle();
      setIsHost(roomRes.data?.host_user_id === profile.id);

      const [members, speakerRows, requestRows, msgRows, reactionRows] = await Promise.all([
        getLiveRoomParticipants(roomId),
        getLiveRoomSpeakers(roomId),
        getSpeakRequests(roomId),
        supabase.from("live_room_messages").select("id,user_id,message").eq("room_id", roomId).order("created_at", { ascending: true }),
        supabase.from("live_room_reactions").select("id,reaction").eq("room_id", roomId).order("created_at", { ascending: true })
      ]);
      setParticipants((members as Array<{ user_id: string; role: string }>) ?? []);
      setSpeakers((speakerRows as Array<{ user_id: string; is_muted: boolean }>) ?? []);
      setRequests((requestRows as Array<{ id: string; user_id: string; status: string }>) ?? []);
      setMessages((msgRows.data as LiveMessage[]) ?? []);
      setReactions((reactionRows.data as LiveReaction[]) ?? []);

      channel = supabase
        .channel(`live-stage-${roomId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "live_room_participants", filter: `room_id=eq.${roomId}` }, () => {
          void getLiveRoomParticipants(roomId).then((rows) => setParticipants(rows as Array<{ user_id: string; role: string }>));
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "live_room_speakers", filter: `room_id=eq.${roomId}` }, () => {
          void getLiveRoomSpeakers(roomId).then((rows) => setSpeakers(rows as Array<{ user_id: string; is_muted: boolean }>));
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "live_room_requests", filter: `room_id=eq.${roomId}` }, () => {
          void getSpeakRequests(roomId).then((rows) => setRequests(rows as Array<{ id: string; user_id: string; status: string }>));
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_room_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new as LiveMessage]);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_room_reactions", filter: `room_id=eq.${roomId}` }, (payload) => {
          setReactions((prev) => [...prev, payload.new as LiveReaction]);
        })
        .subscribe();
    })();
    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId]);

  const liveCount = useMemo(() => participants.length, [participants.length]);

  if (!roomId) {
    return (
      <Screen>
        <EmptyState title="Room missing" subtitle="Could not load live stage." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>Live Room Stage</AppText>
        <AppText muted>{isHost ? "Host controls enabled" : "Listener/Speaker mode"} • Live count: {liveCount}</AppText>
        <AppText muted>Voice provider placeholder: UI/state ready, transport is replaceable.</AppText>

        <View style={styles.panel}>
          <AppText style={styles.panelTitle}>Stage</AppText>
          <AppText muted>Speakers: {speakers.length}</AppText>
          {speakers.map((speaker) => (
            <View key={speaker.user_id} style={styles.row}>
              <AppText muted>{speaker.user_id.slice(0, 8)} • {speaker.is_muted ? "Muted" : "Live Mic"}</AppText>
              {isHost ? (
                <View style={styles.row}>
                  <Pressable style={styles.btn} onPress={() => void muteSpeaker(roomId, speaker.user_id, !speaker.is_muted)}>
                    <AppText>{speaker.is_muted ? "Unmute" : "Mute"}</AppText>
                  </Pressable>
                  <Pressable style={styles.warnBtn} onPress={() => void removeParticipant(roomId, speaker.user_id)}>
                    <AppText>Remove</AppText>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
          {!isHost ? (
            <Pressable style={styles.btn} onPress={() => {
              if (!profileId) return;
              void requestToSpeak(roomId, profileId).then(() => pushToast("Mic request submitted", "success"));
            }}>
              <AppText>Request to Speak</AppText>
            </Pressable>
          ) : null}
        </View>

        {isHost ? (
          <View style={styles.panel}>
            <AppText style={styles.panelTitle}>Speaker Requests</AppText>
            {requests.filter((r) => r.status === "pending").map((req) => (
              <View key={req.id} style={styles.row}>
                <AppText muted>{req.user_id.slice(0, 8)} wants mic</AppText>
                <View style={styles.row}>
                  <Pressable style={styles.btn} onPress={() => void approveSpeakRequest(req.id, roomId, req.user_id)}>
                    <AppText>Accept</AppText>
                  </Pressable>
                  <Pressable style={styles.warnBtn} onPress={() => void rejectSpeakRequest(req.id)}>
                    <AppText>Reject</AppText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.panel}>
          <AppText style={styles.panelTitle}>Live Chat</AppText>
          {messages.map((m) => (
            <AppText key={m.id} muted>{m.message}</AppText>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Send message..."
            placeholderTextColor={colors.textMuted}
            value={messageInput}
            onChangeText={setMessageInput}
          />
          <View style={styles.row}>
            <Pressable
              style={styles.btn}
              onPress={() => {
                if (!profileId || !messageInput.trim()) return;
                void sendLiveRoomMessage(roomId, profileId, messageInput.trim()).then(() => setMessageInput(""));
              }}
            >
              <AppText>Send</AppText>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => {
                if (!profileId) return;
                void sendLiveRoomReaction(roomId, profileId, "🎤");
              }}
            >
              <AppText>React 🎤</AppText>
            </Pressable>
          </View>
          <AppText muted>{reactions.slice(-10).map((r) => r.reaction).join(" ") || "No reactions yet."}</AppText>
        </View>

        {isHost ? (
          <Pressable style={styles.endBtn} onPress={() => void endLiveRoom(roomId)}>
            <AppText>End Room</AppText>
          </Pressable>
        ) : (
          <Pressable
            style={styles.endBtn}
            onPress={() => {
              if (!profileId) return;
              void leaveLiveRoom(roomId, profileId);
            }}
          >
            <AppText>Leave Room</AppText>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  panel: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 8 },
  panelTitle: { fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  warnBtn: { backgroundColor: colors.cardAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input: { backgroundColor: colors.cardAlt, borderRadius: 10, color: colors.text, padding: 10 },
  endBtn: { backgroundColor: colors.danger, borderRadius: 10, padding: 12, alignItems: "center" }
});

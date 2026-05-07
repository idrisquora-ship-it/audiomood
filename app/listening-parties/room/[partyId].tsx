import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  endParty,
  getPartyMembers,
  getPartyPlaybackState,
  hostUpdatePlaybackState,
  leaveParty,
  sendPartyMessage,
  sendPartyReaction,
  suggestPartySong,
  transferHost,
  voteSkip
} from "@/features/parties/listeningPartyService";
import { supabase } from "@/lib/supabase";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

type PartyMessage = { id: string; user_id: string; message: string; created_at: string };
type PartyReaction = { id: string; user_id: string; reaction: string; created_at: string };
type PlaybackState = {
  song_id: string | null;
  playback_seconds: number;
  is_playing: boolean;
  updated_by: string | null;
};

export default function PartyRoomScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const [profileId, setProfileId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [chat, setChat] = useState<PartyMessage[]>([]);
  const [reactions, setReactions] = useState<PartyReaction[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [songSuggestion, setSongSuggestion] = useState("");
  const [playback, setPlayback] = useState<PlaybackState>({ song_id: null, playback_seconds: 0, is_playing: false, updated_by: null });
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!partyId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) return;
      setProfileId(profile.id);

      const members = await getPartyMembers(partyId);
      setMemberCount(members.length);
      setIsHost(members.some((m) => m.user_id === profile.id && m.role === "host"));
      const state = await getPartyPlaybackState(partyId);
      if (state) {
        setPlayback({
          song_id: state.song_id ?? null,
          playback_seconds: state.playback_seconds ?? 0,
          is_playing: state.is_playing ?? false,
          updated_by: state.updated_by ?? null
        });
      }

      const [messagesRes, reactionsRes] = await Promise.all([
        supabase.from("party_messages").select("id,user_id,message,created_at").eq("party_id", partyId).order("created_at", { ascending: true }),
        supabase.from("party_reactions").select("id,user_id,reaction,created_at").eq("party_id", partyId).order("created_at", { ascending: true })
      ]);
      setChat((messagesRes.data ?? []) as PartyMessage[]);
      setReactions((reactionsRes.data ?? []) as PartyReaction[]);

      channel = supabase
        .channel(`party-room-${partyId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "party_messages", filter: `party_id=eq.${partyId}` },
          (payload) => setChat((prev) => [...prev, payload.new as PartyMessage])
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "party_reactions", filter: `party_id=eq.${partyId}` },
          (payload) => setReactions((prev) => [...prev, payload.new as PartyReaction])
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "party_members", filter: `party_id=eq.${partyId}` },
          () => {
            void getPartyMembers(partyId).then((rows) => setMemberCount(rows.length));
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "party_playback_state", filter: `party_id=eq.${partyId}` },
          (payload) => {
            const next = payload.new as PlaybackState;
            setPlayback({
              song_id: next.song_id ?? null,
              playback_seconds: next.playback_seconds ?? 0,
              is_playing: next.is_playing ?? false,
              updated_by: next.updated_by ?? null
            });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [partyId]);

  useEffect(() => {
    if (isHost || !playback.is_playing) return;
    const timer = setInterval(() => {
      setPlayback((prev) => ({ ...prev, playback_seconds: prev.playback_seconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isHost, playback.is_playing]);

  const playbackLabel = useMemo(() => {
    const mins = Math.floor(playback.playback_seconds / 60);
    const secs = playback.playback_seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [playback.playback_seconds]);

  if (!partyId) {
    return (
      <Screen>
        <EmptyState title="Party not found" subtitle="Missing party id." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>Party Room</AppText>
        <AppText muted>{isHost ? "You are host" : "You are guest"} • Members: {memberCount}</AppText>
        <AppText muted>Synced song: {playback.song_id ? playback.song_id.slice(0, 8) : "-"} • {playbackLabel}</AppText>

        <View style={styles.row}>
          <Link href={`/listening-parties/invite?partyId=${partyId}`} asChild>
            <Pressable style={styles.btn}><AppText>Invite Users</AppText></Pressable>
          </Link>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void sendPartyReaction(partyId, profileId, "🔥");
            }}
          >
            <AppText>React</AppText>
          </Pressable>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void voteSkip(partyId, profileId, "skip").then(() => pushToast("Voted to skip", "info"));
            }}
          >
            <AppText>Vote Skip</AppText>
          </Pressable>
        </View>

        {isHost ? (
          <View style={styles.hostPanel}>
            <AppText style={styles.hostTitle}>Host Playback Controls</AppText>
            <View style={styles.row}>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  if (!profileId) return;
                  void hostUpdatePlaybackState(partyId, profileId, {
                    songId: playback.song_id,
                    playbackSeconds: playback.playback_seconds,
                    isPlaying: !playback.is_playing
                  });
                }}
              >
                <AppText>{playback.is_playing ? "Pause" : "Play"}</AppText>
              </Pressable>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  if (!profileId) return;
                  void hostUpdatePlaybackState(partyId, profileId, {
                    songId: playback.song_id,
                    playbackSeconds: Math.max(0, playback.playback_seconds - 5),
                    isPlaying: playback.is_playing
                  });
                }}
              >
                <AppText>-5s</AppText>
              </Pressable>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  if (!profileId) return;
                  void hostUpdatePlaybackState(partyId, profileId, {
                    songId: playback.song_id,
                    playbackSeconds: playback.playback_seconds + 5,
                    isPlaying: playback.is_playing
                  });
                }}
              >
                <AppText>+5s</AppText>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Suggest/Add song id to shared queue"
              placeholderTextColor={colors.textMuted}
              value={songSuggestion}
              onChangeText={setSongSuggestion}
            />
            <Pressable
              style={styles.btn}
              onPress={() => {
                if (!profileId || !songSuggestion.trim()) return;
                void suggestPartySong(partyId, profileId, songSuggestion.trim()).then(() => {
                  setSongSuggestion("");
                  pushToast("Song added to party queue", "success");
                });
              }}
            >
              <AppText>Add To Queue</AppText>
            </Pressable>
            <View style={styles.row}>
              <Pressable
                style={styles.warnBtn}
                onPress={() => {
                  if (!profileId) return;
                  void transferHost(partyId, profileId).then(() => pushToast("Host refreshed", "info"));
                }}
              >
                <AppText>Transfer Host (self)</AppText>
              </Pressable>
              <Pressable
                style={styles.warnBtn}
                onPress={() => {
                  void endParty(partyId).then(() => pushToast("Party ended", "info"));
                }}
              >
                <AppText>End Party</AppText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.chatCard}>
          <AppText style={styles.hostTitle}>Party Chat</AppText>
          {chat.map((msg) => (
            <AppText key={msg.id} muted>{msg.message}</AppText>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Send message..."
            placeholderTextColor={colors.textMuted}
            value={messageInput}
            onChangeText={setMessageInput}
          />
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId || !messageInput.trim()) return;
              void sendPartyMessage(partyId, profileId, messageInput.trim()).then(() => setMessageInput(""));
            }}
          >
            <AppText>Send</AppText>
          </Pressable>
        </View>

        <View style={styles.chatCard}>
          <AppText style={styles.hostTitle}>Reactions</AppText>
          <AppText muted>{reactions.slice(-8).map((r) => r.reaction).join(" ") || "No reactions yet."}</AppText>
        </View>

        <Pressable
          style={styles.leaveBtn}
          onPress={() => {
            if (!profileId) return;
            void leaveParty(partyId, profileId).then(() => pushToast("You left the party", "info"));
          }}
        >
          <AppText>Leave Party</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  warnBtn: { backgroundColor: colors.cardAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  hostPanel: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 8 },
  hostTitle: { fontWeight: "700" },
  chatCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 8 },
  input: { backgroundColor: colors.cardAlt, borderRadius: 10, color: colors.text, padding: 10 },
  leaveBtn: { backgroundColor: colors.danger, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" }
});

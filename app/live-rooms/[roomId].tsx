import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getLiveRoomParticipants, type LiveRoom } from "@/features/liveRooms/liveRoomService";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function LiveRoomDetailsScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!roomId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      await getMyProfile();
      const roomRes = await supabase
        .from("live_rooms")
        .select("id,host_user_id,title,description,room_type,status")
        .eq("id", roomId)
        .maybeSingle();
      if (roomRes.data) setRoom(roomRes.data as LiveRoom);

      const participants = await getLiveRoomParticipants(roomId);
      setParticipantsCount(participants.length);
      setLiveCount(participants.length);

      channel = supabase
        .channel(`live-room-detail-${roomId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "live_room_participants", filter: `room_id=eq.${roomId}` },
          () => {
            void getLiveRoomParticipants(roomId).then((rows) => {
              setParticipantsCount(rows.length);
              setLiveCount(rows.length);
            });
          }
        )
        .subscribe();
    })();
    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (!room) {
    return (
      <Screen>
        <EmptyState title="Loading live room..." subtitle="Preparing room details." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>{room.title}</AppText>
        <AppText muted>{room.description ?? "No room description."}</AppText>
        <AppText muted>Type: {room.room_type ?? "general"}</AppText>
        <AppText muted>Participants: {participantsCount} • Live count: {liveCount}</AppText>

        <Link href={`/live-rooms/stage/${room.id}`} asChild>
          <Pressable style={styles.primaryBtn}>
            <AppText>Enter Live Stage</AppText>
          </Pressable>
        </Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});

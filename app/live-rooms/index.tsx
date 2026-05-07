import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getLiveRooms, joinLiveRoom, type LiveRoom } from "@/features/liveRooms/liveRoomService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function LiveRoomsScreen() {
  const [profileId, setProfileId] = useState("");
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const rows = await getLiveRooms();
      setRooms(rows);
    })();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>Live Audio Rooms</AppText>
        <AppText muted>Join live discussions, Q&A sessions, launches, and freestyle rooms.</AppText>

        <Link href="/live-rooms/create" asChild>
          <Pressable style={styles.primaryBtn}>
            <AppText>Create Room</AppText>
          </Pressable>
        </Link>

        {rooms.length === 0 ? <EmptyState title="No live rooms" subtitle="Create a room and start a conversation." /> : null}
        {rooms.map((room) => (
          <Pressable
            key={room.id}
            style={styles.card}
            onPress={() => {
              if (!profileId) return;
              void joinLiveRoom(room.id, profileId).then(() => {
                pushToast("Joined live room", "success");
                router.push(`/live-rooms/${room.id}`);
              });
            }}
          >
            <AppText>{room.title}</AppText>
            <AppText muted>{room.room_type ?? "General"} • Live</AppText>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 4 }
});

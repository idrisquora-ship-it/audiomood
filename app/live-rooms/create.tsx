import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { createLiveRoom } from "@/features/liveRooms/liveRoomService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

const roomTypes = ["artist_qa", "album_launch", "music_discussion", "podcast_live", "freestyle"] as const;

export default function CreateLiveRoomScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState<(typeof roomTypes)[number]>("music_discussion");
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Create Live Audio Room</AppText>
        <TextInput
          style={styles.input}
          placeholder="Room title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Room description"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Pressable
          style={styles.input}
          onPress={() => {
            const idx = roomTypes.indexOf(roomType);
            setRoomType(roomTypes[(idx + 1) % roomTypes.length]);
          }}
        >
          <AppText>Room type: {roomType}</AppText>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => {
            if (!title.trim()) return;
            void (async () => {
              const profile = await getMyProfile();
              if (!profile?.id) return;
              const room = await createLiveRoom(profile.id, title.trim(), description.trim(), roomType);
              pushToast("Live room created", "success");
              router.replace(`/live-rooms/${room.id}`);
            })();
          }}
        >
          <AppText>Create and Go Live</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});

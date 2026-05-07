import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { createListeningParty } from "@/features/parties/listeningPartyService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function CreatePartyScreen() {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Create Listening Party</AppText>
        <TextInput
          style={styles.input}
          placeholder="Party title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.row}>
          <AppText muted>Public party</AppText>
          <Switch value={isPublic} onValueChange={setIsPublic} />
        </View>
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!title.trim()) return;
            void (async () => {
              const profile = await getMyProfile();
              if (!profile?.id) return;
              const party = await createListeningParty(profile.id, title.trim(), isPublic);
              pushToast("Listening party created", "success");
              router.replace(`/listening-parties/room/${party.id}`);
            })();
          }}
        >
          <AppText>Create and Open Room</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  row: { backgroundColor: colors.card, borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between" },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});

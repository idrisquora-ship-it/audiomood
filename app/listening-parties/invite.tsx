import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { sendPartyMessage } from "@/features/parties/listeningPartyService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function InviteToPartyScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const [inviteText, setInviteText] = useState("");
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Invite To Party</AppText>
        <AppText muted>Send invitation message placeholder (in-app invites can be wired to notifications next phase).</AppText>
        <TextInput
          style={styles.input}
          placeholder="Invite @username or write message"
          placeholderTextColor={colors.textMuted}
          value={inviteText}
          onChangeText={setInviteText}
        />
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!partyId || !inviteText.trim()) return;
            void (async () => {
              const profile = await getMyProfile();
              if (!profile?.id) return;
              await sendPartyMessage(partyId, profile.id, `INVITE: ${inviteText.trim()}`);
              pushToast("Invitation sent in party chat", "success");
              setInviteText("");
            })();
          }}
        >
          <AppText>Send Invite</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 10 },
  title: { fontSize: 24, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});

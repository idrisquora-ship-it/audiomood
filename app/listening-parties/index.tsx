import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getListeningParties, joinParty, type ListeningParty } from "@/features/parties/listeningPartyService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function ListeningPartyHomeScreen() {
  const [profileId, setProfileId] = useState("");
  const [parties, setParties] = useState<ListeningParty[]>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const rows = await getListeningParties();
      setParties(rows);
    })();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>Listening Parties</AppText>
        <AppText muted>Join friends in synced music sessions with chat, reactions and shared queue.</AppText>

        <Link href="/listening-parties/create" asChild>
          <Pressable style={styles.primaryBtn}>
            <AppText>Create Party</AppText>
          </Pressable>
        </Link>

        {parties.length === 0 ? <EmptyState title="No active parties" subtitle="Start one and invite friends." /> : null}
        {parties.map((party) => (
          <Pressable
            key={party.id}
            style={styles.card}
            onPress={() => {
              if (!profileId) return;
              void joinParty(party.id, profileId).then(() => {
                pushToast("Joined listening party", "success");
                router.push(`/listening-parties/room/${party.id}`);
              });
            }}
          >
            <AppText>{party.title}</AppText>
            <AppText muted>{party.is_public ? "Public party" : "Private party"}</AppText>
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

import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  addAnnouncementComment,
  getAnnouncementComments,
  getAnnouncements
} from "@/features/social/socialService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

type Announcement = { id: string; title: string; message: string };
type AnnouncementComment = {
  id: string;
  announcement_id: string;
  user_id: string;
  parent_comment_id: string | null;
  message: string;
};

export default function AnnouncementsScreen() {
  const [profileId, setProfileId] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const rows = (await getAnnouncements()) as Announcement[];
      setAnnouncements(rows);
      const commentsRows = await Promise.all(rows.map((a) => getAnnouncementComments(a.id)));
      setComments(commentsRows.flat() as AnnouncementComment[]);
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, AnnouncementComment[]> = {};
    for (const c of comments) {
      map[c.announcement_id] = [...(map[c.announcement_id] ?? []), c];
    }
    return map;
  }, [comments]);

  const refreshComments = async (announcementId: string) => {
    const rows = (await getAnnouncementComments(announcementId)) as AnnouncementComment[];
    setComments((prev) => [...prev.filter((p) => p.announcement_id !== announcementId), ...rows]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.heading}>Announcements</AppText>
        {announcements.length === 0 ? (
          <EmptyState title="No announcements yet" subtitle="Admin announcements will appear here." />
        ) : null}
        {announcements.map((a) => (
          <SectionCard key={a.id} title={a.title}>
            <AppText muted>{a.message}</AppText>
            <AppText muted>Replies</AppText>
            {(grouped[a.id] ?? []).map((c) => (
              <View key={c.id} style={[styles.comment, c.parent_comment_id ? styles.reply : null]}>
                <AppText muted>{c.message}</AppText>
              </View>
            ))}
            <TextInput
              style={styles.input}
              value={draft[a.id] ?? ""}
              onChangeText={(v) => setDraft((prev) => ({ ...prev, [a.id]: v }))}
              placeholder="Reply to announcement"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              style={styles.button}
              onPress={() => {
                const message = (draft[a.id] ?? "").trim();
                if (!profileId || !message) return;
                void addAnnouncementComment(a.id, profileId, message).then(() => {
                  setDraft((prev) => ({ ...prev, [a.id]: "" }));
                  pushToast("Reply sent", "success");
                  return refreshComments(a.id);
                });
              }}
            >
              <AppText>Send Reply</AppText>
            </Pressable>
          </SectionCard>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "800" },
  comment: { backgroundColor: colors.card, borderRadius: 10, padding: 8, marginTop: 6 },
  reply: { marginLeft: 12, backgroundColor: colors.cardAlt },
  input: { marginTop: 8, backgroundColor: colors.card, color: colors.text, borderRadius: 10, padding: 10 },
  button: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 10, padding: 10, alignItems: "center" }
});

import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { addComment, deleteComment, getSongComments } from "@/features/social/commentService";
import { createReport } from "@/features/social/socialService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  parent_comment_id: string | null;
};

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profileId, setProfileId] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const pushToast = useUiStore((s) => s.pushToast);

  const load = async () => {
    if (!id) return;
    const rows = await getSongComments(id);
    setComments(rows as CommentRow[]);
  };

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      await load();
    })();
  }, [id]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.heading}>Song Comments</AppText>
        <TextInput
          style={styles.input}
          placeholder="Write a comment"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!id || !profileId || !text.trim()) return;
            void addComment(id, profileId, text.trim()).then(() => {
              setText("");
              pushToast("Comment posted", "success");
              return load();
            });
          }}
        >
          <AppText>Post Comment</AppText>
        </Pressable>
        {comments.length === 0 ? (
          <EmptyState title="No comments yet" subtitle="Start the conversation." />
        ) : null}
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <AppText>{comment.body}</AppText>
            <AppText muted>{comment.parent_comment_id ? "Reply" : "Comment"}</AppText>
            <View style={styles.row}>
              {comment.user_id === profileId ? (
                <Pressable
                  style={styles.smallBtn}
                  onPress={() => {
                    void deleteComment(comment.id).then(() => {
                      pushToast("Comment deleted", "info");
                      return load();
                    });
                  }}
                >
                  <AppText>Delete</AppText>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.smallBtn}
                onPress={() => {
                  if (!profileId) return;
                  void createReport(profileId, "comment", comment.id, "harassment");
                  pushToast("Comment reported", "success");
                }}
              >
                <AppText>Report</AppText>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: 10, alignItems: "center" },
  commentCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 6 },
  row: { flexDirection: "row", gap: 8 },
  smallBtn: { backgroundColor: colors.cardAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }
});

import { Link, useLocalSearchParams } from "expo-router";
import { Share } from "react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  addPodcastComment,
  getEpisodeById,
  getPodcastComments,
  likePodcastEpisode,
  playPodcastEpisode,
  savePodcastEpisode,
  type PodcastEpisode
} from "@/features/podcasts/podcastService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function PodcastEpisodeScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const [profileId, setProfileId] = useState("");
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; message: string }>>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!episodeId) return;
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const [loadedEpisode, loadedComments] = await Promise.all([getEpisodeById(episodeId), getPodcastComments(episodeId)]);
      setEpisode(loadedEpisode);
      setComments((loadedComments as Array<{ id: string; message: string }>) ?? []);
    })();
  }, [episodeId]);

  if (!episode) {
    return (
      <Screen>
        <EmptyState title="Loading episode..." subtitle="Fetching episode details." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>{episode.title}</AppText>
        <AppText muted>{episode.description ?? "No description for this episode yet."}</AppText>

        <View style={styles.row}>
          <Pressable
            style={styles.btn}
            onPress={() => {
              playPodcastEpisode(episode.id, episode.title);
              pushToast("Podcast episode started", "success");
            }}
          >
            <AppText>Play</AppText>
          </Pressable>
          <Link href={`/podcasts/player/${episode.id}`} asChild>
            <Pressable style={styles.btn}><AppText>Open Player</AppText></Pressable>
          </Link>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void savePodcastEpisode(profileId, episode.id).then(() => pushToast("Episode saved", "success"));
            }}
          >
            <AppText>Save</AppText>
          </Pressable>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void likePodcastEpisode(profileId, episode.id).then(() => pushToast("Episode liked", "success"));
            }}
          >
            <AppText>Like</AppText>
          </Pressable>
          <Pressable
            style={styles.btn}
            onPress={() =>
              void Share.share({
                message: `Listen to "${episode.title}" on Audiomood podcasts`
              })
            }
          >
            <AppText>Share</AppText>
          </Pressable>
        </View>

        <SectionCard title="Transcript">
          <AppText muted>
            {episode.transcript_text ??
              (episode.status === "processing_transcript"
                ? "Transcript is processing and will appear automatically."
                : "No transcript available for this episode yet.")}
          </AppText>
        </SectionCard>

        <SectionCard title="Comments">
          <TextInput
            style={styles.input}
            placeholder="Comment on this episode..."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId || !comment.trim()) return;
              void addPodcastComment(profileId, episode.id, comment.trim()).then(async () => {
                setComment("");
                pushToast("Comment added", "success");
                const latest = await getPodcastComments(episode.id);
                setComments((latest as Array<{ id: string; message: string }>) ?? []);
              });
            }}
          >
            <AppText>Post Comment</AppText>
          </Pressable>

          {comments.map((item) => (
            <View key={item.id} style={styles.comment}>
              <AppText muted>{item.message}</AppText>
            </View>
          ))}
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input: { backgroundColor: colors.cardAlt, borderRadius: 10, color: colors.text, padding: 10 },
  comment: { backgroundColor: colors.cardAlt, borderRadius: 10, padding: 10, marginTop: 8 }
});

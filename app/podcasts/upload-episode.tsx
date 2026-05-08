import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BecomeArtistModal } from "@/components/ui/BecomeArtistModal";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { canManagePodcast, uploadPodcastEpisode } from "@/features/podcasts/podcastService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function UploadPodcastEpisodeScreen() {
  const { podcastId } = useLocalSearchParams<{ podcastId: string }>();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [coverPath, setCoverPath] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!podcastId) return;
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) {
        setChecked(true);
        setAllowed(false);
        return;
      }
      const roleAllowed = profile.account_type === "artist" || profile.account_type === "both";
      const ownsPodcast = await canManagePodcast(podcastId, profile.id);
      setAllowed(roleAllowed && ownsPodcast);
      setChecked(true);
    })();
  }, [podcastId]);

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.heading}>Upload Podcast Episode</AppText>
        {checked && !allowed ? (
          <View style={styles.block}>
            <AppText muted>Only the owning Artist can upload episodes to this podcast.</AppText>
            <Pressable style={[styles.button, { marginTop: 10 }]} onPress={() => setShowBecomeArtist(true)}>
              <AppText>Become Artist</AppText>
            </Pressable>
          </View>
        ) : null}
        <TextInput style={styles.input} placeholder="Episode title" placeholderTextColor={colors.textMuted} value={title} onChangeText={setTitle} />
        <TextInput
          style={styles.input}
          placeholder="Episode description"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Audio path (storage URL/path)"
          placeholderTextColor={colors.textMuted}
          value={audioPath}
          onChangeText={setAudioPath}
        />
        <TextInput
          style={styles.input}
          placeholder="Cover path (optional)"
          placeholderTextColor={colors.textMuted}
          value={coverPath}
          onChangeText={setCoverPath}
        />
        <TextInput
          style={styles.input}
          placeholder="Schedule release date ISO (optional)"
          placeholderTextColor={colors.textMuted}
          value={releaseDate}
          onChangeText={setReleaseDate}
        />
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!allowed) {
              setShowBecomeArtist(true);
              return;
            }
            if (!podcastId || !title.trim() || !audioPath.trim()) return;
            void uploadPodcastEpisode(podcastId, {
              title: title.trim(),
              description: description.trim(),
              audioPath: audioPath.trim(),
              coverPath: coverPath.trim() || undefined,
              releaseDate: releaseDate.trim() || null
            }).then((episodeId) => {
              pushToast("Podcast episode uploaded", "success");
              router.replace(`/podcasts/episode/${episodeId}`);
            });
          }}
        >
          <AppText>Publish Episode</AppText>
        </Pressable>

        <BecomeArtistModal
          visible={showBecomeArtist}
          title="Become an Artist to create podcasts"
          description="Artists can upload music, create podcast shows, host live rooms, and grow their audience."
          onClose={() => setShowBecomeArtist(false)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 10 },
  heading: { fontSize: 24, fontWeight: "800" },
  block: { backgroundColor: colors.cardAlt, borderRadius: 12, padding: 12 },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});

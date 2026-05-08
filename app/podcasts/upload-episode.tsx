import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
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
  const [audioUri, setAudioUri] = useState("");
  const [audioName, setAudioName] = useState("");
  const [audioMime, setAudioMime] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [processTranscript, setProcessTranscript] = useState(true);
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

  const pickEpisodeAudio = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ["audio/mpeg", "audio/mp4", "audio/mp3", "audio/wav", "audio/x-wav"]
    });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (!asset?.uri) return;
    setAudioUri(asset.uri);
    setAudioName(asset.name ?? "episode-audio");
    setAudioMime(asset.mimeType ?? "audio/mpeg");
  };

  const pickCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const img = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
    if (img.canceled || !img.assets[0]?.uri) return;
    setCoverUri(img.assets[0].uri);
  };

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
        <Pressable style={styles.input} onPress={() => void pickEpisodeAudio()}>
          <AppText>{audioName || "Pick episode audio file"}</AppText>
        </Pressable>
        <Pressable style={styles.input} onPress={() => void pickCover()}>
          <AppText>{coverUri ? "Episode cover selected" : "Pick episode cover (optional)"}</AppText>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Schedule release date ISO (optional)"
          placeholderTextColor={colors.textMuted}
          value={releaseDate}
          onChangeText={setReleaseDate}
        />
        <Pressable
          style={styles.input}
          onPress={() => {
            setProcessTranscript((v) => !v);
          }}
        >
          <AppText>Transcript processing: {processTranscript ? "On" : "Off"}</AppText>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!allowed) {
              setShowBecomeArtist(true);
              return;
            }
            if (!podcastId || !title.trim() || !audioUri.trim()) return;
            void uploadPodcastEpisode(podcastId, {
              title: title.trim(),
              description: description.trim(),
              audioUri: audioUri.trim(),
              audioMime,
              coverUri: coverUri.trim() || undefined,
              releaseDate: releaseDate.trim() || null,
              processTranscript
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

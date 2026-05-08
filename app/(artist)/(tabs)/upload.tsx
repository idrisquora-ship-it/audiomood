import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ArtistScreen } from "@/components/artist/ArtistScreen";
import { UploadInput } from "@/components/artist/UploadInput";
import { UploadPickerCard } from "@/components/artist/UploadPickerCard";
import { MoodChip } from "@/components/music/MoodChip";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AppText } from "@/components/ui/AppText";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createAlbum, getLatestArtistSongCoverUri, submitSongForReview, uploadAlbumCover } from "@/features/artist/uploadService";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const LANGUAGES = ["English", "French", "Swahili", "Yoruba", "Portuguese"];

export default function ArtistUploadScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"song" | "album">("song");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioName, setAudioName] = useState("");
  const [audioMime, setAudioMime] = useState<string | null>(null);

  const [coverUriSingle, setCoverUriSingle] = useState<string | null>(null);
  const [defaultCoverUriSingle, setDefaultCoverUriSingle] = useState<string | null>(null);
  const [coverUriAlbum, setCoverUriAlbum] = useState<string | null>(null);

  const [genreId, setGenreId] = useState("");
  const [moodId, setMoodId] = useState("");
  const [language, setLanguage] = useState("English");
  const [releaseDate, setReleaseDate] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [copyrightOk, setCopyrightOk] = useState(false);
  const [autoLyrics, setAutoLyrics] = useState(true);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Array<{ id: string; name: string }>>([]);
  const [moods, setMoods] = useState<Array<{ id: string; name: string }>>([]);
  const [submittedSong, setSubmittedSong] = useState(false);

  useEffect(() => {
    void (async () => {
      const [g, m] = await Promise.all([
        supabase.from("genres").select("id,name").order("name"),
        supabase.from("moods").select("id,name").order("name")
      ]);
      setGenres((g.data ?? []) as Array<{ id: string; name: string }>);
      setMoods((m.data ?? []) as Array<{ id: string; name: string }>);
      const user = (await supabase.auth.getUser()).data.user;
      if (user?.id) {
        const artist = await supabase.from("artist_profiles").select("id").eq("user_id", user.id).maybeSingle();
        if (artist.data?.id) {
          const latestCover = await getLatestArtistSongCoverUri(artist.data.id);
          setDefaultCoverUriSingle(latestCover);
        }
      }
    })();
  }, []);

  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["audio/mpeg", "audio/mp4", "audio/mp3", "audio/wav", "audio/x-wav"]
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      setAudioUri(asset.uri);
      setAudioName((asset.name ?? "audio").slice(0, 60));
      setAudioMime(asset.mimeType ?? "audio/mpeg");
    } catch {
      Alert.alert("Audio picker", "Could not access your files.");
    }
  };

  const pickCover = async (target: "single" | "album") => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to attach cover artwork.");
      return;
    }
    const img = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.92
    });
    if (img.canceled || !img.assets?.[0]) return;
    const uri = img.assets[0].uri;
    if (target === "single") setCoverUriSingle(uri);
    else setCoverUriAlbum(uri);
  };

  const submitSingle = async () => {
    try {
      if (!copyrightOk) {
        Alert.alert("Rights confirmation", "Please confirm you hold the distribution rights.");
        return;
      }
      if (!audioUri) {
        Alert.alert("Audio required", "Select an audio file to continue.");
        return;
      }
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Please log in");
      const artist = await supabase.from("artist_profiles").select("id").eq("user_id", user.id).single();
      if (!artist.data?.id) throw new Error("Artist profile not found.");

      await submitSongForReview({
        artistId: artist.data.id,
        title,
        description,
        audioUri,
        audioMime,
        coverUri: coverUriSingle ?? defaultCoverUriSingle ?? undefined,
        genreId: genreId || undefined,
        moodId: moodId || undefined,
        language,
        explicit,
        releaseDate,
        copyrightAccepted: copyrightOk,
        autoGenerateLyrics: autoLyrics
      });
      setSubmittedSong(true);
    } catch (error) {
      Alert.alert("Submission failed", error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const submitAlbum = async () => {
    try {
      if (!coverUriAlbum) {
        Alert.alert("Cover artwork", "Choose artwork so listeners recognize your release instantly.");
        return;
      }
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Please log in");
      const artist = await supabase.from("artist_profiles").select("id").eq("user_id", user.id).single();
      if (!artist.data?.id) throw new Error("Artist profile not found.");
      if (!title.trim()) throw new Error("Album title is required.");
      const coverPath = await uploadAlbumCover(artist.data.id, coverUriAlbum);
      await createAlbum(artist.data.id, title.trim(), description, coverPath, releaseDate.trim() || undefined);
      Alert.alert(
        "Album saved",
        "Open Music to add tracks to this album and manage your catalogue."
      );
      setTitle("");
      setDescription("");
      setCoverUriAlbum(null);
    } catch (error) {
      Alert.alert("Album", error instanceof Error ? error.message : "Could not create album shell");
    } finally {
      setLoading(false);
    }
  };

  if (submittedSong) {
    return (
      <ArtistScreen edges={["top", "left", "right"]}>
        <EmptyStateCard
          icon="checkmark-done-outline"
          title="Your song is live"
          description={
            autoLyrics
              ? "Lyrics are generating in the background — listeners can stream the track already."
              : "Your track is on the catalogue — share it from your Music tab anytime."
          }
          ctaLabel="Upload another"
          onCtaPress={() => {
            setSubmittedSong(false);
            setTitle("");
            setDescription("");
            setAudioUri(null);
            setAudioName("");
            setCoverUriSingle(null);
            setGenreId("");
            setMoodId("");
            setCopyrightOk(false);
          }}
        />
        <PrimaryButton
          variant="outline"
          title="Manage library"
          style={{ marginTop: 16 }}
          onPress={() => router.push("/(artist)/(tabs)/music")}
        />
      </ArtistScreen>
    );
  }

  return (
    <ArtistScreen edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.root}>
        <AppHeader title="Upload Music" subtitle="Release a single or draft an album with artwork-first presentation." />

        <View style={styles.segment}>
          <MoodChip label="Single" active={mode === "song"} onPress={() => setMode("song")} />
          <MoodChip label="Album" active={mode === "album"} onPress={() => setMode("album")} />
        </View>

        {mode === "song" ? (
          <>
            <UploadInput label="Song title *" placeholder="Night Drive in Lagos" value={title} onChangeText={setTitle} />
            <UploadInput
              label="Description"
              placeholder="Tell fans what inspired this recording"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 90, paddingTop: 12 }}
            />
            <UploadPickerCard
              label="Audio master *"
              hint="Tap to browse your files"
              valueLabel={audioName || undefined}
              picked={!!audioUri}
              icon="musical-notes"
              onPress={() => void pickAudio()}
            />
            <UploadPickerCard
              label="Cover art"
              hint={defaultCoverUriSingle && !coverUriSingle ? "Using your latest song cover · tap to change" : "Square artwork looks best · optional"}
              valueLabel={coverUriSingle ? "Art selected" : defaultCoverUriSingle ? "Using previous cover" : undefined}
              picked={!!coverUriSingle || !!defaultCoverUriSingle}
              icon="image-outline"
              onPress={() => void pickCover("single")}
            />
            {defaultCoverUriSingle ? (
              <Pressable
                style={[styles.dropdown, { marginTop: -2 }]}
                onPress={() => {
                  setDefaultCoverUriSingle(null);
                  setCoverUriSingle(null);
                }}
              >
                <AppText variant="caption">Remove auto cover and publish without artwork</AppText>
                <Ionicons name="close-circle-outline" color={colors.textMuted} size={18} />
              </Pressable>
            ) : null}
            <UploadInput placeholder="YYYY-MM-DD" label="Release date" value={releaseDate} onChangeText={setReleaseDate} />

            <Pressable onPress={() => setLanguageOpen(true)} style={styles.dropdown}>
              <View>
                <AppText variant="caption" secondary>
                  Primary language
                </AppText>
                <AppText variant="body" style={{ marginTop: 8 }}>
                  {language}
                </AppText>
              </View>
              <Ionicons name="chevron-down" color={colors.textMuted} size={20} />
            </Pressable>
            <Modal visible={languageOpen} transparent animationType="fade">
              <Pressable style={styles.modalBg} onPress={() => setLanguageOpen(false)}>
                <View style={styles.modalSheet}>
                  {LANGUAGES.map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => {
                        setLanguage(lang);
                        setLanguageOpen(false);
                      }}
                      style={styles.modalRow}
                    >
                      <AppText variant="body">{lang}</AppText>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>

            <SectionHeader title="Genre" />
            <View style={styles.wrap}>
              {genres.map((g) => (
                <MoodChip key={g.id} label={g.name} active={genreId === g.id} onPress={() => setGenreId(g.id)} />
              ))}
            </View>
            <SectionHeader title="Mood" />
            <View style={styles.wrap}>
              {moods.map((m) => (
                <MoodChip key={m.id} label={m.name} active={moodId === m.id} onPress={() => setMoodId(m.id)} />
              ))}
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body">Explicit content</AppText>
                <AppText variant="caption" secondary>
                  Applies parental guidance labels downstream.
                </AppText>
              </View>
              <Switch value={explicit} onValueChange={setExplicit} />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body">Auto-generate lyrics</AppText>
                <AppText variant="caption" secondary>
                  Sends audio securely to our lyric lab after submission.
                </AppText>
              </View>
              <Switch value={autoLyrics} onValueChange={setAutoLyrics} />
            </View>
            <Pressable style={styles.checkRow} onPress={() => setCopyrightOk(!copyrightOk)}>
              <Ionicons
                name={copyrightOk ? "checkbox" : "square-outline"}
                size={22}
                color={copyrightOk ? colors.primary : colors.textMuted}
              />
              <AppText variant="caption" secondary style={{ flex: 1, marginLeft: 10 }}>
                I confirm that I hold the publishing and distribution rights for this upload.
              </AppText>
            </Pressable>

            <PrimaryButton
              title={loading ? "Publishing…" : "Publish song"}
              onPress={() => void submitSingle()}
              disabled={loading}
              style={{ marginTop: spacing.sectionGap }}
            />
          </>
        ) : (
          <>
            <UploadInput label="Album title *" placeholder="Midnight Chronicles" value={title} onChangeText={setTitle} />
            <UploadInput
              label="Album description"
              placeholder="Synopsis fans will see alongside the tracklist."
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 90 }}
            />
            <UploadPickerCard
              label="Album cover"
              hint="Choose release artwork · required"
              valueLabel={coverUriAlbum ? "Art selected" : undefined}
              picked={!!coverUriAlbum}
              icon="albums-outline"
              onPress={() => void pickCover("album")}
            />
            <UploadInput placeholder="YYYY-MM-DD" label="Street date (optional)" value={releaseDate} onChangeText={setReleaseDate} />
            <AppText secondary variant="caption" style={{ marginBottom: 8 }}>
              After saving, attach uploaded singles inside Music → Album builder.
            </AppText>
            <PrimaryButton title={loading ? "Saving…" : "Save album shell"} disabled={loading} onPress={() => void submitAlbum()} />
          </>
        )}
      </ScrollView>
    </ArtistScreen>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.itemGap, paddingBottom: spacing.artistScrollBottomPadding },
  segment: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 4 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dropdown: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    marginTop: 4
  },
  checkRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", paddingHorizontal: spacing.screenHorizontal },
  modalSheet: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    gap: 0
  },
  modalRow: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
});

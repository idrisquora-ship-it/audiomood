import { router } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AppText } from "@/components/ui/AppText";
import { BecomeArtistModal } from "@/components/ui/BecomeArtistModal";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { createPodcastShow } from "@/features/podcasts/podcastService";
import { supabase } from "@/lib/supabase";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function CreatePodcastScreen() {
  const [allowed, setAllowed] = useState(false);
  const [checkedRole, setCheckedRole] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUri, setCoverUri] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      const ok = profile?.account_type === "artist" || profile?.account_type === "both";
      setAllowed(Boolean(ok));
      setCheckedRole(true);
      const c = await supabase.from("podcast_categories").select("id,name").order("name");
      setCategories((c.data ?? []) as Array<{ id: string; name: string }>);
    })();
  }, []);

  const pickShowCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const img = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
    if (img.canceled || !img.assets[0]?.uri) return;
    setCoverUri(img.assets[0].uri);
  };

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.heading}>Create Podcast Show</AppText>
        {checkedRole && !allowed ? (
          <View style={styles.block}>
            <AppText muted>Only Artist accounts can create podcast shows.</AppText>
            <Pressable style={[styles.button, { marginTop: 10 }]} onPress={() => setShowBecomeArtist(true)}>
              <AppText>Become Artist</AppText>
            </Pressable>
          </View>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Podcast title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Podcast description"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Pressable style={styles.input} onPress={() => void pickShowCover()}>
          <AppText>{coverUri ? "Cover selected" : "Pick podcast cover image"}</AppText>
        </Pressable>
        <Pressable
          style={styles.input}
          onPress={() => {
            if (!categories.length) return;
            const idx = Math.max(0, categories.findIndex((c) => c.id === categoryId));
            const next = categories[(idx + 1) % categories.length];
            setCategoryId(next.id);
          }}
        >
          <AppText>
            Category: {categories.find((c) => c.id === categoryId)?.name ?? (categories[0]?.name ?? "Uncategorized")}
          </AppText>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            if (!allowed) {
              setShowBecomeArtist(true);
              return;
            }
            if (!title.trim()) return;
            void (async () => {
              const profile = await getMyProfile();
              if (!profile?.id) return;
              const fallbackCategory = categoryId || categories[0]?.id || null;
              const podcastId = await createPodcastShow(profile.id, {
                title: title.trim(),
                description: description.trim(),
                categoryId: fallbackCategory,
                coverUri: coverUri || undefined
              });
              pushToast("Podcast created", "success");
              router.replace(`/podcasts/${podcastId}`);
            })();
          }}
        >
          <AppText>Create Show</AppText>
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

import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ArtistCircle } from "@/components/music/ArtistCircle";
import { MusicCard } from "@/components/music/MusicCard";
import { MoodChip } from "@/components/music/MoodChip";
import { PlaylistMoodCard } from "@/components/music/PlaylistMoodCard";
import { SongRow } from "@/components/music/SongRow";
import { DiscoverFeatureCard } from "@/components/discover/DiscoverFeatureCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  DEMO_ARTISTS,
  DEMO_MOOD_CHIPS,
  DEMO_MOOD_MIXES,
  DEMO_SONGS,
  type DemoSong
} from "@/constants/demoContent";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getRecommendationSections } from "@/features/recommendations/feedService";
import { getApprovedSongs, playSongFromHome } from "@/features/music/songService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

function greetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function ListenerHomeScreen() {
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [name, setName] = useState("friend");
  const [profileId, setProfileId] = useState("");
  const [moodChip, setMoodChip] = useState<number | null>(null);
  const [catalogue, setCatalogue] = useState<DemoSong[]>([...DEMO_SONGS]);
  const [recCount, setRecCount] = useState(0);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      const display = profile?.display_name ?? profile?.username ?? "friend";
      setName(display);

      if (profile?.id) {
        setProfileId(profile.id);
        const [sections, approved] = await Promise.all([
          getRecommendationSections(profile.id),
          getApprovedSongs(24)
        ]);
        setRecCount(sections.recommendedForYou.length);
        const mapped: DemoSong[] =
          (approved ?? []).map((song, idx) => ({
            id: song.id,
            title: song.title,
            artist: ["Nova Ray", "Kairo Beats", "Luna Sound", "Vibe Kid"][idx % 4] ?? "Artist",
            gradient: DEMO_SONGS[idx % DEMO_SONGS.length]?.gradient ?? DEMO_SONGS[0].gradient
          })) ?? [];
        setCatalogue(mapped.length ? mapped : [...DEMO_SONGS]);
      } else {
        setCatalogue([...DEMO_SONGS]);
      }
    })();
  }, []);

  const continueTracks = useMemo(() => catalogue.slice(0, 8), [catalogue]);
  const recoTracks = useMemo(() => catalogue.slice(2, 10), [catalogue]);
  const newReleases = useMemo(() => catalogue.slice().reverse(), [catalogue]);
  const trendingTracks = useMemo(() => catalogue.slice(0, 5), [catalogue]);

  const playFromCard = async (song: DemoSong) => {
    if (!profileId) {
      pushToast("Sign in to play music.", "info");
      return;
    }
    if (!isUuid(song.id)) {
      router.push("/(listener)/(tabs)/discover");
      return;
    }
    const ok = await playSongFromHome(profileId, song.id);
    if (!ok?.ok) pushToast("Could not start playback offline? Try disabling offline.", "error");
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.sectionGap * 4 }}
      >
        <AppHeader
          title={`${greetingLabel()}, ${name}`}
          subtitle="What mood are you in today?"
          right={
            <>
              <Link href="/notifications" asChild>
                <Pressable style={styles.iconBtn} accessibilityLabel="Notifications">
                  <Ionicons name="notifications-outline" size={22} color={colors.text} />
                </Pressable>
              </Link>
              <Link href="/settings" asChild>
                <Pressable style={styles.avatar} accessibilityLabel="Settings">
                  <AppText variant="caption" style={styles.avatarText}>
                    {(name || "A").slice(0, 1).toUpperCase()}
                  </AppText>
                </Pressable>
              </Link>
            </>
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {DEMO_MOOD_CHIPS.map((m, idx) => (
            <MoodChip key={m} label={m} active={moodChip === idx} onPress={() => setMoodChip(idx === moodChip ? null : idx)} />
          ))}
        </ScrollView>

        <SectionHeader title="Continue Listening" />
        <AppText variant="caption" secondary style={styles.sectionHint}>
          Tracks you start will appear here — tap any card to jump in.
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
          {continueTracks.map((song) => (
            <MusicCard
              key={song.id}
              title={song.title}
              subtitle={song.artist}
              gradient={song.gradient}
              onPress={() => void playFromCard(song)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Recommended For You" />
        {recCount === 0 ? (
          <AppText variant="caption" secondary style={styles.sectionHint}>
            Your mix is warming up — like a few tracks to sharpen this row.
          </AppText>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
          {recoTracks.map((song) => (
            <MusicCard
              key={`r-${song.id}`}
              title={song.title}
              subtitle={song.artist}
              gradient={song.gradient}
              onPress={() => void playFromCard(song)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Mood Mixes" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
          {DEMO_MOOD_MIXES.map((mix) => (
            <PlaylistMoodCard
              key={mix.id}
              title={mix.title}
              subtitle={mix.subtitle}
              gradient={mix.gradient}
              onPress={() => router.push("/mood-radio")}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Trending Now" />
        <View style={styles.listBlock}>
          {trendingTracks.map((song, idx) => (
            <SongRow
              key={`t-${song.id}`}
              rank={idx + 1}
              title={song.title}
              artist={song.artist}
              gradient={song.gradient}
              onPress={() => void playFromCard(song)}
            />
          ))}
        </View>

        <SectionHeader title="New Releases" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
          {newReleases.map((song) => (
            <MusicCard
              key={`n-${song.id}`}
              width={148}
              title={song.title}
              subtitle={song.artist}
              gradient={song.gradient}
              onPress={() => void playFromCard(song)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Artists for you" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
          {DEMO_ARTISTS.map((a, i) => (
            <ArtistCircle
              key={a.id}
              name={a.name}
              initial={a.initial}
              gradient={DEMO_SONGS[i % DEMO_SONGS.length].gradient}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Spotlight" />
        <DiscoverFeatureCard
          icon="radio-outline"
          title="AI Mood Radio"
          description="Endless music based on your mood and taste — tune in any time."
          ctaLabel="Start Radio"
          onPress={() => router.push("/mood-radio")}
        />
        <DiscoverFeatureCard
          icon="people-outline"
          title="Listening Parties"
          description="Join synced rooms with chat, reactions, and host-led playback."
          ctaLabel="Join a party"
          onPress={() => router.push("/listening-parties")}
        />
        <DiscoverFeatureCard
          icon="mic-outline"
          title="Live Audio Rooms"
          description="Drop into live spaces for launches, Q&A, and creator sessions."
          ctaLabel="Explore rooms"
          onPress={() => router.push("/live-rooms")}
        />
      </ScrollView>
      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: colors.text, fontWeight: "800", fontFamily: undefined },
  chipsRow: { paddingVertical: 4, marginBottom: spacing.sectionGap },
  sectionHint: { marginTop: -8, marginBottom: 8 },
  hCarousel: { marginBottom: spacing.sectionGap },
  listBlock: { marginBottom: spacing.sectionGap }
});

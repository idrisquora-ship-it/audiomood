import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { DiscoverFeatureCard } from "@/components/discover/DiscoverFeatureCard";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ArtistCircle } from "@/components/music/ArtistCircle";
import { DEMO_ARTISTS, DEMO_SONGS } from "@/constants/demoContent";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SongRow } from "@/components/music/SongRow";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SectionCard } from "@/components/cards/SectionCard";
import { getMyProfile } from "@/features/auth/authService";
import { likeSong, unlikeSong } from "@/features/music/likedSongsService";
import { ensureSongDownloaded } from "@/features/music/downloadService";
import { getApprovedSongs, playSongFromHome } from "@/features/music/songService";
import { getPodcasts, type PodcastShow } from "@/features/podcasts/podcastService";
import { createReport } from "@/features/social/socialService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type SongLite = {
  id: string;
  title: string;
  like_count: number;
  audio_path: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ListenerDiscoverScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<SongLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState("");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      try {
        const rows = await getApprovedSongs(22);
        const podcastRows = await getPodcasts(8);
        setSongs(rows as SongLite[]);
        setPodcasts(podcastRows);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const browseSongs = useMemo(() => {
    if (songs.length > 0) return songs;
    return DEMO_SONGS.map((d, idx) => ({
      id: d.id,
      title: d.title,
      like_count: 120 + idx * 11,
      audio_path: ""
    }));
  }, [songs]);

  const gradientForIndex = (i: number) => DEMO_SONGS[i % DEMO_SONGS.length].gradient;

  const toggleLike = async (songId: string) => {
    if (!profileId || !UUID_RE.test(songId)) {
      pushToast("Like tracks once they are synced from Audiomood artists.", "info");
      return;
    }
    const isLiked = likedMap[songId];
    if (isLiked) {
      await unlikeSong(profileId, songId);
      pushToast("Removed from liked songs", "info");
    } else {
      await likeSong(profileId, songId);
      pushToast("Added to Liked Songs", "success");
    }
    setLikedMap((prev) => ({ ...prev, [songId]: !isLiked }));
  };

  const playSongRow = async (song: SongLite) => {
    if (!UUID_RE.test(song.id)) {
      pushToast("Add your own uploads in Studio to populate this lane.", "info");
      router.push("/(listener)/(tabs)/home");
      return;
    }
    if (!profileId) return pushToast("Sign in to play.", "error");
    const res = await playSongFromHome(profileId, song.id);
    if (!res.ok) pushToast("Download this song or disable offline-only mode.", "error");
  };

  const downloadSong = async (song: SongLite) => {
    if (!profileId || !UUID_RE.test(song.id)) {
      pushToast("Downloads activate only for uploaded tracks.", "info");
      return;
    }
    await ensureSongDownloaded(profileId, song.id, song.audio_path).then(() =>
      pushToast("Saved for offline playback", "success")
    );
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.sectionGap * 4 }}>
        <AppHeader title="Discover" subtitle="Find new sounds, moods, and creators curated for listeners." />

        <DiscoverFeatureCard
          icon="radio-outline"
          title="Start AI Mood Radio"
          description="Infinite blend based on moods, skips, saves, and time of day."
          ctaLabel="Start"
          onPress={() => router.push("/mood-radio")}
        />
        <DiscoverFeatureCard
          icon="people-outline"
          title="Listening Parties"
          description="Host or join synced rooms with fans around the globe."
          ctaLabel="Join session"
          onPress={() => router.push("/listening-parties")}
        />
        <DiscoverFeatureCard
          icon="mic-outline"
          title="Live Audio Rooms"
          description="Press play on live chats, demos, AMAs and launch nights."
          ctaLabel="Explore"
          onPress={() => router.push("/live-rooms")}
        />

        <SectionHeader title="Charts & spotlight" />

        <SectionCard title="Spotlight playlists">
          <AppText secondary variant="body">
            Hand-picked ladders refresh daily — Follow artists to personalize this stack.
          </AppText>
        </SectionCard>

        <SectionCard title="Independent artists">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DEMO_ARTISTS.map((a, i) => (
              <ArtistCircle key={a.id} name={a.name} initial={a.initial} gradient={gradientForIndex(i)} />
            ))}
          </ScrollView>
        </SectionCard>

        <SectionHeader title="Podcasts" />
        <SectionCard title="Featured pods">
          {podcasts.length === 0 ? (
            <EmptyStateCard
              icon="mic-outline"
              title="Shows land here automatically"
              description="Catch new voices as creators publish on Audiomood."
              ctaLabel="Browse podcasts hub"
              onCtaPress={() => router.push("/podcasts")}
            />
          ) : (
            podcasts.map((podcast) => (
              <Link key={podcast.id} href={`/podcasts/${podcast.id}`} asChild>
                <Pressable style={styles.podRow}>
                  <AppText variant="body">{podcast.title}</AppText>
                  <AppText secondary variant="caption" numberOfLines={2}>
                    {podcast.description ?? "Tap to binge episodes"}
                  </AppText>
                </Pressable>
              </Link>
            ))
          )}
        </SectionCard>

        <SectionHeader title="Fresh uploads" />

        {loading ? (
          <View style={{ gap: 8 }}>
            <SkeletonBlock style={{ height: 72 }} />
            <SkeletonBlock style={{ height: 72 }} />
            <SkeletonBlock style={{ height: 72 }} />
          </View>
        ) : browseSongs.length === 0 ? (
          <EmptyStateCard icon="albums-outline" title="Quiet out there" description="Uploads will appear instantly when artists publish." />
        ) : (
          browseSongs.map((song, idx) => (
            <View key={song.id} style={{ marginBottom: 8 }}>
              <SongRow
                title={song.title}
                artist="Audiomood artist"
                gradient={gradientForIndex(idx)}
                rank={idx + 1}
                onPress={() => void playSongRow(song)}
              />
              <View style={styles.rowActions}>
                <PrimaryButton
                  variant="outline"
                  title="Comments"
                  style={styles.compactBtn}
                  onPress={() => {
                    if (!UUID_RE.test(song.id)) {
                      pushToast("Comments unlock when the track is uploaded to Audiomood.", "info");
                      return;
                    }
                    router.push(`/song/${song.id}`);
                  }}
                />
                <PrimaryButton variant="outline" title={likedMap[song.id] ? "Unlike" : "Like"} style={styles.compactBtn} onPress={() => void toggleLike(song.id)} />
                <PrimaryButton variant="outline" title="Save offline" style={styles.compactBtn} onPress={() => void downloadSong(song)} />
                <PrimaryButton variant="outline" title="Report" style={styles.compactBtn}
                  onPress={() => {
                    if (!profileId) return;
                    if (!UUID_RE.test(song.id)) {
                      pushToast("Reporting is available for published tracks.", "info");
                      return;
                    }
                    void createReport(profileId, "song", song.id, "inappropriate song");
                    pushToast("Report submitted", "success");
                  }}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  podRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 6
  },
  rowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginLeft: 4
  },
  compactBtn: { paddingVertical: 8, paddingHorizontal: 10, alignSelf: "flex-start", marginBottom: 0 }
});

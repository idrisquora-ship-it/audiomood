import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { DiscoverFeatureCard } from "@/components/discover/DiscoverFeatureCard";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ArtistCircle } from "@/components/music/ArtistCircle";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SongRow } from "@/components/music/SongRow";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SectionCard } from "@/components/cards/SectionCard";
import { ensureProfileForSession } from "@/features/auth/authService";
import { likeSong, unlikeSong } from "@/features/music/likedSongsService";
import { ensureSongDownloaded } from "@/features/music/downloadService";
import {
  getApprovedSongs,
  getArtistNameMap,
  getFeaturedArtistCircles,
  gradientForSongId,
  playSongFromHome
} from "@/features/music/songService";
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
  artist_id: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ListenerDiscoverScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<SongLite[]>([]);
  const [artistLookup, setArtistLookup] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState("");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Array<{ id: string; name: string; initial: string; gradient: [string, string] }>>(
    []
  );
  const pushToast = useUiStore((s) => s.pushToast);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        setLoading(true);
        const ensured = await ensureProfileForSession();
        const pid = ensured?.id ?? "";
        setProfileId(pid);
        try {
          const rows = (await getApprovedSongs(40)) as SongLite[];
          const artistIds = [...new Set(rows.map((r) => r.artist_id).filter(Boolean))];
          let names: Record<string, string> = {};
          if (artistIds.length) {
            names = await getArtistNameMap(artistIds);
          }
          const podcastRows = await getPodcasts(8).catch(() => [] as PodcastShow[]);
          const circles = await getFeaturedArtistCircles(12).catch(() => []);

          if (cancelled) return;
          setSongs(rows);
          setArtistLookup(names);
          setPodcasts(podcastRows ?? []);
          setFeaturedArtists(
            circles.map((a) => ({ id: a.id, name: a.name, initial: a.initial, gradient: a.gradient }))
          );
        } catch (e) {
          if (!cancelled) pushToast(e instanceof Error ? e.message : "Discover failed to load", "error");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [pushToast])
  );

  const browseSongs = useMemo(() => songs, [songs]);

  const toggleLike = async (songId: string) => {
    if (!profileId || !UUID_RE.test(songId)) {
      pushToast("Sign in to like songs.", "info");
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
    if (!UUID_RE.test(song.id)) return;
    if (!profileId) {
      pushToast("Sign in to play music.", "info");
      router.replace("/(auth)/welcome");
      return;
    }
    const res = await playSongFromHome(profileId, song.id);
    if (!res.ok) pushToast("Can't play — check offline mode or download the track.", "error");
  };

  const downloadSong = async (song: SongLite) => {
    if (!profileId || !UUID_RE.test(song.id)) {
      pushToast("Sign in to download.", "info");
      return;
    }
    await ensureSongDownloaded(profileId, song.id, song.audio_path).then(() =>
      pushToast("Saved for offline playback", "success")
    );
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.sectionGap * 4 }}>
        <AppHeader title="Discover" subtitle="Approved tracks from Audiomood artists and your hub links." />

        <DiscoverFeatureCard
          icon="settings-outline"
          title="Listening preferences"
          description="Playback, moods, podcasts, privacy, downloads, subscription & support live in Settings."
          ctaLabel="Open Settings"
          onPress={() => router.push("/settings")}
        />

        <SectionHeader title="Charts & spotlight" />

        <SectionCard title="Spotlight playlists">
          <AppText secondary variant="body">
            Saved playlists appear in Library. Create playlists from your profile tab.
          </AppText>
        </SectionCard>

        <SectionCard title="Featured artists">
          {featuredArtists.length === 0 ? (
            <AppText secondary variant="caption">
              No artists in the spotlight yet.
            </AppText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredArtists.map((a, i) => (
                <ArtistCircle key={a.id} name={a.name} initial={a.initial} gradient={a.gradient} />
              ))}
            </ScrollView>
          )}
        </SectionCard>

        <SectionHeader title="Podcasts" />
        <SectionCard title="Featured pods">
          {podcasts.length === 0 ? (
            <EmptyStateCard
              icon="mic-outline"
              title="No podcasts published"
              description="Shows appear automatically when creators add them."
              ctaLabel="Open podcasts"
              onCtaPress={() => router.push("/podcasts")}
            />
          ) : (
            podcasts.map((podcast) => (
              <Link key={podcast.id} href={`/podcasts/${podcast.id}`} asChild>
                <Pressable style={styles.podRow}>
                  <AppText variant="body">{podcast.title}</AppText>
                  <AppText secondary variant="caption" numberOfLines={2}>
                    {podcast.description ?? "Tap for episodes"}
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
          <EmptyStateCard
            icon="albums-outline"
            title="No tracks in the catalogue"
            description="Uploads from artists show up here as soon as they are published."
          />
        ) : (
          browseSongs.map((song, idx) => (
            <View key={song.id} style={{ marginBottom: 8 }}>
              <SongRow
                title={song.title}
                artist={artistLookup[song.artist_id] ?? "Artist"}
                gradient={gradientForSongId(song.id)}
                rank={idx + 1}
                onPress={() => void playSongRow(song)}
              />
              <View style={styles.rowActions}>
                <PrimaryButton
                  variant="outline"
                  title="Comments"
                  style={styles.compactBtn}
                  onPress={() => {
                    router.push(`/song/${song.id}`);
                  }}
                />
                <PrimaryButton
                  variant="outline"
                  title={likedMap[song.id] ? "Unlike" : "Like"}
                  style={styles.compactBtn}
                  onPress={() => void toggleLike(song.id)}
                />
                <PrimaryButton variant="outline" title="Save offline" style={styles.compactBtn} onPress={() => void downloadSong(song)} />
                <PrimaryButton
                  variant="outline"
                  title="Report"
                  style={styles.compactBtn}
                  onPress={() => {
                    if (!profileId) {
                      pushToast("Sign in to report.", "info");
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

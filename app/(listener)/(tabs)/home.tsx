import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ArtistCircle } from "@/components/music/ArtistCircle";
import { MusicCard } from "@/components/music/MusicCard";
import { MoodChip } from "@/components/music/MoodChip";
import { PlaylistMoodCard } from "@/components/music/PlaylistMoodCard";
import { SongRow } from "@/components/music/SongRow";
import { AppHeader } from "@/components/ui/AppHeader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { ensureProfileForSession } from "@/features/auth/authService";
import type { SongCardRow } from "@/features/music/songService";
import {
  getApprovedSongsWithArtists,
  getContinueListeningCards,
  getFeaturedArtistCircles,
  getNewReleaseSongCards,
  getRecommendedSongCards,
  getTrendingSongCards,
  playSongFromHome
} from "@/features/music/songService";
import { supabase } from "@/lib/supabase";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

function greetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const isSongId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function ListenerHomeScreen() {
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [name, setName] = useState("friend");
  const [profileId, setProfileId] = useState("");
  const [moods, setMoods] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [continueListening, setContinueListening] = useState<SongCardRow[]>([]);
  const [recommended, setRecommended] = useState<SongCardRow[]>([]);
  const [trending, setTrending] = useState<SongCardRow[]>([]);
  const [newReleases, setNewReleases] = useState<SongCardRow[]>([]);
  const [browse, setBrowse] = useState<SongCardRow[]>([]);
  const [artists, setArtists] = useState<Array<{ id: string; name: string; initial: string; gradient: [string, string] }>>(
    []
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        await supabase.auth.refreshSession().catch(() => undefined);
        const profile = await ensureProfileForSession();
        if (cancelled) return;
        const dn = profile?.display_name ?? profile?.username;
        const u = await supabase.auth.getUser();
        const email = u.data.user?.email ?? "friend";
        setName(typeof dn === "string" && dn.length > 0 ? dn.replace(/^@/, "") : email.split("@")[0] ?? "friend");
        const pid = profile?.id ?? "";
        setProfileId(pid);

        const { data: moodRows } = await supabase.from("moods").select("id,name").order("name").limit(16);
        if (!cancelled) setMoods((moodRows ?? []) as Array<{ id: string; name: string }>);

        const mf = selectedMoodId ?? undefined;

        try {
          if (pid) {
            const [cont, reco, featRows, tr, nr, br] = await Promise.all([
              getContinueListeningCards(pid, 12),
              getRecommendedSongCards(pid, 14),
              getFeaturedArtistCircles(14),
              getTrendingSongCards(8, mf),
              getNewReleaseSongCards(14),
              getApprovedSongsWithArtists(16, mf)
            ]);
            if (cancelled) return;
            setContinueListening(cont);
            setRecommended(reco.length > 0 ? reco : await getApprovedSongsWithArtists(14, mf));
            setArtists(featRows.map((a) => ({ id: a.id, name: a.name, initial: a.initial, gradient: a.gradient })));
            setTrending(tr);
            setNewReleases(nr);
            setBrowse(br);
          } else {
            const [tr, nr, br] = await Promise.all([
              getTrendingSongCards(8, mf),
              getNewReleaseSongCards(14),
              getApprovedSongsWithArtists(16, mf)
            ]);
            if (cancelled) return;
            setContinueListening([]);
            setRecommended([]);
            setArtists([]);
            setTrending(tr);
            setNewReleases(nr);
            setBrowse(br);
          }
        } catch (e) {
          if (!cancelled) pushToast(e instanceof Error ? e.message : "Couldn't load catalogue.", "error");
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [selectedMoodId, pushToast])
  );

  const recoTracks = useMemo(() => recommended.slice(0, 12), [recommended]);

  const playFromCard = async (song: SongCardRow) => {
    if (!profileId) {
      pushToast("Sign in to play music.", "info");
      router.replace("/(auth)/welcome");
      return;
    }
    if (!isSongId(song.id)) return;
    const res = await playSongFromHome(profileId, song.id);
    if (!res.ok) pushToast("Can't play — check offline settings or storage access for audio.", "error");
  };

  const moodMixes = useMemo(() => moods.slice(0, 8), [moods]);

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
            <Link href="/settings" asChild>
              <Pressable style={styles.avatar} accessibilityLabel="Settings">
                <AppText variant="caption" style={styles.avatarText}>
                  {(name || "A").slice(0, 1).toUpperCase()}
                </AppText>
              </Pressable>
            </Link>
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <MoodChip label="All moods" active={selectedMoodId === null} onPress={() => setSelectedMoodId(null)} />
          {moods.map((m) => (
            <MoodChip
              key={m.id}
              label={m.name}
              active={selectedMoodId === m.id}
              onPress={() => setSelectedMoodId((cur) => (cur === m.id ? null : m.id))}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Continue Listening" />
        <AppText variant="caption" secondary style={styles.sectionHint}>
          Tracks you play show up here automatically.
        </AppText>
        {continueListening.length === 0 ? (
          <EmptyStateCard
            icon="play-circle-outline"
            title="Nothing in progress"
            description="Start a song from Discover to build your history."
            ctaLabel="Open Discover"
            onCtaPress={() => router.push("/(listener)/(tabs)/discover")}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
            {continueListening.map((song) => (
              <MusicCard
                key={song.id}
                title={song.title}
                subtitle={song.artist}
                gradient={song.gradient}
                onPress={() => void playFromCard(song)}
              />
            ))}
          </ScrollView>
        )}

        <SectionHeader title="Recommended For You" />
        {recoTracks.length === 0 ? (
          <AppText variant="caption" secondary style={styles.sectionHint}>
            Play and like songs — scores update from your listening.
          </AppText>
        ) : null}
        {recoTracks.length === 0 ? (
          <EmptyStateCard icon="musical-notes-outline" title="No scored picks yet" description="Trending tracks below are playable now." />
        ) : (
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
        )}

        <SectionHeader title="Mood mixes" />
        {moodMixes.length === 0 ? (
          <EmptyStateCard icon="color-palette-outline" title="No moods yet" description="Add rows to the moods table in Supabase to enable mixes." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
            {moodMixes.map((m) => (
              <PlaylistMoodCard
                key={m.id}
                title={`${m.name} mix`}
                subtitle="Tune mood radio around this vibe"
                gradient={["#1A1035", "#FF6A00"]}
                onPress={() => {
                  setSelectedMoodId(m.id);
                  router.push("/mood-radio");
                }}
              />
            ))}
          </ScrollView>
        )}

        <SectionHeader title="Trending Now" />
        {trending.length === 0 ? (
          <EmptyStateCard
            icon="trending-up-outline"
            title="No trending tracks yet"
            description="Music appears here as soon as artists publish to the catalogue."
          />
        ) : (
          <View style={styles.listBlock}>
            {trending.map((song, idx) => (
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
        )}

        <SectionHeader title="New Releases" />
        {newReleases.length === 0 ? (
          <EmptyStateCard icon="albums-outline" title="Waiting for uploads" description="New releases from the catalogue show up here." />
        ) : (
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
        )}

        <SectionHeader title="Artists for you" />
        {artists.length === 0 ? (
          <EmptyStateCard icon="people-outline" title="No spotlight artists" description="Approved creators appear ranked by listeners." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hCarousel}>
            {artists.map((a) => (
              <ArtistCircle key={a.id} name={a.name} initial={a.initial} gradient={a.gradient} />
            ))}
          </ScrollView>
        )}

        <SectionHeader title="Browse" />
        {browse.length === 0 ? (
          <EmptyStateCard icon="albums-outline" title="Nothing to show" description="Relax filters or ask your admin to approve songs." />
        ) : (
          <View style={styles.listBlock}>
            {browse.map((song, idx) => (
              <SongRow
                key={`b-${song.id}`}
                rank={idx + 1}
                title={song.title}
                artist={song.artist}
                gradient={song.gradient}
                onPress={() => void playFromCard(song)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
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

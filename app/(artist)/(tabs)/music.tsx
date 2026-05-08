import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SectionCard } from "@/components/cards/SectionCard";
import { ArtistScreen } from "@/components/artist/ArtistScreen";
import { ArtistSongCard } from "@/components/artist/ArtistSongCard";
import { UploadInput } from "@/components/artist/UploadInput";
import { mapDbSongStatus } from "@/components/artist/SongStatusBadge";
import { MoodChip } from "@/components/music/MoodChip";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import {
  assignSongToAlbum,
  assignSongsToAlbum,
  deleteAlbum,
  getArtistAlbums
} from "@/features/artist/albumService";
import { createAlbum, uploadAlbumCover } from "@/features/artist/uploadService";
import { useUiStore } from "@/store/uiStore";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type TabKey = "songs" | "albums" | "drafts" | "reviews";

type ArtistSongRow = {
  id: string;
  title: string;
  status: string;
  album_id: string | null;
  album_track_number: number | null;
  play_count: number | null;
  like_count: number | null;
  cover_path: string | null;
};

function coverUrl(bucket: string, path?: string | null) {
  if (!path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export default function ArtistMusicScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("songs");
  const [artistId, setArtistId] = useState("");
  const [songs, setSongs] = useState<ArtistSongRow[]>([]);
  const [albums, setAlbums] = useState<Array<{ id: string; title: string; cover_path: string | null; release_date: string | null }>>([]);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumReleaseDate, setAlbumReleaseDate] = useState("");
  const [albumCoverUri, setAlbumCoverUri] = useState<string | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [albumToDelete, setAlbumToDelete] = useState<{ id: string; title: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pushToast = useUiStore((s) => s.pushToast);

  const loadData = useCallback(async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const artist = await supabase.from("artist_profiles").select("id").eq("user_id", user.id).single();
    if (!artist.data?.id) return;
    setArtistId(artist.data.id);
    const [songsRes, albumsRes] = await Promise.all([
      supabase
        .from("songs")
        .select("id,title,status,album_id,album_track_number,play_count,like_count,cover_path")
        .eq("artist_id", artist.data.id)
        .order("created_at", { ascending: false }),
      getArtistAlbums(artist.data.id)
    ]);
    setSongs((songsRes.data ?? []) as ArtistSongRow[]);
    setAlbums(albumsRes as Array<{ id: string; title: string; cover_path: string | null; release_date: string | null }>);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const songBuckets = useMemo(() => {
    const drafts = songs.filter((s) => ["draft", "uploading"].includes(s.status));
    const reviews = songs.filter((s) => s.status === "processing_lyrics");
    const dr = new Set(drafts.map((s) => s.id));
    const rv = new Set(reviews.map((s) => s.id));
    const catalog = songs.filter((s) => !dr.has(s.id) && !rv.has(s.id));
    return { drafts, reviews, catalog };
  }, [songs]);

  const visibleSongs =
    tab === "drafts" ? songBuckets.drafts : tab === "reviews" ? songBuckets.reviews : songBuckets.catalog;

  const albumTrackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach((s) => {
      if (!s.album_id) return;
      counts[s.album_id] = (counts[s.album_id] ?? 0) + 1;
    });
    return counts;
  }, [songs]);

  const pickAlbumCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access.");
      return;
    }
    const img = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
    if (!img.canceled && img.assets[0]?.uri) setAlbumCoverUri(img.assets[0].uri);
  };

  const onCreateAlbum = async () => {
    try {
      if (!artistId || !albumTitle.trim()) return;
      let uploaded: string | undefined;
      if (albumCoverUri) uploaded = await uploadAlbumCover(artistId, albumCoverUri);
      const album = await createAlbum(artistId, albumTitle.trim(), undefined, uploaded, albumReleaseDate.trim() || undefined);
      if (selectedSongIds.length > 0) {
        await assignSongsToAlbum(selectedSongIds, album.id);
      }
      setAlbumTitle("");
      setAlbumReleaseDate("");
      setAlbumCoverUri(null);
      setSelectedSongIds([]);
      await loadData();
      pushToast("Album saved", "success");
    } catch (error) {
      Alert.alert("Albums", error instanceof Error ? error.message : "Failed to create album");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedSongIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <ArtistScreen edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadData().finally(() => setRefreshing(false));
            }}
          />
        }
      >
        <AppHeader
          title="Your Music"
          subtitle="Organize releases, see what is still generating lyrics, and manage albums in one place."
        />
        <PrimaryButton title="Upload song" onPress={() => router.push("/(artist)/(tabs)/upload")} />

        <View style={styles.tabs}>
          {(["songs", "albums", "drafts", "reviews"] as TabKey[]).map((key) => (
            <MoodChip
              key={key}
              label={key === "songs" ? "Songs" : key === "albums" ? "Albums" : key === "drafts" ? "Drafts" : "Lyrics"}
              active={tab === key}
              onPress={() => setTab(key)}
            />
          ))}
        </View>

        {songs.length === 0 ? (
          <EmptyStateCard
            icon="musical-notes-outline"
            title="No music uploaded yet"
            description="Publish singles, manage drafts, and bundle albums from one workspace."
            ctaLabel="Upload song"
            onCtaPress={() => router.push("/(artist)/(tabs)/upload")}
          />
        ) : null}

        {tab === "songs" ? (
          <View style={{ gap: spacing.itemGap }}>
            {visibleSongs.length === 0 ? (
              <AppText secondary variant="body">
                Nothing in your live catalogue yet — finish a draft or publish from Upload.
              </AppText>
            ) : (
              visibleSongs.map((song) => (
                <ArtistSongCard
                  key={song.id}
                  title={song.title}
                  status={mapDbSongStatus(song.status)}
                  plays={song.play_count ?? 0}
                  likes={song.like_count ?? 0}
                  accentSeed={song.title.length}
                  onMenuPress={() => Alert.alert(song.title, "Editing tools arrive in a future drop.")}
                />
              ))
            )}
          </View>
        ) : null}

        {tab === "drafts" ? (
          <View style={{ gap: spacing.itemGap }}>
            {songBuckets.drafts.length === 0 ? (
              <AppText secondary variant="body">
                Draft uploads live here whenever you pause mid-release.
              </AppText>
            ) : (
              songBuckets.drafts.map((song) => (
                <ArtistSongCard
                  key={song.id}
                  title={song.title}
                  status={mapDbSongStatus(song.status)}
                  plays={song.play_count ?? 0}
                  likes={song.like_count ?? 0}
                  accentSeed={song.title.length}
                />
              ))
            )}
          </View>
        ) : null}

        {tab === "reviews" ? (
          <View style={{ gap: spacing.itemGap }}>
            {songBuckets.reviews.length === 0 ? (
              <EmptyStateCard
                icon="hourglass-outline"
                title="Nothing generating lyrics"
                description="When you turn on auto-lyrics on upload, those tracks appear here until generation finishes."
              />
            ) : (
              songBuckets.reviews.map((song) => (
                <ArtistSongCard
                  key={song.id}
                  title={song.title}
                  status={mapDbSongStatus(song.status)}
                  plays={song.play_count ?? 0}
                  likes={song.like_count ?? 0}
                  accentSeed={song.title.length}
                />
              ))
            )}
          </View>
        ) : null}

        {tab === "albums" ? (
          <>
            <SectionCard title="Album builder">
              <UploadInput label="Album title" value={albumTitle} placeholder="Tape title" onChangeText={setAlbumTitle} />
              <UploadInput label="Release date" value={albumReleaseDate} placeholder="YYYY-MM-DD" onChangeText={setAlbumReleaseDate} />
              <PrimaryButton variant="outline" title={albumCoverUri ? "Cover selected" : "Choose album cover"} onPress={() => void pickAlbumCover()} />
              <AppText secondary variant="caption" style={{ marginTop: 8 }}>
                Tick songs below before saving to bulk-attach catalog tracks.
              </AppText>
              <PrimaryButton title="Save album shell" onPress={() => void onCreateAlbum()} style={{ marginTop: 12 }} />
            </SectionCard>

            {albums.length === 0 ? (
              <EmptyStateCard icon="albums-outline" title="No albums yet" description="Kick off packaging for your next rollout." />
            ) : null}

            {albums.map((album) => (
              <View key={album.id} style={styles.albumCard}>
                <View style={styles.albumThumb}>
                  {album.cover_path ? (
                    <Image source={{ uri: coverUrl("album-covers", album.cover_path)! }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  ) : (
                    <Ionicons name="disc-outline" size={30} color={colors.primary} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="section" numberOfLines={2}>{album.title}</AppText>
                  <AppText variant="caption" secondary>
                    {(album.release_date ?? "Street date TBD") + " · " + (albumTrackCounts[album.id] ?? 0) + " songs"}
                  </AppText>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <PrimaryButton variant="outline" title="Details" style={styles.albumBtn} onPress={() => router.push(`/album/${album.id}`)} />
                    <PrimaryButton variant="outline" title="Delete" style={styles.albumBtn} onPress={() => setAlbumToDelete({ id: album.id, title: album.title })} />
                  </View>
                </View>
              </View>
            ))}

            <SectionCard title="Attach singles">
              <AppText secondary variant="caption">
                Quickly map tracks to sleeves without wrestling spreadsheets.
              </AppText>
              {songs.map((song) => (
                <Pressable key={song.id} onPress={() => toggleSelect(song.id)} style={styles.attachSong}>
                  <Ionicons
                    name={selectedSongIds.includes(song.id) ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={selectedSongIds.includes(song.id) ? colors.primary : colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="body">{song.title}</AppText>
                    <AppText variant="caption" secondary>
                      Album: {albums.find((a) => a.id === song.album_id)?.title ?? "Standalone"}
                    </AppText>
                  </View>
                </Pressable>
              ))}
            </SectionCard>

            <SectionCard title="Move between albums">
              {songs.map((song) => (
                <View key={`move-${song.id}`} style={styles.moveBlock}>
                  <AppText variant="body" style={{ flex: 1 }}>
                    {song.title}
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.hl}>
                      {albums.map((al) => (
                        <PrimaryButton
                          key={al.id}
                          variant="outline"
                          title={al.title.slice(0, 14)}
                          style={{ paddingHorizontal: 10, paddingVertical: 8 }}
                          onPress={() => void assignSongToAlbum(song.id, al.id).then(loadData)}
                        />
                      ))}
                      <PrimaryButton variant="outline" title="Standalone" style={{ paddingHorizontal: 12 }} onPress={() => void assignSongToAlbum(song.id, null).then(loadData)} />
                    </View>
                  </ScrollView>
                </View>
              ))}
            </SectionCard>
          </>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={!!albumToDelete}
        title="Delete Album"
        message={`Remove ${albumToDelete?.title ?? "album"} permanently?`}
        confirmText="Delete"
        onCancel={() => setAlbumToDelete(null)}
        onConfirm={() => {
          if (!albumToDelete) return;
          void deleteAlbum(albumToDelete.id).then(() => {
            pushToast("Album removed", "info");
            setAlbumToDelete(null);
            return loadData();
          });
        }}
      />
    </ArtistScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.itemGap, paddingBottom: spacing.artistScrollBottomPadding },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  albumCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  albumThumb: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  albumBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  attachSong: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  moveBlock: { gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  hl: { flexDirection: "row", gap: 8, paddingVertical: 4 }
});

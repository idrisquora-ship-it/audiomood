import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { playPlaylistFromSong } from "@/features/music/songService";
import {
  getPlaylistSongs,
  likePublicPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSong,
  unlikePublicPlaylist
} from "@/features/playlists/playlistService";
import { colors } from "@/theme/colors";

type PlaylistSongRow = {
  id: string;
  position: number;
  song_id: string;
  songs: { id: string; title: string } | null;
};

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rows, setRows] = useState<PlaylistSongRow[]>([]);
  const [profileId, setProfileId] = useState("");
  const [liked, setLiked] = useState(false);

  const reload = async () => {
    if (!id) return;
    const data = await getPlaylistSongs(id);
    const normalized = (data ?? []).map((item: { id: string; position: number; song_id: string; songs: { id: string; title: string } | { id: string; title: string }[] | null }) => {
      const songCandidate = Array.isArray(item.songs) ? item.songs[0] : item.songs;
      return {
        id: item.id,
        position: item.position,
        song_id: item.song_id,
        songs: songCandidate ? { id: songCandidate.id, title: songCandidate.title } : null
      };
    });
    setRows(normalized);
  };

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
    })();
    void reload();
  }, [id]);

  const songIds = useMemo(() => rows.map((r) => r.song_id), [rows]);

  const move = async (rowId: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    await reorderPlaylistSong(rowId, next);
    await reload();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.heading}>Playlist</AppText>
        <Pressable
          style={styles.smallBtn}
          onPress={() => {
            if (!id || !profileId) return;
            if (liked) {
              void unlikePublicPlaylist(id, profileId);
              setLiked(false);
            } else {
              void likePublicPlaylist(id, profileId);
              setLiked(true);
            }
          }}
        >
          <AppText>{liked ? "Unlike Playlist" : "Like Playlist"}</AppText>
        </Pressable>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <Pressable style={styles.songCard} onPress={() => playPlaylistFromSong(songIds, row.song_id)}>
              <AppText>{row.songs?.title ?? "Unknown song"}</AppText>
              <AppText muted>Position: {row.position}</AppText>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => void move(row.id, row.position, -1)}>
              <AppText>Up</AppText>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => void move(row.id, row.position, 1)}>
              <AppText>Down</AppText>
            </Pressable>
            <Pressable
              style={styles.smallBtn}
              onPress={() => {
                if (!id) return;
                void removeSongFromPlaylist(id, row.song_id).then(reload);
              }}
            >
              <AppText>Remove</AppText>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  songCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12 },
  smallBtn: { backgroundColor: colors.cardAlt, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }
});

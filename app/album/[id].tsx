import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getAlbumById, getAlbumSongs, setAlbumTrackNumber } from "@/features/artist/albumService";
import { colors } from "@/theme/colors";

type AlbumSong = {
  id: string;
  title: string;
  status: string;
  album_track_number: number | null;
};

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [album, setAlbum] = useState<{ title: string; cover_path: string | null } | null>(null);
  const [songs, setSongs] = useState<AlbumSong[]>([]);

  const load = async () => {
    if (!id) return;
    const [albumRow, songRows] = await Promise.all([getAlbumById(id), getAlbumSongs(id)]);
    setAlbum({ title: albumRow.title, cover_path: albumRow.cover_path });
    setSongs(songRows as AlbumSong[]);
  };

  useEffect(() => {
    void load();
  }, [id]);

  const shiftTrack = async (songId: string, currentTrack: number | null, delta: number) => {
    const next = Math.max(1, (currentTrack ?? 1) + delta);
    await setAlbumTrackNumber(songId, next);
    await load();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.heading}>{album?.title ?? "Album"}</AppText>
        <AppText muted>{album?.cover_path ?? "No cover path"}</AppText>
        {songs.map((song) => (
          <View key={song.id} style={styles.row}>
            <View style={styles.songCard}>
              <AppText>{song.title}</AppText>
              <AppText muted>Track: {song.album_track_number ?? "-"}</AppText>
            </View>
            <Pressable style={styles.smallBtn} onPress={() => void shiftTrack(song.id, song.album_track_number, -1)}>
              <AppText>Up</AppText>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => void shiftTrack(song.id, song.album_track_number, 1)}>
              <AppText>Down</AppText>
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

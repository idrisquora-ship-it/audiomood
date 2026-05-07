import { useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getMyNotifications, markNotificationRead } from "@/features/social/socialService";
import { supabase } from "@/lib/supabase";
import { useUiStore } from "@/store/uiStore";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  created_at: string;
};

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id || !mounted) return;
      const rows = await getMyNotifications(profile.id);
      if (mounted) setItems(rows as NotificationItem[]);

      channel = supabase
        .channel(`notifications-${profile.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${profile.id}` },
          (payload) => {
            const next = payload.new as NotificationItem;
            setItems((prev) => [next, ...prev]);
            pushToast("New in-app notification", "info");
          }
        )
        .subscribe();

    })();

    return () => {
      mounted = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={{ fontSize: 24, fontWeight: "800" }}>Notifications</AppText>
        {items.length === 0 ? (
          <EmptyState title="No notifications yet" subtitle="Follows, releases and updates will appear here." />
        ) : null}
        {items.map((item) => (
          <SectionCard key={item.id} title={item.title}>
            <AppText muted>{item.body}</AppText>
            <AppText muted>{item.type}</AppText>
            <Pressable
              onPress={() => {
                void markNotificationRead(item.id).then(() =>
                  setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, read: true } : p)))
                );
                pushToast("Notification marked as read", "info");
              }}
            >
              <AppText muted>{item.read ? "Read" : "Mark as read"}</AppText>
            </Pressable>
          </SectionCard>
        ))}
      </ScrollView>
    </Screen>
  );
}

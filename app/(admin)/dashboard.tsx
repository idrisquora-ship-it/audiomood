import { useEffect, useState } from "react";
import { Pressable, ScrollView, TextInput } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import {
  banReportedUser,
  createAdminAnnouncementWithPush,
  getSimplifiedAdminWork,
  markAnnouncementRead,
  removeReportedUser,
  warnReportedUser
} from "@/features/admin/adminService";
import { colors } from "@/theme/colors";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardScreen() {
  const [reports, setReports] = useState<Array<{ id: string; reason: string; target_type: string; target_id: string }>>(
    []
  );
  const [announcements, setAnnouncements] = useState<
    Array<{ id: string; sender_profile_id?: string; message: string; title: string; status: string }>
  >([]);
  const [adminProfileId, setAdminProfileId] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const p = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
        if (p.data?.id) setAdminProfileId(p.data.id);
      }
      const result = await getSimplifiedAdminWork();
      setReports(
        result.userReports as Array<{
          id: string;
          reason: string;
          target_type: string;
          target_id: string;
        }>
      );
      setAnnouncements(
        result.announcements as Array<{
          id: string;
          sender_profile_id?: string;
          message: string;
          title: string;
          status: string;
        }>
      );
    })();
  }, []);

  const withAdmin = async <T,>(fn: (adminId: string) => Promise<T>) => {
    const admin = (await supabase.auth.getUser()).data.user;
    if (!admin) return null;
    return fn(admin.id);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={{ fontSize: 24, fontWeight: "800" }}>Admin Moderation</AppText>
        <SectionCard title="Reported Users">
          {reports.length === 0 ? <AppText muted>No open user reports.</AppText> : null}
          {reports.map((report) => (
            <ScrollView horizontal key={report.id}>
              <AppText muted>{report.reason} ({report.target_type}) </AppText>
              <Pressable
                onPress={() =>
                  void withAdmin(async (adminId) => {
                    await warnReportedUser(report.id, report.target_id, adminId);
                    setReports((prev) => prev.filter((r) => r.id !== report.id));
                  })
                }
              >
                <AppText muted>Warn </AppText>
              </Pressable>
              <Pressable
                onPress={() =>
                  void withAdmin(async (adminId) => {
                    await banReportedUser(report.id, report.target_id, adminId);
                    setReports((prev) => prev.filter((r) => r.id !== report.id));
                  })
                }
              >
                <AppText muted>Ban </AppText>
              </Pressable>
              <Pressable
                onPress={() =>
                  void withAdmin(async (adminId) => {
                    await removeReportedUser(report.id, report.target_id, adminId);
                    setReports((prev) => prev.filter((r) => r.id !== report.id));
                  })
                }
              >
                <AppText muted>Remove</AppText>
              </Pressable>
            </ScrollView>
          ))}
        </SectionCard>

        <SectionCard title="Announcement Replies">
          {announcements.length === 0 ? <AppText muted>No announcements.</AppText> : null}
          {announcements.map((item) => (
            <ScrollView horizontal key={item.id}>
              <AppText muted>{item.title}: {item.message} </AppText>
              <Pressable
                onPress={() =>
                  void withAdmin(async (adminId) => {
                    await markAnnouncementRead(item.id, adminId);
                    setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
                  })
                }
              >
                <AppText muted>Mark Read</AppText>
              </Pressable>
            </ScrollView>
          ))}
        </SectionCard>

        <SectionCard title="Send Announcement to Users">
          <TextInput
            style={{ backgroundColor: colors.card, color: colors.text, borderRadius: 10, padding: 10, marginBottom: 8 }}
            placeholder="Announcement title"
            placeholderTextColor={colors.textMuted}
            value={announcementTitle}
            onChangeText={setAnnouncementTitle}
          />
          <TextInput
            style={{ backgroundColor: colors.card, color: colors.text, borderRadius: 10, padding: 10, marginBottom: 8 }}
            placeholder="Announcement message"
            placeholderTextColor={colors.textMuted}
            value={announcementMessage}
            onChangeText={setAnnouncementMessage}
          />
          <Pressable
            onPress={() =>
              void withAdmin(async (adminId) => {
                if (!adminProfileId || !announcementTitle || !announcementMessage) return;
                await createAdminAnnouncementWithPush(
                  adminId,
                  adminProfileId,
                  announcementTitle,
                  announcementMessage
                );
                setAnnouncementTitle("");
                setAnnouncementMessage("");
              })
            }
          >
            <AppText muted>Broadcast Announcement</AppText>
          </Pressable>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

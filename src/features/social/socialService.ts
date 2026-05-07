import { supabase } from "@/lib/supabase";

export async function createReport(
  reporterId: string,
  targetType: "song" | "comment" | "artist" | "user",
  targetId: string,
  reason:
    | "copyright issue"
    | "wrong lyrics"
    | "inappropriate song"
    | "fake artist"
    | "spam"
    | "harassment"
    | "explicit content not marked",
  details?: string
) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details ?? null,
    status: "open"
  });
  if (error) throw error;
}

export async function getMyNotifications(profileId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,body,type,read,created_at")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  if (error) throw error;
}

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("admin_announcements")
    .select("id,title,message,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getAnnouncementComments(announcementId: string) {
  const { data, error } = await supabase
    .from("announcement_comments")
    .select("id,announcement_id,user_id,parent_comment_id,message,created_at")
    .eq("announcement_id", announcementId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addAnnouncementComment(
  announcementId: string,
  userId: string,
  message: string,
  parentCommentId?: string
) {
  const { error } = await supabase.from("announcement_comments").insert({
    announcement_id: announcementId,
    user_id: userId,
    message,
    parent_comment_id: parentCommentId ?? null
  });
  if (error) throw error;
}

export async function createAdminAnnouncement(adminProfileId: string, title: string, message: string) {
  const { error } = await supabase.from("admin_announcements").insert({
    admin_profile_id: adminProfileId,
    title,
    message,
    status: "open"
  });
  if (error) throw error;
}

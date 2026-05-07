import { supabase } from "@/lib/supabase";

export async function resolveReport(reportId: string, adminUserId: string) {
  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  await supabase.from("admin_actions").insert({
    admin_user_id: adminUserId,
    action: "resolve_report",
    target_type: "report",
    target_id: reportId
  });
}

export async function getSimplifiedAdminWork() {
  const [reports, announcements] = await Promise.all([
    supabase
      .from("reports")
      .select("id,target_type,target_id,reason,status,created_at")
      .eq("status", "open")
      .eq("target_type", "user")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("admin_announcements")
      .select("id,sender_profile_id,admin_profile_id,title,message,status,created_at")
      .in("status", ["open", "read"])
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  return {
    userReports: reports.data ?? [],
    announcements: announcements.data ?? []
  };
}

export async function warnReportedUser(reportId: string, targetProfileId: string, adminUserId: string) {
  const profile = await supabase.from("profiles").select("warning_count").eq("id", targetProfileId).single();
  const nextWarningCount = (profile.data?.warning_count ?? 0) + 1;
  await supabase
    .from("profiles")
    .update({ moderation_status: "warned", warning_count: nextWarningCount })
    .eq("id", targetProfileId);
  await resolveReport(reportId, adminUserId);
  await supabase.from("notifications").insert({
    user_id: targetProfileId,
    title: "Account warning",
    body: "Your account has received a warning from admin.",
    type: "admin_warning",
    payload: { report_id: reportId, warning_count: nextWarningCount }
  });
}

export async function banReportedUser(reportId: string, targetProfileId: string, adminUserId: string) {
  await supabase.from("profiles").update({ moderation_status: "banned" }).eq("id", targetProfileId);
  await resolveReport(reportId, adminUserId);
  await supabase.from("notifications").insert({
    user_id: targetProfileId,
    title: "Account banned",
    body: "Your account has been banned by admin due to reports.",
    type: "admin_ban",
    payload: { report_id: reportId }
  });
}

export async function removeReportedUser(reportId: string, targetProfileId: string, adminUserId: string) {
  await supabase
    .from("profiles")
    .update({ moderation_status: "removed", removed_at: new Date().toISOString() })
    .eq("id", targetProfileId);
  await resolveReport(reportId, adminUserId);
  await supabase.from("notifications").insert({
    user_id: targetProfileId,
    title: "Account removed",
    body: "Your account has been removed by admin.",
    type: "admin_remove",
    payload: { report_id: reportId }
  });
}

export async function markAnnouncementRead(announcementId: string, adminUserId: string) {
  await supabase.from("admin_announcements").update({ status: "read" }).eq("id", announcementId);
  await supabase.from("admin_actions").insert({
    admin_user_id: adminUserId,
    action: "mark_announcement_read",
    target_type: "admin_announcement",
    target_id: announcementId
  });
}

export async function createAdminAnnouncementWithPush(
  adminUserId: string,
  adminProfileId: string,
  title: string,
  message: string
) {
  const announcementRes = await supabase
    .from("admin_announcements")
    .insert({
      admin_profile_id: adminProfileId,
      title,
      message,
      status: "open"
    })
    .select("id")
    .single();

  if (announcementRes.error) throw announcementRes.error;

  const targetsRes = await supabase
    .from("profiles")
    .select("id")
    .neq("role", "admin");

  const targets = targetsRes.data ?? [];

  await Promise.all(
    targets.map((target) =>
      supabase.functions.invoke("send-push-notification", {
        body: {
          user_profile_id: target.id,
          title,
          body: message,
          data: { type: "admin_announcement", announcement_id: announcementRes.data.id }
        }
      })
    )
  );

  await supabase.from("admin_actions").insert({
    admin_user_id: adminUserId,
    action: "create_admin_announcement",
    target_type: "admin_announcement",
    target_id: announcementRes.data.id,
    metadata: { title }
  });
}

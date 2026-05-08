import { supabase } from "@/lib/supabase";

type SignupInput = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  accountType: "listener" | "artist";
};

export async function signUp(input: SignupInput) {
  const username = input.username.trim();
  const displayName = input.displayName.trim() || username;
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        username,
        display_name: displayName,
        requested_account_type: input.accountType
      }
    }
  });
  if (error) throw error;
  return data;
}

/** Accepts email or profile username; maps username to auth email via RPC. */
export async function signIn(identifier: string, password: string) {
  const trimmed = identifier.trim();
  const { data: emailOrNull, error: rpcError } = await supabase.rpc("resolve_sign_in_email", {
    p_identifier: trimmed
  });
  if (rpcError) throw rpcError;
  const email = (emailOrNull as string | null)?.trim();
  if (!email) {
    throw new Error("Could not sign in. Check your email or username and password.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export type MyProfileRow = {
  id: string;
  account_type: string;
  role: string;
  display_name: string | null;
  username: string | null;
};

export async function getMyProfile(): Promise<MyProfileRow | null> {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, account_type, role, display_name, username")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return null;
  return data as MyProfileRow | null;
}

/** Call after sign-in routes; creates profile/settings if JWT exists but DB row missing (email-confirm gaps). */
export async function ensureProfileForSession(): Promise<MyProfileRow | null> {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) return null;

  const existing = await getMyProfile();
  if (existing?.id) return existing;

  const meta = (user.user_metadata ?? {}) as {
    username?: string;
    display_name?: string;
    requested_account_type?: string;
  };
  const cleanUser = meta.username?.trim();
  const username = cleanUser && cleanUser.length > 0 ? cleanUser : `user_${user.id.slice(0, 8)}`;
  const displayName = meta.display_name?.trim() || username;
  const accountType: "listener" | "artist" =
    meta.requested_account_type === "artist" ? "artist" : "listener";

  const { data: profile, error: insErr } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      username,
      display_name: displayName,
      account_type: accountType
    })
    .select("id, account_type, role, display_name, username")
    .maybeSingle();

  if (insErr?.code === "23505") {
    return getMyProfile();
  }
  if (insErr || !profile) {
    return getMyProfile();
  }

  await supabase.from("user_settings").upsert({ user_id: profile.id, autoplay_recommendations: true }, { onConflict: "user_id" });
  const { error: plErr } = await supabase.from("playlists").insert({
    owner_id: profile.id,
    title: "Liked Songs",
    visibility: "private",
    is_liked_songs: true
  });
  if (plErr && plErr.code !== "23505") {
    /* unique liked playlist per owner */
  }

  return profile as MyProfileRow;
}

export async function bootstrapNewUser(
  userId: string,
  accountType: "listener" | "artist",
  preferredUsername?: string,
  displayName?: string
) {
  const clean = preferredUsername?.trim();
  const username = clean && clean.length > 0 ? clean : `user_${userId.slice(0, 8)}`;
  const dn = displayName?.trim() || username;
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      username,
      display_name: dn,
      account_type: accountType
    })
    .select("id")
    .single();

  if (error || !profile) return;

  await supabase.from("user_settings").upsert({ user_id: profile.id, autoplay_recommendations: true }, { onConflict: "user_id" });
  const { error: lpErr } = await supabase.from("playlists").insert({
    owner_id: profile.id,
    title: "Liked Songs",
    visibility: "private",
    is_liked_songs: true
  });
  if (lpErr && lpErr.code !== "23505") {
    /* ignore dup liked playlist */
  }
}

export async function updateMyProfile(updates: { display_name?: string; username?: string }) {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) throw new Error("Not signed in");

  const patch: Record<string, string> = {};
  if (updates.display_name !== undefined) {
    const v = updates.display_name.trim();
    if (v.length === 0) throw new Error("Display name cannot be empty.");
    patch.display_name = v;
  }
  if (updates.username !== undefined) {
    const v = updates.username.trim().replace(/^@/, "");
    if (v.length < 2) throw new Error("Username must be at least 2 characters.");
    patch.username = v;
  }
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
  if (error) {
    const msg =
      error.code === "23505"
        ? "That username is already taken."
        : error.message ?? "Could not update profile.";
    throw new Error(msg);
  }

  await supabase.auth.updateUser({
    data: {
      ...(patch.display_name !== undefined ? { display_name: patch.display_name } : {}),
      ...(patch.username !== undefined ? { username: patch.username } : {})
    }
  });
}

export async function saveListenerPreferences(profileId: string, genreIds: string[], moodIds: string[]) {
  if (genreIds.length > 0) {
    await supabase.from("user_genre_preferences").upsert(
      genreIds.map((genreId) => ({ user_id: profileId, genre_id: genreId })),
      { onConflict: "user_id,genre_id" }
    );
  }
  if (moodIds.length > 0) {
    await supabase.from("user_mood_preferences").upsert(
      moodIds.map((moodId) => ({ user_id: profileId, mood_id: moodId })),
      { onConflict: "user_id,mood_id" }
    );
  }
}

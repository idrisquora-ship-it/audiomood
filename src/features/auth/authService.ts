import { supabase } from "@/lib/supabase";

type SignupInput = {
  email: string;
  password: string;
  username: string;
  accountType: "listener" | "artist";
};

export async function signUp(input: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { username: input.username.trim(), requested_account_type: input.accountType } }
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

export async function getMyProfile() {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, account_type, role, display_name, username")
    .eq("user_id", user.id)
    .single();
  if (error) return null;
  return data;
}

export async function bootstrapNewUser(
  userId: string,
  accountType: "listener" | "artist",
  preferredUsername?: string
) {
  const clean = preferredUsername?.trim();
  const username = clean && clean.length > 0 ? clean : `user_${userId.slice(0, 8)}`;
  const { data: profile } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      username,
      account_type: accountType
    })
    .select("id")
    .single();

  if (!profile) return;

  await supabase.from("user_settings").insert({ user_id: profile.id, autoplay_recommendations: true });
  await supabase.from("playlists").insert({
    owner_id: profile.id,
    title: "Liked Songs",
    visibility: "private",
    is_liked_songs: true
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

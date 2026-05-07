import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const env = {
  supabaseUrl: extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  elevenLabsApiKey:
    extra.ELEVENLABS_API_KEY ?? process.env.ELEVENLABS_API_KEY ?? "",
  elevenLabsSttUrl:
    extra.ELEVENLABS_STT_URL ?? process.env.ELEVENLABS_STT_URL ?? "https://api.elevenlabs.io/v1/speech-to-text"
};

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "For EAS APKs, add them under your Expo project (expo.dev → Environment variables) or `eas secret:create`, then rebuild."
  );
}

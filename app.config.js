/**
 * Merges build-time env (EAS Secrets / expo.dev Env, or local .env via Expo) into `extra`
 * so release APKs get Supabase config. Static fields stay in app.json.
 *
 * Firebase: set a **file** env var `GOOGLE_SERVICES_JSON` for the preview/production EAS environment
 * on expo.dev if `google-services.json` is not in the uploaded repo.
 */
module.exports = ({ config }) => ({
  ...config,
  android: config.android
    ? {
        ...config.android,
        googleServicesFile:
          process.env.GOOGLE_SERVICES_JSON ?? config.android.googleServicesFile
      }
    : config.android,
  extra: {
    ...config.extra,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_STT_URL: process.env.ELEVENLABS_STT_URL
  }
});

# Audiomood Implementation Plan

## 1) Foundation
- Initialize Expo + Expo Router + TypeScript with Bun.
- Set up app theme tokens (orange/black/dark gray/white) and reusable UI primitives.
- Configure global providers (React Query, auth/session bootstrapping, player state).

## 2) Supabase Integration
- Configure Supabase client in app (`auth`, `storage`, `realtime`) with persisted session.
- Use env-based configuration for URL, anon key, service role usage on server-side only.
- Add typed data access service layer for auth, songs, playlists, recommendations.

## 3) Auth + Account Roles
- Screens: Splash, Welcome, Login, Signup, Forgot Password.
- Add account type chooser and onboarding split for Listener vs Artist.
- On signup bootstrap:
  - create `profiles` row
  - create `user_settings` row
  - create default `Liked Songs` playlist
  - initialize recommendation profile data

## 4) Database + Storage + RLS (Supabase)
- Apply SQL migration for all required public tables:
  - `profiles`, `artist_profiles`, `artist_applications`, `songs`, `albums`, `genres`, `moods`,
    `playlists`, `playlist_songs`, `liked_songs`, `follows`, `listening_history`, `play_events`,
    `recommendation_scores`, `lyrics`, `lyrics_jobs`, `comments`, `reports`, `notifications`,
    `subscriptions`, `admin_actions`, `user_settings`, `search_history`
- Enable RLS and ownership/role policies for listener/artist/admin behavior.
- Create storage buckets:
  - private: `song-audio`, `temp-uploads`
  - public: `song-covers`, `artist-avatars`, `artist-banners`, `user-avatars`, `album-covers`

## 5) Listener Experience
- Bottom tabs: Home, Search, Library, Discover, Profile.
- Home modules:
  - Continue Listening
  - Recommended For You
  - Because You Liked
  - Mood Mixes
  - Trending Now
  - New Releases
  - Artists You Follow
  - Popular Playlists
  - Recently Played
- New users: onboarding genres/moods + trending-first recommendation.
- Active users: behavior-driven recommendations from likes/plays/skips/follows/playlists.

## 6) Artist Experience
- Bottom tabs: Dashboard, Upload, Music, Analytics, Profile.
- Artist Dashboard (distinct from listener home):
  - stats cards (plays, likes, followers, monthly listeners)
  - upload CTA
  - latest performance, pending reviews, top songs, fan activity, comments
  - artist tips and boost placeholder
- Add role switch UX:
  - Switch to Listener View
  - Switch to Artist View

## 7) Player + Queue Rules
- Global mini player + full player with:
  - play/pause, prev/next, seek, shuffle, repeat, queue
  - like/unlike, add-to-playlist, lyrics, share
- Queue behavior:
  - playlist play keeps playlist songs first
  - album play keeps album songs first
  - single song play continues with recommendations
  - autoplay recommendations starts only after source queue ends
  - setting: `autoplay_recommendations` default true

## 8) Playlists + Liked Songs
- Playlist CRUD + reorder + visibility + share + shuffle.
- Auto-sync liked songs:
  - like => insert `liked_songs` + add to liked playlist + update signals/counters
  - unlike => remove from `liked_songs` + remove from liked playlist + update signals/counters
- Prevent duplicates with constraints and upserts.

## 9) Recommendation MVP
- Track signals:
  - play, skip, replay, like, playlist-add, follow, duration, complete, search history, onboarding picks
- Score with rule weights:
  - +10 same artist, +8 same genre, +8 same mood, +7 playlist similarity, +6 completion similarity
  - +5 trending in favored genre, +4 followed artist
  - -8 quick skip, -10 blocked/reported artist
- Expose section queries for listener home modules.

## 10) Upload + Moderation + Lyrics
- Artist upload flow:
  - metadata + audio + cover + release settings
  - store files in Supabase Storage buckets
  - create song with status workflow (`draft`, `uploading`, `processing_lyrics`, `pending_review`, `approved`, `rejected`, `hidden`)
- Deploy edge function `generate-song-lyrics`:
  - input `song_id`
  - signed URL for private audio
  - send to ElevenLabs STT
  - store transcript in `lyrics`
  - update `lyrics_jobs` status/error
- Keep songs non-public until admin approval.

## 11) Admin + Reports + Notifications
- Admin dashboard capabilities:
  - artist approvals, song approvals, lyrics review, moderation, featured content, genre/mood management
- Reporting flow:
  - copyright, wrong lyrics, inappropriate song, fake artist, spam, harassment, explicit-not-marked
- Notifications:
  - follows, artist releases, playlist likes, approvals/rejections, lyrics generation, admin messages

## 12) Polish + Quality
- UI polish: skeletons, empty states, toasts, confirmation modals, smooth transitions.
- Tests:
  - unit: queue + recommendation scoring + liked song sync
  - integration: upload + lyrics + moderation lifecycle
  - security: RLS behavior by role
  - e2e: signup → onboarding → playback; artist upload → admin approve → listener play

## Current Supabase Status
- Migrations applied: `init_audiomood`, `storage_buckets_audiomood`
- Edge function deployed: `generate-song-lyrics` (active)
- Seeded catalogs: `genres` and `moods` populated for onboarding

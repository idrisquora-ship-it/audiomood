# Audiomood Next Module Plan

## Scope
Implement Podcasts, AI Mood Radio, Listening Parties, Live Audio Rooms, and a full premium Settings experience in the existing Audiomood app.

## Delivery Order
1. Database migrations for settings, podcasts, mood radio, listening parties, and live rooms.
2. Settings screen UI + Supabase persistence.
3. Podcasts UI + behavior.
4. AI Mood Radio UI + dynamic queue behavior.
5. Listening Parties with Supabase Realtime sync.
6. Live Audio Rooms UI + moderation and participant flows.
7. Notifications + recommendation signal integration for new modules.
8. Listener vs Artist behavior checks and QA pass.

## Step 1 (This step)
- Create migration for module tables:
  - Podcasts: `podcasts`, `podcast_episodes`, `podcast_followers`, `podcast_history`, `podcast_comments`, `podcast_categories`, `saved_podcast_episodes`
  - Mood Radio: `radio_sessions`, `radio_queue`, `radio_feedback`, `radio_preferences`
  - Listening Parties: `listening_parties`, `party_members`, `party_queue`, `party_messages`, `party_reactions`, `party_votes`, `party_playback_state`
  - Live Rooms: `live_rooms`, `live_room_participants`, `live_room_speakers`, `live_room_messages`, `live_room_reactions`, `live_room_requests`
  - Settings: `notification_settings`, `privacy_settings`, `playback_settings`, `podcast_settings`, `mood_radio_settings`, `party_settings`, `live_room_settings`, `artist_settings`
- Extend `user_settings` with additional keys for podcasts/radio/party/live-room behavior.
- Enable RLS and add baseline ownership/authenticated policies.

## Notes
- Reuse `profiles` as user identity anchor.
- Keep room/party voice transport provider-replaceable; schema stores state, permissions, and events only.
- Keep schema MVP-friendly and additive (no destructive changes).

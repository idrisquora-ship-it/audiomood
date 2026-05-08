# Audiomood Feature Permissions & Behavior Plan

This document implements the requested permission rules for **Podcasts**, **AI Mood Radio**, **Live Audio Rooms**, and the updated **Admin** role.

## Goals (Product Rules)

- **Listener vs Artist**
  - Listener can consume content (music, podcasts, radio, live rooms) and engage (likes, follows, playlists, comments, reports).
  - Listener cannot do creator actions (upload songs/podcasts, host live rooms).
  - Artist can do everything listener can, plus creator actions (music, podcasts, host rooms) and creator analytics.
- **No admin approval gate**
  - Admin does **not** approve songs, podcasts, live rooms, artist accounts, or signup.
  - Admin can moderate after reports (remove harmful content, warn/ban users, announcements).
- **Remove “approval/review” language**
  - Replace with publish/live/draft/processing terminology.

## Source of Truth (Permissions)

### Profiles
Use `profiles.account_type`:
- `listener`
- `artist`
- `both`

Rules:
- **Artist-capable** if `account_type in ('artist','both')`.
- Listener → Artist actions must route to `/(onboarding)/artist` to complete onboarding.

### Central helpers (code)
Create helpers in `src/features/auth/permissions.ts`:
- `isArtistAccount(account_type)`
- `isAdminRole(role)`

## Feature 1 — Podcasts

### Listener behavior
- Browse/search/listen episodes
- Follow shows
- Save/like episodes
- Comment on episodes
- Resume from last position (history)
- Report podcast/episode/comment

Restricted:
- Create show
- Upload episode
- Edit podcast content

UX on restricted actions:
- Modal title: **“Become an Artist to create podcasts”**
- Description: **“Artists can upload music, create podcast shows, host live rooms, and grow their audience.”**
- Buttons:
  - **Become Artist** → `/(onboarding)/artist`
  - **Maybe Later** → close

### Artist behavior
- Create show
- Upload episode
- Edit own show/episodes
- Hide/delete own episodes
- Reply to comments
- View podcast analytics

Publishing:
- Episodes go live immediately after upload.
- If transcript processing exists, show **processing** state while still published/visible.

### Status model (DB)
Podcasts:
- `draft`
- `processing_transcript`
- `published`
- `hidden_by_creator`
- `removed_by_admin`

Implementation strategy:
- Add `status` columns (shows + episodes) and default to `published` on upload.
- Listener reads filter to `status = 'published'`.
- Creator reads all own statuses.
- Admin reads all for moderation.

## Feature 2 — AI Mood Radio

Permissions:
- Available to everyone (listener + artist).

Behavior:
- Create `radio_sessions` with mood/genre
- Generate queue from playable catalogue, excluding hidden artists and lowering repeats
- Feedback actions:
  - Like → like song + improve recommendations
  - Dislike → reduce similar + skip
  - Hide artist → exclude in radio + recs

Status:
- `active`
- `paused`
- `ended`

Implementation:
- Ensure radio uses the same “playable song statuses” as listener catalogue.

## Feature 3 — Live Audio Rooms

### Listener behavior
- Browse/join rooms
- Listen
- Chat/reactions
- Request mic
- Follow host
- Report room/user/message

Restricted:
- Create/host room by default

UX on restricted actions:
- Modal title: **“Become an Artist to host live rooms”**
- Description: **“Artists can host fan Q&As, album launches, live podcast sessions, and music conversations.”**
- Buttons:
  - **Become Artist**
  - **Maybe Later**

### Artist behavior
- Create / host live rooms
- Accept/reject mic requests, mute/remove speakers, end room
- Pin messages (later)
- Schedule rooms (later)

Statuses:
- `scheduled`
- `live`
- `ended`
- `removed_by_admin`

## Feature 4 — Admin Role

Admin does NOT approve content.

Admin can:
- View reports
- Warn users
- Ban users
- Remove harmful content/comments
- Create announcements + send notifications
- Removed content log

## Feature 5 — UI Visibility Rules

Listener UI:
- Show consumption features (Podcasts, Mood Radio, Live Rooms join)
- Hide creator CTAs (Upload song/podcast, Create show, Host room)
- If tapped, show “Become Artist” modal.

Artist UI:
- Show creator CTAs (Publish Song, Publish Episode, Go Live)
- Still access listener tabs/features
- Add Switch to Listener View

## Feature 6 — RLS / Database Permissions

Add/Update policies:
- Listeners: read published content, write engagement tables, create radio sessions
- Artists: manage own content
- Admin: moderation tables + content removal

Deliverables:
- New migration(s) in `supabase/migrations/` for podcast/live-room policies and status columns.

## Implementation Order (Execution Plan)

1. **Account type & permission helpers** (central `permissions.ts`)
2. **UI gating + Become Artist modal** for restricted creator actions
3. **Podcasts**: status model, publish default, artist editing scope
4. **Mood Radio**: ensure consistent candidate selection and endless queue rules
5. **Live Rooms**: host-only creation, scheduled/live/ended states (add schedule later)
6. **Admin**: reports/warn/ban/announcements only (no approval UI/logic)
7. **RLS migrations** for podcasts + live rooms + moderation
8. **Language cleanup** across UI (“Publish / Live / Processing”)


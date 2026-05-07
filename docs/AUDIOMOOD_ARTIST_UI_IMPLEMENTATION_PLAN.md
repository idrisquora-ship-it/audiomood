# Audiomood Artist Experience — Implementation Plan

Production-quality artist mode: safe areas, typography, tab bar, reusable components, and screens that match the premium listener shell. Theme reference (single source in code: `src/theme/colors.ts`, `src/theme/artistTheme.ts` after Step 1):

| Token | Hex | Usage |
|--------|-----|--------|
| Background | `#050505` | Root / screen base |
| Card | `#181818` | `surface` / cards |
| Elevated | `#222222` | `surfaceElevated` |
| Primary | `#FF6A00` | CTAs, active tab |
| Border | `#2A2A2A` | Dividers, card stroke |
| Text | `#FFFFFF` | Primary copy |
| Text gray | `#B8B8B8` | Secondary (`textSecondary`) |

## Reusable components (build in order)

Target location: `src/components/artist/` (and shared `src/components/ui/` where already used app-wide).

| Component | Responsibility |
|-----------|----------------|
| `ArtistScreen` | Safe top/bottom insets, horizontal padding, scroll bottom gap for tab bar + optional mini player (`Step 1` foundations). |
| `ArtistHeader` | Title, subtitle, optional avatar, trailing actions (notifications). |
| `StatCard` | Icon, label, value, optional delta line (“+0 this week”). |
| `DashboardActionCard` | Gradient CTA surfaces, primary action. |
| `UploadInput` / `UploadPickerCard` | Label, validation, file/image pickers — no raw storage paths in UI. |
| `ArtistSongCard` | Cover, title, status badge, plays/likes, overflow menu. |
| `AnalyticsChartCard` | Chart placeholder + title + optional empty state. |
| `EmptyState` / `EmptyStateCard` | Already in app; extend for artist-specific illustrations/copy. |
| Artist tab bar styling | Centralize in `navigation/tabBar.tsx` (artist variant): height 72–82px, top border, inactive gray / active orange. |

Icons: prefer **Ionicons** via `@expo/vector-icons` (already shipped). Optional later: `lucide-react-native` only if we need icons not in Ionicons.

### Tab bar icons (target glyphs)

| Tab | Icon idea (Ionicons mappings) |
|-----|--------------------------------|
| Dashboard | `stats-chart` / grid dashboard style |
| Upload | `cloud-upload` / `add-circle` |
| Music | `musical-notes` |
| Analytics | `pulse` / line-style chart |
| Profile | `person-circle` |

## Screen-by-screen acceptance criteria

### Dashboard

- Header: “Welcome back, [name]”, subtitle about growing audience, avatar/logo right, bell action.
- Hero: orange gradient card, copy + “Upload Song”.
- Stats grid: plays, likes, followers, monthly listeners — each with icon, value, small growth line.
- Sections: Latest Song Performance, Pending Reviews, Top Songs, Fan Activity, Recent Comments, Artist Tips — each with real empty states + CTAs where noted in product brief.

### Upload

- Remove user-facing “storage path” fields; use picker cards (audio + cover).
- Tabs: Single vs Album; submission copy **“Submit for Review”** when moderation applies; success confirmation screen.
- Form: title, description, pickers, language/genre/mood, release date, explicit toggle, copyright checkbox, auto-lyrics toggle.
- Album flow: title, description, cover, date, add tracks, submit for review.

### Music (`Your Music`)

- Tabs: Songs, Albums, Drafts, Reviews.
- Song rows: cover, title, status badge (draft / processing / pending / approved / rejected / hidden), plays, likes, menu.
- Album cards: cover, title, release date, track count.
- Empty: “No music uploaded yet” + CTA to upload.

### Analytics

- Time chips: 7d / 30d / 90d / all time.
- Stat grid: plays, likes, skips, playlist adds, followers, comments.
- Placeholder chart cards: plays over time, top songs, audience growth, engagement, geography, retention.
- Empty: “Analytics will appear after listeners play your music.”

### Artist profile

- Banner + avatar + name + @ + verified placeholder + bio + follower / monthly counts.
- Edit profile, Share profile.
- Row groups: settings shortcuts, podcast flows, my songs/albums, notifications, listener switch.
- Profile completion card (photo, bio, socials, first upload).

## Implementation order

- **Step 1 — Safe area, status bar, artist theme, font** ✅ _(current PR)_  
  `artistTheme` + `ArtistScreen` (`artistScreenTopGap` 20), `(artist)/_layout` status bar + `#050505` stack surface, `artistTextInputTypography` (Inter regular) on artist `TextInput`s, `artistScrollBottomPadding` on tab scroll content.

- **Step 2 — Artist bottom tabs** ✅  
  `artistPremiumTabBarOptions(bottomInset)` safe-area aware height, inactive `colors.textSecondary`, active primary, updated Ionicons (stats dashboard, upload cloud, music notes, pulse analytics, person circle). `renderArtistTabIcon` + `normalizeTabRouteName` prevent blank tabs on nested route names.

- **Step 3 — Reusable artist UI primitives** ✅  
  `ArtistHeader`, `StatCard`, `DashboardActionCard`, `UploadPickerCard`, `UploadInput`, `ArtistSongCard`, `SongStatusBadge`, `AnalyticsChartCard` under `src/components/artist/`.

- **Step 4 — Dashboard** ✅  
  Pull-to-refresh, hero CTA gradient, stat tiles, latest / pending / top songs, fan + comment sections, tips. Loading skeletons.

- **Step 5 — Upload** ✅  
  Expo `DocumentPicker` + `ImagePicker` picker cards, single vs album shells, explicit + copyright + auto-lyrics toggles, **`submitSongForReview`** (storage upload to `song-audio` / `song-covers`), success state. `createSongDraft` legacy retained for path-based flows; new path uses review + optional lyrics pipeline.

- **Step 6 — Music management** ✅  
  Tab filters (Songs / Albums / Drafts / Reviews), `ArtistSongCard` list, album cards w/ public cover URLs, album builder w/ image cover, attach + move flows.

- **Step 7 — Analytics** ✅  
  Time chips UI, stat grid, chart placeholder cards, ranked list. Skips / playlist adds labeled “soon” (RLS hides raw listener events from artists today).

- **Step 8 — Artist profile** ✅  
  Banner gradient, avatar ring, verification affordance, follower + monthly stats, share, completion checklist, shortcuts (settings, uploads, podcasts, listener switch).

- **Step 9 — Empty states & polish** ✅  
  `EmptyStateCard` across dashboard / music / analytics / upload success; scroll bottom padding via `artistScrollBottomPadding`.

### Storage

- Migration `20260507200000_storage_upload_policies.sql` adds authenticated INSERT policies for `song-audio`, `song-covers`, `album-covers` (apply via Supabase CLI when deploying).

### Lyrics screen

- `app/lyrics/[songId].tsx` redesigned: gradient header, dismiss chevron, synced clock chip, skeleton + rich empty states, karaoke highlight rows, `Screen` top gap alignment with artist shell.

## Copy guidelines

Replace implementation/debug strings with user-facing tone (examples in original brief). Prefer action-oriented CTAs and neutral empty states.

## Notes

- Keep **RLS and existing Supabase fields**; align UI status labels with real `songs.status` / moderation fields.
- All artist screens should remain **scrollable** with **bottom padding** so the tab bar (and global mini player when present) never occlude primary actions.

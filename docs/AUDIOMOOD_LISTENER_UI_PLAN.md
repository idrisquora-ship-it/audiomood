# Audiomood Listener UI Redesign — Implementation Plan

Premium black/orange music streaming look (inspired by modern apps, not a copy of any single brand). Execute in order; each step should leave the app buildable.

## Step 1 — Global foundation ✅

- Safe area + `Screen` padding (`spacing.screenHorizontal` 20, top gap).
- Status bar (#050505) + Android `app.json`; Inter fonts.

## Step 2 — Bottom navigation ✅

- Listener + Artist tabs: **Ionicons** (filled when focused), **premium tab bar** (surface `#181818`, border `#222222`, ~78px height, labels 11px).
- `src/navigation/tabBar.tsx` + `_layout.tsx` for both navigators.

## Step 3 — Reusable UI components ✅

Added under `src/components/`:

- `ui/AppHeader`, `SectionHeader`, `PrimaryButton`, `SettingsRow`, `EmptyStateCard`
- `music/` — `MusicCard`, `SongRow`, `ArtistCircle`, `PlaylistMoodCard`, `MoodChip`
- `library/LibraryRow`
- `discover/DiscoverFeatureCard`
- `constants/demoContent.ts` — moods, demo songs/mixes, browse labels.

## Step 4 — Listener Home ✅

- Greeting header, bells + initials avatar shortcuts, horizontal mood chips, carousels, trending rows, spotlight feature cards.
- Uses **real songs when approved rows exist**, else curated demo placeholders.

## Step 5 — Search ✅

- Search field with icon; capitalized tabs; Recent / Trending + browse grids (mood/genre tiles); podcast/live/radio deep links preserved.

## Step 6 — Library ✅

- “Your Library” header + toolbar; `LibraryRow` entries; downloads note “coming later”; playlist CTA.

## Step 7 — Discover ✅

- Hero Discover copy + stacked feature cards + charts/spotlight + podcast hub + enriched song rows (like/download/report guarded for real UUID ids).
- **`MiniPlayer`** on Discover (matching Home).

## Step 8 — Profile ✅

- Avatar hero, Listener badge, stats row, grouped `SettingsRow` links.
- **Create playlist modal** (no raw input on page).

## Step 9 — Settings ✅

- `buildDefaultFullSettings()` bootstrap; skeleton while fetching; merges remote prefs when resolved.
- Full UI pass: `AppHeader`, grouped `SectionCard` titles (no numbered/emoji scaffolding), `SettingsRow` / `SettingsToggleRow`, subscription & support stubs, **`expo-constants` version** in About, **danger** logout via `PrimaryButton`, **listener switch** wired for dual-role accounts.

## Step 10 — Polish ✅ (targeted)

- Mini player redesigned (artwork gradient, tap-to-open-player, contextual play/browse).
- Section cards + tokens aligned to new surfaces.
- Safe handling when optional tables (e.g. podcast subscriptions) are missing.

## Step 11 — Artist tabs ✅

- Dashboard, Upload, Music, Analytics, Profile aligned with listener patterns: **`AppHeader`**, **`SectionHeader`**, **`PrimaryButton`**, **`EmptyStateCard`**, surface tokens, and navigation parity (listener switch, catalog/upload shortcuts).

---

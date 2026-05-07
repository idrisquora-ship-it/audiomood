/** Placeholder catalogue so empty Supabase projects still feel like a real app. */

export type DemoSong = {
  id: string;
  title: string;
  artist: string;
  gradient: [string, string];
};

export const DEMO_MOOD_CHIPS = [
  "Chill",
  "Romantic",
  "Workout",
  "Sad",
  "Party",
  "Focus",
  "Prayer",
  "Late Night"
] as const;

export const DEMO_SONGS: DemoSong[] = [
  { id: "demo-1", title: "Midnight Flow", artist: "Nova Ray", gradient: ["#FF6A00", "#5C1A7A"] },
  { id: "demo-2", title: "Orange Nights", artist: "Kairo Beats", gradient: ["#FF8A1C", "#2A1A5C"] },
  { id: "demo-3", title: "Soft Echoes", artist: "Luna Sound", gradient: ["#3D2B6B", "#FF6A00"] },
  { id: "demo-4", title: "Lagos Drive", artist: "Vibe Kid", gradient: ["#1E3A5F", "#FF6A00"] },
  { id: "demo-5", title: "Mood Swing", artist: "Nova Ray", gradient: ["#4A1824", "#FF8A1C"] }
];

export const DEMO_MOOD_MIXES = [
  { id: "m1", title: "Late Night Vibes", subtitle: "Smooth & mellow", gradient: ["#1A1035", "#FF6A00"] as [string, string] },
  { id: "m2", title: "Afro Chill", subtitle: "Rhythm & soul", gradient: ["#0D3D2E", "#FF8A1C"] as [string, string] },
  { id: "m3", title: "Romantic Mood", subtitle: "Hearts & hooks", gradient: ["#3A1528", "#FF6A00"] as [string, string] },
  { id: "m4", title: "Workout Energy", subtitle: "High tempo", gradient: ["#2B1A0A", "#FF6A00"] as [string, string] }
];

export const DEMO_ARTISTS = [
  { id: "a1", name: "Nova Ray", initial: "N" },
  { id: "a2", name: "Kairo Beats", initial: "K" },
  { id: "a3", name: "Luna Sound", initial: "L" },
  { id: "a4", name: "Vibe Kid", initial: "V" }
];

export const DEMO_BROWSE_GENRES = ["Afrobeat", "R&B", "Gospel", "Hip Hop", "Amapiano", "Chill", "Romance", "Workout"];

export const EMPTY_RECOMMENDATIONS = {
  title: "Your recommendations are warming up",
  subtitle: "Play or like a few songs and Audiomood will personalize this section."
};

export const EMPTY_CONTINUE = {
  title: "Nothing in progress",
  subtitle: "Press play on any track and it will show up here."
};

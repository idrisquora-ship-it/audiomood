/**
 * Font family names match `@expo-google-fonts/inter` PostScript names loaded in root `_layout.tsx`.
 */
export const FONT = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold"
} as const;

export const FONT_SIZES = {
  caption: 12,
  body: 15,
  bodyLarge: 16,
  /** Section headings (homescreen blocks, lists). */
  section: 20,
  /** Primary screen titles. */
  screenTitle: 30
} as const;

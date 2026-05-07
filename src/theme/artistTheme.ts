/**
 * Semantic tokens for artist mode (aligned with `colors.ts`).
 * Use these in artist-specific components for a single, auditable palette.
 */
import { colors } from "@/theme/colors";

export const artistTheme = {
  background: colors.background,
  surface: colors.surface,
  surfaceElevated: colors.surfaceElevated,
  primary: colors.primary,
  border: colors.border,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted
} as const;

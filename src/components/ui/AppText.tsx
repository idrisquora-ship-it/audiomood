import { PropsWithChildren, useMemo } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { colors } from "@/theme/colors";
import { FONT, FONT_SIZES } from "@/theme/typography";

export type AppTextVariant = "screenTitle" | "section" | "bodyLarge" | "body" | "caption";

type Props = PropsWithChildren<
  TextProps & {
    muted?: boolean;
    secondary?: boolean;
    variant?: AppTextVariant;
    style?: StyleProp<TextStyle>;
  }
>;

export function AppText({ children, muted = false, secondary = false, variant = "body", style, ...rest }: Props) {
  const variantStyle = useMemo((): TextStyle => {
    switch (variant) {
      case "screenTitle":
        return {
          fontFamily: FONT.extraBold,
          fontSize: FONT_SIZES.screenTitle,
          lineHeight: 36,
          color: colors.text,
          letterSpacing: -0.5
        };
      case "section":
        return {
          fontFamily: FONT.bold,
          fontSize: FONT_SIZES.section,
          lineHeight: 26,
          color: colors.text,
          letterSpacing: -0.2
        };
      case "bodyLarge":
        return { fontFamily: FONT.regular, fontSize: FONT_SIZES.bodyLarge, lineHeight: 23, color: colors.text };
      case "caption":
        return {
          fontFamily: FONT.medium,
          fontSize: FONT_SIZES.caption,
          lineHeight: 17,
          color: colors.textSecondary
        };
      default:
        return { fontFamily: FONT.regular, fontSize: FONT_SIZES.body, lineHeight: 21, color: colors.text };
    }
  }, [variant]);

  const tone = useMemo((): StyleProp<TextStyle> => {
    if (muted) return { color: colors.textMuted };
    if (secondary) return { color: colors.textSecondary };
    return null;
  }, [muted, secondary]);

  return (
    <Text style={[variantStyle, tone, style]} {...rest}>
      {children}
    </Text>
  );
}


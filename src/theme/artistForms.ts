import type { TextStyle } from "react-native";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";

/** Base style for TextInputs on artist flows so system “comic”/default faces never show through. */
export const artistTextInputTypography: TextStyle = {
  fontFamily: FONT.regular,
  fontSize: 15,
  color: colors.text
};

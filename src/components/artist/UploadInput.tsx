import { StyleSheet, TextInput, type StyleProp, type TextInputProps, type ViewStyle, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { artistTextInputTypography } from "@/theme/artistForms";
import { colors } from "@/theme/colors";

type Props = TextInputProps & {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function UploadInput({ label, containerStyle, style, ...rest }: Props) {
  return (
    <View style={containerStyle}>
      <AppText variant="caption" secondary style={{ marginBottom: 6 }}>
        {label}
      </AppText>
      <TextInput {...rest} style={[styles.field, artistTextInputTypography, style]} placeholderTextColor={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border
  }
});

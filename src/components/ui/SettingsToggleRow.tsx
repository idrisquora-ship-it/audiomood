import { StyleSheet, Switch, View } from "react-native";
import { AppText } from "@/components/ui/AppText";

type Props = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  subtitle?: string;
};

export function SettingsToggleRow({ label, value, onValueChange, subtitle }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="body">{label}</AppText>
        {subtitle ? (
          <AppText variant="caption" secondary>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4
  },
  text: { flex: 1, marginRight: 8 }
});

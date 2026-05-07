import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id);
      }, 2500)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [removeToast, toasts]);

  return (
    <View pointerEvents="none" style={[styles.container, { bottom: Math.max(insets.bottom, 8) + 10 }]}>
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[
            styles.toast,
            toast.kind === "success" && styles.success,
            toast.kind === "error" && styles.error
          ]}
        >
          <AppText>{toast.text}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    gap: 8
  },
  toast: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  success: { borderColor: colors.success },
  error: { borderColor: colors.danger }
});

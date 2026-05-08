import { Modal, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText muted>{message}</AppText>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={onCancel}>
              <AppText>{cancelText}</AppText>
            </Pressable>
            <Pressable style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <AppText>{confirmText}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10
  },
  title: { fontSize: 18, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  button: { backgroundColor: colors.cardAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  confirm: { backgroundColor: colors.primary }
});

import { router } from "expo-router";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type Props = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export function BecomeArtistModal({ visible, title, description, onClose }: Props) {
  return (
    <ConfirmModal
      visible={visible}
      title={title}
      message={description}
      cancelText="Maybe Later"
      confirmText="Become Artist"
      onCancel={onClose}
      onConfirm={() => {
        onClose();
        router.push("/(onboarding)/artist");
      }}
    />
  );
}


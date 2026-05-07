import { create } from "zustand";

type ToastKind = "success" | "error" | "info";

type ToastMessage = {
  id: string;
  text: string;
  kind: ToastKind;
};

type UiState = {
  toasts: ToastMessage[];
  pushToast: (text: string, kind?: ToastKind) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (text, kind = "info") =>
    set((state) => ({
      toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, text, kind }]
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));

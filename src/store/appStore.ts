import { create } from "zustand";

type AccountView = "listener" | "artist";

type AppState = {
  accountView: AccountView;
  setAccountView: (view: AccountView) => void;
};

export const useAppStore = create<AppState>((set) => ({
  accountView: "listener",
  setAccountView: (accountView) => set({ accountView })
}));

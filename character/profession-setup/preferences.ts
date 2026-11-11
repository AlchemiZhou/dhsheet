import { create } from "zustand";
import {
  getProfessionAutoSetup,
  setProfessionAutoSetup,
  getReferencePrint,
  setReferencePrint,
} from "@/lib/app-preferences";
export const useProfessionSetupPreferences = create<{
  enabled: boolean;
  referencePrint: boolean;
  setEnabled: (value: boolean) => void;
  setReferencePrint: (value: boolean) => void;
}>((set) => ({
  enabled: getProfessionAutoSetup(),
  referencePrint: getReferencePrint(),
  setEnabled: (enabled) => {
    setProfessionAutoSetup(enabled);
    set({ enabled });
  },
  setReferencePrint: (referencePrint) => {
    setReferencePrint(referencePrint);
    set({ referencePrint });
  },
}));

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModuleKey, User } from "./types";

interface NXState {
  currentUserId: string;
  currentUser: User | null;
  setCurrentUser: (u: User) => void;
  activeModule: ModuleKey;
  setModule: (m: ModuleKey) => void;
  // neighborhood context
  neighborhood: {
    state: string;
    district: string;
    city: string;
    area: string;
    society: string;
    scope: "SOCIETY" | "AREA" | "CITY";
  };
  setScope: (s: "SOCIETY" | "AREA" | "CITY") => void;
  // chat
  chatOpen: boolean;
  chatRoom: string;
  openChat: (room: string) => void;
  closeChat: () => void;
}

export const useNX = create<NXState>()(
  persist(
    (set) => ({
      currentUserId: "seed-arjun",
      currentUser: null,
      setCurrentUser: (u) => set({ currentUser: u, currentUserId: u.id }),
      activeModule: "dashboard",
      setModule: (m) => set({ activeModule: m }),
      neighborhood: {
        state: "Maharashtra",
        district: "Latur",
        city: "Udgir",
        area: "Khair Nagar",
        society: "Royal Residency",
        scope: "AREA",
      },
      setScope: (s) =>
        set((st) => ({ neighborhood: { ...st.neighborhood, scope: s } })),
      chatOpen: false,
      chatRoom: "general",
      openChat: (room) => set({ chatOpen: true, chatRoom: room }),
      closeChat: () => set({ chatOpen: false }),
    }),
    { name: "neighborx-store" }
  )
);

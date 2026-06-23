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
  // admin console view switch — NOT persisted (always boot into user app)
  adminView: boolean;
  setAdminView: (v: boolean) => void;
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
      adminView: false,
      setAdminView: (v) => set({ adminView: v }),
    }),
    {
      name: "neighborx-store",
      // Prevent automatic synchronous rehydration on the client, which would
      // cause the client's first render to differ from the server-rendered
      // HTML (e.g. a different activeModule) and trigger React hydration
      // mismatches that shift Radix useId() slots. We rehydrate manually in
      // a useEffect after mount (see AppShell).
      skipHydration: true,
      // Only persist user preferences — never persist navigation state
      // (activeModule) so the app always boots into the dashboard on both
      // server and client.
      partialize: (state) => ({
        neighborhood: state.neighborhood,
      }),
    }
  )
);

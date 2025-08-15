import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,                 // { email } or null
      isAuthed: false,

      // Call this after a successful server login
      loginSuccess: (email) => set({ user: { email }, isAuthed: true }),

      // Clears local state; also call your API to invalidate the cookie
      logout: async (opts = {}) => {
        const { silent } = opts;
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (_) {}
        set({ user: null, isAuthed: false });
        if (!silent) window.location.href = "/login";
      },

      // Optional: hydrate from /auth/me if page loaded with a valid cookie
      hydrateFromServer: async () => {
        if (get().isAuthed) return;
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (res.ok) {
            const me = await res.json(); // { email: string, ... }
            set({ user: { email: me.email }, isAuthed: true });
          }
        } catch (_) {}
      },
    }),
    {
      name: "auth", // session key
      storage: createJSONStorage(() => sessionStorage),
      // Only store minimal profile client-side; auth token remains httpOnly cookie
      partialize: (state) => ({ user: state.user, isAuthed: state.isAuthed }),
      // Sync across tabs
      skipHydration: false,
    }
  )
);
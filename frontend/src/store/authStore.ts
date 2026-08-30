import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import { Staff } from "../types/domain";

interface AuthState {
  staff: Staff | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<Staff>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      staff: null,
      accessToken: null,
      refreshToken: null,

      async login(email, password) {
        const result = await authService.login(email, password);
        set({ staff: result.staff, accessToken: result.accessToken, refreshToken: result.refreshToken });
        return result.staff;
      },

      logout() {
        set({ staff: null, accessToken: null, refreshToken: null });
      },

      async refreshAccessToken() {
        const rt = get().refreshToken;
        if (!rt) return null;
        try {
          const { accessToken } = await authService.refresh(rt);
          set({ accessToken });
          return accessToken;
        } catch {
          return null;
        }
      }
    }),
    { name: "pos-auth" }
  )
);

import { useAuthStore } from "../store/authStore";
import { canAccess, Screen } from "../utils/roles";

export function useAuth() {
  const staff = useAuthStore(s => s.staff);
  const logout = useAuthStore(s => s.logout);
  return {
    staff,
    isAuthed: !!staff,
    can: (screen: Screen) => (staff ? canAccess(staff.role, screen) : false),
    logout
  };
}

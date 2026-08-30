import { Role } from "../types/domain";

export type Screen =
  | "pos" | "dashboard" | "products" | "transactions" | "inventory"
  | "customers" | "reports" | "messages" | "settings";

// Mirrors backend/src/types/roles.ts (ROLE_SCREENS) — duplicated deliberately:
// two tiers, two deploys, the API is the actual enforcement point, this just
// drives which nav items and routes render.
export const ROLE_SCREENS: Record<Role, Screen[]> = {
  admin: ["pos", "dashboard", "products", "transactions", "inventory", "customers", "reports", "messages", "settings"],
  manager: ["pos", "dashboard", "products", "transactions", "inventory", "customers", "reports", "messages", "settings"],
  cashier: ["pos", "transactions", "customers", "messages"],
  viewer: ["dashboard", "reports", "messages"]
};

export function canAccess(role: Role, screen: Screen): boolean {
  return ROLE_SCREENS[role].includes(screen);
}

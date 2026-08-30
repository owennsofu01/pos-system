export type Role = "admin" | "manager" | "cashier" | "viewer";

export type Screen =
  | "pos"
  | "dashboard"
  | "products"
  | "transactions"
  | "inventory"
  | "customers"
  | "reports"
  | "messages"
  | "settings";

// Mirrors ROLE_SCREENS in the original pos-core.js prototype — kept as the
// single source of truth for both API route gating (requireRole) and the
// frontend nav (frontend/src/utils/roles.ts duplicates this by design: two
// tiers, two deploys, no shared package).
export const ROLE_SCREENS: Record<Role, Screen[]> = {
  admin: ["pos", "dashboard", "products", "transactions", "inventory", "customers", "reports", "messages", "settings"],
  manager: ["pos", "dashboard", "products", "transactions", "inventory", "customers", "reports", "messages", "settings"],
  cashier: ["pos", "transactions", "customers", "messages"],
  viewer: ["dashboard", "reports", "messages"]
};

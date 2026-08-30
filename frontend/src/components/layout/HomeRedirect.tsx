import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_SCREENS } from "../../utils/roles";

const PATH_FOR: Record<string, string> = {
  pos: "/pos", dashboard: "/dashboard", products: "/products", transactions: "/transactions",
  inventory: "/inventory", customers: "/customers", reports: "/reports", messages: "/messages", settings: "/settings"
};

// Sends a freshly-signed-in user to the first screen their role can see —
// mirrors signIn() in the prototype (`screen: allowed[0]`).
export function HomeRedirect() {
  const { staff } = useAuth();
  if (!staff) return <Navigate to="/login" replace />;
  const first = ROLE_SCREENS[staff.role][0];
  return <Navigate to={PATH_FOR[first]} replace />;
}

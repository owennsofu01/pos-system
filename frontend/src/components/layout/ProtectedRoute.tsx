import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Screen } from "../../utils/roles";

export function ProtectedRoute({ screen, children }: { screen: Screen; children: ReactNode }) {
  const { isAuthed, can } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!can(screen)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

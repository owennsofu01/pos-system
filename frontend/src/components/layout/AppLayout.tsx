import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useSettings } from "../../hooks/useSettings";
import { useCartStore } from "../../store/cartStore";

export function AppLayout() {
  const { settings } = useSettings();
  const cartCount = useCartStore(s => s.lines.reduce((a, l) => a + l.qty, 0));

  return (
    <div className="grid min-h-screen bg-bg text-ink" style={{ gridTemplateColumns: "208px minmax(0,1fr)" }}>
      <Sidebar businessName={settings.businessName} cartCount={cartCount} />
      <main className="min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

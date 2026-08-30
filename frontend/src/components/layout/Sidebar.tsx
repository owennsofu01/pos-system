import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { Screen } from "../../utils/roles";

const NAV_ITEMS: Array<{ screen: Screen; path: string; label: string }> = [
  { screen: "pos", path: "/pos", label: "Point of sale" },
  { screen: "dashboard", path: "/dashboard", label: "Dashboard" },
  { screen: "products", path: "/products", label: "Products" },
  { screen: "transactions", path: "/transactions", label: "Transactions" },
  { screen: "inventory", path: "/inventory", label: "Inventory" },
  { screen: "customers", path: "/customers", label: "Customers" },
  { screen: "reports", path: "/reports", label: "Reports" },
  { screen: "messages", path: "/messages", label: "Messages" },
  { screen: "settings", path: "/settings", label: "Settings" }
];

export function Sidebar({ businessName, cartCount }: { businessName: string; cartCount: number }) {
  const { staff, can, logout } = useAuth();
  if (!staff) return null;

  return (
    <aside className="border-r border-divider flex flex-col pt-7 w-52 shrink-0">
      <div className="px-6 pb-8">
        <div className="font-heading font-semibold text-[23px] leading-tight tracking-tight">{businessName}</div>
        <div className="text-[10px] tracking-[0.2em] uppercase mt-1 text-accent-700">Retail terminal 01</div>
      </div>
      <nav className="flex flex-col">
        {NAV_ITEMS.filter(item => can(item.screen)).map(item => (
          <NavLink
            key={item.screen}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 min-h-12 pr-6 py-3 border-0 bg-transparent font-heading font-semibold text-base transition-colors ${
                isActive ? "text-accent-800" : "text-ink hover:bg-ink/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`block w-0.5 self-stretch ${isActive ? "bg-accent" : "bg-transparent"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.screen === "pos" && cartCount > 0 && (
                  <span className="text-[11px] text-ink/45">{cartCount} in cart</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-6 border-t border-divider flex flex-col gap-1 items-start">
        <div className="text-[10px] tracking-wider uppercase text-ink/64">Signed in</div>
        <div className="text-sm">{staff.name}</div>
        <div className="text-[11px] text-accent-700 capitalize">{staff.role}</div>
        <Button variant="ghost" className="mt-1.5 text-[11px] tracking-wide uppercase" onClick={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}

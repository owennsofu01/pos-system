import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "../types/domain";
import { customersService } from "../services/customers.service";
import { useSettings } from "../hooks/useSettings";
import { useCartStore } from "../store/cartStore";
import { formatMoney } from "../utils/money";
import { Table } from "../components/ui/Table";
import { Tag } from "../components/ui/Tag";
import { Button } from "../components/ui/Button";

function tier(points: number) {
  return points >= 1000 ? "Trade" : points >= 250 ? "Member" : "New";
}
function tierVariant(points: number): "accent" | "outline" | "neutral" {
  return points >= 1000 ? "accent" : points >= 250 ? "outline" : "neutral";
}

export function CustomersPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const setCustomerId = useCartStore(s => s.setCustomerId);
  const [rows, setRows] = useState<Customer[]>([]);

  useEffect(() => { customersService.list().then(setRows); }, []);

  return (
    <section className="p-11 pb-13 flex flex-col gap-7">
      <header className="flex items-end gap-3.5">
        <div className="flex-1">
          <h6 className="kicker">Fig. 06 — Accounts</h6>
          <h2 className="text-[40px] tracking-tight">Customers</h2>
        </div>
        <span className="text-xs max-w-[340px] text-right text-ink/66">
          Points accrue at {settings.pointsPerUnit} per currency unit spent, credited when the sale is charged.
        </span>
      </header>

      <Table>
        <thead>
          <tr>
            <th>Customer</th><th>Phone</th><th>Email</th>
            <th className="text-right">Visits</th><th className="text-right">Lifetime spend</th>
            <th className="text-right">Avg basket</th><th className="text-right">Points</th><th>Tier</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id}>
              <td className="font-heading font-semibold text-[15px]">{c.name}</td>
              <td className="text-muted text-xs">{c.phone}</td>
              <td className="text-muted text-xs">{c.email}</td>
              <td className="text-right">{c.visits}</td>
              <td className="text-right">{formatMoney(c.spend, settings.currency)}</td>
              <td className="text-right text-muted">{formatMoney(c.visits ? c.spend / c.visits : 0, settings.currency)}</td>
              <td className="text-right font-heading font-semibold">{c.points}</td>
              <td><Tag variant={tierVariant(c.points)}>{tier(c.points)}</Tag></td>
              <td className="text-right">
                <Button variant="ghost" className="text-xs" onClick={() => { setCustomerId(c.id); navigate("/pos"); }}>
                  Attach to sale
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}

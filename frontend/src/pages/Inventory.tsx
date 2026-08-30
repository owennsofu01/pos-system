import { useEffect, useState } from "react";
import { InventoryLogEntry, Product } from "../types/domain";
import { inventoryService } from "../services/inventory.service";
import { useSettings } from "../hooks/useSettings";
import { formatMoney } from "../utils/money";
import { formatClock } from "../utils/format";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { Table } from "../components/ui/Table";
import { Tag } from "../components/ui/Tag";
import { Button } from "../components/ui/Button";

export function InventoryPage() {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(settings.lowStockThreshold);
  const [log, setLog] = useState<InventoryLogEntry[]>([]);

  const reload = () => {
    inventoryService.rows().then(r => { setProducts(r.products); setThreshold(r.lowStockThreshold); });
    inventoryService.log().then(setLog);
  };
  useEffect(reload, []);

  async function adjust(p: Product, delta: number) {
    if (delta < 0 && p.qty === 0) return;
    await inventoryService.adjust(p.id, delta);
    reload();
  }

  const lowStock = products.filter(p => p.qty <= threshold);
  const stockColor = (qty: number) => (qty === 0 ? "#1d454e" : qty <= threshold ? "#2f5f66" : undefined);

  return (
    <section className="p-11 pb-13 flex flex-col gap-7">
      <header>
        <h6 className="kicker">Fig. 05 — Stock</h6>
        <h2 className="text-[40px] tracking-tight">Inventory</h2>
      </header>

      {lowStock.length > 0 && (
        <BlueprintPanel className="px-[18px] py-3.5 flex items-center gap-3.5" style={{ borderColor: "#35696f" }}>
          <Tag variant="accent">Low stock</Tag>
          <span className="text-sm">
            {lowStock.length} products at or below the {threshold}-unit threshold: {lowStock.map(p => p.name).join(", ")}.
          </span>
        </BlueprintPanel>
      )}

      <div className="grid gap-11 items-start" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <Table>
          <thead>
            <tr><th>Product</th><th>SKU</th><th className="text-right">On hand</th><th className="text-right">Value</th><th className="text-right">Adjust</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td className="font-heading font-semibold text-[15px]">{p.name}</td>
                <td className="text-muted text-xs">{p.sku}</td>
                <td className="text-right" style={{ color: stockColor(p.qty) }}>{p.qty}</td>
                <td className="text-right text-muted">{formatMoney(p.qty * p.cost, settings.currency)}</td>
                <td className="text-right whitespace-nowrap">
                  <Button variant="secondary" aria-label="Decrease stock" className="w-[34px] h-[34px] p-0" onClick={() => adjust(p, -1)}>−</Button>
                  <Button variant="secondary" aria-label="Increase stock" className="w-[34px] h-[34px] p-0 ml-1.5" onClick={() => adjust(p, 1)}>+</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <BlueprintPanel className="p-[18px]">
          <h4 className="mb-5 text-[19px] tracking-wide">Audit trail</h4>
          <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-auto">
            {log.map(l => (
              <div key={l.id} className="grid gap-1 pb-2.5 border-b" style={{ gridTemplateColumns: "1fr auto", borderColor: "rgba(11,34,48,0.08)" }}>
                <span className="text-[13px]">{l.productName}</span>
                <span className="font-heading font-semibold text-sm" style={{ color: l.delta > 0 ? "#2f5f66" : "#3f4b4d" }}>
                  {l.delta > 0 ? `+${l.delta}` : l.delta}
                </span>
                <span className="text-[11px] text-ink/64">{l.type.replace("_", " ")} · {l.reference}</span>
                <span className="text-[11px] text-ink/64">{formatClock(l.occurredAt)}</span>
              </div>
            ))}
          </div>
        </BlueprintPanel>
      </div>
    </section>
  );
}

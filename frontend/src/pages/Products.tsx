import { useEffect, useState } from "react";
import { Product } from "../types/domain";
import { productsService } from "../services/products.service";
import { useSettings } from "../hooks/useSettings";
import { useDebounce } from "../hooks/useDebounce";
import { formatMoney } from "../utils/money";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { ProductFormDialog, ProductFormValue } from "../components/products/ProductFormDialog";

const EMPTY: ProductFormValue = { id: null, name: "", sku: "", category: "", price: "", cost: "", qty: "" };

export function ProductsPage() {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const [form, setForm] = useState<ProductFormValue | null>(null);

  const reload = () => { productsService.list().then(setProducts); };
  useEffect(reload, []);

  const q = debouncedQuery.trim().toLowerCase();
  const rows = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await productsService.remove(p.id);
    reload();
  }

  return (
    <section className="p-11 pb-13 flex flex-col gap-7">
      <header className="flex items-end gap-3.5">
        <div className="flex-1">
          <h6 className="kicker">Fig. 03 — Catalog</h6>
          <h2 className="text-[40px] tracking-tight">Products</h2>
        </div>
        <Input placeholder="Search catalog" value={query} onChange={e => setQuery(e.target.value)} className="w-[260px]" />
        <Button variant="primary" className="h-9" onClick={() => setForm(EMPTY)}>New product</Button>
      </header>

      <Table>
        <thead>
          <tr>
            <th>Name</th><th>SKU</th><th>Category</th>
            <th className="text-right">Cost</th><th className="text-right">Price</th><th className="text-right">Margin</th>
            <th className="text-right">Stock</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id}>
              <td className="font-heading font-semibold text-[15px]">{p.name}</td>
              <td className="text-muted text-xs">{p.sku}</td>
              <td>{p.category}</td>
              <td className="text-right text-muted">{formatMoney(p.cost, settings.currency)}</td>
              <td className="text-right">{formatMoney(p.price, settings.currency)}</td>
              <td className="text-right">{p.price ? `${Math.round(((p.price - p.cost) / p.price) * 100)}%` : "—"}</td>
              <td className="text-right" style={{ color: p.qty === 0 ? "#1d454e" : p.qty <= settings.lowStockThreshold ? "#2f5f66" : undefined }}>{p.qty}</td>
              <td className="text-right whitespace-nowrap">
                <Button variant="ghost" className="text-xs" onClick={() => setForm({ id: p.id, name: p.name, sku: p.sku, category: p.category, price: String(p.price), cost: String(p.cost), qty: String(p.qty) })}>
                  Edit
                </Button>
                <Button variant="ghost" className="text-xs" onClick={() => remove(p)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {form && (
        <ProductFormDialog
          initial={form}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); reload(); }}
        />
      )}
    </section>
  );
}

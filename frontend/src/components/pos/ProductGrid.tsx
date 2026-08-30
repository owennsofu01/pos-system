import { useMemo, useState } from "react";
import { Product } from "../../types/domain";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "../ui/Input";
import { ChoiceChips } from "../ui/ChoiceChips";
import { formatMoney } from "../../utils/money";
import { cn } from "../../utils/cn";

export function ProductGrid({ products, currency, onAdd }: { products: Product[]; currency: string; onAdd: (p: Product) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const debouncedQuery = useDebounce(query, 150);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const grid = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return products.filter(p => {
      const matches = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return matches && (category === "All" || p.category === category);
    });
  }, [products, debouncedQuery, category]);

  return (
    <section className="min-w-0 flex flex-col p-11 pr-8">
      <header className="flex items-end gap-5 mb-8">
        <div className="flex-1 min-w-0">
          <h6 className="kicker">Fig. 01 — Point of sale</h6>
          <h2 className="text-[40px] tracking-tight">New sale</h2>
        </div>
        <div className="flex-none w-[300px]">
          <Input placeholder="Search name or scan SKU" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="mb-7">
        <ChoiceChips options={categories as string[]} value={category} onChange={setCategory} />
      </div>

      <div className="grid gap-px bg-divider" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(206px, 1fr))" }}>
        {grid.map(p => (
          <button
            key={p.id}
            type="button"
            disabled={p.qty === 0}
            onClick={() => onAdd(p)}
            className={cn(
              "flex flex-col gap-1.5 min-h-[146px] p-[18px] bg-bg border-0 cursor-pointer text-left font-body text-ink transition-colors hover:bg-accent-100",
              p.qty === 0 && "opacity-45 cursor-not-allowed hover:bg-bg"
            )}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] tracking-wider uppercase text-accent-700">{p.category}</span>
              <span className="text-[10px]" style={{ color: p.qty === 0 ? "#1d454e" : p.qty <= 6 ? "#2f5f66" : "rgba(11,34,48,0.62)" }}>
                {p.qty === 0 ? "Out of stock" : `${p.qty} on hand`}
              </span>
            </span>
            <span className="font-heading font-semibold text-lg leading-tight text-left">{p.name}</span>
            <span className="flex items-baseline justify-between gap-2 mt-auto">
              <span className="text-[10px] tracking-wide text-ink/45">{p.sku}</span>
              <span className="font-heading font-semibold text-xl tracking-tight">{formatMoney(p.price, currency)}</span>
            </span>
          </button>
        ))}
      </div>
      {grid.length === 0 && <p className="mt-5 text-sm text-ink/66">No products match that search.</p>}
    </section>
  );
}

import { useMemo, useState } from "react";
import { Customer, PaymentMethod, Product, Settings, Transaction } from "../../types/domain";
import { useCartStore } from "../../store/cartStore";
import { computeTotals } from "../../utils/pricing";
import { currencyFor, formatMoney } from "../../utils/money";
import { transactionsService } from "../../services/transactions.service";
import { BlueprintPanel } from "../ui/BlueprintPanel";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { cn } from "../../utils/cn";

const PAY_METHODS: Array<{ key: PaymentMethod; label: string }> = [
  { key: "cash", label: "Cash" }, { key: "card", label: "Card" }, { key: "mobile_money", label: "Mobile money" }
];

export function CartPanel({
  products, customers, settings, onCharged
}: {
  products: Product[]; customers: Customer[]; settings: Settings; onCharged: (tx: Transaction) => void;
}) {
  const cart = useCartStore();
  const [manualOpen, setManualOpen] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [custQuery, setCustQuery] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const currency = currencyFor(settings.currency);
  const money = (n: number) => formatMoney(n, settings.currency);

  const totals = computeTotals(cart.lines.map(l => ({ unit: l.unit, qty: l.qty })), cart.discountInput, settings.taxRate);
  const paid = cart.method === "cash" ? Number(cart.tendered) || 0 : totals.total;
  const short = cart.lines.length > 0 && paid + 0.001 < totals.total;
  const selectedCustomer = customers.find(c => c.id === cart.customerId) ?? null;

  const custResults = customers.filter(c => {
    const q = custQuery.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  function onManualCodeChange(v: string) {
    setManualCode(v);
    const t = v.trim().toLowerCase();
    const hit = t
      ? products.find(p => p.sku.toLowerCase() === t || p.name.toLowerCase() === t) ||
        products.find(p => p.sku.toLowerCase().startsWith(t) || p.name.toLowerCase().startsWith(t))
      : null;
    setManualPrice(hit ? String(hit.price) : "");
    setManualNote(hit ? `${hit.name} — ${money(hit.price)} · ${hit.qty} on hand` : "");
  }

  function addManualLine() {
    const code = manualCode.trim();
    if (!code) { setManualNote("Enter a SKU or a description first."); return; }
    const hit = products.find(p => p.sku.toLowerCase() === code.toLowerCase() || p.name.toLowerCase() === code.toLowerCase())
      || products.find(p => p.sku.toLowerCase().startsWith(code.toLowerCase()) || p.name.toLowerCase().startsWith(code.toLowerCase()));
    const qty = Math.max(1, Math.floor(Number(manualQty) || 1));
    if (hit) {
      cart.addProduct(hit, qty);
      setManualNote(`${hit.name} × ${qty} added from catalog.`);
    } else {
      const price = Number(manualPrice);
      if (!(price > 0)) { setManualNote("No catalog match — enter a price to add it as a manual line."); return; }
      cart.addManual(code, price, qty);
      setManualNote("Manual line added — not tracked against stock.");
    }
    setManualCode(""); setManualPrice(""); setManualQty("");
  }

  async function charge() {
    setError("");
    setBusy(true);
    try {
      const tx = await transactionsService.checkout({
        lines: cart.toApiLines(),
        discountInput: cart.discountInput,
        method: cart.method,
        tendered: cart.method === "cash" ? Number(cart.tendered) || 0 : undefined,
        customerId: cart.customerId
      });
      cart.clear();
      onCharged(tx);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete the sale.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BlueprintPanel className="m-11 ml-0 flex flex-col bg-surface" style={{ height: "calc(100vh - 88px)" }}>
      <div className="px-[22px] pt-[22px] pb-[18px] border-b border-divider flex items-baseline justify-between flex-none">
        <h4>Cart</h4>
        <span className="text-[11px] tracking-wide uppercase text-ink/66">{cart.count()} items</span>
      </div>

      <div className="flex-1 min-h-[200px] overflow-y-auto">
        {cart.lines.length === 0 && (
          <p className="m-0 px-[22px] py-7 text-[13px] text-ink/64">Tap a product to start the sale, or key one in below.</p>
        )}
        {cart.lines.map(line => (
          <div key={line.id} className="px-[22px] py-3.5 border-b" style={{ borderColor: "rgba(11,34,48,0.07)" }}>
            <div className="grid items-center gap-4" style={{ gridTemplateColumns: "1fr auto auto" }}>
              <div className="min-w-0">
                <div className="font-heading font-semibold text-[15px]">{line.name}</div>
                <div className="text-[11px] text-ink/64">{money(line.unit)} each{line.manual ? " · manual" : ""}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  aria-label="Decrease quantity"
                  className="w-10 h-10 p-0 text-[17px]"
                  onClick={() => cart.step(line.id, -1, line.productId ? productById.get(line.productId)?.qty : 99)}
                >
                  −
                </Button>
                <span className="min-w-[20px] text-center text-sm">{line.qty}</span>
                <Button
                  variant="secondary"
                  aria-label="Increase quantity"
                  className="w-10 h-10 p-0 text-[17px]"
                  onClick={() => cart.step(line.id, 1, line.productId ? productById.get(line.productId)?.qty : 99)}
                >
                  +
                </Button>
              </div>
              <div className="font-heading font-semibold text-base text-right min-w-[62px]">{money(line.unit * line.qty)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-none px-[22px] py-[18px] border-t border-divider flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => { setManualOpen(v => !v); setCustOpen(false); }}
            className={cn("min-h-[42px] px-3.5 border font-heading font-semibold text-[13px]", manualOpen ? "border-accent bg-accent-100" : "border-divider bg-transparent")}
          >
            {manualOpen ? "Close key-in" : "Key in item"}
          </button>
          <button
            type="button"
            onClick={() => { setCustOpen(v => !v); setManualOpen(false); }}
            className={cn("min-h-[42px] px-3.5 border font-heading font-semibold text-[13px] truncate", custOpen ? "border-accent bg-accent-100" : "border-divider bg-transparent")}
          >
            {selectedCustomer ? `${selectedCustomer.name} · ${selectedCustomer.points} pts` : "Walk-in"}
          </button>
        </div>

        {manualOpen && (
          <>
            <div className="grid gap-1.5 items-end" style={{ gridTemplateColumns: "1fr 76px 52px auto" }}>
              <Field label="SKU or description" className="!m-0">
                <Input placeholder="TLS-1601" value={manualCode} onChange={e => onManualCodeChange(e.target.value)} />
              </Field>
              <Field label="Price" className="!m-0">
                <Input type="number" min={0} step={0.01} placeholder="0.00" value={manualPrice} onChange={e => setManualPrice(e.target.value)} />
              </Field>
              <Field label="Qty" className="!m-0">
                <Input type="number" min={1} placeholder="1" value={manualQty} onChange={e => setManualQty(e.target.value)} />
              </Field>
              <Button variant="secondary" className="h-11 min-w-[56px]" onClick={addManualLine}>Add</Button>
            </div>
            <div className="text-[11px] text-ink/64">{manualNote || "Type a SKU to pull it from the catalog, or a description plus price for an off-catalog line."}</div>
          </>
        )}

        {custOpen && (
          <div>
            <Input placeholder="Search customers by name or phone" value={custQuery} onChange={e => setCustQuery(e.target.value)} />
            <div className="border border-t-0 border-divider max-h-[132px] overflow-y-auto">
              <button
                type="button"
                onClick={() => { cart.setCustomerId(null); setCustOpen(false); setCustQuery(""); }}
                className={cn("flex justify-between w-full px-2.5 py-1.5 border-0 text-left text-[13px] hover:bg-ink/5", cart.customerId === null && "bg-accent-100")}
              >
                <span>Walk-in — no customer</span><span />
              </button>
              {custResults.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { cart.setCustomerId(c.id); setCustOpen(false); setCustQuery(""); }}
                  className={cn("flex justify-between w-full px-2.5 py-1.5 border-0 text-left text-[13px] hover:bg-ink/5", cart.customerId === c.id && "bg-accent-100")}
                >
                  <span>{c.name}</span><span className="text-ink/64">{c.points} pts</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Discount — percent or code" className="!m-0">
          <Input placeholder="10 or SAVE10" value={cart.discountInput} onChange={e => cart.setDiscountInput(e.target.value)} />
        </Field>
      </div>

      <div className="flex-none px-[22px] py-[18px] border-t border-divider flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(totals.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Discount</span><span>{totals.discount ? `−${money(totals.discount)}` : money(0)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Tax {settings.taxRate}%</span><span>{money(totals.tax)}</span></div>
        <div className="flex justify-between items-baseline mt-1 pt-1.5 border-t border-divider">
          <span className="font-heading font-semibold text-lg">Total</span>
          <span className="font-heading font-semibold text-[34px] tracking-tight">{money(totals.total)}</span>
        </div>
      </div>

      <div className="flex-none px-[22px] pt-[18px] pb-[22px] border-t border-divider flex flex-col gap-2.5">
        <div className="flex gap-px border border-divider">
          {PAY_METHODS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => cart.setMethod(m.key)}
              className={cn(
                "flex-1 min-h-[46px] py-2 border-0 font-heading font-semibold text-sm transition-colors",
                cart.method === m.key ? "bg-accent text-bg" : "bg-transparent text-ink"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {cart.method === "cash" && (
          <>
            <div className="grid gap-1.5 items-end" style={{ gridTemplateColumns: "1fr auto auto auto" }}>
              <Field label="Cash tendered" className="!m-0">
                <Input type="number" min={0} value={cart.tendered} onChange={e => cart.setTendered(e.target.value)} />
              </Field>
              {currency.quick.map(q => (
                <Button key={q} variant="secondary" className="h-10 min-w-[56px]" onClick={() => cart.setTendered(String(q))}>
                  {currency.symbol}{q}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Change due</span>
              <span className={cn("font-heading font-semibold text-base", short ? "text-neutral-700" : "text-accent-700")}>
                {short ? `Short ${money(totals.total - paid)}` : money(Math.max(0, paid - totals.total))}
              </span>
            </div>
          </>
        )}

        {error && <div className="text-xs text-accent-800">{error}</div>}

        <Button
          variant="primary"
          className="blueprint h-[50px] text-lg tracking-wide relative"
          disabled={cart.lines.length === 0 || short || busy}
          onClick={charge}
        >
          <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
          {cart.lines.length === 0 ? "Charge" : busy ? "Charging…" : `Charge ${money(totals.total)}`}
        </Button>
        <Button variant="ghost" className="text-[11px] tracking-wide uppercase" disabled={cart.lines.length === 0} onClick={() => cart.clear()}>
          Void sale
        </Button>
      </div>
    </BlueprintPanel>
  );
}

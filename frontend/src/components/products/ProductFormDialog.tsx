import { ChangeEvent, useState } from "react";
import { Product } from "../../types/domain";
import { productsService } from "../../services/products.service";
import { Dialog } from "../ui/Dialog";
import { Field, Input } from "../ui/Input";
import { Button } from "../ui/Button";

export interface ProductFormValue {
  id: number | null; name: string; sku: string; category: string; price: string; cost: string; qty: string;
}

export function ProductFormDialog({ initial, onClose, onSaved }: { initial: ProductFormValue; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof ProductFormValue) => (e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.name.trim()) { setError("A product needs a name."); return; }
    const payload: Omit<Product, "id"> = {
      name: form.name.trim(), sku: form.sku || "NEW-000", category: form.category || "Uncategorised",
      price: Number(form.price) || 0, cost: Number(form.cost) || 0, qty: Number(form.qty) || 0
    };
    if (payload.price < 0 || payload.cost < 0) { setError("Price and cost cannot be negative."); return; }
    setBusy(true);
    try {
      if (form.id) await productsService.update(form.id, payload);
      else await productsService.create(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog width={468}>
      <h4 className="mb-6 text-[19px] tracking-wide">{form.id ? "Edit product" : "New product"}</h4>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Name" className="col-span-2 !m-0"><Input value={form.name} onChange={set("name")} /></Field>
        <Field label="SKU" className="!m-0"><Input value={form.sku} onChange={set("sku")} /></Field>
        <Field label="Category" className="!m-0"><Input value={form.category} onChange={set("category")} /></Field>
        <Field label="Cost" className="!m-0"><Input type="number" min={0} step={0.01} value={form.cost} onChange={set("cost")} /></Field>
        <Field label="Price" className="!m-0"><Input type="number" min={0} step={0.01} value={form.price} onChange={set("price")} /></Field>
        <Field label="Quantity on hand" className="!m-0"><Input type="number" min={0} value={form.qty} onChange={set("qty")} /></Field>
      </div>
      <div className="flex items-center gap-3.5 mt-5">
        <span className="flex-1 text-xs text-accent-800">{error}</span>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={busy}>Save product</Button>
      </div>
    </Dialog>
  );
}

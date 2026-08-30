import { useEffect, useState } from "react";
import { Customer, Product, Transaction } from "../types/domain";
import { productsService } from "../services/products.service";
import { customersService } from "../services/customers.service";
import { useSettings } from "../hooks/useSettings";
import { useCartStore } from "../store/cartStore";
import { ProductGrid } from "../components/pos/ProductGrid";
import { CartPanel } from "../components/pos/CartPanel";
import { ReceiptDialog } from "../components/receipts/ReceiptDialog";

export function PosPage() {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const addProduct = useCartStore(s => s.addProduct);

  const reload = () => {
    productsService.list().then(setProducts);
    customersService.list().then(setCustomers);
  };

  useEffect(reload, []);

  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 372px", minHeight: "max(100vh, 1000px)" }}>
      <ProductGrid products={products} currency={settings.currency} onAdd={p => addProduct(p)} />
      <CartPanel
        products={products}
        customers={customers}
        settings={settings}
        onCharged={tx => { setReceipt(tx); reload(); }}
      />
      {receipt && (
        <ReceiptDialog tx={receipt} settings={settings} customers={customers} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

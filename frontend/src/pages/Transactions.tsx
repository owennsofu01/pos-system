import { useEffect, useState } from "react";
import { Customer, Transaction } from "../types/domain";
import { transactionsService } from "../services/transactions.service";
import { customersService } from "../services/customers.service";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../hooks/useAuth";
import { formatMoney } from "../utils/money";
import { Table } from "../components/ui/Table";
import { Tag } from "../components/ui/Tag";
import { Button } from "../components/ui/Button";
import { ReceiptDialog } from "../components/receipts/ReceiptDialog";

const METHOD_LABELS: Record<string, string> = { cash: "Cash", card: "Card", mobile_money: "Mobile money" };

export function TransactionsPage() {
  const { settings } = useSettings();
  const { can } = useAuth();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [viewing, setViewing] = useState<Transaction | null>(null);

  const reload = () => transactionsService.list().then(setRows);
  useEffect(() => {
    reload();
    if (can("customers")) customersService.list().then(setCustomers);
  }, []);

  async function refund(t: Transaction) {
    if (!confirm(`Refund ${t.receiptNo}? Stock will be restored.`)) return;
    await transactionsService.refund(t.id);
    reload();
  }

  return (
    <section className="p-11 pb-13 flex flex-col gap-7">
      <header>
        <h6 className="kicker">Fig. 04 — Ledger</h6>
        <h2 className="text-[40px] tracking-tight">Transactions</h2>
      </header>

      <Table>
        <thead>
          <tr>
            <th>Receipt</th><th>Date</th><th>Cashier</th><th>Method</th><th>Items</th>
            <th className="text-right">Total</th><th>Status</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id}>
              <td className="font-heading">{t.receiptNo}</td>
              <td className="text-muted">{t.date} {t.time}</td>
              <td>{t.cashierName}</td>
              <td>{METHOD_LABELS[t.method]}</td>
              <td>{t.lines.reduce((a, l) => a + l.qty, 0)}</td>
              <td className="text-right">{formatMoney(t.total, settings.currency)}</td>
              <td><Tag variant={t.status === "refunded" ? "neutral" : "accent"}>{t.status}</Tag></td>
              <td className="text-right whitespace-nowrap">
                <Button variant="ghost" className="text-xs" onClick={() => setViewing(t)}>Receipt</Button>
                <Button variant="ghost" className="text-xs" disabled={t.status === "refunded"} onClick={() => refund(t)}>Refund</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {viewing && (
        <ReceiptDialog tx={viewing} settings={settings} customers={customers} onClose={() => setViewing(null)} doneLabel="Close" />
      )}
    </section>
  );
}

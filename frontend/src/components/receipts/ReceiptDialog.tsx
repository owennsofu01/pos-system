import { useState } from "react";
import { Customer, Settings, Transaction } from "../../types/domain";
import { formatMoney } from "../../utils/money";
import { settingsService } from "../../services/settings.service";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function ReceiptDialog({
  tx, settings, customers, onClose, doneLabel = "New sale"
}: {
  tx: Transaction; settings: Settings; customers: Customer[]; onClose: () => void; doneLabel?: string;
}) {
  const money = (n: number) => formatMoney(n, settings.currency);
  const customer = customers.find(c => c.id === tx.customerId);
  const methodLabel = { cash: "Cash", card: "Card", mobile_money: "Mobile money" }[tx.method];

  const [emailTo, setEmailTo] = useState(customer?.email ?? "");
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);

  async function sendEmail() {
    setSending(true);
    try {
      const result = await settingsService.sendReceipt(emailTo, tx.receiptNo, settings.businessName);
      setToast(result.message);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Could not send the receipt.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog width={396} zIndex={40}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="text-center pb-3.5 border-b border-divider">
          <div className="font-heading font-semibold text-2xl">{settings.businessName}</div>
          <div className="text-[11px] text-ink/66">148 Foundry Row · (415) 555 0142</div>
        </div>
        <div className="flex justify-between text-[11px] py-2.5 text-ink/60">
          <span>{tx.receiptNo}</span><span>{tx.date} {tx.time}</span>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {tx.lines.map((l, i) => (
              <tr key={i}>
                <td className="py-1.5">
                  {l.qty} × {l.name}
                  <div className="text-[10px] text-ink/64">{money(l.unitPrice)} each</div>
                </td>
                <td className="py-1.5 text-right align-top">{money(l.unitPrice * l.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3.5 pt-2.5 border-t border-divider flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(tx.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Discount</span><span>{tx.discount ? `−${money(tx.discount)}` : money(0)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Tax {settings.taxRate}%</span><span>{money(tx.tax)}</span></div>
          <div className="flex justify-between pt-1.5 mt-1 border-t border-divider font-heading font-semibold text-xl"><span>Total</span><span>{money(tx.total)}</span></div>
          <div className="flex justify-between"><span className="text-muted">{methodLabel} tendered</span><span>{money(tx.paid)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Change</span><span>{money(tx.changeDue)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Customer</span><span>{customer?.name ?? "Walk-in"}</span></div>
          <div className="flex justify-between"><span className="text-muted">Loyalty earned</span><span>{tx.pointsEarned ? `+${tx.pointsEarned} pts` : "—"}</span></div>
        </div>
        <p className="mt-4 text-[11px] text-center text-ink/66">{settings.receiptFooter}</p>
        <div className="grid gap-1.5 mt-4" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
          <Input type="email" placeholder="customer@email.com" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
          <Button variant="secondary" className="min-h-9" onClick={sendEmail} disabled={sending || !emailTo}>Email</Button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <Button variant="secondary" className="col-span-2" onClick={() => window.print()}>Print</Button>
          <Button variant="primary" className="col-span-2" onClick={onClose}>{doneLabel}</Button>
        </div>
        {toast && <div className="text-[11px] text-center mt-1.5 text-accent-700">{toast}</div>}
      </div>
    </Dialog>
  );
}

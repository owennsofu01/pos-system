import { useEffect, useState } from "react";
import { ChannelSummary, DashboardReport } from "../types/domain";
import { reportsService } from "../services/reports.service";
import { channelsService } from "../services/channels.service";
import { useSettings } from "../hooks/useSettings";
import { formatMoney } from "../utils/money";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { StatTile } from "../components/dashboard/StatTile";
import { HourlyChart } from "../components/dashboard/HourlyChart";
import { CategoryBars } from "../components/dashboard/CategoryBars";
import { Table } from "../components/ui/Table";
import { Tag } from "../components/ui/Tag";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

const METHOD_LABELS: Record<string, string> = { cash: "Cash", card: "Card", mobile_money: "Mobile money" };

export function DashboardPage() {
  const { settings } = useSettings();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [channels, setChannels] = useState<ChannelSummary[]>([]);

  useEffect(() => {
    reportsService.dashboard().then(setReport);
    channelsService.list().then(setChannels);
  }, []);

  if (!report) return <div className="p-11 text-sm text-ink/60">Loading…</div>;

  const money = (n: number) => formatMoney(n, settings.currency);
  const unreadTotal = channels.reduce((a, c) => a + c.unread, 0);

  return (
    <section className="p-11 pb-13 flex flex-col gap-10">
      <header>
        <h6 className="kicker">Fig. 02 — Today</h6>
        <h2 className="text-[40px] tracking-tight">Dashboard</h2>
      </header>

      <div className="grid grid-cols-4 gap-7">
        <StatTile label="Revenue today" value={money(report.revenue)} note={`${report.transactionCount - report.refundedCount} completed sales`} />
        <StatTile label="Transactions" value={String(report.transactionCount)} note={`${report.refundedCount} refunded`} />
        <StatTile label="Units sold" value={String(report.unitsSold)} note={`Across ${report.topSellers.length} products`} />
        <StatTile label="Average basket" value={money(report.averageBasket)} note={`Tax at ${settings.taxRate}%`} />
      </div>

      <div className="grid gap-11 items-start" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        <BlueprintPanel className="p-7">
          <HourlyChart hourly={report.hourly} currency={settings.currency} />
        </BlueprintPanel>
        <BlueprintPanel className="p-7">
          <div className="text-[10px] tracking-[0.18em] uppercase text-accent-700 mb-6">Revenue by category</div>
          <CategoryBars byCategory={report.byCategory} currency={settings.currency} />
        </BlueprintPanel>
      </div>

      <div className="grid grid-cols-2 gap-11">
        <div>
          <h4 className="mb-5 text-[19px] tracking-wide">Payment methods</h4>
          <div className="flex flex-col gap-3.5">
            {report.paymentBreakdown.map(b => (
              <div key={b.method}>
                <div className="flex justify-between text-[13px] mb-1.5"><span>{b.label}</span><span className="text-muted">{money(b.amount)}</span></div>
                <div className="h-2.5 border border-divider">
                  <div className="h-full bg-accent" style={{ width: `${Math.round(b.share * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-5 text-[19px] tracking-wide">Top sellers</h4>
          <Table>
            <thead><tr><th>Product</th><th className="text-right">Units</th><th className="text-right">Revenue</th></tr></thead>
            <tbody>
              {report.topSellers.map(t => (
                <tr key={t.name}><td>{t.name}</td><td className="text-right">{t.units}</td><td className="text-right">{money(t.revenue)}</td></tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="grid gap-11 items-start" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        <div>
          <h4 className="mb-5 text-[19px] tracking-wide">Recent transactions</h4>
          <Table>
            <thead><tr><th>Receipt</th><th>Time</th><th>Cashier</th><th>Method</th><th>Items</th><th className="text-right">Total</th><th>Status</th></tr></thead>
            <tbody>
              {report.recentTx.map(t => (
                <tr key={t.id}>
                  <td className="font-heading">{t.receiptNo}</td>
                  <td className="text-muted">{t.time}</td>
                  <td>{t.cashierName}</td>
                  <td>{METHOD_LABELS[t.method]}</td>
                  <td>{t.lines.reduce((a, l) => a + l.qty, 0)}</td>
                  <td className="text-right">{money(t.total)}</td>
                  <td><Tag variant={t.status === "refunded" ? "neutral" : "accent"}>{t.status}</Tag></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <BlueprintPanel className="p-6">
          <div className="flex items-baseline justify-between gap-3.5 mb-5">
            <div className="text-[10px] tracking-[0.18em] uppercase text-accent-700">Floor chat</div>
            <span className="text-[11px] text-ink/66">{unreadTotal ? `${unreadTotal} unread` : "All caught up"}</span>
          </div>
          <div className="flex flex-col gap-4">
            {channels.map(c => (
              <div key={c.id} className="flex flex-col gap-0.5 pb-3.5 border-b" style={{ borderColor: "rgba(11,34,48,0.07)" }}>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-heading font-semibold text-sm">{c.name}</span>
                  {c.unread > 0 && <span className="text-[11px] text-ink/62">{c.unread} new</span>}
                </div>
                <div className="text-[13px] text-ink/80 truncate">{c.preview}</div>
              </div>
            ))}
          </div>
          <Link to="/messages">
            <Button variant="secondary" block className="mt-2 min-h-10">Open messages</Button>
          </Link>
        </BlueprintPanel>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { RangeReport } from "../types/domain";
import { reportsService } from "../services/reports.service";
import { useSettings } from "../hooks/useSettings";
import { formatMoney } from "../utils/money";
import { BlueprintPanel } from "../components/ui/BlueprintPanel";
import { ChoiceChips } from "../components/ui/ChoiceChips";
import { Table } from "../components/ui/Table";

type Range = "Daily" | "Weekly" | "Monthly";
const RANGES: Range[] = ["Daily", "Weekly", "Monthly"];

export function ReportsPage() {
  const { settings } = useSettings();
  const [range, setRange] = useState<Range>("Daily");
  const [report, setReport] = useState<RangeReport | null>(null);

  useEffect(() => { reportsService.range(range).then(setReport); }, [range]);

  const money = (n: number) => formatMoney(n, settings.currency);

  return (
    <section className="p-11 pb-13 flex flex-col gap-10">
      <header className="flex items-end gap-3.5">
        <div className="flex-1">
          <h6 className="kicker">Fig. 07 — Analysis</h6>
          <h2 className="text-[40px] tracking-tight">Reports</h2>
        </div>
        <ChoiceChips options={RANGES} value={range} onChange={setRange} />
      </header>

      {report && (
        <>
          <BlueprintPanel className="p-7">
            <div className="flex items-baseline gap-7 mb-5">
              <div>
                <div className="text-[10px] tracking-wide uppercase text-accent">Period total</div>
                <div className="font-heading font-semibold text-[38px] leading-none tracking-tight">{money(report.sum)}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-wide uppercase text-accent">Average per bucket</div>
                <div className="font-heading font-semibold text-[38px] leading-none tracking-tight">{money(report.average)}</div>
              </div>
            </div>
            <div className="flex items-end gap-3.5 border-b border-divider" style={{ height: 224 }}>
              {report.rows.map(([label, amount]) => (
                <div key={label} className="flex-1 flex flex-col justify-end items-center gap-1.5 h-full">
                  <span className="text-[11px] text-ink/66">{money(amount)}</span>
                  <div
                    className="w-full"
                    style={{
                      height: `${Math.max(2, Math.round((amount / report.peak) * 100))}%`,
                      background: label === "Today" ? "#2f5f66" : "#86c4bf"
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3.5 mt-1.5">
              {report.rows.map(([label]) => (
                <div key={label} className="flex-1 text-center text-[11px] tracking-wide uppercase text-ink/66">{label}</div>
              ))}
            </div>
          </BlueprintPanel>

          <div className="grid grid-cols-3 gap-10 items-start">
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
            <div>
              <h4 className="mb-5 text-[19px] tracking-wide">Slow movers</h4>
              <Table>
                <thead><tr><th>Product</th><th className="text-right">On hand</th><th className="text-right">Tied-up cost</th></tr></thead>
                <tbody>
                  {report.slowMovers.map(p => (
                    <tr key={p.name}><td>{p.name}</td><td className="text-right">{p.qty}</td><td className="text-right">{money(p.value)}</td></tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div>
              <h4 className="mb-5 text-[19px] tracking-wide">Staff performance</h4>
              <Table>
                <thead><tr><th>Cashier</th><th className="text-right">Sales</th><th className="text-right">Total</th><th className="text-right">Avg</th></tr></thead>
                <tbody>
                  {report.staffPerformance.map(m => (
                    <tr key={m.name}><td>{m.name}</td><td className="text-right">{m.count}</td><td className="text-right">{money(m.total)}</td><td className="text-right text-muted">{money(m.avg)}</td></tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

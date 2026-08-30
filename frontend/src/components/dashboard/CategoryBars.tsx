import { DashboardReport } from "../../types/domain";
import { formatMoney } from "../../utils/money";

export function CategoryBars({ byCategory, currency }: { byCategory: DashboardReport["byCategory"]; currency: string }) {
  return (
    <div className="flex flex-col gap-[18px]">
      {byCategory.rows.map(r => {
        const share = Math.round((r.amount / (byCategory.total || 1)) * 100);
        const width = Math.max(2, Math.round((r.amount / byCategory.peak) * 100));
        return (
          <div key={r.label}>
            <div className="flex justify-between items-baseline text-[13px] mb-1.5">
              <span className="font-heading font-semibold text-[15px]">{r.label}</span>
              <span className="text-ink/66">{formatMoney(r.amount, currency)} · {share}%</span>
            </div>
            <div className="h-3.5 border border-divider">
              <div className="h-full bg-accent" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { DashboardReport } from "../../types/domain";
import { formatMoney } from "../../utils/money";

const W = 620, H = 190;

export function HourlyChart({ hourly, currency }: { hourly: DashboardReport["hourly"]; currency: string }) {
  const n = hourly.buckets.length;
  const x = (i: number) => (n === 1 ? 0 : (i * W) / (n - 1));
  const y = (v: number) => H - (v / hourly.peak) * (H - 16);
  const pts = hourly.buckets.map((b, i) => `${x(i).toFixed(1)},${y(b.total).toFixed(1)}`);
  const line = pts.join(" ");
  const area = `0,${H} ${pts.join(" ")} ${W},${H}`;
  const busiest = hourly.buckets.length ? [...hourly.buckets].sort((a, b) => b.total - a.total)[0].label : "—";

  return (
    <div>
      <div className="flex items-end justify-between gap-5 mb-6">
        <div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-accent-700">Sales through the day</div>
          <div className="font-heading font-semibold text-[32px] leading-tight tracking-tight">{formatMoney(hourly.total, currency)}</div>
        </div>
        <div className="text-right text-[11px] text-ink/66">
          <div>Busiest hour {busiest}</div>
          <div>Peak {formatMoney(hourly.peak, currency)}</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block w-full overflow-visible" style={{ height: H }}>
        <line x1="0" y1={H * 0.25} x2={W} y2={H * 0.25} stroke="rgba(11,34,48,0.16)" strokeWidth="1" />
        <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke="rgba(11,34,48,0.16)" strokeWidth="1" />
        <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} stroke="rgba(11,34,48,0.16)" strokeWidth="1" />
        <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke="#2f5f66" strokeWidth="1" />
        <polygon points={area} fill="#cfe4e2" />
        <polyline points={line} fill="none" stroke="#2f5f66" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {hourly.buckets.map((b, i) => (
          <circle key={b.hour} cx={x(i)} cy={y(b.total)} r="3.5" fill="#eaeeee" stroke="#2f5f66" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex gap-1 mt-2.5">
        {hourly.buckets.map(b => (
          <div key={b.hour} className="flex-1 text-center text-[10px] tracking-wide text-ink/60">{b.label.slice(0, 2)}</div>
        ))}
      </div>
    </div>
  );
}

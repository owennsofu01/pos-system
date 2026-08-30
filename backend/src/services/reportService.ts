import { transactionRepository } from "../repositories/transactionRepository";
import { productRepository } from "../repositories/productRepository";
import { round2 } from "../utils/money";
import { PaymentMethod, Transaction } from "../types/domain";

const METHOD_LABELS: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", mobile_money: "Mobile money" };
const METHODS: PaymentMethod[] = ["cash", "card", "mobile_money"];

// Static historic series the prototype ships with (pos-core.js SERIES) — a
// real deployment would replace this with a rollup table once there's more
// than a day of history; kept as-is here to match the design's Reports screen.
const SERIES: Record<string, Array<[string, number]>> = {
  Daily: [["19 Aug", 812], ["20 Aug", 1140], ["21 Aug", 964], ["22 Aug", 1388], ["23 Aug", 1502], ["24 Aug", 690]],
  Weekly: [["W30", 5240], ["W31", 6108], ["W32", 5896], ["W33", 6740]],
  Monthly: [["Mar", 21400], ["Apr", 23880], ["May", 25120], ["Jun", 24010], ["Jul", 26890], ["Aug", 18240]]
};

// Direct port of the POS.reports.* functions from pos-core.js, now computed
// from real rows (transactionRepository.findCompletedWithLines) instead of
// an in-memory array.
export const reportService = {
  async dashboard() {
    const [all, completed, products] = await Promise.all([
      transactionRepository.findAll(),
      transactionRepository.findCompletedWithLines(),
      productRepository.findAll()
    ]);
    const revenue = round2(completed.reduce((a, t) => a + t.total, 0));
    const units = completed.reduce((a, t) => a + t.lines.reduce((b, l) => b + l.qty, 0), 0);

    return {
      revenue,
      transactionCount: all.length,
      refundedCount: all.filter(t => t.status === "refunded").length,
      unitsSold: units,
      averageBasket: completed.length ? round2(revenue / completed.length) : 0,
      hourly: hourly(completed, 9, 18),
      byCategory: byCategory(completed, products),
      paymentBreakdown: paymentBreakdown(completed),
      topSellers: topSellers(completed, 5),
      recentTx: all.slice(0, 5)
    };
  },

  async range(range: "Daily" | "Weekly" | "Monthly") {
    const completed = await transactionRepository.findCompletedWithLines();
    const products = await productRepository.findAll();
    const todayTotal = round2(completed.reduce((a, t) => a + t.total, 0));
    const rows = [...(SERIES[range] ?? SERIES.Daily), ["Today", todayTotal] as [string, number]];
    const peak = Math.max(...rows.map(r => r[1])) || 1;
    const sum = round2(rows.reduce((a, r) => a + r[1], 0));
    return {
      rows, peak, sum, average: round2(sum / rows.length),
      topSellers: topSellers(completed, 5),
      slowMovers: slowMovers(products, completed, 6),
      staffPerformance: staffPerformance(completed)
    };
  }
};

function paymentBreakdown(completed: Transaction[]) {
  const total = completed.reduce((a, t) => a + t.total, 0);
  return METHODS.map(m => {
    const amount = round2(completed.filter(t => t.method === m).reduce((a, t) => a + t.total, 0));
    return { method: m, label: METHOD_LABELS[m], amount, share: total ? amount / total : 0 };
  });
}

function topSellers(completed: Transaction[], limit: number) {
  const acc: Record<string, { name: string; units: number; revenue: number }> = {};
  for (const t of completed) {
    for (const l of t.lines) {
      acc[l.name] ??= { name: l.name, units: 0, revenue: 0 };
      acc[l.name].units += l.qty;
      acc[l.name].revenue += l.qty * l.unitPrice;
    }
  }
  return Object.values(acc).sort((a, b) => b.revenue - a.revenue).slice(0, limit)
    .map(x => ({ ...x, revenue: round2(x.revenue) }));
}

function slowMovers(products: Array<{ id: number; name: string; qty: number; cost: number }>, completed: Transaction[], limit: number) {
  const sold = new Set<number>();
  for (const t of completed) for (const l of t.lines) if (l.productId) sold.add(l.productId);
  return products.filter(p => !sold.has(p.id)).slice(0, limit)
    .map(p => ({ name: p.name, qty: p.qty, value: round2(p.qty * p.cost) }));
}

function staffPerformance(completed: Transaction[]) {
  const acc: Record<string, { name: string; count: number; total: number }> = {};
  for (const t of completed) {
    acc[t.cashierName] ??= { name: t.cashierName, count: 0, total: 0 };
    acc[t.cashierName].count += 1;
    acc[t.cashierName].total += t.total;
  }
  return Object.values(acc).sort((a, b) => b.total - a.total)
    .map(x => ({ ...x, total: round2(x.total), avg: round2(x.total / x.count) }));
}

function hourly(completed: Transaction[], openHour: number, closeHour: number) {
  const buckets = [];
  for (let h = openHour; h <= closeHour; h++) buckets.push({ hour: h, label: `${String(h).padStart(2, "0")}:00`, total: 0, count: 0 });
  for (const t of completed) {
    const h = parseInt(t.time.slice(0, 2), 10);
    const b = buckets.find(x => x.hour === h);
    if (b) { b.total += t.total; b.count += 1; }
  }
  const peak = Math.max(...buckets.map(b => b.total)) || 1;
  return { buckets: buckets.map(b => ({ ...b, total: round2(b.total) })), peak, total: round2(buckets.reduce((a, b) => a + b.total, 0)) };
}

function byCategory(completed: Transaction[], products: Array<{ id: number; category: string }>) {
  const acc: Record<string, number> = {};
  const byId = new Map(products.map(p => [p.id, p.category]));
  for (const t of completed) {
    for (const l of t.lines) {
      const key = l.productId ? byId.get(l.productId) ?? "Manual" : "Manual";
      acc[key] = (acc[key] ?? 0) + l.qty * l.unitPrice;
    }
  }
  const rows = Object.entries(acc).map(([label, amount]) => ({ label, amount: round2(amount) })).sort((a, b) => b.amount - a.amount);
  const peak = rows.length ? rows[0].amount : 1;
  return { rows, peak, total: round2(rows.reduce((a, r) => a + r.amount, 0)) };
}

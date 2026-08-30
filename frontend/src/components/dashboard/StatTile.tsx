import { BlueprintPanel } from "../ui/BlueprintPanel";

export function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <BlueprintPanel className="p-6 flex flex-col gap-2.5">
      <div className="text-[10px] tracking-[0.18em] uppercase text-accent-700">{label}</div>
      <div className="font-heading font-semibold text-[44px] leading-none tracking-tight">{value}</div>
      <div className="text-[11px] text-ink/66">{note}</div>
    </BlueprintPanel>
  );
}

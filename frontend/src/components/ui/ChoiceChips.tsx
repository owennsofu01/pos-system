import { cn } from "../../utils/cn";

interface ChoiceChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labelFor?: (v: T) => string;
}

// The prototype's recurring "row of toggle buttons" pattern — category
// filters, currency picker, role picker, date range — reused everywhere.
export function ChoiceChips<T extends string>({ options, value, onChange, labelFor }: ChoiceChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "font-heading font-semibold text-[13px] tracking-wide uppercase min-h-10 px-4 border transition-colors",
            opt === value ? "bg-accent text-bg border-accent" : "bg-transparent text-ink/80 border-divider hover:bg-ink/5"
          )}
        >
          {labelFor ? labelFor(opt) : opt}
        </button>
      ))}
    </div>
  );
}

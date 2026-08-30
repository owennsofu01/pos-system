import { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

// The design system's signature framing device — a hairline box with four
// corner tick marks, used for cards/panels/dialogs/the primary CTA button.
export function BlueprintPanel({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("blueprint", className)} {...rest}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </div>
  );
}

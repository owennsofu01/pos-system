import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Tag({ variant = "neutral", children }: { variant?: "accent" | "neutral" | "outline"; children: ReactNode }) {
  return (
    <span className={cn("tag", variant === "accent" && "tag-accent", variant === "neutral" && "tag-neutral", variant === "outline" && "tag-outline")}>
      {children}
    </span>
  );
}

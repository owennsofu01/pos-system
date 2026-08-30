import { ReactNode } from "react";
import { BlueprintPanel } from "./BlueprintPanel";
import { cn } from "../../utils/cn";

export function Dialog({ children, width = 420, zIndex = 50 }: { children: ReactNode; width?: number; zIndex?: number }) {
  return (
    <div className="dialog-backdrop" style={{ zIndex }}>
      <BlueprintPanel className={cn("bg-bg shadow-lg p-8")} style={{ width, maxWidth: "100%" }}>
        {children}
      </BlueprintPanel>
    </div>
  );
}

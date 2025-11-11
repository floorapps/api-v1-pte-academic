import * as React from "react";
import { cn } from "@/lib/utils";

// Minimal checkbox that mirrors native input while matching the app's design system.
// No external dependency so it works out of the box.

type CheckboxProps = React.ComponentProps<"input"> & {
  label?: React.ReactNode;
};

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className={cn("group inline-flex items-center gap-2", className)}>
      <input
        type="checkbox"
        className={cn(
          "appearance-none size-4 rounded border border-input bg-background",
          "transition-colors outline-none",
          "checked:bg-primary checked:border-primary",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        )}
        {...props}
      />
      {label ? (
        <span className="text-sm text-foreground/90 group-data-[disabled=true]:opacity-50">
          {label}
        </span>
      ) : null}
    </label>
  );
}

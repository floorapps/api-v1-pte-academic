"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, Radix-free Tabs implementation compatible with shadcn/ui API.
 * Exports: Tabs, TabsList, TabsTrigger, TabsContent
 * - Controlled via `value` + `onValueChange`, or uncontrolled via `defaultValue`
 * - Adds proper ARIA roles and keyboard-focus styles
 */

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  idBase: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsCtx() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  id?: string;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, id, className, children, ...props },
  ref
) {
  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const isControlled = value !== undefined;
  const activeValue = isControlled ? (value as string) : internal;
  const idBase = id || "tabs";

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  const ctx = React.useMemo(
    () => ({ value: activeValue, setValue, idBase }),
    [activeValue, idBase, setValue]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function TabsList({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1",
        className
      )}
      {...props}
    />
  );
});

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, value, onClick, ...props }, ref) {
    const { value: active, setValue, idBase } = useTabsCtx();
    const selected = active === value;
    const tabId = `${idBase}-tab-${value}`;
    const panelId = `${idBase}-panel-${value}`;

    return (
      <Button
        ref={ref}
        role="tab"
        id={tabId}
        aria-selected={selected}
        data-state={selected ? "active" : "inactive"}
        aria-controls={panelId}
        type="button"
        className={cn(
          "ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          setValue(value);
        }}
        {...props}
      />
    );
  }
);

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, value, ...props }, ref) {
    const { value: active, idBase } = useTabsCtx();
    const selected = active === value;
    const panelId = `${idBase}-panel-${value}`;
    const tabId = `${idBase}-tab-${value}`;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        hidden={!selected}
        data-state={selected ? "active" : "inactive"}
        className={cn(
          "ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

export { Tabs, TabsList, TabsTrigger, TabsContent };

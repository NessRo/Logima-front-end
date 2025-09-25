// src/components/ui/tabs.jsx
import React, { createContext, useContext } from "react";

const TabsCtx = createContext(null);
const cn = (...c) => c.filter(Boolean).join(" ");

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsCtx.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div role="tablist" className={cn("inline-flex items-center gap-1", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const ctx = useContext(TabsCtx);
  const selected = ctx?.value === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx?.onValueChange?.(value)}
      className={cn(
        "px-3 py-1.5 text-xs rounded-md border border-white/10",
        selected ? "bg-white/10" : "bg-transparent hover:bg-white/5",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, forceMount, children, className }) {
  const ctx = useContext(TabsCtx);
  const selected = ctx?.value === value;
  if (!forceMount && !selected) return null;
  return <div className={cn(className)} hidden={!selected}>{children}</div>;
}

export default { Tabs, TabsList, TabsTrigger, TabsContent };

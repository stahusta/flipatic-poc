"use client";

import { Layers3, Type } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "preview", label: "Preview", icon: Type },
  { id: "scenario", label: "Scenario", icon: Layers3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SegmentedControl() {
  const [active, setActive] = useState<TabId>("preview");

  return (
    <div className="flex h-10 w-[214px] items-center rounded-lg bg-[var(--color-bg-disabled)] p-0">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium leading-5 transition-colors",
              isActive
                ? "shadow-button-secondary bg-[var(--color-bg-base)] text-[var(--color-fg-base)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-base)]",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

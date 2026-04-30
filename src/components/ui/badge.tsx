import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md border border-[var(--color-border-base)] bg-[var(--color-bg-base)] px-1.5 py-0.5",
        "text-[12px] font-medium leading-4 text-[var(--color-tag-neutral-text)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PillBadge({ children, className }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full border border-[var(--color-border-base)] bg-[var(--color-bg-base)] px-2 py-1",
        "text-[12px] font-medium leading-4 text-[var(--color-tag-neutral-text)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

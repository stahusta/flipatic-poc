import { cn } from "@/lib/utils";

type IconButtonProps = {
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "ghost" | "secondary";
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export function IconButton({
  children,
  size = "md",
  variant = "ghost",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors",
        size === "sm" && "size-7 p-1",
        size === "md" && "size-10 p-3",
        variant === "ghost" && "bg-transparent hover:bg-[var(--color-bg-disabled)]",
        variant === "secondary" &&
          "shadow-button-secondary bg-[var(--color-button-secondary)] hover:bg-[var(--color-bg-component)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

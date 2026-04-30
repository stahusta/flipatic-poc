import Image from "next/image";
import { cn } from "@/lib/utils";

type ThumbProps = {
  src: string;
  className?: string;
};

export function Thumb({ src, className }: ThumbProps) {
  return (
    <div
      className={cn(
        // NOTE: outside white stroke (`shadow-thumb`) lives on wrapping
        // components (SortableThumbV2, ThumbOverlayV2) — putting it here
        // would get clipped by the wrapper's overflow-hidden during
        // width transitions. Wrappers' own box-shadow is unaffected by
        // their own overflow-hidden, so it stays visible there.
        "relative size-10 shrink-0 overflow-hidden rounded-lg",
        // 1px inner contour painted on top of the image (rgba(9,9,11,0.1))
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:border after:border-[var(--color-image-border)] after:content-['']",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="pointer-events-none select-none object-cover"
        draggable={false}
      />
    </div>
  );
}

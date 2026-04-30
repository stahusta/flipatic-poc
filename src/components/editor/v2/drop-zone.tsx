"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  slideId: string;
  index: number;
  /** Whether the slide's thumbs are currently spread (hover or drag) — DZ
   *  takes 4px so it forms the visible gap between thumbnails. */
  spread?: boolean;
  /** This DZ is the current insertion target — render expanded gray
   *  placeholder. Driven by panel-level state (default = source position,
   *  updated on dragOver). Single placeholder follows the cursor. */
  isActiveTarget?: boolean;
  /** Force-collapse this DZ to width 0. Used to hide the redundant
   *  duplicate DZ next to the active thumb's source slot. */
  hidden?: boolean;
  /** True for one frame after a drop — disables width transition so the
   *  DZ snaps to its post-drop width instantly (the row may have shifted
   *  in DOM order, and animating widths from old to new would cause a
   *  visible drift of neighbouring thumbs). */
  justReleased?: boolean;
};

/**
 * Insertion drop zone — stable, indexed slot between thumbs.
 *
 * NOTE: this is the zero-animation baseline. All width/opacity transitions
 * have been removed intentionally — we'll add them back step by step.
 *
 * Drop = insertAt is read directly from `over.data.current.index` — no
 * left/right side math, no rect comparison. Each DZ has a single, stable
 * index that maps 1:1 to a position in the thumbnails array.
 */
export function DropZone({
  slideId,
  index,
  spread,
  isActiveTarget,
  hidden,
  justReleased,
}: DropZoneProps) {
  const { active } = useDndContext();
  const isThumbDrag = active?.data?.current?.type === "thumb";

  const { setNodeRef } = useDroppable({
    id: `dz-${slideId}-${index}`,
    data: { type: "dropzone", slideId, index },
    disabled: !isThumbDrag || hidden,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        // h-11 (44px) — tall enough to contain the placeholder's 2px
        // outside stroke top+bottom (40px + 2*2px = 44px visual).
        // flex-centering keeps the inner placeholder symmetrical at
        // every outer width: as DZ grows 4→48 the placeholder reveals
        // from the centre outward (no left-side wipe like padding
        // would produce).
        "h-11 shrink-0 overflow-hidden flex items-center justify-center",
        // Width animates over 300ms — placeholder glides between DZ slots
        // when the cursor moves, and DZ-y in a slide grow from 0 to their
        // gap/placeholder size when the cursor enters that slide during a
        // cross-slide drag. Disabled on the just-released frame so the
        // post-drop layout snaps instantly (no neighbour drift).
        "duration-300 ease-[var(--ease-out-soft)]",
        justReleased ? "transition-none" : "transition-[width]",
        // Force-hidden (redundant duplicate next to active thumb's source slot).
        hidden && "w-0",
        // Default: collapsed (thumbs overlap via -ml-4 in their wrapper).
        !hidden && !spread && "w-0",
        // Spread state (hover or any drag): 4px gap between thumbs.
        !hidden && spread && !isActiveTarget && "w-1",
        // Active target: 48px outer = 40px placeholder centred + 4px on
        // each side (matches the layout sum 4+40+4 around active).
        !hidden && isThumbDrag && isActiveTarget && "w-12",
      )}
    >
      {!hidden && (
        <div
          className={cn(
            // shadow-thumb gives the placeholder the SAME 2px white
            // outside stroke that thumbs have — so the gap between a
            // real thumb and a placeholder matches the gap between two
            // real thumbs (strokes meet across the 4px gap).
            "shadow-thumb size-10 rounded-lg border border-dashed",
            "border-[var(--color-border-base)] bg-[var(--color-bg-disabled)]",
            // scale-x synchronises with the outer's width transition:
            // inner visual width = 40 × scaleX, outer content width
            // grows 4 → 48. Both with origin-centre + same duration/ease,
            // so mid-transition the inner stays inside outer's bounds —
            // no "cropping" of the placeholder square as it appears.
            // Always rendered (not gated on isThumbDrag) so the scale
            // transition fires on isActiveTarget changes; idle state is
            // scale-x-0 opacity-0 → invisible.
            "origin-center duration-300 ease-[var(--ease-out-soft)]",
            justReleased ? "transition-none" : "transition-[transform,opacity]",
            isActiveTarget ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
          )}
        />
      )}
    </div>
  );
}

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { Thumb } from "../thumb";
import { cn } from "@/lib/utils";

type SortableThumbV2Props = {
  thumbId: string;
  slideId: string;
  src: string;
  /** True for one frame after a drop — disables the wrapper's width
   *  transition so layout snaps to its post-drop position instantly.
   *  The inner image still fades in via opacity. */
  justReleased?: boolean;
};

/**
 * V2 — stable drop-zone sortable thumb. Intentionally does NOT apply
 * dnd-kit's transform/transition: we don't want live-shift (neighbours
 * sliding aside as the active thumb moves), because that conflicts with
 * the drop-zone strategy where insertion is decided by indexed DZs that
 * grow/shrink in place. useSortable still gives us listeners, setNodeRef
 * and isDragging — the rest is ignored.
 *
 * Zero-animation baseline: width collapse and image hide are instant.
 * Animations will be added back step by step.
 */
export function SortableThumbV2({
  thumbId,
  slideId,
  src,
  justReleased,
}: SortableThumbV2Props) {
  const { setNodeRef, attributes, listeners, isDragging } = useSortable({
    id: thumbId,
    data: { type: "thumb", slideId, thumbId },
  });

  // Prevent parent SortableSlide listener from also activating
  const isolatedListeners = listeners
    ? Object.fromEntries(
        Object.entries(listeners).map(([key, handler]) => [
          key,
          (event: React.SyntheticEvent) => {
            event.stopPropagation();
            (handler as (e: React.SyntheticEvent) => void)(event);
          },
        ]),
      )
    : undefined;

  return (
    <div
      ref={setNodeRef}
      data-thumb-id={thumbId}
      className={cn(
        // shadow-thumb (2px white outside stroke) lives on this wrapper
        // — wrapper's OWN box-shadow is unaffected by its own
        // overflow-hidden, so the stroke stays visible while children
        // (the image) are clipped during width transitions.
        // flex-center keeps the inner image centred horizontally as
        // the wrapper width animates 40→0 → with scaleX origin-centre
        // on the inner, mid-transition the visual stays inside the
        // wrapper at every frame (no "image clipped from right" feel).
        "shadow-thumb relative w-10 shrink-0 overflow-hidden rounded-lg flex items-center justify-center",
        // PICKUP: width animates in sync with the drop-zone (same 300ms
        // / ease) so the active slot morphs into placeholder as one
        // continuous motion (sum 4+40+4 → 48+0+0 stays constant per
        // frame). DROP: transition is disabled — the row may have
        // re-ordered DOM nodes and animating widths would drift the
        // neighbours sideways. Layout snaps; image fades in via opacity.
        "duration-300 ease-[var(--ease-out-soft)]",
        justReleased ? "transition-none" : "transition-[width]",
        // Collapse the source slot to 0 while dragging.
        isDragging && "!w-0",
      )}
    >
      <div
        {...attributes}
        {...isolatedListeners}
        className={cn(
          "cursor-grab touch-none rounded-lg active:cursor-grabbing",
          // Inset focus ring (slide container has overflow-hidden so the
          // default outline would be clipped).
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-button-primary)] focus-visible:ring-inset",
          // PICKUP: scale-x collapses the image symmetrically to a vertical
          //   line at the centre (origin-center) while opacity fades it out
          //   — no "clip from right" feel of pure width-shrink.
          // DROP: justReleased disables the transform transition so scale
          //   jumps back to 1 instantly — the only animation on release is
          //   the opacity fade-in of the image at its settled position.
          "origin-center duration-300 ease-[var(--ease-out-soft)]",
          justReleased
            ? "transition-[opacity]"
            : "transition-[transform,opacity]",
          isDragging && "scale-x-0 opacity-0",
        )}
      >
        <Thumb src={src} />
      </div>
    </div>
  );
}

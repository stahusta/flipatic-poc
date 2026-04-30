"use client";

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal } from "lucide-react";
import { Fragment } from "react";
import type { Slide } from "@/types/editor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Thumb } from "../thumb";
import { DropZone } from "./drop-zone";
import { SortableThumbV2 } from "./sortable-thumb-v2";

type VideoLayerItemV2Props = {
  slide: Slide;
  index: number;
  isHovered?: boolean;
  /** This whole slide is being dragged (live-shift placeholder) */
  isSlideGhost?: boolean;
  /** A thumb is being dragged from this slide → filter it out of rendering
   *  (a single drop placeholder shows in its place via activeTargetIdx). */
  isThumbDragSource?: boolean;
  /** Index of the active thumb in THIS slide (only when this is source),
   *  otherwise -1. Used to filter out the active thumb from rendering. */
  activeThumbIdxInSlide?: number;
  /** Index of the DZ in THIS slide that is the current insertion target
   *  (driven by panel state). -1 means no DZ is the target in this slide. */
  activeTargetIdx?: number;
  /** True for one frame after a drop — disables width/margin transitions
   *  so layout snaps instantly while opacity still fades the thumb in. */
  justReleased?: boolean;
  isInOverlay?: boolean;
};

export function VideoLayerItemV2({
  slide,
  index,
  isHovered,
  isSlideGhost,
  isThumbDragSource,
  activeThumbIdxInSlide = -1,
  activeTargetIdx = -1,
  justReleased,
  isInOverlay,
}: VideoLayerItemV2Props) {
  // The active thumb stays mounted (with size-0) so dnd-kit keeps its
  // useSortable subscription alive. The DZ at activeThumbIdxInSlide is the
  // default insertion target → it renders the gray placeholder right where
  // the picked thumb was. The DZ at activeThumbIdxInSlide+1 is hidden
  // (it's the redundant duplicate of the same insertion gap).
  const dzHidden = (idx: number) =>
    activeThumbIdxInSlide >= 0 && idx === activeThumbIdxInSlide + 1;
  // Spread thumbs (no overlap) only when this specific slide is "engaged":
  //   - hovered (pre-drag),
  //   - this is the active drag's source slide (so the placeholder at the
  //     picked thumb's slot is visible),
  //   - this slide is the current drop target (cursor over one of its DZs).
  // Other slides stay collapsed during a drag — they only spread once the
  // user moves the cursor over them.
  const spreadThumbs =
    isHovered || isInOverlay || isThumbDragSource || activeTargetIdx >= 0;
  // More button (⋯) appears only when the user is meaningfully focused on a
  // specific slide — NOT in every destination during a thumb drag.
  const showMore = isHovered || isInOverlay || isThumbDragSource;

  const showInteractiveBorder = isHovered || isInOverlay;

  return (
    <div className="relative w-full">
      <div
        data-node-id={slide.id}
        className={cn(
          "flex w-full items-center overflow-hidden rounded-lg border bg-[var(--color-bg-base)] transition-colors",
          showInteractiveBorder
            ? "border-[var(--color-button-primary)]"
            : "border-[var(--color-border-base)]",
          // Active slide → render as a clean gray placeholder
          isSlideGhost &&
            "border-dashed bg-[var(--color-bg-disabled)] [&_*]:!invisible",
        )}
      >
        {/* Content (title + badges) */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 self-stretch py-3 pl-3">
          <div className="flex w-full items-start gap-1.5 text-[14px] leading-5 text-[var(--color-fg-base)]">
            <span className="shrink-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
              {index + 1}.
            </span>
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-normal">
              {slide.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{slide.duration}</Badge>
            {slide.hasQuote && <Badge>Quote</Badge>}
          </div>
        </div>

        {/* Image stack + ellipsis */}
        <div className="flex shrink-0 items-center self-stretch">
          <div className="drop-shadow-fade-left flex h-full items-center bg-[var(--color-bg-base)] pr-3">
            <SortableContext
              items={slide.thumbnails.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="relative flex isolate items-center">
                {/* DropZone before the very first thumb */}
                <DropZone
                  slideId={slide.id}
                  index={0}
                  spread={spreadThumbs}
                  isActiveTarget={activeTargetIdx === 0}
                  hidden={dzHidden(0)}
                  justReleased={justReleased}
                />
                {slide.thumbnails.map((t, i) => (
                  <Fragment key={t.id}>
                    <div
                      className={cn(
                        // Hover spread: thumbs glide apart from their
                        // -ml-4 overlap to a 4px DZ gap (and back) over
                        // 500ms. On the just-released frame skip the
                        // transition so any spread-state flip caused by
                        // the cursor briefly leaving the slide doesn't
                        // re-run a hover-style wave right after drop.
                        "relative shrink-0 duration-500 ease-[var(--ease-out-soft)]",
                        justReleased ? "transition-none" : "transition-[margin]",
                        !spreadThumbs && i > 0 && "-ml-4",
                      )}
                      style={{ zIndex: slide.thumbnails.length - i }}
                    >
                      <SortableThumbV2
                        thumbId={t.id}
                        slideId={slide.id}
                        src={t.src}
                        justReleased={justReleased}
                      />
                    </div>
                    {/* DropZone after each thumb (idx i+1) — kept mounted
                        with hidden=true (rather than unmounted) when
                        redundant, so the row collapses smoothly instead of
                        snapping by 4px on pickup. */}
                    <DropZone
                      slideId={slide.id}
                      index={i + 1}
                      spread={spreadThumbs}
                      isActiveTarget={activeTargetIdx === i + 1}
                      hidden={dzHidden(i + 1)}
                      justReleased={justReleased}
                    />
                  </Fragment>
                ))}
              </div>
            </SortableContext>

            <button
              type="button"
              aria-label="More options"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex h-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-disabled)]",
                "transition-[width,margin-left,opacity] duration-500 ease-[var(--ease-out-soft)]",
                showMore
                  ? "ml-3 w-7 opacity-100"
                  : "pointer-events-none ml-0 w-0 opacity-0",
              )}
            >
              <MoreHorizontal className="size-4 shrink-0" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** DragOverlay renderer for V2 (clean thumb with lift shadow + 2px white
 *  outside stroke; stroke lives on this wrapper since Thumb itself no
 *  longer carries it — see thumb.tsx for the rationale). */
export function ThumbOverlayV2({ src }: { src: string }) {
  return (
    <div className="shadow-thumb-drag-lift rounded-lg">
      <Thumb src={src} />
    </div>
  );
}

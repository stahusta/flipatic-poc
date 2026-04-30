"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  pointerWithin,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_SLIDES } from "@/data/slides";
import { MAX_THUMBS_PER_SLIDE, type Slide } from "@/types/editor";
import { PillBadge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { SortableSlideV2 } from "./sortable-slide-v2";
import { ThumbOverlayV2, VideoLayerItemV2 } from "./video-layer-item-v2";

type ActiveDrag =
  | { type: "slide"; slideId: string }
  | { type: "thumb"; thumbId: string; sourceSlideId: string }
  | null;

function findSlideContainingThumb(slides: Slide[], thumbId: string) {
  return slides.find((s) => s.thumbnails.some((t) => t.id === thumbId));
}

function isSlideId(slides: Slide[], id: string) {
  return slides.some((s) => s.id === id);
}

/**
 * V2 — single drop-placeholder pattern. The active thumb is filtered out of
 * the source slide on pickup (no ghost). One stable indexed drop zone is
 * the current insertion target — by default the source position, updated on
 * dragOver as the user moves the cursor. That ONE DZ renders as a gray
 * dashed placeholder; all others stay invisible. Drop = splice into the
 * target slide at the target DZ's index.
 */
export function SlidesPanelV2({ className }: { className?: string }) {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [active, setActive] = useState<ActiveDrag>(null);
  // Single insertion target. On drag start = source position (so the gray
  // placeholder appears right where the picked thumb was). On drag over a
  // DZ = that DZ. There's only ever one target → only one placeholder.
  const [activeTarget, setActiveTarget] = useState<{
    slideId: string;
    index: number;
  } | null>(null);
  // True for ~50ms right after a drop. Disables width/margin transitions
  // in children so the row snaps to its post-drop layout instantly —
  // the only animation on drop is the released thumb's opacity fade-in.
  // 50ms (3 frames) covers dnd-kit's internal state reset which happens
  // ASYNCHRONOUSLY after handleDragEnd returns: useSortable's isDragging
  // can flip true→false a frame later than our `active` state, and if
  // justReleased was already false by then, the width transition would
  // fire on the wrapper as it reverts from !w-0 to w-10.
  const [justReleased, setJustReleased] = useState(false);
  useEffect(() => {
    if (!justReleased) return;
    const id = window.setTimeout(() => setJustReleased(false), 50);
    return () => window.clearTimeout(id);
  }, [justReleased]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const lastOverIdRef = useRef<string | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  /** Read live cursor side relative to a thumb DOM element */
  function sideOf(thumbId: string): "before" | "after" {
    const el = document.querySelector(`[data-thumb-id="${thumbId}"]`);
    if (!el) return "before";
    const r = el.getBoundingClientRect();
    return pointerRef.current.x > r.left + r.width / 2 ? "after" : "before";
  }

  // V2 thumb collision = stable drop-zones approach.
  //   Slide drag         → match slide containers
  //   Thumb drag         →
  //     1) find slide under cursor (pointerWithin)
  //     2) within that slide, pick the closest DROP ZONE (not thumb!)
  //        — DZs are positioned exactly between thumbs, each carries a
  //          stable `index` in its data → drop = arr.splice(idx, 0, active)
  //        — no side detection, no rect math, no SortableContext bias
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (active?.type === "slide") {
        // Don't filter out the active slide — a user dragging slide 3 must
        // be able to drop it back at position 3 (same as we allow for
        // thumbs). dnd-kit handles over=active naturally → no-op reorder.
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (c) => c.data.current?.type === "slide",
          ),
        });
      }

      const slideContainers = args.droppableContainers.filter(
        (c) => c.data.current?.type === "slide",
      );
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const pointerOverride = {
        pointerCoordinates: { x: px, y: py },
        collisionRect: {
          width: 0,
          height: 0,
          top: py,
          bottom: py,
          left: px,
          right: px,
        },
      };

      const slideHit =
        pointerWithin({
          ...args,
          ...pointerOverride,
          droppableContainers: slideContainers,
        })[0]?.id ??
        rectIntersection({
          ...args,
          ...pointerOverride,
          droppableContainers: slideContainers,
        })[0]?.id;

      if (!slideHit) {
        return lastOverIdRef.current
          ? [{ id: lastOverIdRef.current, data: { droppableContainer: {} } }]
          : [];
      }

      // Block cross-container drag into full destination
      if (
        active?.type === "thumb" &&
        active.sourceSlideId !== String(slideHit)
      ) {
        const dest = slides.find((s) => s.id === String(slideHit));
        if (dest && dest.thumbnails.length >= MAX_THUMBS_PER_SLIDE) {
          return lastOverIdRef.current
            ? [{ id: lastOverIdRef.current, data: { droppableContainer: {} } }]
            : [];
        }
      }

      // Closest DROP ZONE in the matched slide
      const dzInSlide = args.droppableContainers.filter(
        (c) =>
          c.data.current?.type === "dropzone" &&
          c.data.current?.slideId === slideHit,
      );

      if (dzInSlide.length > 0) {
        const dzHit = closestCenter({
          ...args,
          ...pointerOverride,
          droppableContainers: dzInSlide,
        });
        if (dzHit.length > 0) {
          lastOverIdRef.current = String(dzHit[0].id);
          return dzHit;
        }
      }

      // Fallback (shouldn't happen — every slide has DZs) → slide itself
      lastOverIdRef.current = String(slideHit);
      return [{ id: slideHit, data: { droppableContainer: {} } }];
    },
    [active, slides],
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { type: "slide"; slideId: string }
      | { type: "thumb"; slideId: string; thumbId: string }
      | undefined;
    if (!data) return;
    if (data.type === "slide") {
      setActive({ type: "slide", slideId: data.slideId });
    } else {
      setActive({
        type: "thumb",
        thumbId: data.thumbId,
        sourceSlideId: data.slideId,
      });
      // Default insertion target = source position. After we filter the
      // active thumb out of the source slide, DZ idx = original idx points
      // to the same gap (between the surrounding thumbs).
      const sourceSlide = slides.find((s) => s.id === data.slideId);
      const sourceIdx =
        sourceSlide?.thumbnails.findIndex((t) => t.id === data.thumbId) ?? -1;
      if (sourceSlide && sourceIdx >= 0) {
        setActiveTarget({ slideId: sourceSlide.id, index: sourceIdx });
      }
    }
    lastOverIdRef.current = null;
  }

  /**
   * V2 thumb logic — drop-zone driven.
   *
   * No state mutation here at all. Drop zones provide stable, indexed
   * insertion points; the actual move is committed in handleDragEnd by
   * splicing into destination at `over.data.current.index`. During drag
   * dnd-kit's sortable strategy still animates same-container reorder
   * visually (transforms), and the active thumb stays as a placeholder in
   * its original slot of the source slide.
   */
  function handleDragOver(event: DragOverEvent) {
    // Track which DZ is currently under cursor → it becomes the single
    // active target (= the one DZ that renders the gray placeholder).
    // dnd-kit's `over` is biased by SortableContext, so prefer
    // collisions[0] (set by our custom collision detection above).
    const dzData = event.collisions?.[0]?.data?.droppableContainer?.data
      ?.current as
      | { type: "dropzone"; slideId: string; index: number }
      | undefined;
    if (dzData?.type === "dropzone") {
      setActiveTarget((prev) =>
        prev?.slideId === dzData.slideId && prev.index === dzData.index
          ? prev
          : { slideId: dzData.slideId, index: dzData.index },
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const winnerId = event.collisions?.[0]?.id ?? event.over?.id ?? null;

    if (active?.type === "slide" && winnerId) {
      const overContainer = isSlideId(slides, String(winnerId))
        ? String(winnerId)
        : findSlideContainingThumb(slides, String(winnerId))?.id;
      if (overContainer) {
        const fromIdx = slides.findIndex((s) => s.id === active.slideId);
        const toIdx = slides.findIndex((s) => s.id === overContainer);
        // Allow same-position drop (drop slide 3 back at position 3) —
        // just skip the state update since arrayMove(x, i, i) is a no-op.
        if (fromIdx !== toIdx) {
          setSlides((prev) => arrayMove(prev, fromIdx, toIdx));
        }
      }
    }

    if (active?.type === "thumb" && activeTarget) {
      // The single source of truth: panel-level activeTarget (= the DZ the
      // user last hovered, or source position by default). DZ indices in
      // the source slide are in the FILTERED axis (active thumb removed),
      // so insert = without.splice(index, 0, thumb) — no adjustments.
      const destSlideId = activeTarget.slideId;
      const destIndex = activeTarget.index;
      const sourceSlideId = active.sourceSlideId;
      const thumbId = active.thumbId;

      setSlides((prev) => {
        const sourceIdx = prev.findIndex((s) => s.id === sourceSlideId);
        const destIdx = prev.findIndex((s) => s.id === destSlideId);
        if (sourceIdx === -1 || destIdx === -1) return prev;

        const activeThumb = prev[sourceIdx].thumbnails.find(
          (t) => t.id === thumbId,
        );
        if (!activeThumb) return prev;

        // Same-slide reorder. DZ indices are in the FULL (unfiltered) axis,
        // so when the dest is to the right of the active's source position,
        // the splice index shifts down by 1 (the active is removed first).
        if (sourceSlideId === destSlideId) {
          const fromIdx = prev[sourceIdx].thumbnails.findIndex(
            (t) => t.id === thumbId,
          );
          const adjustedDestIdx =
            destIndex > fromIdx ? destIndex - 1 : destIndex;
          if (adjustedDestIdx === fromIdx) return prev;
          const without = prev[sourceIdx].thumbnails.filter(
            (t) => t.id !== thumbId,
          );
          const reordered = [
            ...without.slice(0, adjustedDestIdx),
            activeThumb,
            ...without.slice(adjustedDestIdx),
          ];
          return prev.map((s, i) =>
            i === sourceIdx ? { ...s, thumbnails: reordered } : s,
          );
        }

        // Cross-slide. Destination DZ idx is in the destination's full
        // (unfiltered) axis — splice straight into dest.thumbnails.
        const dest = prev[destIdx];
        if (dest.thumbnails.length >= MAX_THUMBS_PER_SLIDE) return prev;

        return prev.map((s) => {
          if (s.id === sourceSlideId) {
            return {
              ...s,
              thumbnails: s.thumbnails.filter((t) => t.id !== thumbId),
            };
          }
          if (s.id === destSlideId) {
            return {
              ...s,
              thumbnails: [
                ...s.thumbnails.slice(0, destIndex),
                activeThumb,
                ...s.thumbnails.slice(destIndex),
              ],
            };
          }
          return s;
        });
      });
    }

    setActive(null);
    setActiveTarget(null);
    setJustReleased(true);
    lastOverIdRef.current = null;
  }

  function handleDragCancel() {
    setActive(null);
    setActiveTarget(null);
    setJustReleased(true);
    lastOverIdRef.current = null;
  }

  // ---- Active overlay payload ------------------------------------------

  const activeSlide =
    active?.type === "slide"
      ? slides.find((s) => s.id === active.slideId)
      : undefined;
  const activeSlideIdx =
    active?.type === "slide"
      ? slides.findIndex((s) => s.id === active.slideId)
      : -1;
  const activeThumbSrc = (() => {
    if (active?.type !== "thumb") return null;
    // Active thumb may have been moved to a new slide during drag (cross-
    // container live shift) — search the whole tree, not just sourceSlideId.
    for (const slide of slides) {
      const found = slide.thumbnails.find((t) => t.id === active.thumbId);
      if (found) return found.src;
    }
    return null;
  })();

  // Reactive "home slide" of the active thumb — kept in sync with state since
  // cross-container moves can change it mid-drag.
  const currentThumbHomeSlideId =
    active?.type === "thumb"
      ? slides.find((s) =>
          s.thumbnails.some((t) => t.id === active.thumbId),
        )?.id ?? null
      : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <aside
        className={cn(
          "flex h-full w-[378px] shrink-0 flex-col p-6",
          className,
        )}
      >
        <div className="shadow-card flex w-[330px] min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-[var(--color-bg-component)]">
          <div className="flex w-full shrink-0 items-center gap-4 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h2 className="text-[16px] font-semibold leading-6 text-[var(--color-fg-base)]">
                Slides
              </h2>
              <PillBadge>{slides.length}</PillBadge>
            </div>
            <IconButton size="sm" variant="secondary" aria-label="Add slide">
              <Plus className="size-4" strokeWidth={1.75} />
            </IconButton>
          </div>

          <div className="flex w-full flex-col gap-1 overflow-y-auto px-1 pb-1">
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {slides.map((slide, index) => (
                <SortableSlideV2
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isAnyDragActive={!!active}
                  isThumbDragSource={currentThumbHomeSlideId === slide.id}
                  activeThumbIdxInSlide={
                    active?.type === "thumb" &&
                    currentThumbHomeSlideId === slide.id
                      ? slide.thumbnails.findIndex(
                          (t) => t.id === active.thumbId,
                        )
                      : -1
                  }
                  activeTargetIdx={
                    activeTarget?.slideId === slide.id
                      ? activeTarget.index
                      : -1
                  }
                  justReleased={justReleased}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </aside>

      <DragOverlay dropAnimation={null}>
        {active?.type === "slide" && activeSlide && (
          <div className="shadow-drag-lift w-[322px] rounded-lg">
            <VideoLayerItemV2
              slide={activeSlide}
              index={activeSlideIdx}
              isInOverlay
            />
          </div>
        )}
        {active?.type === "thumb" && activeThumbSrc && (
          <ThumbOverlayV2 src={activeThumbSrc} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

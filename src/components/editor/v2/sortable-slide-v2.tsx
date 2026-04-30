"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Slide } from "@/types/editor";
import { VideoLayerItemV2 } from "./video-layer-item-v2";

type SortableSlideV2Props = {
  slide: Slide;
  index: number;
  isAnyDragActive?: boolean;
  /** True while a thumb is being dragged from this very slide */
  isThumbDragSource?: boolean;
  /** Index of active thumb if it lives in this slide (-1 otherwise) */
  activeThumbIdxInSlide?: number;
  /** Index of currently-targeted DZ in this slide (-1 if not this slide) */
  activeTargetIdx?: number;
  /** True for one frame after a drop — disables width/margin transitions
   *  so the row snaps to its post-drop layout instantly while only the
   *  released thumb's image fades in via opacity. */
  justReleased?: boolean;
};

export function SortableSlideV2({
  slide,
  index,
  isAnyDragActive,
  isThumbDragSource,
  activeThumbIdxInSlide,
  activeTargetIdx,
  justReleased,
}: SortableSlideV2Props) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: slide.id,
    data: { type: "slide", slideId: slide.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none active:cursor-grabbing focus:outline-none"
    >
      <VideoLayerItemV2
        slide={slide}
        index={index}
        isHovered={isHovered && !isAnyDragActive}
        isSlideGhost={isDragging}
        isThumbDragSource={isThumbDragSource}
        activeThumbIdxInSlide={activeThumbIdxInSlide}
        activeTargetIdx={activeTargetIdx}
        justReleased={justReleased}
      />
    </div>
  );
}

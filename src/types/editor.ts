export const MAX_THUMBS_PER_SLIDE = 5;

export type Thumbnail = {
  id: string;
  src: string;
};

export type Slide = {
  id: string;
  title: string;
  duration: string;
  hasQuote: boolean;
  thumbnails: Thumbnail[];
};

export type DragData =
  | { type: "slide"; slideId: string }
  | { type: "thumb"; slideId: string; thumbId: string };

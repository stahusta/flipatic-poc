import {
  ArrowLeft,
  Clapperboard,
  SearchCheck,
  Settings,
  Video,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function Navbar() {
  return (
    <header className="flex w-full items-center gap-5 border-b border-[var(--color-border-base)] bg-[var(--color-bg-base)] px-6 py-4">
      {/* Left: back + breadcrumb */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <IconButton size="sm" aria-label="Back">
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </IconButton>

        {/* Vertical separator */}
        <div className="flex w-2 items-center">
          <div className="h-4 w-px bg-[var(--color-border-base)]" />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Video className="size-4 text-[var(--color-fg-muted)]" strokeWidth={1.75} />
            <span className="text-[14px] font-medium leading-5 text-[var(--color-fg-muted)]">
              Video
            </span>
          </div>
          <span className="text-[14px] font-medium leading-5 text-[var(--color-fg-muted)]">
            /
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium leading-5 text-[var(--color-fg-base)]">
              Berlin&rsquo;s top attractions: Reichstag i only the start
            </span>
            {/* Status dot */}
            <div className="size-2.5 rounded-[2px] border border-black/10 bg-[var(--color-tag-neutral-icon)]" />
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <IconButton aria-label="Search">
            <SearchCheck className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton aria-label="Storyboard">
            <Clapperboard className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton aria-label="Settings">
            <Settings className="size-4" strokeWidth={1.75} />
          </IconButton>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="shadow-button-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-button-secondary)] px-4 py-2 text-[14px] font-medium leading-5 text-[var(--color-fg-base)] transition-colors hover:bg-[var(--color-bg-component)]"
          >
            Save draft
          </button>
          <button
            type="button"
            className="shadow-button-primary shadow-button-primary-inner relative inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-button-primary)] px-4 py-2 text-[14px] font-medium leading-5 text-[var(--color-fg-on-color)] transition-colors hover:brightness-110"
          >
            Export Video
          </button>
        </div>
      </div>
    </header>
  );
}

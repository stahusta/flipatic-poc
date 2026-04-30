import { Maximize, Play } from "lucide-react";
import Image from "next/image";
import { SegmentedControl } from "./segmented-control";

export function PreviewPanel() {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center">
      {/* Pagination row with segmented control */}
      <div className="flex w-full shrink-0 items-center justify-center pt-6">
        <SegmentedControl />
      </div>

      {/* Preview area */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 py-6 w-full">
        <div
          className="relative flex h-full max-h-full w-auto flex-col items-start justify-between overflow-hidden rounded-xl border border-[var(--color-image-border)] shadow-card"
          style={{
            aspectRatio: "9 / 16",
            maxWidth: "100%",
            containerType: "inline-size",
          }}
        >
          {/* Background image */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <Image
              src="/figma-assets/hero.png"
              alt="Brandenburg Gate"
              fill
              priority
              sizes="(max-width: 1024px) 60vw, 504px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[39%] to-black/70" />
          </div>

          {/* CNN logo */}
          <div className="relative z-10 m-6">
            <Image
              src="/figma-assets/cnn-logo.svg"
              alt="CNN"
              width={87}
              height={41}
              className="h-auto w-[87px]"
            />
          </div>

          {/* Title (positioned above the player) */}
          <h1
            className="relative z-10 mx-[24px] mb-[120px] font-semibold text-white"
            style={{ fontSize: "9.79cqw", lineHeight: "1" }}
          >
            Berlin&rsquo;s top attractions: Reichstag is only the start
          </h1>

          {/* Player overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end overflow-hidden bg-gradient-to-b from-transparent via-black/30 via-[52%] to-black/70 h-[110px]">
            <div className="flex w-full items-center gap-3 p-3">
              {/* Play button */}
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-lg bg-transparent p-1 text-white hover:bg-white/10"
                aria-label="Play"
              >
                <Play className="size-4 fill-white" strokeWidth={0} />
              </button>

              {/* Time */}
              <div className="flex shrink-0 items-center gap-1 text-[14px] leading-5">
                <span className="text-white">0:00</span>
                <span className="text-white/70">/</span>
                <span className="text-white/70">1:23</span>
              </div>

              {/* Timeline */}
              <div className="relative flex min-w-0 flex-1 items-center">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/70">
                  <div className="absolute left-0 top-0 h-1 rounded-full bg-white" style={{ width: "30%" }} />
                </div>
                {/* Thumb */}
                <div
                  className="absolute size-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-white shadow-md"
                  style={{ left: "30%" }}
                />
              </div>

              {/* Fullscreen */}
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-lg bg-transparent p-1 text-white hover:bg-white/10"
                aria-label="Fullscreen"
              >
                <Maximize className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

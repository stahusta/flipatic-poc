import { Navbar } from "@/components/editor/navbar";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { SlidesPanelV2 } from "@/components/editor/v2/slides-panel-v2";

export default function EditorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-surface)]">
      <Navbar />
      <div className="flex h-[calc(100vh-72px)] min-h-0 w-full items-stretch">
        <SlidesPanelV2 />
        <PreviewPanel />
      </div>
    </div>
  );
}

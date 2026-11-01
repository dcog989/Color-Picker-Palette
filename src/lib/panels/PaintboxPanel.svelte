<script lang="ts">
import CircleX from "@lucide/svelte/icons/circle-x";
import PaintboxGrid from "../components/PaintboxGrid.svelte";
import { PALETTE_FILE } from "../constants";
import { getApp } from "../context";
import type { PaintboxSortMode } from "../stores/paintbox.svelte";
import { parsePaletteFile } from "../utils/import-strategies";
import { exportVisual } from "../utils/strategies";

interface Props {
  onExport: () => void;
}

let { onExport }: Props = $props();

const app = getApp();
const { paintbox, toast } = app;

let fileInput = $state<HTMLInputElement | null>(null);
let exporting = $state<"png" | "svg" | "pdf" | null>(null);

const handleImport = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  if (file.size > PALETTE_FILE.MAX_SIZE) {
    toast.show(`Palette file too large (max ${PALETTE_FILE.MAX_SIZE / (1024 * 1024)}MB)`);
    return;
  }

  try {
    const colors = parsePaletteFile(file.name, await file.text());
    colors.forEach((css) => {
      paintbox.add(css);
    });
    const noun = colors.length === 1 ? "color" : "colors";
    const capped = colors.length > paintbox.items.length;
    toast.show(
      capped
        ? `Imported ${colors.length} ${noun}; paintbox keeps the newest ${paintbox.items.length}`
        : `Imported ${colors.length} ${noun}`,
    );
  } catch (err) {
    toast.show(err instanceof Error ? err.message : "Failed to import palette");
  }
};

const runVisualExport = async (kind: "png" | "svg" | "pdf") => {
  exporting = kind;
  try {
    await exportVisual(app, kind);
  } catch (err) {
    toast.show(err instanceof Error ? err.message : "Export failed");
  } finally {
    exporting = null;
  }
};

const sortOptions: { label: string; value: PaintboxSortMode }[] = [
  { label: "New First", value: "newest" },
  { label: "New Last", value: "oldest" },
  { label: "Hue", value: "hue" },
  { label: "Bright", value: "lightness" },
  { label: "Vivid", value: "chroma" },
];
</script>

<section
  class="
      panel flex flex-col
    "
>
  <div class="space-y-6">
    <div
      class="
              flex flex-col items-start justify-between gap-4
              sm:flex-row sm:items-center
            "
    >
      <h2 class="section-heading shrink-0">Paintbox</h2>

      <div
        class="
                  flex w-full flex-wrap items-center gap-2
                  sm:w-auto
                "
      >
        <select
          id="paintboxSort"
          bind:value={paintbox.sortMode}
          aria-label="Sort paintbox by"
          class="select-control flex-1 sm:flex-none"
        >
          {#each sortOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>

        <button
          type="button"
          onclick={() => paintbox.clear()}
          disabled={paintbox.items.length === 0}
          class="icon-button hover:bg-red-500 hover:text-white"
          title="Clear Paintbox"
        >
          <CircleX class="size-4" />
        </button>
      </div>
    </div>

    <PaintboxGrid />
  </div>

  <!-- Export Options -->
  <div class="mt-8 space-y-3">
    <h3 class="section-heading">Export</h3>
    <div class="grid grid-cols-4 gap-3">
      <button type="button" onclick={() => runVisualExport("png")} disabled={exporting !== null} class="action-button">
        {exporting === "png" ? "..." : "PNG"}
      </button>
      <button type="button" onclick={() => runVisualExport("svg")} disabled={exporting !== null} class="action-button">
        {exporting === "svg" ? "..." : "SVG"}
      </button>
      <button type="button" onclick={() => runVisualExport("pdf")} disabled={exporting !== null} class="action-button">
        {exporting === "pdf" ? "..." : "PDF"}
      </button>
      <button type="button" onclick={onExport} class="action-button">Code...</button>
    </div>
  </div>

  <!-- Import Options -->
  <div class="mt-4 space-y-3">
    <h3 class="section-heading">Import</h3>
    <input bind:this={fileInput} type="file" accept={PALETTE_FILE.ACCEPT} class="hidden" onchange={handleImport}>
    <button type="button" onclick={() => fileInput?.click()} class="action-button">DTCG JSON / GIMP GPL</button>
  </div>
</section>

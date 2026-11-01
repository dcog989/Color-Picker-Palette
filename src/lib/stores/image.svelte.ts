import { IMAGE_ANALYSIS } from "../constants";
import { orderPalette, type PaletteEntry, type PaletteSortMode } from "../utils/image-palette";
import { validateImageFile } from "../utils/validate-image";
import { ManagedWorker } from "../utils/worker-manager";
import ColorAnalysisWorker from "../workers/color-analysis.ts?worker";

export type SortMode = PaletteSortMode;

type ImageWorkerMessage = {
  clusters: { color: string; pixels: number }[];
};

export class ImageStore {
  mosaicData = $state<PaletteEntry[]>([]);

  sortMode = $state<SortMode>("dominant");
  isProcessing = $state(false);
  previewUrl = $state<string>("");
  currentFile = $state<File | null>(null);

  analysisError = $state<string | null>(null);

  #managedWorker = new ManagedWorker<ImageWorkerMessage>();
  #generation = 0;

  extractedPalette = $derived(orderPalette(this.mosaicData, this.sortMode));

  async analyze(file: File) {
    validateImageFile(file);

    const generation = ++this.#generation;

    this.#managedWorker.terminate();

    this.isProcessing = true;
    this.analysisError = null;
    this.currentFile = file;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(file);

    try {
      const bitmap = await createImageBitmap(file);

      if (generation !== this.#generation) {
        bitmap.close();
        return;
      }

      const width = IMAGE_ANALYSIS.DOWNSAMPLE_SIZE;
      const height = IMAGE_ANALYSIS.DOWNSAMPLE_SIZE;

      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        this.isProcessing = false;
        return;
      }

      ctx.drawImage(bitmap, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);

      bitmap.close();

      this.#managedWorker.init(
        () => new ColorAnalysisWorker(),
        {
          onMessage: (data) => {
            if (generation !== this.#generation) return;
            this.mosaicData = data.clusters;
            this.isProcessing = false;
            this.#managedWorker.terminate();
          },
          onError: () => {
            if (generation !== this.#generation) return;
            this.isProcessing = false;
            this.analysisError = "Image analysis failed. Reload the page and try again.";
          },
        },
        "Image analysis worker",
      );

      this.#managedWorker.post({ imageData, distance: 0.05 }, [imageData.data.buffer]);
    } catch (error) {
      console.error("Image analysis error:", error);
      if (generation === this.#generation) {
        this.isProcessing = false;
        this.#managedWorker.terminate();
      }
      throw error;
    }
  }

  clear() {
    this.#generation++;
    this.isProcessing = false;
    this.analysisError = null;
    this.mosaicData = [];
    this.currentFile = null;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = "";
    }
    this.#managedWorker.terminate();
  }

  destroy() {
    this.clear();
    this.#managedWorker.destroy();
  }
}

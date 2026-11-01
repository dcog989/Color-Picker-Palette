import { rgbToHex } from "@colordx/core/fn";
import { extractColorClusters } from "../utils/color-clusters";

interface WorkerMessage {
  imageData: ImageData;
  distance: number;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const clusters = extractColorClusters(e.data.imageData.data, e.data.distance);

  self.postMessage({
    clusters: clusters.map((c) => ({
      color: rgbToHex({ r: c.r, g: c.g, b: c.b, alpha: 1 }),
      pixels: c.pixels,
    })),
  });
};

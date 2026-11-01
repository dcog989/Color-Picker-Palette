import { describe, expect, it } from "vitest";
import { extractColorClusters } from "./color-clusters";

const pixels = (rows: number[][]) => Uint8ClampedArray.from(rows.flat());

describe("extractColorClusters", () => {
  it("groups identical pixels and sorts by count", () => {
    const data = pixels([
      [255, 0, 0, 255],
      [255, 0, 0, 255],
      [0, 0, 255, 255],
    ]);

    const clusters = extractColorClusters(data, 0.05);

    expect(clusters).toHaveLength(2);
    expect(clusters[0]).toMatchObject({ r: 255, g: 0, b: 0, pixels: 2 });
    expect(clusters[1]).toMatchObject({ r: 0, g: 0, b: 255, pixels: 1 });
  });

  it("ignores transparent pixels", () => {
    expect(extractColorClusters(pixels([[255, 0, 0, 0]]), 0.05)).toEqual([]);
  });

  it("merges nearby colors and averages them by weight", () => {
    const data = pixels([
      [230, 0, 0, 255],
      [250, 0, 0, 255],
    ]);

    expect(extractColorClusters(data, 0)).toHaveLength(2);
    expect(extractColorClusters(data, 0.05)).toEqual([{ r: 240, g: 0, b: 0, pixels: 2 }]);
  });

  it("ignores trailing bytes that do not form a pixel", () => {
    expect(extractColorClusters(Uint8ClampedArray.from([1, 2, 3]), 0.05)).toEqual([]);
  });
});

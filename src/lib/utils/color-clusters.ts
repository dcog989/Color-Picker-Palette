const BIN_COUNT = 4096;
const MAX_CANDIDATES = 400;
const MAX_CLUSTERS = 64;
const MIN_ALPHA = 125;
const DISTANCE_SCALE = 765;

export interface ColorCluster {
  r: number;
  g: number;
  b: number;
  pixels: number;
}

export function extractColorClusters(data: Uint8ClampedArray, distance: number): ColorCluster[] {
  const rBin = new Uint32Array(BIN_COUNT);
  const gBin = new Uint32Array(BIN_COUNT);
  const bBin = new Uint32Array(BIN_COUNT);
  const countBin = new Uint32Array(BIN_COUNT);

  const length = data.length;

  for (let i = 0; i < length; i += 4) {
    if (i + 3 >= length) break;

    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const a = data[i + 3] ?? 0;

    if (a < MIN_ALPHA) continue;

    const key = (((r >> 4) & 0xf) << 8) | (((g >> 4) & 0xf) << 4) | ((b >> 4) & 0xf);

    rBin[key] = (rBin[key] ?? 0) + r;
    gBin[key] = (gBin[key] ?? 0) + g;
    bBin[key] = (bBin[key] ?? 0) + b;
    countBin[key] = (countBin[key] ?? 0) + 1;
  }

  interface ColorBin {
    r: number;
    g: number;
    b: number;
    count: number;
  }

  const colorList: ColorBin[] = [];

  for (let i = 0; i < BIN_COUNT; i++) {
    const count = countBin[i];
    if (count !== undefined && count > 0) {
      colorList.push({
        r: Math.round((rBin[i] ?? 0) / count),
        g: Math.round((gBin[i] ?? 0) / count),
        b: Math.round((bBin[i] ?? 0) / count),
        count,
      });
    }
  }

  colorList.sort((a, b) => b.count - a.count);

  if (colorList.length > MAX_CANDIDATES) {
    colorList.length = MAX_CANDIDATES;
  }

  const threshold = distance * DISTANCE_SCALE;
  const mergedList: ColorBin[] = [];
  const mergedIndices = new Uint8Array(colorList.length);

  for (let i = 0; i < colorList.length; i++) {
    if (mergedIndices[i]) continue;

    const current = colorList[i];
    if (!current) continue;

    let mergedCount = current.count;

    for (let j = i + 1; j < colorList.length; j++) {
      if (mergedIndices[j]) continue;

      const other = colorList[j];
      if (!other) continue;

      const dist = Math.abs(current.r - other.r) + Math.abs(current.g - other.g) + Math.abs(current.b - other.b);

      if (dist < threshold) {
        const total = mergedCount + other.count;
        current.r = Math.round((current.r * mergedCount + other.r * other.count) / total);
        current.g = Math.round((current.g * mergedCount + other.g * other.count) / total);
        current.b = Math.round((current.b * mergedCount + other.b * other.count) / total);
        mergedCount = total;
        mergedIndices[j] = 1;
      }
    }

    current.count = mergedCount;
    mergedList.push(current);
  }

  mergedList.sort((a, b) => b.count - a.count);

  return mergedList.slice(0, MAX_CLUSTERS).map((c) => ({ r: c.r, g: c.g, b: c.b, pixels: c.count }));
}

import { colordx } from "@colordx/core";

export type PaletteSortMode = "dominant" | "vibrant" | "bright" | "dark";

export interface PaletteEntry {
  color: string;
  pixels: number;
}

export const MAX_PALETTE_COLORS = 24;

export function orderPalette(entries: ReadonlyArray<PaletteEntry>, sortMode: PaletteSortMode): string[] {
  const needsColor = sortMode !== "dominant";
  const candidates = entries.map((item) => {
    let l = 0;
    let c = 0;
    if (needsColor) {
      const parsed = colordx(item.color);
      if (parsed.isValid()) {
        const oklch = parsed.toOklch();
        l = oklch.l;
        c = oklch.c;
      }
    }
    return { ...item, l, c };
  });

  switch (sortMode) {
    case "vibrant":
      candidates.sort((a, b) => b.c - a.c);
      break;
    case "bright":
      candidates.sort((a, b) => b.l - a.l);
      break;
    case "dark":
      candidates.sort((a, b) => a.l - b.l);
      break;
    default:
      candidates.sort((a, b) => b.pixels - a.pixels);
      break;
  }

  return candidates.slice(0, MAX_PALETTE_COLORS).map((candidate) => candidate.color);
}

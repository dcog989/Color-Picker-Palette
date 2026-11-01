import { describe, expect, it } from "vitest";
import { MAX_PALETTE_COLORS, orderPalette, type PaletteEntry } from "./image-palette";

const entry = (color: string, pixels: number): PaletteEntry => ({ color, pixels });

const entries = [entry("#ff0000", 10), entry("#808080", 50), entry("#ffffff", 5), entry("#000000", 20)];

describe("orderPalette", () => {
  it("sorts by pixel count in dominant mode", () => {
    expect(orderPalette(entries, "dominant")[0]).toBe("#808080");
  });

  it("sorts by chroma in vibrant mode", () => {
    expect(orderPalette(entries, "vibrant")[0]).toBe("#ff0000");
  });

  it("sorts by lightness in bright and dark modes", () => {
    expect(orderPalette(entries, "bright")[0]).toBe("#ffffff");
    expect(orderPalette(entries, "dark")[0]).toBe("#000000");
  });

  it("caps the palette at 24 colors", () => {
    const many = Array.from({ length: 30 }, (_, i) => entry(`#${i.toString(16).padStart(6, "0")}`, i));

    expect(orderPalette(many, "dominant")).toHaveLength(MAX_PALETTE_COLORS);
  });

  it("treats unparseable colors as neutral", () => {
    expect(orderPalette([entry("nope", 1), entry("#ff0000", 2)], "vibrant")[0]).toBe("#ff0000");
  });
});

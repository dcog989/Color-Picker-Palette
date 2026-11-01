import { describe, expect, it } from "vitest";
import { generatePalette, isHarmonyMode } from "./palette";

describe("isHarmonyMode", () => {
  it("separates harmony names from channel axes", () => {
    expect(isHarmonyMode("triadic")).toBe(true);
    expect(isHarmonyMode("split-complementary")).toBe(true);
    expect(isHarmonyMode("l")).toBe(false);
  });
});

describe("generatePalette", () => {
  it("clamps the step count between two and twenty", () => {
    expect(generatePalette({ l: 0.5, c: 0.1, h: 100 }, "l", 0)).toHaveLength(2);
    expect(generatePalette({ l: 0.5, c: 0.1, h: 100 }, "l", 99)).toHaveLength(20);
  });

  it("varies only the requested channel", () => {
    const lightness = generatePalette({ l: 0.5, c: 0.1, h: 100 }, "l", 3);
    const hue = generatePalette({ l: 0.5, c: 0.1, h: 100 }, "h", 3);

    expect(new Set(lightness).size).toBe(3);
    expect(new Set(hue).size).toBe(3);
  });

  it("spreads alpha across the eight digit hex range", () => {
    const alpha = generatePalette({ l: 0.5, c: 0.1, h: 100 }, "a", 3);

    expect(alpha[0]).toMatch(/^#[0-9a-f]{8}$/);
    expect(alpha[2]?.slice(7)).toBe("ff");
  });
});

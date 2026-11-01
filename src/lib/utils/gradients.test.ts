import { extend } from "@colordx/core";
import okhsl from "@colordx/core/plugins/okhsl";
import { describe, expect, it } from "vitest";
import { getGradient, okhslGradient } from "./gradients";

extend([okhsl]);

describe("getGradient", () => {
  it("maps oklch channels to gradient classes", () => {
    expect(getGradient("l", { r: 0, g: 0, b: 0 })).toEqual({ gradientClass: "gradient-oklch-l" });
    expect(getGradient("c", { r: 0, g: 0, b: 0 })).toEqual({ gradientClass: "gradient-oklch-c" });
    expect(getGradient("h", { r: 0, g: 0, b: 0 })).toEqual({ gradientClass: "gradient-oklch-h" });
  });

  it("builds rgb and alpha gradients", () => {
    expect(getGradient("r", { r: 1, g: 2, b: 3 }).gradientStyle).toContain("rgb(255,0,0)");
    expect(getGradient("g", { r: 1, g: 2, b: 3 }).gradientStyle).toContain("rgb(0,255,0)");
    expect(getGradient("b", { r: 1, g: 2, b: 3 }).gradientStyle).toContain("rgb(0,0,255)");
    expect(getGradient("alpha", { r: 10, g: 20, b: 30 }).gradientStyle).toContain("rgba(10,20,30,1)");
  });

  it("returns nothing for an unknown channel", () => {
    expect(getGradient("nope", { r: 0, g: 0, b: 0 })).toEqual({});
  });
});

describe("okhslGradient", () => {
  it("emits the full hue turn", () => {
    const style = okhslGradient("h", { h: 0, s: 50, l: 50 }).gradientStyle;

    expect(style).toContain("linear-gradient(to right");
    expect(style?.endsWith("100.00%)")).toBe(true);
  });

  it("emits fewer stops for saturation and lightness", () => {
    const style = okhslGradient("s", { h: 0, s: 50, l: 50 }).gradientStyle;

    expect(style?.match(/rgb\(/g)).toHaveLength(13);
  });
});

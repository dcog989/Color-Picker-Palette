import { describe, expect, it } from "vitest";
import { usesDarkText } from "./text-contrast";

describe("usesDarkText", () => {
  it("asks for dark text on light backgrounds and light text on dark", () => {
    expect(usesDarkText("#ffffff")).toBe(true);
    expect(usesDarkText("#000000")).toBe(false);
  });

  it("falls back to light text for invalid input", () => {
    expect(usesDarkText("not-a-color")).toBe(false);
  });
});

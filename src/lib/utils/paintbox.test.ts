import { describe, expect, it } from "vitest";
import { newestHalf, toColorKey } from "./paintbox";

describe("toColorKey", () => {
  it("normalizes equivalent color strings to the same key", () => {
    expect(toColorKey("#aabbcc")).toBe(toColorKey("#aabbccff"));
    expect(toColorKey("rgb(170 187 204)")).toBe(toColorKey("#aabbcc"));
    expect(toColorKey("#ABC")).toBe(toColorKey("#aabbcc"));
  });

  it("passes unparseable values through", () => {
    expect(toColorKey("not-a-color")).toBe("not-a-color");
  });
});

describe("newestHalf", () => {
  it("keeps the newest half and drops the oldest", () => {
    expect(newestHalf([1, 2, 3, 4])).toEqual([3, 4]);
    expect(newestHalf([1, 2, 3])).toEqual([2, 3]);
  });

  it("handles empty and single item lists", () => {
    expect(newestHalf([])).toEqual([]);
    expect(newestHalf([1])).toEqual([]);
  });
});

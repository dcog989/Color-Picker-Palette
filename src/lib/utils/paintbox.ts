import { colordx } from "@colordx/core";

export function toColorKey(css: string): string {
  const parsed = colordx(css);
  return parsed.isValid() ? parsed.toHex8() : css;
}

export function newestHalf<T>(items: readonly T[]): T[] {
  return items.slice(Math.max(Math.floor(items.length / 2), 1));
}

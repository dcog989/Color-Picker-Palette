import { colordx, getFormat } from "@colordx/core";

export type ExportFormat = "hex" | "rgb" | "hsl" | "oklch";

// These functions only have the space-separated CSS syntax; a comma paste needs converting.
const SPACE_ONLY_FUNCTION = /^(?:oklch|oklab|okhsv|okhsl|lch|lab|hwb)\s*\(/i;

export function normalizeColorString(str: string): string {
  const trimmed = str.trim();
  return SPACE_ONLY_FUNCTION.test(trimmed) ? trimmed.replace(/,/g, " ") : trimmed;
}

export function safeColor(str: string) {
  const normalized = normalizeColorString(str);
  if (getFormat(normalized) !== undefined) {
    try {
      return colordx(normalized);
    } catch {
      return null;
    }
  }
  return null;
}

export function formatColor(color: string, format: ExportFormat): string {
  const parsed = safeColor(color);
  if (!parsed) return color;

  switch (format) {
    case "hex":
      return parsed.toHex();
    case "rgb":
      return parsed.toRgbString();
    case "hsl":
      return parsed.toHslString();
    case "oklch":
      return parsed.toOklchString();
    default:
      return color;
  }
}

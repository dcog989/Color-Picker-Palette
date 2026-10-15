import { colordx, getFormat } from "@colordx/core";

export type ExportFormat = "hex" | "rgb" | "hsl" | "oklch";

// These functions only have the space-separated CSS syntax; a comma paste needs converting.
const SPACE_ONLY_FUNCTION = /^(?:oklch|oklab|okhsv|okhsl|lch|lab|hwb)\s*\(/i;
// okhsl/okhsv use 0..1 for saturation/lightness in the reference implementation, but
// colordx reads a unitless value as a percentage. Values <= 1 get scaled up.
const OKH_SL_ARGS = /^(okhsl|okhsv)\s*\(\s*(\S+)\s+(\S+)\s+(\S+)(.*)\)$/i;

function scaleOkhSlFractions(str: string): string {
  const match = OKH_SL_ARGS.exec(str);
  if (!match) return str;
  const [, fn = "", h = "", s = "", l = "", rest = ""] = match;
  const scale = (token: string) => {
    if (token.endsWith("%")) return token;
    const n = Number(token);
    return n <= 1 && n >= 0 ? `${Number((n * 100).toFixed(6))}` : token;
  };
  const tail = rest.trim();
  return `${fn}(${h} ${scale(s)} ${scale(l)}${tail ? ` ${tail}` : ""})`;
}

export function normalizeColorString(str: string): string {
  const trimmed = str.trim();
  const spaced = SPACE_ONLY_FUNCTION.test(trimmed) ? trimmed.replace(/\s*,\s*/g, " ") : trimmed;
  return scaleOkhSlFractions(spaced);
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

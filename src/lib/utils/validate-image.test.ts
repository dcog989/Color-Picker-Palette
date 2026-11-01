import { describe, expect, it } from "vitest";
import { IMAGE_ANALYSIS } from "../constants";
import { validateImageFile } from "./validate-image";

const fileOf = (type: string, size: number) => ({ type, size }) as File;

describe("validateImageFile", () => {
  it("accepts an allowed type under the size limit", () => {
    expect(() => validateImageFile(fileOf("image/png", 1024))).not.toThrow();
  });

  it("rejects unsupported types", () => {
    expect(() => validateImageFile(fileOf("text/plain", 1024))).toThrow(/Unsupported format/);
  });

  it("rejects files over the size limit", () => {
    expect(() => validateImageFile(fileOf("image/png", IMAGE_ANALYSIS.MAX_FILE_SIZE + 1))).toThrow(/Image too large/);
  });
});

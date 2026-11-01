import { describe, expect, it } from "vitest";
import { trapFocus } from "./focus-trap";

const buildPanel = () => {
  const panel = document.createElement("div");
  const first = document.createElement("button");
  const middle = document.createElement("input");
  const last = document.createElement("button");
  panel.append(first, middle, last);
  document.body.append(panel);
  return { panel, first, middle, last };
};

describe("trapFocus", () => {
  it("focuses the first control and restores the previous focus on destroy", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();

    const { panel, first } = buildPanel();
    const action = trapFocus(panel);

    expect(document.activeElement).toBe(first);

    action.destroy();

    expect(document.activeElement).toBe(opener);

    panel.remove();
    opener.remove();
  });

  it("wraps Tab at both ends", () => {
    const { panel, first, last } = buildPanel();
    const action = trapFocus(panel);

    last.focus();
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    action.destroy();
    panel.remove();
  });
});

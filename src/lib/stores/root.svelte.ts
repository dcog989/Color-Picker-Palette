import { extend } from "@colordx/core";
import a11y from "@colordx/core/plugins/a11y";
import a98rgb from "@colordx/core/plugins/a98rgb";
import cmyk from "@colordx/core/plugins/cmyk";
import harmonies from "@colordx/core/plugins/harmonies";
import hsv from "@colordx/core/plugins/hsv";
import hwb from "@colordx/core/plugins/hwb";
import lab from "@colordx/core/plugins/lab";
import lch from "@colordx/core/plugins/lch";
import names from "@colordx/core/plugins/names";
import okhsl from "@colordx/core/plugins/okhsl";
import okhsv from "@colordx/core/plugins/okhsv";
import p3 from "@colordx/core/plugins/p3";
import prophoto from "@colordx/core/plugins/prophoto";
import rec2020 from "@colordx/core/plugins/rec2020";
import srgbLinear from "@colordx/core/plugins/srgb-linear";

import { ColorStore } from "./color.svelte";
import { EngineStore } from "./engine.svelte";
import { ImageStore } from "./image.svelte";
import { PaintboxStore } from "./paintbox.svelte";
import { ThemeStore } from "./theme.svelte";
import { ToastStore } from "./toast.svelte";

extend([a11y, a98rgb, cmyk, harmonies, hsv, hwb, lab, lch, names, okhsl, okhsv, p3, prophoto, rec2020, srgbLinear]);

export class RootStore {
  precision = $state<"precise" | "practical">("practical");
  color: ColorStore;
  toast = new ToastStore();
  paintbox = new PaintboxStore();
  image = new ImageStore();
  theme = new ThemeStore();
  engine: EngineStore;

  constructor() {
    // ColorStore depends on precision getter
    this.color = new ColorStore(() => this.precision);
    // Engine depends on Color
    this.engine = new EngineStore(this.color);
  }

  init() {
    this.theme.init();
    this.paintbox.init();
    this.engine.init();
  }

  destroy() {
    this.engine.destroy();
    this.image.destroy();
  }

  async copy(text: string, e?: MouseEvent) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.showAt("Copied", e);
    } catch {
      this.toast.showAt("Copy failed", e);
    }
  }
}

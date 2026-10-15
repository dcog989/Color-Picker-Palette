<script lang="ts">
import { getApp } from "../context";
import { getGradient } from "../utils/gradients";
import Slider from "./Slider.svelte";

const { color } = getApp();
</script>

<Slider
  label="Lightness"
  bind:value={color.l}
  displayValue={`${(color.l * 100).toFixed(color.percentDecimals)}%`}
  min={0}
  max={1}
  step={color.channelStep}
  {...getGradient("l", color.rgbComp)}
/>
<Slider
  label="Chroma"
  bind:value={color.c}
  displayValue={color.c.toFixed(color.channelDecimals)}
  min={0}
  max={color.chromaMax}
  step={color.channelStep}
  {...getGradient("c", color.rgbComp)}
/>
<Slider
  label="Hue"
  bind:value={color.h}
  displayValue={`${color.h.toFixed(color.hueDecimals)}°`}
  min={0}
  max={360}
  step={color.hueStep}
  {...getGradient("h", color.rgbComp)}
/>

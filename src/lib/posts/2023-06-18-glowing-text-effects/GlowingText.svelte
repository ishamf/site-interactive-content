<script lang="ts" module>
  import { sRGB, ColorSpace, OKLCH } from 'colorjs.io/fn';
  ColorSpace.register(sRGB);
  ColorSpace.register(OKLCH);
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import { parse, to as convert, serialize, clone } from 'colorjs.io/fn';
  import GlowingTextPrecalculated from './GlowingTextPrecalculated.svelte';

  interface Props {
    color: string;
    text: string;
    lightnessOffset?: number;
    fontLightnessOffset?: number;
  }

  let { color, text, lightnessOffset = 0.2, fontLightnessOffset = 0.2 }: Props = $props();

  let colorObj: ReturnType<typeof convert> = $state();
  let lighterColor: typeof colorObj = $state();
  let lighterFontColor: typeof colorObj = $state();

  run(() => {
    colorObj = convert(parse(color), OKLCH);
    lighterColor = clone(colorObj);
    lighterColor.coords[0] = Math.max(colorObj.coords[0] + lightnessOffset, lightnessOffset);

    lighterFontColor = clone(colorObj);
    lighterFontColor.coords[0] = Math.max(
      colorObj.coords[0] + fontLightnessOffset,
      fontLightnessOffset
    );
  });
</script>

<GlowingTextPrecalculated
  {text}
  {color}
  lighterColor={serialize(lighterColor)}
  lighterFontColor={serialize(lighterFontColor)}
/>

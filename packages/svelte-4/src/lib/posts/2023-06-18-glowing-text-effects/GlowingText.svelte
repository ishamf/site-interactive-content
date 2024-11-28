<script lang="ts" context="module">
  import { sRGB, ColorSpace, OKLCH } from 'colorjs.io/fn';
  ColorSpace.register(sRGB);
  ColorSpace.register(OKLCH);
</script>

<script lang="ts">
  import { parse, to as convert, serialize, clone } from 'colorjs.io/fn';
  import GlowingTextPrecalculated from './GlowingTextPrecalculated.svelte';

  export let color: string;
  export let text: string;
  export let lightnessOffset = 0.2;
  export let fontLightnessOffset = 0.2;

  let colorObj: ReturnType<typeof convert>;
  let lighterColor: typeof colorObj;
  let lighterFontColor: typeof colorObj;

  $: {
    colorObj = convert(parse(color), OKLCH);
    lighterColor = clone(colorObj);
    lighterColor.coords[0] = Math.max(colorObj.coords[0] + lightnessOffset, lightnessOffset);

    lighterFontColor = clone(colorObj);
    lighterFontColor.coords[0] = Math.max(
      colorObj.coords[0] + fontLightnessOffset,
      fontLightnessOffset
    );
  }
</script>

<GlowingTextPrecalculated
  {text}
  {color}
  lighterColor={serialize(lighterColor)}
  lighterFontColor={serialize(lighterFontColor)}
/>

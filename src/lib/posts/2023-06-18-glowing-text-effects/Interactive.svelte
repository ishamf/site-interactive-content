<script lang="ts">
  import { onMount } from 'svelte';
  import GlowingText from './GlowingText.svelte';

  let resultColor = '#cc00cc';
  let resultFontLightness = 0.1;
  let resultLightness = 0.2;

  let browser = false;

  onMount(() => {
    browser = true;
  });
</script>

<p>
  <GlowingText
    color={resultColor}
    lightnessOffset={resultLightness}
    fontLightnessOffset={resultFontLightness}
    text="This text is glowing magically"
  />
</p>

<p class="dark:hidden">It looks best on dark backgrounds:</p>

<div class="bg-slate-800 p-4 dark:hidden">
  <GlowingText
    color={resultColor}
    lightnessOffset={resultLightness}
    fontLightnessOffset={resultFontLightness}
    text="This text is glowing magically"
  />
</div>

<p>
  Customise it!
  {#if !browser}
    This only works with JavaScript though, seems you haven't finished loading it or it's disabled.
  {/if}
</p>

<ul>
  <li>
    Color: <input type="color" bind:value={resultColor} class="w-8 ml-2 my-0 h-8 align-middle" />
  </li>
  <li>
    Lighten glow color by: <input
      type="number"
      step="0.01"
      bind:value={resultLightness}
      min="0"
      max="0.5"
      class="w-16 ml-2 my-0 dark:bg-slate-600"
    />
  </li>
  <li>
    Lighten font color by: <input
      type="number"
      step="0.01"
      bind:value={resultFontLightness}
      min="0"
      max="0.5"
      class="w-16 ml-2 my-0 dark:bg-slate-600"
    />
  </li>
</ul>

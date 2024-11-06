<svelte:options
  customElement={{
    tag: 'xif-window-display',

    extend: addComponentStylesheet,
  }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import { onMount } from 'svelte';

  let screenWidth = $state(1920);
  let screenHeight = $state(1080);

  let windowWidth = $state(800);
  let windowHeight = $state(600);

  let screenTop = $state(100);
  let screenLeft = $state(100);

  onMount(() => {
    const interval = setInterval(() => {
      screenWidth = window.screen.availWidth;
      screenHeight = window.screen.availHeight;
      windowWidth = window.outerWidth;
      windowHeight = window.outerHeight;

      const topOffset = 'availTop' in window.screen ? (window.screen.availTop as number) : 0;
      const leftOffset = 'availLeft' in window.screen ? (window.screen.availLeft as number) : 0;

      screenTop = window.screenTop - topOffset;
      screenLeft = window.screenLeft - leftOffset;
    }, 100);

    return () => {
      clearInterval(interval);
    };
  });

  const screenDivHeight = 20; // in rem
  let ratio = $derived(screenDivHeight / screenHeight);

  let screenDivWidth = $derived(screenWidth * ratio);

  let windowDivHeight = $derived(windowHeight * ratio);
  let windowDivWidth = $derived(windowWidth * ratio);

  let windowDivTop = $derived(screenTop * ratio);
  let windowDivLeft = $derived(screenLeft * ratio);

  let screenStyle = $derived(`
    height: ${screenDivHeight}rem;
    width: ${screenDivWidth}rem;
  `);

  let windowStyle = $derived(`
    height: ${windowDivHeight}rem;
    width: ${windowDivWidth}rem;
    top: ${windowDivTop}rem;
    left: ${windowDivLeft}rem;
    `);
</script>

<div class="container">
  <div class="screen" style={screenStyle}>
    <p class="absolute left-0 bottom-0 p-1 bg-blue-200 text-blue-800">screen</p>
    <div class="window" style={windowStyle}>
      <p class="absolute left-0 bottom-0 p-1 bg-yellow-200 text-yellow-800">window</p>
    </div>
  </div>
</div>

<style lang="postcss">
  .container {
    margin: 0 auto;
    position: relative;
  }

  .screen {
    @apply rounded-sm border-2 border-blue-200 relative mx-auto box-content;
  }

  .window {
    @apply rounded-sm border-2 border-yellow-200 absolute;
  }
</style>

<script lang="ts">
  import { createStoreFromMobx } from '$lib/utils';
  import CoveredInput from '$lib/components/CoveredInput.svelte';
  import type { Calculation } from './state';

  export let calculation: Calculation;

  let resultNode: HTMLSpanElement | undefined;

  function onResultClick() {
    if (resultNode) {
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(resultNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  $: mainText = createStoreFromMobx(
    () => calculation.inputText,
    (text) => calculation.updateText(text)
  );

  $: calcResult = createStoreFromMobx(() => calculation.value);
  $: displaySegments = createStoreFromMobx(() => calculation.displaySegments);

  $: variableColors = createStoreFromMobx(() => calculation.variableColors);

  $: shouldShowResult =
    $calcResult && !$calcResult.invalidReason && $calcResult.toString().trim() !== $mainText.trim();
</script>

<!-- 
  This is quite a mess because we cannot add any whitespace in between nodes,
  It's rendering something like this:
    2 + 2a = 4
             ^- result span
           ^- equals mark span
         ^- variable type segment
    ^- string type segments
-->
<CoveredInput bind:value={$mainText} padding="medium"
  >{#each $displaySegments as segment}{#if segment.type === 'string'}<span class="cover"
        >{segment.value}</span
      >{:else}<span class="cover" style={`color: ${$variableColors[segment.value] || 'red'}`}
        >{segment.value}</span
      >{/if}{/each}{#if shouldShowResult}<span class="text-neutral-500 ml-1"
      ><span class="cover"
        >= <!-- adding this comment to prevent prettier from adding newline
        --></span
      ><!-- 
      svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions
      --><span
        class="result"
        bind:this={resultNode}
        on:click={onResultClick}>{$calcResult?.toString()}</span
      ></span
    >{/if}</CoveredInput
>

<style>
  .cover {
    /* Make it so that double-clicking the result only selects it */
    user-select: none;
  }
  .result {
    pointer-events: auto;
    cursor: text;
    /* Make the result more easily selectable */
    padding: 0.5rem;
    margin: -0.5rem;
  }
</style>

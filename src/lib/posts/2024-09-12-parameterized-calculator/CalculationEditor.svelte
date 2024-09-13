<script lang="ts">
  import { createStoreFromMobx } from '$lib/utils';
  import CoveredInput from '$lib/components/CoveredInput.svelte';
  import type { Calculation } from './state';

  export let calculation: Calculation;

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

<CoveredInput bind:value={$mainText} padding="medium"
  >{#each $displaySegments as segment}{#if segment.type === 'string'}<span class="cover"
        >{segment.value}</span
      >{:else}<span class="cover" style={`color: ${$variableColors[segment.value] || 'red'}`}
        >{segment.value}</span
      >{/if}{/each}{#if shouldShowResult}<span class="text-neutral-500 ml-1"
      ><span class="cover">= </span><span class="result">{$calcResult?.toString()}</span></span
    >{/if}</CoveredInput
>

<style>
  .cover {
    /* Make it so that double-clicking the result only selects it */
    user-select: none;
  }
  .result {
    pointer-events: auto;
    /* Make the result more easily selectable */
    padding: 1rem;
    margin: -1rem;
  }
</style>

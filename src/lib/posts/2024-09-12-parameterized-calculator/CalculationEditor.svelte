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
  ><span class="whitespace-pre-wrap"
    >{#each $displaySegments as segment}{#if segment.type === 'string'}{segment.value}{:else}<span
          style={`color: ${$variableColors[segment.value] || 'red'}`}>{segment.value}</span
        >{/if}{/each}{#if shouldShowResult}<span class="text-neutral-500 ml-1">= {$calcResult}</span
      >{/if}</span
  ></CoveredInput
>

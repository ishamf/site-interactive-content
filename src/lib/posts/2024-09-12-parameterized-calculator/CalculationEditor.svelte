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

  $: shouldShowResult =
    $calcResult && !$calcResult.invalidReason && $calcResult.toString().trim() !== $mainText.trim();
</script>

<CoveredInput bind:value={$mainText} padding="medium"
  >{$mainText}{#if shouldShowResult}<span class="text-neutral-500 ml-1">= {$calcResult}</span
    >{/if}</CoveredInput
>

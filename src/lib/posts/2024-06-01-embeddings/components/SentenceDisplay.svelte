<script lang="ts">
  import type { ProjectedSentence } from '../types';
  import Label from './Label.svelte';

  interface Props {
    sentences: ProjectedSentence[];
  }

  let { sentences }: Props = $props();
</script>

<div class="h-80 w-80 bg-neutral-100 dark:bg-neutral-800 text-sm relative">
  {#each sentences as sentence, i (i)}
    <div
      class="absolute overflow-visible w-1 h-1 bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all"
      style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}
    ></div>
    <Label style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}>
      {sentence.value}
    </Label>
  {/each}
</div>

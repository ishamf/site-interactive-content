<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { mdiPlus, mdiClose, mdiSetSplit } from '@mdi/js';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Sentence } from '../types';

  export let sentence: Sentence;
  export let isDraft = false;

  const dispatch = createEventDispatcher();

  // Refresh flags to control UI elements
  $: shouldShowRemoveButton = !isDraft;
</script>

<div class="flex flex-row justify-stretch gap-4">
  <div class="flex-1 flex">
    <Input bind:value={sentence.value} placeholder={'Enter text...'} />
  </div>

  {#if shouldShowRemoveButton}
    <Button
      title="Remove sentence"
      icon={mdiClose}
      on:click={() => {
        dispatch('remove');
      }}
    />
  {/if}
</div>

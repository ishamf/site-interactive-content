<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { mdiClose } from '@mdi/js';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Sentence } from '../types';

  interface Props {
    sentence: Sentence;
    isDraft?: boolean;
  }

  let { sentence = $bindable(), isDraft = false }: Props = $props();

  const dispatch = createEventDispatcher();

  // Refresh flags to control UI elements
  let shouldShowRemoveButton = $derived(!isDraft);
</script>

<div class="flex flex-row justify-stretch gap-4">
  <div class="flex-1 flex">
    <Input on:focus on:blur bind:value={sentence.value} placeholder={'Enter text...'} />
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

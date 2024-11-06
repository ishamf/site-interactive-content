<script lang="ts">
  import { mdiClose } from '@mdi/js';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Sentence } from '../types';

  interface Props {
    sentence: Sentence;
    isDraft?: boolean;
    onfocus?: () => void;
    onblur?: () => void;
    onremove?: () => void;
  }

  let { sentence = $bindable(), isDraft = false, onfocus, onblur, onremove }: Props = $props();

  // Refresh flags to control UI elements
  let shouldShowRemoveButton = $derived(!isDraft);
</script>

<div class="flex flex-row justify-stretch gap-4">
  <div class="flex-1 flex">
    <Input {onfocus} {onblur} bind:value={sentence.value} placeholder={'Enter text...'} />
  </div>

  {#if shouldShowRemoveButton}
    <Button
      title="Remove sentence"
      icon={mdiClose}
      onclick={() => {
        onremove?.();
      }}
    />
  {/if}
</div>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    value: string;
    placeholder: string;
    disabled?: boolean;
    onfocus?: HTMLInputAttributes['onfocus'];
    onblur?: HTMLInputAttributes['onblur'];
  }

  let { value = $bindable(), placeholder, disabled = false, onfocus, onblur }: Props = $props();
</script>

<input
  type="text"
  bind:value
  {onfocus}
  {onblur}
  {disabled}
  {placeholder}
  class="flex-1 px-4 py-2 block min-w-0 min-h-12
		bg-neutral-100 placeholder:text-neutral-400 text-neutral-800
		disabled:bg-neutral-200 disabled:text-neutral-400
		dark:bg-neutral-700 dark:placeholder:text-neutral-400 dark:text-neutral-200
		dark:disabled:bg-neutral-500 dark:disabled:text-neutral-400
    
    focus:outline-none focus:ring-2 focus:ring-neutral-500
    "
/>

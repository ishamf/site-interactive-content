<script lang="ts" module>
  export const textTypes = ['normal', 'error'] as const;

  export type TextType = (typeof textTypes)[number];
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;

    type?: TextType;
  }

  let { children, type = 'normal' }: Props = $props();

  let textNormal = $derived(type === 'normal');
  let textError = $derived(type === 'error');
</script>

<span class="font-normal" class:textNormal class:textError>
  {@render children?.()}
</span>

<style lang="postcss">
  .textNormal {
    @apply text-neutral-900 dark:text-neutral-100;
  }

  .textError {
    @apply text-red-700 dark:text-red-300;
  }
</style>

<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props {
    danger?: boolean;
    onclick?: HTMLButtonAttributes['onclick'];
    children?: import('svelte').Snippet;
  }

  let { danger = false, children, onclick }: Props = $props();
</script>

<button
  {onclick}
  class="px-4 py-2
        bg-neutral-100 hover:bg-neutral-200
        dark:bg-neutral-700 dark:hover:bg-neutral-600

        focus:outline-none focus:ring-2 focus:ring-neutral-500
    "
  class:danger
>
  {@render children?.()}
</button>

<style lang="postcss">
  .danger {
    @apply text-red-100 bg-red-600 hover:bg-red-500
    dark:bg-red-700 dark:hover:bg-red-600;
  }
</style>

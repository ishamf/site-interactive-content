<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<span class="font-normal text-neutral-900 dark:text-neutral-100">
  {@render children?.()}
</span>

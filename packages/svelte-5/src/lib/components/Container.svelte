<script lang="ts">
  interface Props {
    background?: boolean;
    children?: import('svelte').Snippet;
  }

  let { background = true, children }: Props = $props();
</script>

<div class:background class="prose prose-neutral dark:prose-invert font-sans max-w-none">
  {@render children?.()}
</div>

<style lang="postcss">
  .background {
    @apply bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl;
  }
</style>

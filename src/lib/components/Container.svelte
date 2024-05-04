<script lang="ts">
  export let background = true;
</script>

<div class:background class="prose prose-neutral dark:prose-invert font-sans">
  <slot />
</div>

<style lang="postcss">
  .background {
    @apply bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl;
  }
</style>

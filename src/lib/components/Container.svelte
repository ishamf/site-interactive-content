<script lang="ts">
  export let background = true;
</script>

<div class:background class="prose prose-slate dark:prose-invert font-sans">
  <slot />
</div>

<style lang="postcss">
  .background {
    @apply bg-neutral-50 dark:bg-slate-900 p-4 rounded-xl;
  }
</style>

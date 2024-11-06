<script lang="ts">
  interface Props {
    style: string;
    children?: import('svelte').Snippet;
  }

  let { style, children }: Props = $props();

  let isHover = $state(false);
</script>

<div
  role="tooltip"
  class="ms-1 overflow-hidden w-fit absolute transition-all break-all"
  onpointerenter={() => {
    isHover = true;
  }}
  onpointerleave={() => {
    isHover = false;
  }}
  class:hover={isHover}
  {style}
>
  {@render children?.()}
</div>

<style lang="postcss">
  .hover {
    @apply bg-neutral-200 dark:bg-neutral-700 z-10;
  }
</style>

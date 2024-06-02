<script lang="ts">
  export let style: string
  
  let isHover = false;
  
</script>

<div
  role="tooltip"
  class="ms-1 overflow-hidden w-fit absolute"
  on:pointerenter={() => {
    isHover = true;
  }}
  on:pointerleave={() => {
    isHover = false;
  }}
  class:hover={isHover}
  {style}
>
  <slot />
</div>

<style lang="postcss">
  .hover {
    @apply bg-neutral-200 dark:bg-neutral-700 z-10;
  }
</style>

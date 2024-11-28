<script lang="ts">
  import { onMount } from 'svelte';

  export let headings: { text: string; slug: string; depth: number }[];

  let scrollPosition = 0;
  let idPositions: Record<string, number> = {};

  onMount(() => {
    const listener = () => {
      scrollPosition = window.scrollY;
    };

    document.addEventListener('scroll', listener);

    for (const item of headings) {
      const element = document.getElementById(item.slug);
      if (!element) continue;
      idPositions[item.slug] = element.getBoundingClientRect().top + window.scrollY;
    }

    return () => {
      document.removeEventListener('scroll', listener);
    };
  });

  $: currentItemSlug = headings.findLast(
    (item) => scrollPosition >= idPositions[item.slug] - 10
  )?.slug;
</script>

<nav class="toc-nav">
  <ul>
    {#each headings as tocItem}
      <li
        class="toc-item"
        class:current-item={tocItem.slug === currentItemSlug}
        style={`margin-left: ${tocItem.depth - 1}rem`}
      >
        <a href={`#${tocItem.slug}`}>
          {tocItem.text}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style lang="postcss">
  .toc-nav {
    @apply sticky top-4 mt-32 mx-8;
  }

  /* TODO: move container measurement to this component, don't rely on caller */
  @container (width < 150px) {
    .toc-nav {
      display: none;
    }
  }

  .toc-item {
    @apply my-4 text-sm
        text-slate-600 dark:text-slate-400
        hover:text-slate-900 dark:hover:text-slate-200;

    display: list-item;
    list-style-type: disc;

    &.current-item {
      @apply font-bold text-slate-900 dark:text-slate-100;

      & a {
        @apply cursor-default;
      }
    }
  }
</style>

<script lang="ts" module>
  const observer =
    typeof IntersectionObserver === 'undefined'
      ? undefined // SSR
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const callback = callbacks.get(entry.target);
              if (callback) callback(entry.isIntersecting);
            });
          },
          { threshold: 0.5 }
        );

  const callbacks: Map<Element, (active: boolean) => unknown> = new Map();
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    text: string;
    color: string;
    lighterColor: string;
    lighterFontColor: string;
  }

  let { text, color, lighterColor, lighterFontColor }: Props = $props();

  let span: HTMLSpanElement | undefined = $state();
  let isActive = $state(!observer); // Turn it on by default on SSR

  onMount(() => {
    if (!observer || !span) return;

    const observedElement = span;

    observer.observe(observedElement);
    callbacks.set(observedElement, (active) => {
      isActive = active;
    });

    return () => {
      observer.unobserve(observedElement);
      callbacks.delete(observedElement);
    };
  });
</script>

<span
  bind:this={span}
  class:glowing-text={isActive}
  style={`--lighter-color: ${lighterColor}; --lighter-font-color: ${lighterFontColor}; color: ${color};`}
  >{#each text as char}<span
      style={`animation-delay: ${-Math.random() * 2}s; animation-duration: ${
        0.7 + Math.random() * 0.8
      }s`}>{char}</span
    >{/each}</span
>

<style>
  .glowing-text span {
    animation:
      waverShadow infinite,
      waverText infinite;
  }

  @keyframes waverShadow {
    from {
      text-shadow:
        0px 0px 10px currentColor,
        0px 0px 10px var(--lighter-color);
    }

    50% {
      text-shadow:
        0px 0px 10px currentColor,
        0px 0px 20px var(--lighter-color);
    }

    to {
      text-shadow:
        0px 0px 10px currentColor,
        0px 0px 10px var(--lighter-color);
    }
  }

  @keyframes waverText {
    from {
      color: currentColor;
    }

    50% {
      color: var(--lighter-font-color);
    }

    to {
      color: currentColor;
    }
  }
</style>

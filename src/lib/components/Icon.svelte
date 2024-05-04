<script lang="ts">
  export let title: string;
  export let icon: string; // @mdi/js icon path
  export let style: keyof typeof styles;

  const styles = {
    button:
      'fill-neutral-400 group-disabled:fill-neutral-300 dark:fill-neutral-300 dark:group-disabled:fill-neutral-400',
    text: 'fill-neutral-400 group-disabled:fill-neutral-500 dark:fill-neutral-400 dark:group-disabled:fill-neutral-500',
  };
</script>

<svg viewBox="0 0 24 24" role="img" class={styles[style]}>
  <title>{title}</title>
  <path d={icon} />
</svg>

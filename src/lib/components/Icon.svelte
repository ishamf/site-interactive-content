<script lang="ts">
  interface Props {
    title: string;
    icon: string; // @mdi/js icon path
    style: keyof typeof styles;
  }

  let { title, icon, style }: Props = $props();

  const styles = {
    button:
      'fill-neutral-400 group-disabled:fill-neutral-300 dark:fill-neutral-300 dark:group-disabled:fill-neutral-400',
    text: 'fill-neutral-400 group-disabled:fill-neutral-500 dark:fill-neutral-400 dark:group-disabled:fill-neutral-500',
    white: 'fill-white',
  };
</script>

<svg viewBox="0 0 24 24" role="img" class={styles[style]}>
  <title>{title}</title>
  <path d={icon} />
</svg>

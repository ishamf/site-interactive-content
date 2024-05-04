<script lang="ts">
  import Icon from './Icon.svelte';

  export let title: string;
  export let icon: string;
  export let disabled = false;
</script>

<button
  {disabled}
  on:click
  class="w-12 p-2 transition-colors group
bg-neutral-100 enabled:hover:bg-neutral-200 disabled:bg-neutral-200
dark:bg-neutral-700 dark:enabled:hover:bg-neutral-600 dark:disabled:bg-neutral-500
focus:outline-none focus:ring-2 focus:ring-neutral-500
"
>
  <Icon {title} {icon} style="button" />
</button>

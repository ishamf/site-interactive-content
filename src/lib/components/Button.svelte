<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Icon from './Icon.svelte';

  interface Props {
    title: string;
    icon: string;
    disabled?: boolean;
    onclick?: HTMLButtonAttributes['onclick'];
    fullWidth?: boolean;
  }

  let { title, icon, disabled = false, fullWidth = false, onclick }: Props = $props();
</script>

<button
  {disabled}
  {onclick}
  class:w-12={!fullWidth}
  class="transition-colors group flex justify-center
bg-neutral-100 enabled:hover:bg-neutral-200 disabled:bg-neutral-200
dark:bg-neutral-700 dark:enabled:hover:bg-neutral-600 dark:disabled:bg-neutral-500
focus:outline-none focus:ring-2 focus:ring-neutral-500
"
>
  <div class="w-12 p-2">
    <Icon {title} {icon} style="button" />
  </div>
</button>

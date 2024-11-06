<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import Icon from './Icon.svelte';

  interface Props {
    title: string;
    icon: string;
    disabled?: boolean;
    fullWidth?: boolean;
  }

  let { title, icon, disabled = false, fullWidth = false }: Props = $props();
</script>

<button
  {disabled}
  onclick={bubble('click')}
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

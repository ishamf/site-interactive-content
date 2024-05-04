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
bg-slate-100 enabled:hover:bg-slate-200 disabled:bg-slate-200
dark:bg-slate-700 dark:enabled:hover:bg-slate-600 dark:disabled:bg-slate-500
focus:outline-none focus:ring-2 focus:ring-slate-500
"
>
  <Icon {title} {icon} style="button" />
</button>

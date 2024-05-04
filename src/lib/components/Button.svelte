<script lang="ts">
  export let title: string;
  export let icon: string;
  export let disabled = false;
</script>

<button
  {disabled}
  on:click
  class="w-12 transition-colors group
bg-slate-100 enabled:hover:bg-slate-200 disabled:bg-slate-200
dark:bg-slate-700 dark:enabled:hover:bg-slate-600 dark:disabled:bg-slate-500
focus:outline-none focus:ring-2 focus:ring-slate-500
"
>
  <svg
    viewBox="0 0 24 24"
    role="img"
    class="m-2
    fill-slate-400 group-disabled:fill-slate-300
    dark:fill-slate-300 dark:group-disabled:fill-slate-400"
  >
    <title>{title}</title>
    <path d={icon} />
  </svg>
</button>

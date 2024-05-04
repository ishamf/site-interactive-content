<script lang="ts">
  export let value: string;
  export let placeholder: string;
  export let disabled = false;
</script>

<input
  type="text"
  bind:value
  {disabled}
  {placeholder}
  class="flex-1 px-4 py-2 block min-w-0 min-h-12
		bg-slate-100 placeholder:text-slate-400 text-slate-800
		disabled:bg-slate-200 disabled:text-slate-400
		dark:bg-slate-700 dark:placeholder:text-slate-400 dark:text-slate-200
		dark:disabled:bg-slate-500 dark:disabled:text-slate-400
    
    focus:outline-none focus:ring-2 focus:ring-slate-500
    "
/>

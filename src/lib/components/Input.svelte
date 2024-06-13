<script lang="ts">
  export let value: string;
  export let placeholder: string;
  export let disabled = false;
</script>

<input
  type="text"
  bind:value
  on:focus
  on:blur
  {disabled}
  {placeholder}
  class="flex-1 px-4 py-2 block min-w-0 min-h-12
		bg-neutral-100 placeholder:text-neutral-400 text-neutral-800
		disabled:bg-neutral-200 disabled:text-neutral-400
		dark:bg-neutral-700 dark:placeholder:text-neutral-400 dark:text-neutral-200
		dark:disabled:bg-neutral-500 dark:disabled:text-neutral-400
    
    focus:outline-none focus:ring-2 focus:ring-neutral-500
    "
/>

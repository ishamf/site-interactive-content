<script lang="ts">
  export let title: string;
  export let link: string;
  export let created: Date;
</script>

<a href={link}>
  <h2 class="text-3xl font-sans text-slate-900 dark:text-slate-200">{title}</h2>
</a>

<date
  class="block text-sm text-slate-700 dark:text-slate-300 mt-2"
  datetime={created.toISOString()}
>
  {created.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
</date>

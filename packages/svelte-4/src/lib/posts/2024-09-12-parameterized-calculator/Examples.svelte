<svelte:options customElement={{ tag: 'xif-calculator-examples', shadow: 'none' }} />

<script lang="ts">
  import type Calculator from './Calculator.svelte';
  export let targetId: string;

  function getCalc() {
    return document.getElementById(targetId) as Calculator | null;
  }

  const examples: { text: string; expression: string; variables?: Record<string, string> }[] = [
    { text: 'Simple calculation', expression: '200 - 12*10' },
    { text: 'Single variable', expression: '3x^2 + 2x - 1', variables: { x: '1/3' } },
    { text: 'Multiple variables', expression: '2x^2 - y^2', variables: { x: '5/7', y: '1/7' } },
  ];
</script>

<ul>
  {#each examples as { text, expression, variables }}
    <li>
      <a
        href={`#${targetId}`}
        on:click={(e) => {
          e.preventDefault();
          getCalc()?.updateText(expression, variables);
        }}>{text}</a
      >: ({expression})
    </li>
  {/each}
</ul>

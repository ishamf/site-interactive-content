<svelte:options customElement={{ tag: 'xif-calculator', extend: addComponentStylesheet }} />

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import { createStoreFromMobx } from '$lib/utils';
  import CalculationEditor from './CalculationEditor.svelte';
  import { CalculatorState } from './state';
  import VariableEditor from './VariableEditor.svelte';

  const state = new CalculatorState();

  state.mainCalculation.updateText('3a^2 + 2 a b - 5');
  state.variables['a']?.updateText('1/3');
  state.variables['b']?.updateText('7');

  export function updateText(text: string, variables?: Record<string, string>) {
    state.mainCalculation.updateText(text);

    if (variables) {
      for (const [name, value] of Object.entries(variables)) {
        state.variables[name]?.updateText(value);
      }
    }
  }

  const validVariablePairs = createStoreFromMobx(() => Object.entries(state.validVariables));

  const variableColors = createStoreFromMobx(() => state.variableColors);
</script>

<div class="flex flex-col gap-4 p-4 prose prose-neutral dark:prose-invert font-sans max-w-none">
  <CalculationEditor calculation={state.mainCalculation}></CalculationEditor>

  {#each $validVariablePairs as [name, calculation]}
    <VariableEditor {name} color={$variableColors[name] || 'red'} {calculation}></VariableEditor>
  {/each}
</div>

<svelte:options customElement={{ tag: 'xif-calculator', extend: addComponentStylesheet }} />

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';
  import { createStoreFromMobx } from '$lib/utils';
  import CalculationEditor from './CalculationEditor.svelte';
  import { CalculatorState } from './state';
  import VariableEditor from './VariableEditor.svelte';

  const state = new CalculatorState();

  state.mainCalculation.updateText('3x^2 + 17x - 6');
  state.variables['x']?.updateText('1/3');

  const validVariablePairs = createStoreFromMobx(() => Object.entries(state.validVariables));
</script>

<div class="flex flex-col gap-4 max-w-4xl p-4">
  <CalculationEditor calculation={state.mainCalculation}></CalculationEditor>

  {#each $validVariablePairs as [name, calculation]}
    <VariableEditor {name} {calculation}></VariableEditor>
  {/each}
</div>

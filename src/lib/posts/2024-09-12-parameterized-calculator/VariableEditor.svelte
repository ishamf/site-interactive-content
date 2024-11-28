<script lang="ts">
  import CalculationEditor from './CalculationEditor.svelte';
  import type { Calculation } from './state';

  export let name: string;
  export let color: string;
  export let calculation: Calculation;
</script>

<div class="flex flex-row gap-1 items-center pl-2">
  <span><span style={`color: ${color}`}>{name}</span> =</span>
  <div class="flex-1">
    <CalculationEditor {calculation}></CalculationEditor>
  </div>
</div>

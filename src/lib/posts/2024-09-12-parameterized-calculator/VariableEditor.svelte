<script lang="ts">
  import CalculationEditor from './CalculationEditor.svelte';
  import type { Calculation } from './state';

  export let name: string;
  export let calculation: Calculation;
</script>

<div class="flex flex-row gap-1 items-center">
  <span>{name} =</span>
  <div class="flex-1">
    <CalculationEditor {calculation}></CalculationEditor>
  </div>
</div>

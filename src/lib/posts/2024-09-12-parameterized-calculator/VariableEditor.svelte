<script lang="ts">
  import CalculationEditor from './CalculationEditor.svelte';
  import type { Calculation } from './state';

  interface Props {
    name: string;
    color: string;
    calculation: Calculation;
  }

  let { name, color, calculation }: Props = $props();
</script>

<div class="flex flex-row gap-1 items-center pl-2">
  <span><span style={`color: ${color}`}>{name}</span> =</span>
  <div class="flex-1">
    <CalculationEditor {calculation}></CalculationEditor>
  </div>
</div>

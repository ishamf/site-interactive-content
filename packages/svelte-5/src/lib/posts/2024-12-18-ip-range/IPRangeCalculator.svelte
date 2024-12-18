<svelte:options
  customElement={{ tag: 'xif-ip-range-calculator', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Input from '$lib/components/Input.svelte';
  import Text from '$lib/components/Text.svelte';
  import { subtractIPRanges } from './calculator';
  import { lastAvailableResult } from './utils.svelte';

  let allowedIpString = $state('');
  let disallowedIpString = $state('');

  let calculationResult = $derived(subtractIPRanges(allowedIpString, disallowedIpString));

  let result = lastAvailableResult(() => calculationResult);
</script>

<div class="flex flex-col p-4 gap-4">
  <Input bind:value={allowedIpString} placeholder="Allowed IPs"></Input>
  <Input bind:value={disallowedIpString} placeholder="Disallowed IPs"></Input>
  <Text>{calculationResult.result}</Text>
  <Text>{calculationResult.error}</Text>
</div>

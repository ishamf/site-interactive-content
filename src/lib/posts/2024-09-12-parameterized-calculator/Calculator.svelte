<svelte:options customElement={{ tag: 'xif-calculator', extend: addComponentStylesheet }} />

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';
  import Input from '$lib/components/Input.svelte';
  import { parseValue } from './parser';

  let text = '2 + 2';

  $: result = parseValue(text);

  $: calcResult = result.ok ? result.value.toString() : result.error;
</script>

<Container>
  <Input placeholder="Enter something..." bind:value={text}></Input>
  {calcResult}
</Container>

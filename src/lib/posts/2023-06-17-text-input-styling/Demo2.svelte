<svelte:options customElement={{ tag: 'xif-input-styling-2', extend: addComponentStylesheet }} />

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';
  import CoveredInput from '$lib/components/CoveredInput.svelte';

  let secondValue = $state(
    'This looks identical to the above input, but the text inside is rendered differently.'
  );
</script>

<Container>
  <CoveredInput bind:value={secondValue} rows={2}>
    {secondValue}
  </CoveredInput>
</Container>

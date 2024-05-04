<svelte:options
  customElement={{ tag: 'xif-input-styling-2', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
    import Container from '$lib/components/Container.svelte';
  import CoveredInput from './CoveredInput.svelte';

  let secondValue =
    'This looks identical to the above input, but the text inside is rendered differently.';
</script>

<Container>
  <CoveredInput bind:value={secondValue} rows={2}>
    {secondValue}
  </CoveredInput>
</Container>

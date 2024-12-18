<svelte:options
  customElement={{ tag: 'xif-timestamp-converter', extend: addComponentStylesheet }}
/>

<script>
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';
  import TimestampConverter from './TimestampConverter.svelte';
</script>

<Container>
  <TimestampConverter />
</Container>

<svelte:options customElement={{ tag: 'xif-glowing-text', extend: addComponentStylesheet }} />

<script>
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';
  import Interactive from './Interactive.svelte';
</script>

<Container background={false}>
  <Interactive></Interactive>
</Container>

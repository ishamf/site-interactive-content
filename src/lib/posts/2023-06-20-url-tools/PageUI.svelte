<svelte:options customElement={{ tag: 'xif-url-tools', extend: addComponentStylesheet }} />

<script lang="ts">
  import { onMount } from 'svelte';
  import URLTool from './URLTool.svelte';
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';

  let isBrowser = $state(false);

  onMount(() => {
    isBrowser = true;
  });
</script>

<Container>
  {#if isBrowser}
    <URLTool />
  {:else}
    <p>Loading URL tool...</p>
  {/if}
</Container>

<style lang="postcss" src="$lib/app.css"></style>

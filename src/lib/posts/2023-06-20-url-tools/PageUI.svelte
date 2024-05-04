<svelte:options
  customElement={{ tag: 'xif-url-tools', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { onMount } from 'svelte';
  import URLTool from './URLTool.svelte';
  import TextButton from '$lib/components/TextButton.svelte';
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';

  let isBrowser = false;

  onMount(() => {
    isBrowser = true;
  });

  let urlTool: URLTool;
  const testUrl =
    'https://archive.org/wayback/available?url=https%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle%3DWayback_Machine%26action%3Dhistory';
</script>

<Container>
  {#if isBrowser}
    <TextButton
      on:click={() => {
        urlTool?.setUrl(testUrl);
      }}
    >
      Try it out with a complex url!
    </TextButton>

    <URLTool bind:this={urlTool} />
  {:else}
    <p>Loading URL tool...</p>
  {/if}
</Container>

<style lang="postcss" src="$lib/app.css"></style>

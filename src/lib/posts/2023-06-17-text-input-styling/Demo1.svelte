<svelte:options
  customElement={{ tag: 'xif-input-styling-1', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Container from '$lib/components/Container.svelte';

  let firstValue = 'This is some text inside a text input';
</script>

<Container>
  <input class="dark:bg-neutral-800 bg-neutral-100 p-1" bind:value={firstValue} />

  <p>
    <span class="p-1">{firstValue}</span>
  </p>
</Container>

<style>
  input {
    width: 100%;
  }
</style>

<svelte:options
  customElement={{ tag: 'xif-input-styling-3', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
    import Container from '$lib/components/Container.svelte';
  import CoveredInput from './CoveredInput.svelte';

  let thirdValue =
    'This is some text inside a text input which shows every word with "text" in it in red.' +
    ' You can edit the text and it will automatically update.';

  $: transformedThirdValue = thirdValue.split(' ').map((text, i) => ({
    text: i === 0 ? text : ' ' + text,
    style: text.toLowerCase().includes('text') ? 'red' : 'normal',
  }));
</script>

<Container>
  <CoveredInput bind:value={thirdValue} rows={3}
    >{#each transformedThirdValue as elem}{#if elem.style === 'normal'}{elem.text}{:else}<span
          class="text-red-500">{elem.text}</span
        >{/if}{/each}</CoveredInput
  >
</Container>

<svelte:options
  customElement={{
    tag: 'xif-image-key',
    mode: 'open',
    extend: createComponentExtender({ onConnect }),
  }}
/>

<script lang="ts">
  import { createComponentExtender } from '$lib/component';
  import Button from '$lib/components/Button.svelte';
  import { mdiCamera } from '@mdi/js';
  import Capturer from './components/Capturer.svelte';

  import { globalEmbedder } from './embedder';
  import { closestEmbedding, embeddingSimilarity } from './utils';
  import type { StoredData } from './types';
  import { getInitialData } from './initialData';

  let capturer: Capturer;
  let data: string | undefined;

  let processingData: string | undefined;
  let embedding: number[] | undefined;
  let embeddedData: string | undefined;

  let storedData: StoredData[] = [];

  function onConnect() {
    const style = document.documentElement.style;

    if (!style.scrollSnapType) {
      style.scrollSnapType = 'y proximity';

      return () => {
        style.scrollSnapType = '';
      };
    }
  }

  getInitialData().then((res) => {
    storedData.push(...res);
    storedData = storedData;
  });

  $: {
    if (!data) {
      processingData = undefined;
      embedding = undefined;
    } else if (data !== embeddedData) {
      const currentData = data;
      processingData = currentData;
      globalEmbedder.embed(currentData).then((res) => {
        if (res && processingData === currentData) {
          embedding = res;
          processingData = undefined;
          embeddedData = currentData;
        }
      });
    }
  }

  $: closestStoredDataIndex = embedding
    ? closestEmbedding(
        storedData.map((x) => x.embedding),
        embedding
      )
    : -1;

  $: closestStoredData =
    closestStoredDataIndex !== -1 ? storedData[closestStoredDataIndex] : undefined;

  $: distanceFromCurrent =
    closestStoredData && embedding
      ? embeddingSimilarity(embedding, closestStoredData.embedding)
      : 0;

  $: {
    console.log({
      closestStoredDataIndex,
      closestStoredData,
      storedData,
    });
  }

  function loadImage(event: MouseEvent, imageUrl: string) {
    event.preventDefault();

    data = imageUrl;
  }

  function addCurrent() {
    if (embedding) {
      storedData.push({ embedding, data: '', originalImage: embeddedData || '' });
      storedData = storedData;
    }
  }
</script>

<div class="container">
  <div class="camera">
    <Capturer bind:this={capturer}></Capturer>
    <div class="absolute bottom-16 left-1/2 -translate-x-1/2">
      <Button
        fullWidth
        icon={mdiCamera}
        on:click={() => {
          data = capturer.takePhoto();
        }}
        title="Take Photo"
      ></Button>
    </div>
  </div>

  <div class="notes-container">
    {#each storedData as note}
      <div class="note">
        <img class="original-image" src={note.originalImage} />
        <textarea class="note-area" bind:value={note.data}></textarea>
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .container {
    @apply text-neutral-800 dark:text-neutral-200 text-base max-w-4xl mx-auto;
    scroll-snap-align: start;
  }

  .camera {
    background-color: red;
    position: sticky;
    height: 100dvh;
    z-index: 5;

    top: 0;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .notes-container {
    position: relative;
    z-index: 10;

    scroll-snap-align: start;
    height: 100dvh;

    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .note {
    width: 100vw;
    flex: 0 0 auto;

    display: flex;
    flex-direction: column;
    scroll-snap-align: start;
    gap: 1rem;
    padding: 1rem;
    align-items: center;
  }

  .original-image {
    width: 16rem;
    height: 16rem;
    object-fit: cover;
  }

  .note-area {
    width: 100%;
    height: 10rem;
    resize: none;
  }
</style>

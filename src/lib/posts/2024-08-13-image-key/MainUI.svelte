<svelte:options
  customElement={{ tag: 'xif-image-key', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import Button from '$lib/components/Button.svelte';
  import { mdiCamera, mdiUpload } from '@mdi/js';
  import Capturer from './components/Capturer.svelte';

  import { images } from './testImages';
  import { globalEmbedder } from './embedder';
  import { closestEmbedding, embeddingSimilarity } from './utils';
  import TextButton from '$lib/components/TextButton.svelte';

  let capturer: Capturer;
  let data: string | undefined;

  let processingData: string | undefined;
  let embedding: number[] | undefined;
  let embeddedData: string | undefined;

  type StoredData = {
    originalImage: string;
    embedding: number[];
    data: string;
  };

  let storedData: StoredData[] = [];

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

<div
  class="flex flex-wrap gap-4 text-neutral-800 dark:text-neutral-200 text-base max-w-4xl px-4 mx-auto"
>
  <div class="flex flex-grow">
    <div class="sticky top-4 w-80 grid gap-4 camera-grid">
      <!-- Image Container -->
      <div class="camera min-h-80 bg-neutral-100 dark:bg-neutral-800">
        <Capturer bind:this={capturer}></Capturer>
      </div>

      <Button fullWidth icon={mdiUpload} title="Upload"></Button>
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

  <div class="min-w-80 flex-1 flex-grow-[9999]">
    <p>Put data here</p>
    {#if data}
      <img class="w-20 h-20" src={data} />
      {#if processingData}
        <p>Processing...</p>
      {/if}
      <p>{distanceFromCurrent}</p>
    {/if}

    {#if closestStoredData}
      <img class="w-20 h-20" src={closestStoredData.originalImage} />
      <textarea bind:value={closestStoredData.data}></textarea>
    {/if}

    <TextButton on:click={addCurrent}>Add new</TextButton>
  </div>
</div>

<ul>
  {#each images as image}
    <li>
      <a
        href="#"
        on:click={(e) => {
          loadImage(e, image);
        }}
      >
        <img src={image} class="w-10 h-10" />
      </a>
    </li>
  {/each}
</ul>

<style lang="postcss">
  .camera-grid {
    grid: 'camera camera' auto 'btn1 btn2' auto / 1fr 1fr;
  }

  .camera {
    grid-area: camera;
  }
</style>

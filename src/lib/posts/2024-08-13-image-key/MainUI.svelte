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
  import { set as idbSet, get as idbGet } from 'idb-keyval';

  import { globalEmbedder } from './embedder';
  import { closestEmbedding, embeddingSimilarity, sortedNoteBySimilarity } from './utils';
  import type { NoteData } from './types';
  import { getInitialData } from './initialData';
  import Note from './components/Note.svelte';
  import TextButton from '$lib/components/TextButton.svelte';

  let capturer: Capturer;
  let takenImageUri: string | undefined;

  let processingData: string | undefined;
  let embedding: number[] | undefined;
  let embeddedData: string | undefined;

  const embedderStatus = globalEmbedder.statusStore;
  const loadPercent = globalEmbedder.loadPercentStore;
  $: roundedLoadPercent = Math.round($loadPercent);

  let storedData: NoteData[] = [];

  let takenPhotoPosition: HTMLDivElement;

  function onConnect() {
    // const style = document.documentElement.style;
    // if (!style.scrollSnapType) {
    //   style.scrollSnapType = 'y proximity';
    //   return () => {
    //     style.scrollSnapType = '';
    //   };
    // }
  }

  const storageKey = 'image-key-data';
  let hasLoadedStorage = false;

  idbGet(storageKey).then(async (res) => {
    if (res) {
      storedData = res;
    } else {
      storedData = await getInitialData();
    }

    hasLoadedStorage = true;
  });

  $: {
    if (hasLoadedStorage) {
      idbSet(storageKey, storedData);
    }
  }

  $: {
    if (!takenImageUri) {
      processingData = undefined;
      embedding = undefined;
    } else if (takenImageUri !== embeddedData) {
      const currentData = takenImageUri;
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

  function addCurrent() {
    if (embedding) {
      storedData.push({ embedding, note: '', originalImage: embeddedData || '' });
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
          const res = capturer.takePhoto();

          if (res) {
            takenImageUri = res;
            takenPhotoPosition.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        title="Take Photo"
      ></Button>
    </div>
  </div>

  <div bind:this={takenPhotoPosition} class="-mb-4"></div>

  {#if takenImageUri}
    <div class="flex flex-row gap-4 px-4">
      <img class="w-24 h-24 object-cover" src={takenImageUri} alt="Taken" />

      <div>
        <p class="mb-4">Current image</p>

        <p>
          {#if $embedderStatus !== 'ready'}
            <p>Loading model... ({roundedLoadPercent}%)</p>
          {:else if takenImageUri === processingData && takenImageUri !== embeddedData}
            <p>Processing image...</p>
          {:else}
            <TextButton on:click={addCurrent}>Add Note</TextButton>
          {/if}
        </p>
      </div>
    </div>
  {/if}

  {#each sortedNoteBySimilarity(storedData, embedding) as scannedNote}
    <Note
      note={scannedNote.note}
      match={scannedNote.similarity}
      on:replace={() => {
        if (takenImageUri && embedding && embeddedData === takenImageUri) {
          scannedNote.note.originalImage = takenImageUri;
          scannedNote.note.embedding = embedding;
        }
      }}
      on:delete={() => {
        const currentNote = scannedNote.note;

        storedData = storedData.filter((x) => x !== currentNote);
      }}
    />
  {/each}
</div>

<style lang="postcss">
  .container {
    @apply text-neutral-800 dark:text-neutral-200 text-base max-w-4xl mx-auto
      flex flex-col gap-4;
  }

  .camera {
    background-color: black;
    position: relative;
    height: min(40rem, 100svh);

    top: 0;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 1rem;
  }
</style>

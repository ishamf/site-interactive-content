<svelte:options
  customElement={{
    tag: 'xif-image-key',
    mode: 'open',
    extend: createComponentExtender({ onConnect }),
  }}
/>

<script lang="ts">
  import { createComponentExtender } from '$lib/component';
  import Capturer from './components/Capturer.svelte';
  import { set as idbSet, get as idbGet } from 'idb-keyval';

  import { globalEmbedder } from './embedder';
  import { randomId, sortedNoteBySimilarity } from './utils';
  import type { NoteData } from './types';
  import { getInitialData } from './initialData';
  import Note from './components/Note.svelte';
  import TextButton from '$lib/components/TextButton.svelte';

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

  // Promise.resolve().then(async () => {
  //   storedData = await getInitialData();
  //   hasLoadedStorage = true;
  // });

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
      storedData.push({ embedding, note: '', originalImage: embeddedData || '', id: randomId() });
      storedData = storedData;
    }
  }

  function onPhoto(event: CustomEvent<string>) {
    takenImageUri = event.detail;
    takenPhotoPosition.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<div class="container">
  <Capturer on:photo={onPhoto}></Capturer>

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

  {#each sortedNoteBySimilarity(storedData, embedding) as scannedNote (scannedNote.note.id)}
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
</style>

<svelte:options
  customElement={{
    tag: 'xif-image-key',

    extend: addComponentStylesheet,
  }}
/>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import { addComponentStylesheet } from '$lib/component';
  import Capturer from './components/Capturer.svelte';
  import { set as idbSet, get as idbGet } from 'idb-keyval';

  import { globalEmbedder } from './embedder';
  import { randomId, sortedNoteBySimilarity } from './utils';
  import type { NoteData } from './types';
  import Note from './components/Note.svelte';
  import TextButton from '$lib/components/TextButton.svelte';

  let takenImageUri: string | undefined = $state();

  let processingData: string | undefined = $state();
  let embedding: number[] | undefined = $state();
  let embeddedData: string | undefined = $state();

  const embedderStatus = globalEmbedder.statusStore;
  const loadPercent = globalEmbedder.loadPercentStore;

  let storedData: NoteData[] = $state([]);

  let takenPhotoPosition: HTMLDivElement = $state();

  const storageKey = 'image-key-data';
  let hasLoadedStorage = $state(false);

  idbGet(storageKey).then(async (res) => {
    if (res) {
      storedData = res;
    } else {
      // Only load initial data if needed
      const { getInitialData } = await import('./initialData');

      storedData = await getInitialData();
    }

    hasLoadedStorage = true;
  });

  let currentSavePromise: Promise<void> | undefined;
  let currentSaveTimeout: ReturnType<typeof setTimeout> | undefined;

  async function queueSave(data: NoteData[]) {
    if (currentSaveTimeout) {
      clearTimeout(currentSaveTimeout);
    }

    currentSaveTimeout = setTimeout(() => {
      currentSavePromise = (currentSavePromise || Promise.resolve()).then(() => {
        return idbSet(storageKey, data);
      });
    }, 500);
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
  let roundedLoadPercent = $derived(Math.round($loadPercent));
  // Promise.resolve().then(async () => {
  //   storedData = await getInitialData();
  //   hasLoadedStorage = true;
  // });

  run(() => {
    if (hasLoadedStorage) {
      queueSave(storedData);
    }
  });
  run(() => {
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
  });
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
      on:note-change={(e) => {
        scannedNote.note.note = e.detail.value;
      }}
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

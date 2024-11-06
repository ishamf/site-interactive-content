<script lang="ts">
  import { mdiBackspace } from '@mdi/js';
  import Button from '$lib/components/Button.svelte';
  import type { NoteData } from '../types';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    takenPhoto: string;
    existingNote: NoteData;
  }

  let { takenPhoto, existingNote = $bindable() }: Props = $props();

  const dispatch = createEventDispatcher();
</script>

<div class="container">
  <div class="row">
    <Button
      icon={mdiBackspace}
      onclick={() => {
        dispatch('back');
      }}
      title="Back"
    ></Button>
  </div>
  <div class="row photos">
    <img src={takenPhoto} alt="Captured" />

    <img src={existingNote.originalImage} alt="Existing" />
  </div>
  <textarea class="note-area" bind:value={existingNote.note}></textarea>
</div>

<style lang="postcss">
  .container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .row {
    display: flex;
    gap: 1rem;
    flex-direction: row;
  }

  .photos {
    flex: 0;

    & img {
      flex: 1 1 0;
      min-width: 0;
    }
  }

  .note-area {
    flex: 2;
    width: 100%;
    height: 10rem;
    resize: none;
  }
</style>

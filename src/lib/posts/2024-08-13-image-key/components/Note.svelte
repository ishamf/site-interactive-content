<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { NoteData } from '../types';
  import TextButton from '$lib/components/TextButton.svelte';

  export let note: NoteData;
  export let match: number | undefined = undefined;

  const dispatch = createEventDispatcher();
</script>

<div class="note" class:with-match={typeof match === 'number'}>
  <img src={note.originalImage} alt="Original" />

  {#if typeof match === 'number'}
    <div class="match">
      {Math.floor(match * 100)}% match
    </div>
  {/if}

  <textarea bind:value={note.note}></textarea>

  <div class="buttons">
    {#if match}
      <TextButton
        on:click={() => {
          dispatch('replace');
        }}>Replace Photo</TextButton
      >
    {/if}
    <TextButton
      on:click={() => {
        dispatch('delete');
      }}>Delete</TextButton
    >
  </div>
</div>

<style lang="postcss">
  .note {
    @apply gap-4 p-4 bg-neutral-50;

    display: grid;
    grid:
      'image text' 1fr
      'image buttons' auto
      / auto 1fr;
  }

  .with-match {
    grid:
      'image match' auto
      'image text' 1fr
      'image buttons' auto
      / auto 1fr;
  }

  img {
    grid-area: image;
    width: 6rem;
    height: 6rem;
    object-fit: cover;
  }

  textarea {
    grid-area: text;
    resize: none;

    @apply p-4;
  }

  .match {
    grid-area: match;
  }

  .buttons {
    grid-area: buttons;

    @apply flex flex-row gap-4;
  }
</style>

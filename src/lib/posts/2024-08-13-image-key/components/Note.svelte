<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import type { NoteData } from '../types';
  import TextButton from '$lib/components/TextButton.svelte';

  interface Props {
    note: NoteData;
    match?: number | undefined;
  }

  let { note, match = undefined }: Props = $props();

  const dispatch = createEventDispatcher();

  let isConfirmingDelete = $state(false);

  let deleteTimeout: ReturnType<typeof setTimeout> | undefined;

  onDestroy(() => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
    }
  });

  function onDeletePress() {
    if (!isConfirmingDelete) {
      isConfirmingDelete = true;

      deleteTimeout = setTimeout(() => {
        isConfirmingDelete = false;
      }, 3000);
    } else {
      dispatch('delete');
    }
  }
</script>

<div class="note" class:with-match={typeof match === 'number'}>
  <img src={note.originalImage} alt="Original" />

  {#if typeof match === 'number'}
    <div class="match">
      {Math.floor(match * 100)}% match
    </div>
  {/if}

  <textarea
    value={note.note}
    oninput={(e) => {
      dispatch('note-change', { value: e.currentTarget.value });
    }}
  ></textarea>

  <div class="buttons">
    {#if match}
      <TextButton
        on:click={() => {
          dispatch('replace');
        }}>Replace Photo</TextButton
      >
    {/if}
    <TextButton on:click={onDeletePress} danger={isConfirmingDelete}
      >{isConfirmingDelete ? 'Confirm' : 'Delete'}</TextButton
    >
  </div>
</div>

<style lang="postcss">
  .note {
    @apply gap-4 p-4 bg-neutral-50 dark:bg-neutral-800;

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

    @apply p-4 bg-neutral-100  text-neutral-800
		dark:bg-neutral-700  dark:text-neutral-200
    focus:outline-none focus:ring-2 focus:ring-neutral-500;
  }

  .match {
    grid-area: match;
  }

  .buttons {
    grid-area: buttons;

    @apply flex flex-row gap-4;
  }
</style>

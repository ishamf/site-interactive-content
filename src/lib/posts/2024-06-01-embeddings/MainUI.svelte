<svelte:options customElement={{ tag: 'xif-embeddings', extend: addComponentStylesheet }} />

<script lang="ts">
  import { run } from 'svelte/legacy';

  import { addComponentStylesheet } from '$lib/component';
  import { asyncDerived, writable } from '@square/svelte-store';
  import Node from './components/Node.svelte';
  import { globalEmbedder } from './embedder';
  import type { Sentence } from './types';

  import { Projector } from './projector';

  import TextButton from '$lib/components/TextButton.svelte';
  import SentenceDisplay from './components/SentenceDisplay.svelte';

  const sentences = writable(
    ['man', 'woman', 'king', 'queen', 'actor', 'actress'].map((x) => ({
      value: x,
    })) as Sentence[]
  );

  // Create drafts if needed
  run(() => {
    if ($sentences.every((x) => !!x.value)) {
      // Automatically create draft sentences if all is filled
      $sentences = [...$sentences, { value: '' }];
    }
  });

  const embedder = globalEmbedder;
  const projector = new Projector();

  const embedderStatus = embedder.statusStore;
  const loadPercent = embedder.loadPercentStore;

  let isInitial = true;

  let focusedSentence: unknown = $state(null);

  const debouncedSentences = asyncDerived([sentences], async ([text]) => {
    if (isInitial) {
      isInitial = false;
    } else {
      await new Promise((r) => setTimeout(r, 500));
    }

    return text;
  });

  let autoUpdate = $state(true);
  const desiredUpdateCount = writable(0);
  let updateCount = 0;

  const result = asyncDerived(
    [debouncedSentences, desiredUpdateCount],
    async ([text, duc]) => {
      const validText = text.filter((s) => s.value);

      if (validText.length === 0) return [];

      const res = await projector.project(validText, duc !== updateCount || autoUpdate);
      updateCount = duc;

      return res;
    },
    { initial: [] }
  );
</script>

<div
  class="flex flex-wrap gap-4 text-neutral-800 dark:text-neutral-200 text-base max-w-4xl px-4 mx-auto"
>
  <div class="flex justify-center flex-grow">
    <div class="sticky top-4">
      <SentenceDisplay sentences={$result}></SentenceDisplay>
      <div class="flex items-center p-4 gap-4">
        <input bind:checked={autoUpdate} type="checkbox" id="checkbox-auto-update" />
        <label for="checkbox-auto-update">Auto Update Projection</label>
      </div>
      {#if !autoUpdate}
        <TextButton
          on:click={() => {
            $desiredUpdateCount += 1;
          }}
        >
          Update Projection
        </TextButton>
      {/if}
      <!-- <TextButton
        on:click={() => {
          caches.keys().then((xs) => Promise.all(xs.map((x) => caches.delete(x))));
        }}
      >
        Clear Cache
      </TextButton> -->
    </div>
  </div>

  <div class="min-w-80 flex-1 flex-grow-[9999]">
    {#each $sentences as sentence, i}
      <div class:my-4={i > 0}>
        <Node
          bind:sentence={$sentences[i]}
          isDraft={i === $sentences.length - 1}
          on:focus={() => {
            focusedSentence = sentence;
          }}
          on:blur={() => {
            if (
              focusedSentence === sentence &&
              // If we're loading, we just always show some kind of progress
              $embedderStatus !== 'loading'
            ) {
              focusedSentence = null;
            }
          }}
          on:remove={() => {
            $sentences = $sentences.filter((s) => s !== sentence);
          }}
        />

        {#if focusedSentence === sentence && $embedderStatus !== 'ready'}
          <div class="p-2 bg-neutral-100 dark:bg-neutral-800 text-sm mt-4">
            {#if $embedderStatus === 'pending'}
              If you {sentence.value ? 'modify this text' : 'write some text here'}, you'll need to
              load around 40MB of model data and additional code to compute the embeddings.
            {:else if $embedderStatus === 'loading'}
              Loading... {Math.round($loadPercent)}%
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

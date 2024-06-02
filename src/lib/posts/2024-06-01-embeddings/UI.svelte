<svelte:options
  customElement={{ tag: 'xif-embeddings', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import { asyncDerived, writable } from '@square/svelte-store';
  import Node from './components/Node.svelte';
  import { Embedder } from './embedder';
  import type { Sentence } from './types';
  import Input from '$lib/components/Input.svelte';
  import { Projector } from './projector';
  import Container from '$lib/components/Container.svelte';
  import Label from './components/Label.svelte';
  import TextButton from '$lib/components/TextButton.svelte';

  const sentences = writable(
    ['man', 'woman', 'king', 'queen', 'actor', 'actress'].map((x) => ({
      value: x,
      label: 't',
    })) as Sentence[]
  );

  // Create drafts if needed
  $: {
    if ($sentences.every((x) => !!x.value)) {
      // Automatically create draft sentences if all is filled
      $sentences = [...$sentences, { value: '' }];
    }
  }

  const embedder = new Embedder();
  const projector = new Projector(embedder);

  const embedderStatus = embedder.statusStore;
  const loadPercent = embedder.loadPercentStore;

  let isInitial = true;

  let focusedSentence: unknown = null;

  const debouncedSentences = asyncDerived([sentences], async ([text]) => {
    if (isInitial) {
      isInitial = false;
    } else {
      await new Promise((r) => setTimeout(r, 500));
    }

    return text;
  });

  let autoUpdate = true;
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
  class="flex flex-wrap gap-y-4 text-neutral-800 dark:text-neutral-200 text-base max-w-4xl mx-auto"
>
  <div class="flex justify-center flex-grow">
    <div class="sticky top-4">
      <div class="h-80 w-80 bg-neutral-100 dark:bg-neutral-800 text-sm relative">
        {#each $result as sentence, i (i)}
          <div
            class="absolute overflow-visible w-1 h-1 bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all"
            style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}
          ></div>
          <Label style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}>
            {sentence.value}
          </Label>
        {/each}
      </div>
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
    </div>
  </div>

  <div class="min-w-80 flex-1 flex-grow-[9999] px-4">
    {#each $sentences as sentence, i}
      <div class:my-4={i > 0}>
        <Node
          bind:sentence
          isDraft={i === $sentences.length - 1}
          on:focus={() => {
            focusedSentence = sentence;
          }}
          on:blur={() => {
            if (focusedSentence === sentence) {
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
              If you modify the text, you'll need to load around 40MB of model data and additional
              code to compute the embeddings.
            {:else if $embedderStatus === 'loading'}
              Loading... {Math.round($loadPercent)}%
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
